import React, { useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ModalButton } from './elements/ModalButton';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';

export default function ModalExportTypeLegacy({
    modal,
    onSubmit,
    buttonCancel,
    buttonSubmit,
}: {
    modal: ModalState;
    onSubmit?: (exportType: string) => void;
    buttonCancel?: ModalButton;
    buttonSubmit?: ModalButton;
}) {
    const translate = useTranslate();
    const [exportTypes] = useState(['xls', 'csv']);
    const [exportType, setExportType] = useState('xls');

    return (
        <div
            className={classNames(
                'modal',
                'modal-md',
                'modal-animated',
                'modal-voucher-export-type',
                'modal-voucher-export-narrow',
                modal.loading && 'modal-loading',
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window form">
                <div className="modal-close mdi mdi-close" onClick={modal.close} />
                <div className="modal-header">{translate('modals.modal_voucher_export.title')}</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="voucher-export-type">
                            <div className="voucher-export-type-row">
                                {exportTypes.map((type) => (
                                    <div
                                        key={type}
                                        className={`voucher-export-type-item ${type == exportType ? 'active' : ''}`}
                                        onClick={() => setExportType(type)}>
                                        <div className="voucher-export-type-item-check">
                                            <em className="mdi mdi-check-bold" />
                                        </div>
                                        <div className="voucher-export-type-item-icon">
                                            <em className="mdi mdi-file-delimited" />
                                        </div>
                                        {translate(`modals.modal_voucher_export.modal_section.export_type_${type}`)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    {<ModalButton button={{ onClick: modal.close, ...buttonCancel }} text="Annuleren" type="default" />}
                    {
                        <ModalButton
                            button={{
                                onClick: () => {
                                    modal.close();
                                    onSubmit(exportType);
                                },
                                ...buttonSubmit,
                            }}
                            submit={true}
                            text="Bevestigen"
                            type="primary"
                        />
                    }
                </div>
            </div>
        </div>
    );
}
