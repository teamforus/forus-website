import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import PdfPreview from '../elements/pdf-preview/PdfPreview';
import useTranslate from '../../hooks/useTranslate';

export default function ModalPdfPreview({
    modal,
    className,
    rawPdfFile,
}: {
    modal: ModalState;
    className?: string;
    rawPdfFile?: Blob;
}) {
    const translate = useTranslate();

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-pdf-preview',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modal_pdf_preview.header.title')}</div>
                <div className="modal-body">
                    <div className="modal-section">
                        <PdfPreview className={'block block-pdf-preview'} rawPdfFile={rawPdfFile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
