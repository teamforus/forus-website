import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import Voucher from '../../props/models/Voucher';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';

export default function ModalVoucherActivate({
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

    const form = useFormBuilder({ note: '' }, async (values) => {
        onSubmit(values);
        modal.close();
    });

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-icon modal-icon-primary">
                    <i className="mdi mdi-message-alert-outline" />
                </div>

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{t('modals.modal_voucher_activation.title')}</div>
                            <div className="modal-text">{t('modals.modal_voucher_activation.description')}</div>
                        </div>

                        <form className="form" onSubmit={() => form.submit}>
                            <div className="form-group">
                                <div className="form-label">{t('modals.modal_voucher_activation.labels.note')}</div>
                                <textarea
                                    className="form-control r-n"
                                    maxLength={140}
                                    value={form.values.note}
                                    placeholder={t('modals.modal_voucher_activation.placeholders.note')}
                                    onChange={(e) => form.update({ note: e.target.value })}
                                />
                                <div className="form-hint">{t('modals.modal_voucher_activation.hints.note')}</div>
                                <FormError error={form.errors?.note} />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {t('modals.modal_voucher_activation.buttons.cancel')}
                    </button>
                    {voucher.state === 'pending' && form.values.note.length <= 140 && (
                        <button type="button" className="button button-primary" onClick={() => form.submit()}>
                            {t('modals.modal_voucher_activation.buttons.submit_activate')}
                        </button>
                    )}
                    {voucher.state === 'deactivated' && form.values.note.length <= 140 && (
                        <button type="button" className="button button-primary" onClick={() => form.submit()}>
                            {t('modals.modal_voucher_activation.buttons.submit_reactivate')}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
