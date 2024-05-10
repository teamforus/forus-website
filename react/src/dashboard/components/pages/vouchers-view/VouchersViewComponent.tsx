import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Voucher from '../../../props/models/Voucher';
import { currencyFormat, strLimit } from '../../../helpers/string';
import useEnvData from '../../../hooks/useEnvData';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalVoucherTransaction from '../../modals/ModalVoucherTransaction';
import Fund from '../../../props/models/Fund';
import ModalVoucherDeactivation from '../../modals/ModalVoucherDeactivation';
import ModalVoucherActivate from '../../modals/ModalVoucherActivate';
import { useParams } from 'react-router-dom';
import useVoucherService from '../../../services/VoucherService';
import { useFundService } from '../../../services/FundService';
import { hasPermission } from '../../../helpers/utils';
import ModalAddPhysicalCard from '../../modals/ModalAddPhysicalCard';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { usePhysicalCardService } from '../../../services/PhysicalCardService';
import ModalVoucherQRCode from '../../modals/ModalVoucherQRCode';
import NumericControl from '../../elements/forms/controls/NumericControl';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import VoucherRecords from './elements/VoucherRecords';
import VoucherTransactions from './elements/VoucherTransactions';
import useFilter from '../../../hooks/useFilter';

export default function VouchersViewComponent() {
    const { t } = useTranslation();
    const { id } = useParams();

    const envData = useEnvData();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const panelType = envData.client_type;
    const activeOrganization = useActiveOrganization();

    const voucherService = useVoucherService();
    const fundService = useFundService();
    const physicalCardService = usePhysicalCardService();

    const [voucher, setVoucher] = useState<Voucher>(null);
    const [fund, setFund] = useState<Fund>(null);
    const [physicalCardsAvailable, setPhysicalCardsAvailable] = useState<boolean>(false);
    const [showMakeTransactionButton, setShowMakeTransactionButton] = useState<boolean>(false);

    const transactionsFilters = useFilter({
        per_page: 20,
        order_by: 'created_at',
        order_dir: 'desc',
        voucher_id: parseInt(id),
    });

    const reservationTransactionsFilters = useFilter({
        per_page: 20,
        order_by: 'created_at',
        order_dir: 'desc',
        reservation_voucher_id: parseInt(id),
    });

    const fetchVoucher = useCallback(() => {
        voucherService.show(activeOrganization.id, parseInt(id)).then((res) => {
            setVoucher(res.data.data);
        });
    }, [activeOrganization.id, id, voucherService]);

    const fetchFund = useCallback(() => {
        if (!voucher) {
            return;
        }

        fundService.read(voucher.fund.organization_id, voucher.fund.id).then((res) => {
            setFund(res.data.data);
        });
    }, [fundService, voucher]);

    const makeTopUpTransaction = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherTransaction
                modal={modal}
                voucher={voucher}
                organization={activeOrganization}
                target={'top_up'}
                onCreated={() => fetchVoucher()}
            />
        ));
    }, [activeOrganization, fetchVoucher, openModal, voucher]);

    const makeTransaction = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherTransaction
                modal={modal}
                voucher={voucher}
                organization={activeOrganization}
                onCreated={() => fetchVoucher()}
            />
        ));
    }, [activeOrganization, fetchVoucher, openModal, voucher]);

    const deactivateVoucher = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherDeactivation
                modal={modal}
                voucher={voucher}
                onSubmit={() => fetchVoucher()}
            />
        ));
    }, [activeOrganization, fetchVoucher, openModal, voucher]);

    const activateVoucher = useCallback(() => {
        openModal((modal) => <ModalVoucherActivate modal={modal} voucher={voucher} onSubmit={() => fetchVoucher()} />);
    }, [fetchVoucher, openModal, voucher]);

    const addPhysicalCard = useCallback(() => {
        openModal((modal) => (
            <ModalAddPhysicalCard
                modal={modal}
                voucher={voucher}
                organization={activeOrganization}
                onSent={() => fetchVoucher()}
                onAssigned={() => fetchVoucher()}
                onAttached={() => fetchVoucher()}
            />
        ));
    }, [activeOrganization, fetchVoucher, openModal, voucher]);

    const deletePhysicalCard = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={t('modals.modal_voucher_physical_card.delete_card.title', { code: voucher.physical_card.code })}
                description={t('modals.modal_voucher_physical_card.delete_card.description')}
                buttonCancel={{
                    onClick: modal.close,
                    text: t('modals.modal_voucher_physical_card.delete_card.cancelButton'),
                }}
                buttonSubmit={{
                    onClick: () => {
                        physicalCardService
                            .delete(activeOrganization.id, voucher.id, voucher.physical_card.id)
                            .then(() => {
                                fetchVoucher();
                            });
                    },
                    text: t('modals.modal_voucher_physical_card.delete_card.confirmButton'),
                }}
            />
        ));
    }, [
        activeOrganization.id,
        fetchVoucher,
        openModal,
        physicalCardService,
        t,
        voucher?.id,
        voucher?.physical_card.code,
        voucher?.physical_card.id,
    ]);

    const orderPhysicalCard = useCallback(() => {
        openModal((modal) => <ModalVoucherActivate modal={modal} voucher={voucher} onSubmit={() => null} />);
    }, [openModal, voucher]);

    const showQrCode = useCallback(() => {
        openModal((modal) => (
            <ModalVoucherQRCode
                modal={modal}
                voucher={voucher}
                onSent={() => fetchVoucher()}
                onAssigned={() => fetchVoucher()}
            />
        ));
    }, [fetchVoucher, openModal, voucher]);

    const submitLimitMultiplier = useCallback(
        (value, prevValue) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.increase_limit_multiplier.title')}
                    description={t('modals.danger_zone.increase_limit_multiplier.description')}
                    buttonCancel={{
                        onClick: () => {
                            modal.close();
                            setVoucher({ ...voucher, limit_multiplier: prevValue });
                        },
                        text: t('modals.danger_zone.increase_limit_multiplier.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            setProgress(0);

                            voucherService
                                .update(activeOrganization.id, voucher.id, {
                                    limit_multiplier: value,
                                })
                                .then(() => {
                                    pushSuccess('Opgeslagen!');
                                })
                                .catch((err: ResponseError) => {
                                    pushDanger('Error!');
                                    console.error(err);
                                })
                                .finally(() => setProgress(100));
                        },
                        text: t('modals.danger_zone.increase_limit_multiplier.buttons.confirm'),
                    }}
                />
            ));
        },
        [activeOrganization.id, openModal, pushDanger, pushSuccess, setProgress, t, voucher, voucherService],
    );

    useEffect(() => {
        fetchVoucher();
    }, [fetchVoucher]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        if (!voucher) {
            return;
        }

        setPhysicalCardsAvailable(
            voucher.fund.allow_physical_cards &&
                voucher.fund.type === 'subsidies' &&
                voucher.state !== 'deactivated' &&
                !voucher.is_external,
        );

        setShowMakeTransactionButton(
            hasPermission(activeOrganization, 'make_direct_payments') &&
                voucher.fund.type === 'budget' &&
                voucher.state === 'active' &&
                fund?.state != 'closed' &&
                !voucher.product &&
                !voucher.expired,
        );
    }, [activeOrganization, fund?.state, voucher]);

    if (!voucher) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                {!voucher.product && (
                    <StateNavLink
                        name={'vouchers'}
                        params={{ organizationId: activeOrganization.id }}
                        className="breadcrumb-item">
                        Vouchers
                    </StateNavLink>
                )}

                {voucher.product && (
                    <StateNavLink
                        name={'product-vouchers'}
                        params={{ organizationId: activeOrganization.id }}
                        className="breadcrumb-item">
                        Aanbiedingsvouchers
                    </StateNavLink>
                )}

                {panelType == 'sponsor' && (
                    <StateNavLink
                        name={'vouchers'}
                        params={{ organizationId: activeOrganization.id }}
                        className="breadcrumb-item">
                        {voucher.fund.name}
                    </StateNavLink>
                )}

                <div className="breadcrumb-item active">{`${strLimit(voucher.fund.name, 50)} #${voucher.id}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <div className="flex flex-vertical flex-center">
                                    {`${strLimit(voucher.fund.name, 50)} #${voucher.id}`}
                                </div>
                                <div className="flex flex-vertical flex-center">
                                    {!voucher.expired && voucher.state == 'active' && (
                                        <div className="tag tag-success tag-sm">{voucher.state_locale}</div>
                                    )}
                                </div>
                                <div className="flex flex-vertical flex-center">
                                    {!voucher.expired && voucher.state == 'pending' && (
                                        <div className="tag tag-default tag-sm">{voucher.state_locale}</div>
                                    )}
                                </div>
                                <div className="flex flex-vertical flex-center">
                                    {!voucher.expired && voucher.state == 'deactivated' && (
                                        <div className="tag tag-danger tag-sm">{voucher.state_locale}</div>
                                    )}
                                </div>
                                <div className="flex flex-vertical flex-center">
                                    {voucher.expired && (
                                        <div className="tag tag-warning tag-sm">{t('vouchers.labels.expired')}</div>
                                    )}
                                </div>
                                &nbsp;&nbsp;
                                {voucher.fund.type == 'budget' && (
                                    <span className="text-primary">
                                        {currencyFormat(parseFloat(voucher.amount_total))}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-self-start">
                            <div className="flex-row">
                                <div className="button-group">
                                    {showMakeTransactionButton && fund?.allow_voucher_top_ups && (
                                        <div
                                            className="button button-default button-sm"
                                            onClick={() => makeTopUpTransaction()}>
                                            <em className="mdi mdi-cash-plus icon-start" />
                                            {t('vouchers.buttons.make_top_up_transaction')}
                                        </div>
                                    )}

                                    {showMakeTransactionButton && (
                                        <div
                                            className="button button-primary button-sm"
                                            onClick={() => makeTransaction()}>
                                            <em className="mdi mdi-cash-fast icon-start" />
                                            {t('vouchers.buttons.make_transaction')}
                                        </div>
                                    )}

                                    {!voucher.expired && voucher.state === 'active' && (
                                        <div
                                            className="button button-danger button-sm"
                                            onClick={() => deactivateVoucher()}>
                                            <em className="mdi mdi-close icon-start" />
                                            Deactiveren
                                        </div>
                                    )}

                                    {!voucher.expired && voucher.state === 'deactivated' && !voucher.is_external && (
                                        <div
                                            className="button button-danger button-sm"
                                            onClick={() => activateVoucher()}>
                                            <em className="mdi mdi-alert-outline icon-start" />
                                            Activeren
                                        </div>
                                    )}

                                    {physicalCardsAvailable && !voucher.expired && (
                                        <div
                                            className="button button-default button-sm"
                                            onClick={() => orderPhysicalCard()}>
                                            <em className="mdi mdi-card-text-outline icon-start" />
                                            Plastic pas bestellen
                                        </div>
                                    )}

                                    {physicalCardsAvailable && !voucher.physical_card && (
                                        <div
                                            className="button button-default button-sm"
                                            onClick={() => addPhysicalCard()}>
                                            <em className="mdi mdi-ticket-account icon-start" />
                                            {t('vouchers.buttons.physical_card_add')}
                                        </div>
                                    )}

                                    {physicalCardsAvailable && voucher.physical_card && (
                                        <div
                                            className="button button-default button-sm"
                                            onClick={() => deletePhysicalCard()}>
                                            <em className="mdi mdi-ticket-account icon-start" />
                                            {t('vouchers.buttons.physical_card_delete')}
                                        </div>
                                    )}

                                    {!voucher.expired &&
                                        !voucher.is_granted &&
                                        voucher.state === 'pending' &&
                                        !voucher.is_external && (
                                            <div
                                                className="button button-primary button-sm"
                                                onClick={() => showQrCode()}>
                                                <em className="mdi mdi-qrcode icon-start " />
                                                {t('vouchers.labels.qr_code')}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">{t('vouchers.labels.id')}</div>
                            <div className="keyvalue-value text-black">{voucher.id}</div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">{t('vouchers.labels.email')}</div>
                            <div className="keyvalue-value text-muted-dark">
                                {voucher.identity_email || 'Niet toegewezen'}
                            </div>
                        </div>
                        {voucher.identity_bsn ||
                            (voucher.relation_bsn && (
                                <div className="keyvalue-item">
                                    <div className="keyvalue-key">{t('vouchers.labels.bsn')}</div>
                                    <div className="keyvalue-value">{voucher.identity_bsn || voucher.relation_bsn}</div>
                                </div>
                            ))}
                        {voucher.physical_card && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.physical_card')}</div>
                                <div className="keyvalue-value">{voucher.physical_card.code}</div>
                            </div>
                        )}
                        {voucher.activation_code && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.details_activation_code')}</div>
                                <div className="keyvalue-value">{voucher.activation_code}</div>
                            </div>
                        )}
                        {voucher.client_uid && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.uid')}</div>
                                <div className="keyvalue-value">{voucher.client_uid}</div>
                            </div>
                        )}
                        {voucher.fund.type == 'subsidies' && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.limit_multiplier')}</div>
                                <div className="keyvalue-value">
                                    <div className="form">
                                        <NumericControl
                                            minValue={1}
                                            maxValue={1000}
                                            value={voucher.limit_multiplier}
                                            apply={true}
                                            applyText={'Aanpassen'}
                                            onChange={(value) => setVoucher({ ...voucher, limit_multiplier: value })}
                                            onSubmit={(value: number) =>
                                                submitLimitMultiplier(value, voucher.limit_multiplier)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {voucher.product && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.provider_name')}</div>
                                <div className="keyvalue-value text-black">
                                    {voucher.product.organization.name || 'Niet aanbieder'}
                                </div>
                            </div>
                        )}
                        {voucher.product && (
                            <div className="keyvalue-item">
                                <div className="keyvalue-key">{t('vouchers.labels.product_name')}</div>
                                <div className="keyvalue-value text-black">{voucher.product.name}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <div className="flex flex-vertical flex-center">Voucher details</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table table-fixed table-align-top">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.expire_at')}
                                            </strong>
                                            <br />
                                            <strong className="text-black">{voucher.expire_at_locale}</strong>
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.created_at')}
                                            </strong>
                                            <br />
                                            <strong className="text-black">
                                                {voucher.created_at_locale.split(' - ')[1]}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.source')}
                                            </strong>
                                            <br />
                                            <strong className="text-black">{voucher.source_locale}</strong>
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.in_use')}
                                            </strong>
                                            <br />
                                            <em className="mdi mdi-close text-black" />
                                            {!voucher.in_use ? (
                                                <strong className="text-black">
                                                    {t('product_vouchers.labels.no')}
                                                </strong>
                                            ) : (
                                                <strong className="text-black">
                                                    {t('product_vouchers.labels.yes')}
                                                </strong>
                                            )}
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.used_date')}
                                            </strong>
                                            <br />
                                            {voucher.first_use_date_locale ? (
                                                <div>
                                                    <strong className="text-black">
                                                        {voucher.first_use_date_locale}
                                                    </strong>
                                                </div>
                                            ) : (
                                                <div>
                                                    <em className="mdi mdi-close text-black" />
                                                    <strong className="text-black">
                                                        {t('product_vouchers.labels.no')}
                                                    </strong>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <strong className="text-strong text-md text-primary">
                                                {t('vouchers.labels.has_payouts')}
                                            </strong>
                                            <br />
                                            <em className="mdi mdi-close text-black" />
                                            {!voucher.has_payouts ? (
                                                <strong className="text-black">{t('vouchers.labels.no')}</strong>
                                            ) : (
                                                <strong className="text-black">{t('vouchers.labels.yes')}</strong>
                                            )}
                                        </td>
                                    </tr>
                                    {!voucher.product && voucher.fund.type != 'subsidies' && (
                                        <tr>
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    Totaal toegekend
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {currencyFormat(parseFloat(voucher.amount_total))}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    Initieel toegekend
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {currencyFormat(parseFloat(voucher.amount))}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    Totaal opgewaardeerd
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {currencyFormat(parseFloat(voucher.amount_top_up))}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    Huidig bedrag
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {currencyFormat(parseFloat(voucher.amount_available))}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong className="text-strong text-md text-primary">
                                                    Uitgegeven bedrag
                                                </strong>
                                                <br />
                                                <strong className="text-black">
                                                    {currencyFormat(
                                                        parseFloat(voucher.amount_total) -
                                                            parseFloat(voucher.amount_available),
                                                    )}
                                                </strong>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {voucher.fund.allow_voucher_records && (
                <VoucherRecords voucher={voucher} organization={activeOrganization} />
            )}

            {voucher.note && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{t('vouchers.labels.note')}</div>
                    </div>

                    <div className="card-section">
                        <div className="card-text">{voucher.note}</div>
                    </div>
                </div>
            )}

            <VoucherTransactions
                organization={activeOrganization}
                blockTitle={'Transacties'}
                filterValues={transactionsFilters.activeValues}
            />

            <VoucherTransactions
                organization={activeOrganization}
                blockTitle={'Reserveringen'}
                filterValues={reservationTransactionsFilters.activeValues}
            />
        </Fragment>
    );
}
