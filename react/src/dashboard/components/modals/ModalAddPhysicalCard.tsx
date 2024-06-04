import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import Voucher from '../../props/models/Voucher';
import Organization from '../../props/models/Organization';
import { useTranslation } from 'react-i18next';
import PincodeControl from '../elements/forms/controls/PincodeControl';
import FormError from '../elements/forms/errors/FormError';
import IconCardSuccess from '../../../../assets/forus-platform/resources/_platform-common/assets/img/modal/icon-physical-cards-success.svg';
import { usePhysicalCardService } from '../../services/PhysicalCardService';
import { ResponseError } from '../../props/ApiResponses';

export default function ModalAddPhysicalCard({
    modal,
    className,
    voucher,
    organization,
    onAttached,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    organization: Organization;
    onAttached: () => void;
}) {
    const { t } = useTranslation();

    const setProgress = useSetProgress();

    const physicalCardService = usePhysicalCardService();

    const [code, setCode] = useState('');
    const [state, setState] = useState<string>('form');

    const form = useFormBuilder({ code: '100' }, async (values) => {
        setProgress(0);

        physicalCardService
            .store(organization.id, voucher.id, values)
            .then((res) => {
                setProgress(100);
                setCode(res.data.data.code);
                setState('success_old_card');
                onAttached();
            })
            .catch((res: ResponseError) => {
                form.setIsLocked(false);

                if (res.status === 429) {
                    return form.setErrors({
                        code: [res.data.message],
                    });
                }

                form.setErrors(res.data.errors);
            });
    });

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-physical-cards',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" aria-label="Sluiten" role="button" onClick={modal.close} />

            {state != 'success_old_card' ? (
                <div className="modal-window">
                    <a className="mdi mdi-close modal-close" aria-label="Sluiten" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">{t('modals.modal_voucher_physical_card.header.card_title')}</div>
                    </div>

                    <div className="modal-content">
                        <form className="form">
                            <div className="activation-card">
                                <div className="physical-card-title">
                                    {t('modals.modal_voucher_physical_card.content.title')}
                                </div>
                                <p className="text-center">
                                    {t('modals.modal_voucher_physical_card.content.subtitle')}
                                </p>
                                <PincodeControl
                                    className={'block-pincode-compact'}
                                    value={form.values.code}
                                    valueType={'num'}
                                    blockSize={4}
                                    blockCount={3}
                                    cantDeleteSize={3}
                                    onChange={(code) => form.update({ code })}
                                />

                                <div className="text-center">
                                    <FormError error={form.errors?.code} />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {t('modals.modal_voucher_physical_card.buttons.cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`button button-primary ${form.values.code.length != 12 ? 'disabled' : ''}`}
                            onClick={() => form.submit()}>
                            {t('modals.modal_voucher_physical_card.buttons.submit')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="modal-window">
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="modal-title">{t('modals.modal_voucher_physical_card.success_card.title')}</div>
                    </div>

                    <div className="modal-content">
                        <div className="modal-section">
                            <div className="physical-card-result">
                                <div className="physical-card-media">
                                    <IconCardSuccess />
                                </div>

                                <div
                                    className="physical-card-description"
                                    dangerouslySetInnerHTML={{
                                        __html: t('modals.modal_voucher_physical_card.success_card.description', {
                                            code: code,
                                        }),
                                    }}
                                />

                                <div className="text-center">
                                    <button type="button" className="button button-primary" onClick={modal.close}>
                                        {t('modals.modal_voucher_physical_card.success_card.button')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
