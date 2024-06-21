import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Voucher from '../../props/models/Voucher';
import FormError from '../elements/forms/errors/FormError';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDangerZone from './ModalDangerZone';
import useTranslate from '../../hooks/useTranslate';

export default function ModalVoucherDeactivation({
    modal,
    voucher,
    onSubmit,
    className,
}: {
    modal: ModalState;
    voucher: Voucher;
    onSubmit: (values: object) => void;
    className?: string;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const [hasEmail] = useState<boolean>(!!voucher.identity_email);
    const [hideModal, setHideModal] = useState(false);

    const form = useFormBuilder(
        {
            note: '',
            notify_by_email: false,
        },
        async (values) => {
            const $transKey = 'modals.modal_voucher_deactivation.danger_zone';
            const $transData = { fund_name: voucher.fund.name, email: voucher.identity_email };

            const descNoEmail = translate(`${$transKey}.description_no_email`, $transData);
            const descNotification = translate(`${$transKey}.description_notification`, $transData);
            const descNotificationEmail = translate(`${$transKey}.description_notification_email`, $transData);

            const description = hasEmail
                ? values.notify_by_email
                    ? descNotification + descNotificationEmail
                    : descNotification
                : descNoEmail;

            setHideModal(true);
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate(`${$transKey}.title`, $transData)}
                    description_text={description}
                    buttonCancel={{
                        text: 'Annuleren',
                        onClick: () => {
                            setHideModal(false);
                            modal.close();
                        },
                    }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onSubmit(values);
                            setHideModal(false);
                            modal.close();
                        },
                    }}
                />
            ));
        },
    );

    return (
        <div
            className={`modal modal-md modal-animated ${
                modal.loading || hideModal ? 'modal-loading' : ' '
            } ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{translate('modals.modal_voucher_deactivation.title')}</div>
                            <div className="modal-text">
                                {translate('modals.modal_voucher_deactivation.description')}
                            </div>
                            <span />
                        </div>

                        <div className="form-group">
                            <div className="form-label">
                                {translate('modals.modal_voucher_deactivation.labels.note')}
                            </div>
                            <textarea
                                className="form-control r-n"
                                maxLength={140}
                                value={form.values.note || ''}
                                placeholder={translate('modals.modal_voucher_deactivation.placeholders.note')}
                                onChange={(e) => form.update({ note: e.target.value })}
                            />
                            <div className="form-hint">{translate('modals.modal_voucher_activation.hints.note')}</div>
                            <FormError error={form.errors?.note} />
                        </div>

                        {hasEmail && (
                            <div className="form-group.form-group-inline">
                                <CheckboxControl
                                    title={'Informeer de gebruiker via een e-mailbericht.'}
                                    checked={form.values.notify_by_email || false}
                                    onChange={(e) => form.update({ notify_by_email: e.target.checked })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_deactivation.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary" disabled={form.values.note.length > 140}>
                        {translate('modals.modal_voucher_deactivation.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
