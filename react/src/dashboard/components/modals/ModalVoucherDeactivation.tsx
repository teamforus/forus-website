import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import Voucher from '../../props/models/Voucher';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDangerZone from './ModalDangerZone';

export default function ModalVoucherDeactivation({
    modal,
    className,
    voucher,
    onSubmit,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    onSubmit: (values: object) => void;
}) {
    const { t } = useTranslation();

    const openModal = useOpenModal();

    const [hasEmail] = useState<boolean>(!!voucher.identity_email);

    const form = useFormBuilder(
        {
            note: '',
            notify_by_email: false,
        },
        async (values) => {
            modal.close();

            const $transKey = 'modals.modal_voucher_deactivation.danger_zone';
            const $transData = { fund_name: voucher.fund.name, email: voucher.identity_email };

            const descNoEmail = t(`${$transKey}.description_no_email`, $transData);
            const descNotification = t(`${$transKey}.description_notification`, $transData);
            const descNotificationEmail = t(`${$transKey}.description_notification_email`, $transData);

            const description = hasEmail
                ? values.notify_by_email
                    ? descNotification + descNotificationEmail
                    : descNotification
                : descNoEmail;

            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t(`${$transKey}.title`, $transData)}
                    description_text={description}
                    buttonCancel={{ text: 'Annuleren', onClick: modal.close }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onSubmit(values);
                            modal.close();
                        },
                    }}
                />
            ));
        },
    );

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{t('modals.modal_voucher_deactivation.title')}</div>
                            <div className="modal-text">{t('modals.modal_voucher_deactivation.description')}</div>
                            <span />
                        </div>

                        <form className="form" onSubmit={() => form.submit}>
                            <div className="form-group">
                                <div className="form-label">{t('modals.modal_voucher_deactivation.labels.note')}</div>
                                <textarea
                                    className="form-control r-n"
                                    maxLength={140}
                                    value={form.values.note}
                                    placeholder={t('modals.modal_voucher_deactivation.placeholders.note')}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                                <div className="form-hint">{t('modals.modal_voucher_activation.hints.note')}</div>
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
                        </form>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {t('modals.modal_voucher_deactivation.buttons.cancel')}
                    </button>
                    {form.values.note.length <= 140 && (
                        <button type="button" className="button button-primary" onClick={() => form.submit()}>
                            {t('modals.modal_voucher_deactivation.buttons.submit')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
