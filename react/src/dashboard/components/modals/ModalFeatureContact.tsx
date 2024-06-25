import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useEnvData from '../../hooks/useEnvData';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';

export default function ModalFeatureContact({ modal }: { modal: ModalState }) {
    const envData = useEnvData();

    const translate = useTranslate();

    return (
        <div
            className={classNames(
                'modal',
                'modal-md',
                'modal-animated',
                'modal-feature-contact',
                modal.loading && 'modal-loading',
            )}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window form">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_feature_contact.title')}</div>
                <div className="modal-body">
                    <div className="modal-section text-center">
                        <div className="icon-wrapper">
                            <div className="icon">
                                <em className="mdi mdi-email-outline" />
                            </div>
                        </div>
                        <div className="title">{translate('modals.modal_feature_contact.modal_section.title')}</div>
                        <div className="description">
                            {translate('modals.modal_feature_contact.modal_section.description')}
                        </div>
                        <div className="contact-row">
                            {envData.config.features_contact_phone && (
                                <div className="contact-item">
                                    <div className="icon">
                                        <em className="mdi mdi-cellphone-basic" />
                                    </div>
                                    <div className="title">
                                        {translate('modals.modal_feature_contact.modal_section.phone.title')}
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
                                        {translate('modals.modal_feature_contact.modal_section.email.title')}
                                    </div>
                                    <div className="description">{envData.config.features_contact_email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('modals.modal_feature_contact.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
