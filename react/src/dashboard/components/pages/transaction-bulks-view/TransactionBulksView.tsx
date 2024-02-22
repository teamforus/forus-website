import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import useTransactionBulkService from '../../../services/TransactionBulkService';
import useSetProgress from '../../../hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams, useSearchParams } from 'react-router-dom';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import Tooltip from '../../elements/tooltip/Tooltip';
import ThSortable from '../../elements/tables/ThSortable';
import { currencyFormat, strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import TransactionBulk from '../../../props/models/TransactionBulk';
import useFilter from '../../../hooks/useFilter';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { hasPermission } from '../../../helpers/utils';
import Transaction from '../../../props/models/Transaction';
import { PaginationData } from '../../../props/ApiResponses';
import useTransactionService from '../../../services/TransactionService';
import useTransactionExportService from '../../../services/exports/useTransactionExportService';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import useMakeExporterService from '../../../services/exports/useMakeExporterService';

export default function TransactionBulksView() {
    const { t } = useTranslation();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const envData = useEnvData();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();
    const transactionBulkService = useTransactionBulkService();
    const transactionService = useTransactionService();
    const transactionsExportService = useTransactionExportService();
    const [, setSearchParams] = useSearchParams();
    const { saveExportedData } = useMakeExporterService();

    const bulkId = parseInt(useParams().id);
    const [transactionBulk, setTransactionBulk] = useState<TransactionBulk>(null);
    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const [resettingBulk, setResettingBulk] = useState(false);
    const [submittingBulk, setSubmittingBulk] = useState(false);

    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);

    const [{ success, error }] = useQueryParams({
        success: BooleanParam,
        error: StringParam,
    });

    useEffect(() => {
        if (success === true) {
            pushSuccess('Succes!', 'De bulk is bevestigd!');
        }

        if (error) {
            pushDanger(
                'Error!',
                {
                    canceled: 'Geannuleerd.',
                    unknown: 'Er is iets misgegaan!',
                }[error] || error,
            );
        }

        if (success === true || error) {
            setSearchParams((params) => {
                params.delete('success');
                params.delete('error');
                return params;
            });
        }
    }, [error, pushDanger, pushSuccess, setSearchParams, success]);

    const filter = useFilter({
        per_page: 20,
        order_by: 'created_at',
        order_dir: 'desc',
    });

    const fetchTransactionBulk = useCallback(() => {
        setProgress(0);

        transactionBulkService
            .show(activeOrganization.id, bulkId)
            .then((res) => setTransactionBulk(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, setProgress, transactionBulkService, bulkId]);

    const fetchTransactions = useCallback(
        (id) => {
            setProgress(0);

            transactionService
                .list(envData.client_type, activeOrganization.id, {
                    ...filter.activeValues,
                    voucher_transaction_bulk_id: id,
                })
                .then((res) => setTransactions(res.data))
                .catch((res) => pushDanger('Mislukt!', res.data?.message))
                .finally(() => setProgress(100));
        },
        [setProgress, transactionService, envData.client_type, activeOrganization.id, filter.activeValues, pushDanger],
    );

    const canManage = useMemo(
        () => hasPermission(activeOrganization, 'manage_transaction_bulks'),
        [activeOrganization],
    );

    const confirmDangerAction = useCallback(
        (title, description, onSubmit?: () => void, onCancel?: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={title}
                    description_text={description}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            if (typeof onSubmit == 'function') {
                                onSubmit();
                            }
                            modal.close();
                        },
                    }}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            if (typeof onCancel == 'function') {
                                onCancel();
                            }
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal],
    );

    const confirmReset = useCallback(
        (bank, onConfirm) => {
            if (bank.key === 'bunq') {
                // Reset Bunq bulk confirmation
                return confirmDangerAction(
                    'Bulktransactie opnieuw versturen',
                    [
                        'U staat op het punt om een bulktransactie opnieuw te versturen.',
                        'De vorige bulkbetaling was geannuleerd.',
                        'Het opnieuw versturen stelt de bulktransactie opnieuw in en stuurt de transactie naar uw mobiele app.\n',
                        'Weet u zeker dat u wilt verdergaan?',
                    ].join(' '),
                    onConfirm,
                );
            }

            if (bank.key === 'bng') {
                // Reset BNG bulk confirmation
                return confirmDangerAction(
                    'Reset BNG bulk',
                    [
                        'Weet u zeker dat u de bulk opnieuw wilt instellen?',
                        'Stel alleen de bulk opnieuw in als de link om te autoriseren niet meer geldig is.',
                        'Alleen de bulk betalingen die nog niet geautoriseerd zijn kunnen opnieuw worden ingesteld.\n\n',
                        'U wordt doorverwezen naar de betalingsverkeer pagina van de BNG.\n',
                        'Weet u zeker dat u door wil gaan?',
                    ].join(' '),
                    onConfirm,
                );
            }
        },
        [confirmDangerAction],
    );

    const confirmSubmitToBNG = useCallback(
        (onConfirm) => {
            confirmDangerAction(
                'Betalingsverkeer via de BNG',
                [
                    'U wordt doorverwezen naar de betalingsverkeer pagina van de BNG.\n',
                    'Weet u zeker dat u door wil gaan?',
                ].join(' '),
                onConfirm,
            );
        },
        [confirmDangerAction],
    );

    const confirmExport = useCallback(
        (onConfirm) => {
            confirmDangerAction(
                'Exporteer SEPA bestand',
                ['Weet u zeker dat u het bestand wilt exporteren?'].join(' '),
                onConfirm,
            );
        },
        [confirmDangerAction],
    );

    const confirmSetPaidExport = useCallback(
        (onConfirm) => {
            confirmDangerAction(
                'Markeer bulk lijst als betaald',
                [
                    'Bevestig dat de bulk lijst is betaald.\n',
                    'Betalingen via het SEPA bestand vinden niet (automatisch) via het systeem plaats.',
                    'Het is uw verantwoordelijkheid om de betaling te verwerken middels de SEPA export.',
                ].join(' '),
                onConfirm,
            );
        },
        [confirmDangerAction],
    );

    const onError = useCallback(
        (err) => {
            pushDanger('Mislukt!', err && err?.data?.message ? err.data.message : 'Er ging iets mis!');
        },
        [pushDanger],
    );

    const resetPaymentRequest = useCallback(() => {
        const bank = transactionBulk.bank;

        confirmReset(bank, () => {
            setResettingBulk(true);
            setProgress(0);

            transactionBulkService
                .reset(activeOrganization.id, transactionBulk.id)
                .then(
                    (res) => {
                        if (bank.key === 'bunq') {
                            pushSuccess(`Succes!`, `Accepteer de transacties via uw bank.`);
                        }

                        if (bank.key === 'bng') {
                            document.location = res.data.data.auth_url;
                        }
                    },
                    (res) => {
                        onError(res);
                    },
                )
                .finally(() => {
                    setResettingBulk(false);
                    setProgress(100);
                });
        });
    }, [
        activeOrganization.id,
        confirmReset,
        onError,
        pushSuccess,
        setProgress,
        transactionBulk,
        transactionBulkService,
    ]);

    const submitPaymentRequestToBNG = useCallback(() => {
        confirmSubmitToBNG(() => {
            setSubmittingBulk(true);
            setProgress(0);

            transactionBulkService
                .submit(activeOrganization.id, transactionBulk.id)
                .then(
                    (res) => {
                        if (res.data.data.auth_url) {
                            return (document.location = res.data.data.auth_url); // todo ask
                        }

                        onError(res);
                    },
                    (res) => {
                        onError(res);
                    },
                )
                .finally(() => {
                    setSubmittingBulk(false);
                    setProgress(100);
                });
        });
    }, [activeOrganization.id, confirmSubmitToBNG, onError, setProgress, transactionBulk?.id, transactionBulkService]);

    const exportTransactions = useCallback(() => {
        transactionsExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            voucher_transaction_bulk_id: transactionBulk.id,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, transactionBulk?.id, transactionsExportService]);

    const exportSepa = useCallback(() => {
        confirmExport(() => {
            setProgress(0);

            transactionBulkService
                .exportSepa(activeOrganization.id, transactionBulk.id)
                .then((res) =>
                    saveExportedData(
                        { data_format: 'xml', fields: '' },
                        activeOrganization.id,
                        res,
                        transactionBulk.id,
                    ),
                )
                .finally(() => setProgress(100));
        });
    }, [
        activeOrganization.id,
        confirmExport,
        setProgress,
        transactionBulk?.id,
        transactionBulkService,
        saveExportedData,
    ]);

    const acceptManually = useCallback(() => {
        confirmSetPaidExport(() => {
            setProgress(0);

            transactionBulkService
                .acceptManually(activeOrganization.id, transactionBulk.id)
                .then(
                    () => {
                        pushSuccess(`Succes!`, `De bulk lijst is handmatig geaccepteerd.`);
                        fetchTransactionBulk();
                    },
                    (res) => {
                        pushDanger('Mislukt!', res && res?.data?.message ? res.data.message : 'Er ging iets mis!');
                    },
                )
                .finally(() => setProgress(100));
        });
    }, [
        activeOrganization.id,
        confirmSetPaidExport,
        fetchTransactionBulk,
        pushDanger,
        pushSuccess,
        setProgress,
        transactionBulk?.id,
        transactionBulkService,
    ]);

    useEffect(() => {
        fetchTransactionBulk();
    }, [fetchTransactionBulk]);

    useEffect(() => {
        if (transactionBulk?.id) {
            fetchTransactions(transactionBulk.id);
        }
    }, [fetchTransactions, transactionBulk?.id]);

    if (!transactionBulk) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'transactions'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    {t('page_state_titles.transactions')}
                </StateNavLink>

                <div className="breadcrumb-item active">{'#' + transactionBulk.id}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex flex-grow">
                            <div className="card-title">{t('financial_dashboard_transaction.labels.details')}</div>
                        </div>

                        {canManage && (
                            <div className="flex">
                                <div className="button-group">
                                    {transactionBulk.bank.key === 'bng' && (
                                        <Fragment>
                                            {transactionBulk.state === 'pending' && transactionBulk.auth_url && (
                                                <a
                                                    className="button button-default button-sm"
                                                    href={transactionBulk.auth_url}>
                                                    <div className="mdi mdi-link icon-start" />
                                                    Autoriseer
                                                </a>
                                            )}

                                            {transactionBulk.state == 'draft' && (
                                                <Fragment>
                                                    {activeOrganization.allow_manual_bulk_processing && (
                                                        <button
                                                            className="button button-default button-sm"
                                                            onClick={() => exportSepa()}>
                                                            <em className="mdi mdi-download icon-start" />
                                                            Export SEPA file
                                                        </button>
                                                    )}

                                                    <button
                                                        className="button button-primary button-sm"
                                                        onClick={() => submitPaymentRequestToBNG()}
                                                        disabled={submittingBulk || resettingBulk}>
                                                        {!submittingBulk && (
                                                            <em className="mdi mdi-circle-multiple-outline icon-start" />
                                                        )}
                                                        {submittingBulk && (
                                                            <em className="mdi mdi-reload mdi-spin icon-start" />
                                                        )}
                                                        Verstuur de bulk naar BNG
                                                    </button>

                                                    {transactionBulk.is_exported && (
                                                        <button
                                                            className="button button-danger button-sm"
                                                            onClick={() => acceptManually()}>
                                                            <em className="mdi mdi-alert-outline icon-start" />
                                                            Markeer de bulk lijst en de transacties als betaald.
                                                        </button>
                                                    )}
                                                </Fragment>
                                            )}
                                        </Fragment>
                                    )}

                                    {(transactionBulk.bank.key === 'bng' && transactionBulk.state == 'pending') ||
                                        (transactionBulk.bank.key === 'bunq' && transactionBulk.state == 'rejected' && (
                                            <button
                                                className="button button-danger button-sm"
                                                onClick={() => resetPaymentRequest()}
                                                disabled={submittingBulk || resettingBulk}>
                                                {resettingBulk ? (
                                                    <em className="mdi mdi-reload mdi-spin icon-start" />
                                                ) : (
                                                    <em className="mdi mdi-reload icon-start" />
                                                )}
                                                Verstuur bulktransactie opnieuw
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-section">
                    <div className="flex">
                        <div className="flex">
                            <div className="card-block card-block-keyvalue">
                                <KeyValueItem label="Transactiewaarde">
                                    {currencyFormat(transactionBulk.voucher_transactions_amount)}
                                </KeyValueItem>

                                <KeyValueItem label={t('financial_dashboard_transaction.labels.id')}>
                                    {transactionBulk.id}
                                </KeyValueItem>

                                {isSponsor && (
                                    <Fragment>
                                        {transactionBulk.payment_id && (
                                            <Fragment>
                                                {transactionBulk.bank.key === 'bunq' && (
                                                    <KeyValueItem
                                                        label={t('financial_dashboard_transaction.labels.bunq_id')}>
                                                        {transactionBulk.payment_id}
                                                    </KeyValueItem>
                                                )}

                                                {transactionBulk.bank.key === 'bng' && (
                                                    <KeyValueItem
                                                        label={t('financial_dashboard_transaction.labels.bng_id')}>
                                                        {transactionBulk.payment_id}
                                                    </KeyValueItem>
                                                )}
                                            </Fragment>
                                        )}

                                        <KeyValueItem label={t('financial_dashboard_transaction.labels.bunq')}>
                                            {currencyFormat(transactionBulk.voucher_transactions_cost)}
                                        </KeyValueItem>
                                    </Fragment>
                                )}

                                <KeyValueItem label={t('financial_dashboard_transaction.labels.date')}>
                                    {transactionBulk.created_at_locale}
                                </KeyValueItem>

                                {transactionBulk.execution_date !== null && (
                                    <KeyValueItem label={t('financial_dashboard_transaction.labels.execution_date')}>
                                        {transactionBulk.execution_date_locale}
                                    </KeyValueItem>
                                )}

                                <KeyValueItem label={t('financial_dashboard_transaction.labels.status')}>
                                    <Fragment>
                                        {transactionBulk.state == 'rejected' && (
                                            <span className="label label-danger">{transactionBulk.state_locale}</span>
                                        )}
                                        {transactionBulk.state == 'error' && (
                                            <span className="label label-danger">{transactionBulk.state_locale}</span>
                                        )}
                                        {transactionBulk.state == 'draft' && (
                                            <span className="label label-default">{transactionBulk.state_locale}</span>
                                        )}
                                        {transactionBulk.state == 'accepted' && (
                                            <span className="label label-success">{transactionBulk.state_locale}</span>
                                        )}
                                        {transactionBulk.state == 'pending' && (
                                            <span className="label label-default">{transactionBulk.state_locale}</span>
                                        )}
                                        {transactionBulk.state == 'pending' && (
                                            <Tooltip text="De status van bulkbetaling wordt om het uur gecontroleerd." />
                                        )}
                                    </Fragment>
                                </KeyValueItem>

                                {canManage &&
                                    transactionBulk.bank.key === 'bng' &&
                                    transactionBulk.state == 'accepted' &&
                                    activeOrganization.allow_manual_bulk_processing && (
                                        <KeyValueItem label={t('financial_dashboard_transaction.labels.accepted')}>
                                            {transactionBulk.accepted_manually ? 'Handmatig' : 'Verstuurd naar de BNG'}
                                        </KeyValueItem>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {transactions && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex-row">
                            <div className="flex flex-grow">
                                <div className="card-title">
                                    <span>{t('transactions.header.title')}</span>
                                    <span className="span-count">{transactions.meta.total}</span>
                                </div>
                            </div>
                            <div className="flex">
                                <button
                                    className="button button-primary button-sm"
                                    onClick={() => exportTransactions()}>
                                    <em className="mdi mdi-download icon-start" />
                                    <span className="ng-scope">Exporteren</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.id')}
                                                value="id"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.uid')}
                                                value="uid"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.price')}
                                                value="amount"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.date')}
                                                value="created_at"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.fund')}
                                                value="fund_name"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.provider')}
                                                value="provider_name"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.product_name')}
                                                value="product_name"
                                            />

                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.status')}
                                                value="status"
                                            />

                                            <ThSortable
                                                className={'th-narrow text-right'}
                                                filter={filter}
                                                label={t('transactions.labels.action')}
                                            />
                                        </tr>

                                        {transactions?.data.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td>{transaction.id}</td>

                                                <td title={transaction.uid || '-'}>
                                                    {strLimit(transaction.uid || '-', 25)}
                                                </td>

                                                <td>
                                                    <StateNavLink
                                                        name={'transaction'}
                                                        params={{
                                                            organizationId: activeOrganization.id,
                                                            address: transaction.address,
                                                        }}
                                                        className="text-primary-light">
                                                        {transaction.amount_locale}
                                                    </StateNavLink>
                                                </td>

                                                <td>
                                                    <strong className="text-primary">
                                                        {transaction.created_at_locale.split(' - ')[0]}
                                                    </strong>
                                                    <br />
                                                    <strong className="text-strong text-md text-muted-dark">
                                                        {transaction.created_at_locale.split(' - ')[1]}
                                                    </strong>
                                                </td>

                                                <td>{strLimit(transaction.fund.name, 25)}</td>

                                                <td className={transaction.organization ? '' : 'text-muted'}>
                                                    {strLimit(transaction.organization?.name || '-', 25) || '-'}
                                                </td>

                                                <td>{strLimit(transaction.product?.name || '-', 25) || '-'}</td>

                                                <td>
                                                    <div
                                                        className={
                                                            transaction.state == 'success'
                                                                ? 'label label-success'
                                                                : 'label label-default'
                                                        }>
                                                        {transaction.state_locale}
                                                    </div>
                                                </td>
                                                <td>
                                                    <StateNavLink
                                                        name={'transaction'}
                                                        params={{
                                                            organizationId: activeOrganization.id,
                                                            address: transaction.address,
                                                        }}
                                                        className="button button-sm button-primary button-icon pull-right">
                                                        <em className="mdi mdi-eye-outline icon-start" />
                                                    </StateNavLink>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {transactions?.meta.last_page > 1 && (
                        <div className="card-section">
                            <Paginator meta={transactions.meta} filters={filter.values} updateFilters={filter.update} />
                        </div>
                    )}
                </div>
            )}
        </Fragment>
    );
}
