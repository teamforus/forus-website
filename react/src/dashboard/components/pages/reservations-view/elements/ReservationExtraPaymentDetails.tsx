import React, { useCallback, useMemo } from 'react';
import Organization from '../../../../props/models/Organization';
import Reservation from '../../../../props/models/Reservation';
import ExtraPayment from '../../../../props/models/ExtraPayment';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import useProductReservationService from '../../../../services/ProductReservationService';
import { ResponseError } from '../../../../props/ApiResponses';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import useEnvData from '../../../../hooks/useEnvData';
import useTranslate from '../../../../hooks/useTranslate';

export default function ReservationExtraPaymentDetails({
    payment,
    onUpdate,
    reservation,
    organization,
}: {
    payment: ExtraPayment;
    onUpdate?: (reservation: Reservation) => void;
    reservation: Reservation;
    organization: Organization;
}) {
    const envData = useEnvData();
    const isProvider = useMemo(() => envData.client_type == 'provider', [envData.client_type]);

    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();

    const productReservationService = useProductReservationService();

    const fetchExtraPayment = useCallback(() => {
        setProgress(0);

        productReservationService
            .fetchReservationExtraPayment(organization.id, reservation.id)
            .then((res) => {
                onUpdate(res.data.data);
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => pushDanger(err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, productReservationService, organization.id, reservation.id, onUpdate, pushSuccess, pushDanger]);

    const refundExtraPayment = useCallback(
        function () {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.confirm_extra_payment_refund.title')}
                    description={translate('modals.danger_zone.confirm_extra_payment_refund.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.confirm_extra_payment_refund.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            setProgress(0);

                            productReservationService
                                .refundReservationExtraPayment(organization.id, reservation.id)
                                .then((res) => {
                                    onUpdate(res.data.data);
                                    pushSuccess('Refund created!');
                                })
                                .catch((err: ResponseError) => pushDanger(err.data.message))
                                .finally(() => {
                                    setProgress(100);
                                    modal.close();
                                });
                        },
                        text: translate('modals.danger_zone.confirm_extra_payment_refund.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            translate,
            onUpdate,
            openModal,
            pushDanger,
            setProgress,
            pushSuccess,
            reservation.id,
            organization.id,
            productReservationService,
        ],
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">Transactie details van de bijbetaling</div>
                    </div>

                    {isProvider && (
                        <div className="button-group">
                            {!reservation.canceled && (
                                <button className="button button-primary button-sm" onClick={() => fetchExtraPayment()}>
                                    <em className="mdi mdi-autorenew icon-start"></em>
                                    Gegevens ophalen
                                </button>
                            )}

                            {!payment.is_fully_refunded && payment.is_paid && (
                                <button
                                    className="button button-danger button-sm"
                                    disabled={!payment.is_refundable}
                                    onClick={() => refundExtraPayment()}>
                                    <em className="mdi mdi-undo-variant icon-start"></em>
                                    Bijbetaling terugbetalen
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-keyvalue">
                    <KeyValueItem label={translate('reservation.labels.status')}>
                        {!payment.is_fully_refunded && payment.is_paid && (
                            <div className="label label-success">{payment.state_locale}</div>
                        )}

                        {!payment.is_fully_refunded && payment.is_pending && (
                            <div className="label default">{payment.state_locale}</div>
                        )}

                        {['failed', 'canceled', 'expired'].includes(payment.state) && (
                            <div className="label label-danger">{payment.state_locale}</div>
                        )}

                        {payment.is_fully_refunded && <div className="label label-danger">Terugbetaald</div>}
                    </KeyValueItem>

                    <KeyValueItem label={translate('reservation.labels.amount')}>
                        {reservation.amount_locale}
                    </KeyValueItem>

                    <KeyValueItem label={translate('reservation.labels.amount_extra')}>
                        {payment.amount_locale}
                    </KeyValueItem>

                    <KeyValueItem label={translate('reservation.labels.price')}>
                        {reservation.price_locale}
                    </KeyValueItem>

                    <KeyValueItem label={translate('reservation.labels.extra_payment_paid_at')}>
                        {payment.paid_at_locale}
                    </KeyValueItem>

                    <KeyValueItem label={translate('reservation.labels.method')}>{payment.method}</KeyValueItem>
                </div>
            </div>
        </div>
    );
}
