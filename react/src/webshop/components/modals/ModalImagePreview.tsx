import React from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';

export default function ModalImagePreview({ modal, imageSrc }: { modal: ModalState; imageSrc?: string }) {
    const translate = useTranslate();

    return (
        <div className={`modal modal-animated modal-file-preview ${modal.loading ? '' : 'modal-loaded'}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a
                    className="mdi mdi-close modal-close"
                    tabIndex={0}
                    onClick={modal.close}
                    onKeyDown={clickOnKeyEnter}
                    role="button"
                />
                <div className="modal-header">
                    <h2 className="modal-header-title">{translate('image_preview.header.title')}</h2>
                </div>
                <div className="modal-body">
                    <div className="modal-file-preview-image">
                        <img src={imageSrc} alt={''} />
                    </div>
                </div>
            </div>
        </div>
    );
}
