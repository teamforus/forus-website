import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import PdfPreview from '../../../dashboard/components/elements/pdf-preview/PdfPreview';

export default function ModalPdfPreview({
    modal,
    className = '',
    rawPdfFile,
}: {
    modal: ModalState;
    className?: string;
    rawPdfFile?: Blob;
}) {
    const { t } = useTranslation();

    return (
        <div className={`modal modal-animated modal-file-preview ${className} ${modal.loading ? '' : 'modal-loaded'}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">
                    <h2 className="modal-header-title">{t('pdf_preview.header.title')}</h2>
                </div>
                <div className="modal-body">
                    <PdfPreview className={'file-pdf'} rawPdfFile={rawPdfFile} />
                </div>
            </div>
        </div>
    );
}
