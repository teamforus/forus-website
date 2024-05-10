import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import Voucher from '../../props/models/Voucher';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';
import CheckboxControl from '../elements/forms/controls/CheckboxControl';

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

    const setProgress = useSetProgress();

    const [hasEmail] = useState<boolean>(true);

    const form = useFormBuilder({ note: '', notify_by_email: false }, async (values) => {
        setProgress(0);

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

                <div className="modal-body form">
                    <div className="modal-section modal-section-pad">
                        <div className="text-center">
                            <div className="modal-heading">{t('modals.modal_voucher_deactivation.title')}</div>
                            <div className="modal-text">{t('modals.modal_voucher_deactivation.description')}</div>
                        </div>

                        <form className="form" onSubmit={() => form.submit}>
                            <div className="form-group">
                                <div className="form-label">{t('modals.modal_voucher_deactivation.labels.note')}</div>
                                <textarea
                                    className="form-control r-n"
                                    maxLength={140}
                                    value={form.values.note}
                                    placeholder={t('modal_voucher_deactivation.placeholders.note')}
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
            </form>
        </div>
    );
}
