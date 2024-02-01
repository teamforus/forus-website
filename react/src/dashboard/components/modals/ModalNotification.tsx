import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import { ModalButton } from './elements/ModalButton';
import useAssetUrl from '../../hooks/useAssetUrl';

export default function ModalNotification({
    modal,
    icon,
    title,
    className,
    description,
    buttonClose,
    buttonCancel,
    buttonSubmit,
    buttons,
}: {
    modal: ModalState;
    icon?: string;
    title: string;
    className?: string;
    description?: string | Array<string>;
    buttonClose?: ModalButton;
    buttonCancel?: ModalButton;
    buttonSubmit?: ModalButton;
    buttons?: Array<ModalButton>;
}) {
    const assetUrl = useAssetUrl();
    const getIcon = useCallback((icon) => assetUrl('./assets/img/modal/' + icon + '.png'), [assetUrl]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-notification',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="text-center">
                            {icon && (
                                <div className="modal-icon-rounded">
                                    <img src={getIcon(icon)} alt="Icon" />
                                </div>
                            )}

                            <div className="modal-heading">{title}</div>

                            {description && (
                                <div className="modal-text">
                                    {(Array.isArray(description) ? description : [description]).map((value, index) => (
                                        <div key={index}>{value}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    {buttonClose && <ModalButton button={buttonClose} text="Sluiten" type="default" />}
                    {buttonCancel && <ModalButton button={buttonCancel} text="Annuleren" type="default" />}
                    {buttonSubmit && <ModalButton button={buttonSubmit} text="Bevestigen" type="primary" />}

                    {buttons?.map((button, index) => (
                        <ModalButton key={index} button={button} text={''} type="default" submit={true} />
                    ))}
                </div>
            </div>
        </div>
    );
}
