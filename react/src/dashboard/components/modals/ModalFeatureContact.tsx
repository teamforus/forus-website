import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import useEnvData from '../../hooks/useEnvData';

export default function ModalFeatureContact({ modal }: { modal: ModalState }) {
    const { t } = useTranslation();
    const envData = useEnvData();

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                'modal-feature-contact',
                modal.loading ? 'modal-loading' : null,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window form">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{t('modals.modal_feature_contact.title')}</div>
                <div className="modal-body">
                    <div className="modal-section text-center">
                        <div className="icon-wrapper">
                            <div className="icon">
                                <em className="mdi mdi-email-outline" />
                            </div>
                        </div>
                        <div className="title">{t('modals.modal_feature_contact.modal_section.title')}</div>
                        <div className="description">{t('modals.modal_feature_contact.modal_section.description')}</div>
                        <div className="contact-row">
                            {envData.config.features_contact_phone && (
                                <div className="contact-item">
                                    <div className="icon">
                                        <em className="mdi mdi-cellphone-basic" />
                                    </div>
                                    <div className="title">
                                        {t('modals.modal_feature_contact.modal_section.phone.title')}
                                    </div>
                                    <div className="description">{envData.config.features_contact_phone}</div>
                                </div>
                            )}

                            {envData.config.features_contact_email && (
                                <div className="contact-item">
                                    <div className="icon">
                                        <em className="mdi mdi-email-outline" />
                                    </div>
                                    <div className="title">
                                        {t('modals.modal_feature_contact.modal_section.email.title')}
                                    </div>
                                    <div className="description">{envData.config.features_contact_email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {t('modals.modal_feature_contact.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
