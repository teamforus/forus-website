import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useAssetUrl from '../../../hooks/useAssetUrl';
import 'react-image-crop/dist/ReactCrop.css';
import { PaginationData } from '../../../props/ApiResponses';
import Bank from '../../../props/models/Bank';
import usePushDanger from '../../../hooks/usePushDanger';
import { useBankConnectionService } from '../../../services/BankConnectionService';
import { useBankService } from '../../../services/BankService';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import BankConnection from '../../../props/models/BankConnection';
import ModalSwitchBankConnectionAccount from '../../modals/ModalSwitchBankConnectionAccount';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { StringParam, useQueryParams } from 'use-query-params';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function BankConnections() {
    const [query] = useQueryParams({
        success: StringParam,
        error: StringParam,
    });

    const openModal = useOpenModal();
    const assetUrl = useAssetUrl();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const navigate = useNavigate();
    const activeOrganization = useActiveOrganization();

    const bankConnectionService = useBankConnectionService();
    const bankService = useBankService();
    const paginatorService = usePaginatorService();

    const [banks, setBanks] = useState<PaginationData<Bank>>(null);
    const [bank, setBank] = useState<Bank>(null);
    const [bankConnection, setBankConnection] = useState<BankConnection>(null);
    const [bankConnections, setBankConnections] = useState<PaginationData<BankConnection>>(null);
    const [submittingConnection, setSubmittingConnection] = useState<boolean>(false);
    const [paginatorKey] = useState('bank-connections');

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const selectBank = useCallback(
        (bankName: string) => {
            setBank(banks.data.filter((bank) => bank.key == bankName)[0] || undefined);
        },
        [banks],
    );

    const onRequestError = useCallback(
        (res) => {
            pushDanger('Error', res.data.message || 'Er is iets misgegaan, probeer het later opnieuw.');
        },
        [pushDanger],
    );

    const confirmDangerAction = useCallback(
        (header, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={header}
                        description_text={description_text}
                        buttonCancel={{
                            text: cancelButton,
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: confirmButton,
                            onClick: () => {
                                modal.close();
                                resolve(true);
                            },
                        }}
                    />
                ));
            });
        },
        [openModal],
    );

    const confirmConnectionDisabling = useCallback(() => {
        return confirmDangerAction(
            'Verbinding met uw bank stopzetten',
            [
                'U staat op het punt om de verbinding vanuit Forus met uw bank stop te zetten. Hierdoor stopt Forus met het uitlezen van de rekeninginformatie en het initiëren van transacties.',
                'Weet u zeker dat u verder wilt gaan?',
            ].join('\n'),
        );
    }, [confirmDangerAction]);

    const clearFlags = useCallback(
        (flags: ['success', 'error']) => {
            const params = flags.reduce(
                (params, flag) => {
                    return { ...params, [flag]: null };
                },
                { ...query },
            );

            navigate(
                getStateRouteUrl('bank-connections', { organizationId: activeOrganization.id }) +
                    createSearchParams(params),
            );
        },
        [activeOrganization.id, navigate, query],
    );

    const showStatePush = useCallback(
        (success, error) => {
            if (success === true) {
                pushSuccess('De verbinding met bank is tot stand gebracht.');
            }

            if (error) {
                pushDanger(
                    'Verbinding mislukt',
                    {
                        invalid_grant: 'De autorisatiecode is ongeldig of verlopen.',
                        access_denied: 'Het autorisatieverzoek is geweigerd.',
                        not_pending: 'Verzoek voor verbinding is al behandeld.',
                    }[error] || error,
                );
            }

            if (success === true || error) {
                clearFlags(['success', 'error']);
            }
        },
        [clearFlags, pushDanger, pushSuccess],
    );

    const fetchBankConnections = useCallback(
        async (query: object = {}): Promise<PaginationData<BankConnection>> => {
            return bankConnectionService
                .list(activeOrganization.id, { ...query, ...filter.activeValues })
                .then((res) => res.data);
        },
        [activeOrganization.id, bankConnectionService, filter.activeValues],
    );

    const fetchActiveBankConnection = useCallback(async () => {
        const res = await fetchBankConnections({ state: 'active' });
        return res.data[0] || null;
    }, [fetchBankConnections]);

    const updateActiveBankConnection = useCallback(() => {
        return new Promise((resolve) => {
            fetchActiveBankConnection().then(
                (bankConnection: BankConnection) => {
                    setBankConnection(bankConnection);
                    resolve(bankConnection);
                },
                () => resolve(false),
            );
        });
    }, [fetchActiveBankConnection]);

    const confirmNewConnection = useCallback(() => {
        return new Promise((resolve) => {
            fetchActiveBankConnection().then((bankConnection) => {
                if (bankConnection) {
                    confirmDangerAction(
                        'U heeft al een actieve verbinding met uw bank',
                        [
                            'U staat op het punt om opnieuw toestemming te geven en daarmee de verbinding opnieuw tot stand te brengen.',
                            'Weet u zeker dat u verder wilt gaan?',
                        ].join('\n'),
                    ).then(resolve);
                } else {
                    resolve(true);
                }
            });
        });
    }, [confirmDangerAction, fetchActiveBankConnection]);

    const replaceConnectionModel = useCallback(
        (bankConnection) => {
            for (let i = 0; i < bankConnections.data.length; i++) {
                if (bankConnections.data[i].id == bankConnection.id) {
                    bankConnections.data[i] = bankConnection;
                }
            }
        },
        [bankConnections?.data],
    );

    const disableConnection = useCallback(
        (connection_id) => {
            confirmConnectionDisabling().then((confirmed) => {
                if (confirmed) {
                    bankConnectionService
                        .update(activeOrganization.id, connection_id, { state: 'disabled' })
                        .then((res) => {
                            replaceConnectionModel(res.data.data);

                            setBank(null);
                            showStatePush(query.success, query.error);
                            updateActiveBankConnection().then((connection: BankConnection) => {
                                setBank(connection ? connection.bank : null);
                            });
                        }, onRequestError);
                }
            });
        },
        [
            activeOrganization.id,
            bankConnectionService,
            confirmConnectionDisabling,
            onRequestError,
            query,
            replaceConnectionModel,
            showStatePush,
            updateActiveBankConnection,
        ],
    );

    const makeBankConnection = useCallback(
        (bank: Bank) => {
            if (submittingConnection) {
                return;
            }

            setSubmittingConnection(true);

            confirmNewConnection().then((confirmed) => {
                const values = { bank_id: bank.id };

                if (!confirmed) {
                    setSubmittingConnection(false);
                }

                bankConnectionService.store(activeOrganization.id, values).then(
                    (res) => {
                        const { auth_url, state } = res.data.data;

                        if (state === 'pending' && auth_url) {
                            return (document.location = auth_url);
                        }

                        pushDanger('Error!', 'Er is een onbekende fout opgetreden.');
                    },
                    (res) => {
                        setSubmittingConnection(false);
                        onRequestError(res);
                    },
                );
            });
        },
        [
            activeOrganization.id,
            bankConnectionService,
            confirmNewConnection,
            onRequestError,
            pushDanger,
            submittingConnection,
        ],
    );

    const switchMonetaryAccount = useCallback(
        (bankConnection: BankConnection) => {
            const onClose = () => {
                updateActiveBankConnection().then(() => {
                    fetchBankConnections({}).then((res) => setBankConnections(res), onRequestError);
                });
            };

            openModal((modal) => (
                <ModalSwitchBankConnectionAccount modal={modal} bankConnection={bankConnection} onClose={onClose} />
            ));
        },
        [fetchBankConnections, onRequestError, openModal, updateActiveBankConnection],
    );

    const fetchBanks = useCallback(() => {
        bankService.list().then((res) => {
            setBanks(res.data);
        });
    }, [bankService]);

    useEffect(() => {
        fetchBankConnections({}).then((bank_connections) => {
            setBankConnections(bank_connections);
        }, onRequestError);
    }, [fetchBankConnections, filter.values, onRequestError]);

    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    useEffect(() => {
        updateActiveBankConnection().then((connection: BankConnection) => {
            setBank(connection ? connection.bank : null);
        });
    }, [updateActiveBankConnection]);

    return (
        <Fragment>
            {banks?.meta.total === 0 && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-title">Niet beschikbaar</div>
                            <div className="empty-details">Geen verbindingen met een bank beschikbaar</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col col-md-6">
                    {bank === null && !bankConnection && (
                        <div className="card">
                            <div className="card-section">
                                <div className="block block-empty text-center">
                                    <div className="empty-icon">
                                        <img
                                            className="empty-icon-img"
                                            src={assetUrl('/assets/img/bunq-logo.jpg')}
                                            alt={''}
                                        />
                                    </div>
                                    <div className="empty-title">Bunq integratie</div>
                                    <div className="empty-actions">
                                        <button className="button button-primary" onClick={() => selectBank('bunq')}>
                                            Selecteer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col col-md-6">
                    {bank === null && !bankConnection && (
                        <div className="card">
                            <div className="card-section">
                                <div className="block block-empty text-center">
                                    <div className="empty-icon">
                                        <img
                                            className="empty-icon-img empty-icon-img-border"
                                            src={assetUrl('/assets/img/bng-logo.jpg')}
                                            alt={''}
                                        />
                                    </div>
                                    <div className="empty-title">BNG integratie</div>
                                    <div className="empty-actions">
                                        <button className="button button-primary" onClick={() => selectBank('bng')}>
                                            Selecteer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {bank?.key === 'bunq' && !bankConnection && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <form className="form" onSubmit={() => makeBankConnection(bank)}>
                                <div className="empty-icon">
                                    <img
                                        className="empty-icon-img"
                                        src={assetUrl('/assets/img/bunq-logo.jpg')}
                                        alt={''}
                                    />
                                </div>
                                <div className="empty-title">Bank integratie</div>
                                <div className="empty-details">
                                    <div className="row">
                                        <div className="col-lg-6 col-sm-8 col-offset-sm-2 col-offset-lg-3">
                                            Gebruik de koppeling met uw bank om rekeninginformatie uit te lezen en
                                            transacties klaar te zetten.
                                        </div>
                                    </div>
                                </div>
                                <div className="empty-actions">
                                    <button className="button button-primary" type="submit">
                                        {submittingConnection && (
                                            <div className="mdi mdi-loading mdi-spin icon-start" />
                                        )}
                                        {!submittingConnection && <div className="mdi mdi-qrcode-scan icon-start" />}
                                        Koppelen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {bank?.key === 'bng' && !bankConnection && (
                <div className="card">
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <form className="form" onSubmit={() => makeBankConnection(bank)}>
                                <div className="empty-icon">
                                    <img
                                        className="empty-icon-img empty-icon-img-border"
                                        src={assetUrl('/assets/img/bng-logo.jpg')}
                                        alt={''}
                                    />
                                </div>
                                <div className="empty-title">Bank integratie</div>
                                <div className="empty-details">
                                    <div className="row">
                                        <div className="col-lg-6 col-sm-8 col-offset-sm-2 col-offset-lg-3">
                                            Gebruik de koppeling met uw bank om rekeninginformatie uit te lezen en
                                            transacties klaar te zetten.
                                        </div>
                                    </div>
                                </div>
                                <div className="empty-actions">
                                    <button className="button button-primary" type="submit">
                                        {submittingConnection && (
                                            <div className="mdi mdi-loading mdi-spin icon-start" />
                                        )}
                                        {!submittingConnection && <div className="mdi mdi-qrcode-scan icon-start" />}
                                        Koppelen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {bank && bankConnection && (
                <div className="card card-collapsed">
                    <div className="card-section">
                        <div className="card-section-actions">
                            <div className="button-group flex-end">
                                <button className="button button-default" onClick={() => makeBankConnection(bank)}>
                                    {bank.key === 'bunq' && <em className="mdi mdi-qrcode-scan icon-start" />}
                                    {bank.key !== 'bunq' && <em className="mdi mdi-link-variant icon-start" />}
                                    Geef opnieuw toestemming
                                </button>

                                <button
                                    className="button button-primary"
                                    onClick={() => disableConnection(bankConnection.id)}>
                                    <em className="mdi mdi-trash-can-outline icon-start" />
                                    Stopzetten
                                </button>
                            </div>
                        </div>

                        <div className="card-block card-block-bank">
                            <div className="card-block-bank-media">
                                <img src={assetUrl('/assets/img/' + bank.key + '-logo.jpg')} alt={''} />
                            </div>

                            <div className="card-block-bank-details">
                                <div className="card-block-bank-name">{bank.name}</div>

                                <div className="card-block-bank-properties">
                                    <div className="card-block-bank-property">
                                        <div className="card-block-bank-property-label">Actieve IBAN</div>

                                        {bankConnection.accounts.length === 1 && (
                                            <div className="card-block-bank-property-value">
                                                <span>{bankConnection.iban}</span>
                                            </div>
                                        )}

                                        {bankConnection.accounts.length > 1 && (
                                            <div
                                                className="card-block-bank-property-value card-block-bank-property-value-link"
                                                onClick={() => switchMonetaryAccount(bankConnection)}>
                                                <span>{bankConnection.iban}</span>
                                                <em className="mdi mdi-pencil-outline" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bank && bankConnections?.meta?.total > 0 && (
                <div className="card card-collapsed">
                    <div className="card-header">
                        <div className="card-title">Status verbindingen</div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="th-narrow nowrap">Datum van toestemming</th>
                                            <th>Bank</th>
                                            <th>Verloopdatum</th>
                                            <th>Rekening</th>
                                            <th className="th-narrow text-right">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bank &&
                                            bankConnections.data?.map((bankConnection: BankConnection) => (
                                                <tr key={bankConnection.id}>
                                                    <td>{bankConnection.created_at_locale}</td>
                                                    <td>{bankConnection.bank.name}</td>
                                                    <td>
                                                        {bankConnection.expire_at
                                                            ? bankConnection.expire_at_locale
                                                            : 'Geen verloopdatum'}
                                                    </td>
                                                    <td>{bankConnection.iban}</td>
                                                    <td className="text-right">
                                                        <div
                                                            className={
                                                                'label ' +
                                                                (bankConnection.state == 'active'
                                                                    ? 'label-success'
                                                                    : 'label-default')
                                                            }>
                                                            {bankConnection.state_locale}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {bankConnections.meta && (
                        <div className="card-section">
                            <Paginator
                                filters={filter.values}
                                updateFilters={filter.update}
                                meta={bankConnections.meta}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </div>
            )}
        </Fragment>
    );
}
