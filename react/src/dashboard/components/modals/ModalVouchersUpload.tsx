import React, { useCallback, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useSetProgress from '../../hooks/useSetProgress';
import Fund from '../../props/models/Fund';
import { useTranslation } from 'react-i18next';
import { useFileService } from '../../services/FileService';
import useVoucherService from '../../services/VoucherService';
import { currencyFormat, fileSize } from '../../helpers/string';

export default function ModalVouchersUpload({
    modal,
    className,
    funds,
    fund_id,
    onCreated,
}: {
    modal: ModalState;
    className?: string;
    funds: Array<Partial<Fund>>;
    fund_id: number;
    onCreated: (fund: Partial<Fund>) => void;
}) {
    const { t } = useTranslation();

    const setProgress = useSetProgress();

    const fileService = useFileService();
    const voucherService = useVoucherService();

    const [csvParser] = useState(null);
    const [fund] = useState<Fund>(null);
    const [type] = useState<string>('fund_voucher');
    const [loading, setLoading] = useState<boolean>(false);
    const [productsIds, setProductsIds] = useState<number[]>([]);

    const downloadExampleCsv = useCallback(() => {
        if (type == 'fund_voucher') {
            fileService.downloadFile(
                'budget_voucher_upload_sample.csv',
                fund?.type === 'budget'
                    ? voucherService.sampleCSVBudgetVoucher(fund.end_date)
                    : voucherService.sampleCSVSubsidiesVoucher(fund.end_date),
            );
        } else {
            fileService.downloadFile(
                'product_voucher_upload_sample.csv',
                voucherService.sampleCSVProductVoucher(productsIds[0] || null, fund.end_date),
            );
        }
    }, [fileService, fund?.end_date, fund?.type, productsIds, type, voucherService]);

    const selectFile = useCallback(() => {
        csvParser.selectFile();
    }, [csvParser]);

    const reset = useCallback(() => {
        csvParser.reset();
    }, [csvParser]);

    return (
        <div
            className={classList(['modal', 'modal-animated', modal.loading ? 'modal-loading' : null, className])}
            data-dusk="modalVoucherUpload">
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Upload CSV-bestand</div>
                <div className="modal-body form">
                    <div className="modal-section form">
                        {fund && (
                            <div className="block block-csv condensed">
                                <div className="csv-inner">
                                    {csvParser.progress <= 1 && (
                                        <div className="csv-upload-btn" onClick={() => csvParser.selectFile()}>
                                            <div className="csv-upload-icon">
                                                <div className="mdi mdi-upload" />
                                            </div>
                                            <div className="csv-upload-text">
                                                {t('csv_upload.labels.upload')}
                                                <br />
                                                {t('csv_upload.labels.swipe')}
                                            </div>
                                        </div>
                                    )}
                                    <div className="button-group flex-center">
                                        {csvParser.progress <= 1 && (
                                            <button
                                                className="button button-default"
                                                onClick={() => downloadExampleCsv()}>
                                                <em className="mdi mdi-file-table-outline icon-start"> </em>
                                                <span>{t('product_vouchers.buttons.download_csv')}</span>
                                            </button>
                                        )}
                                        {csvParser.progress <= 1 && (
                                            <button
                                                className="button button-primary"
                                                onClick={() => selectFile()}
                                                data-dusk="selectFileButton">
                                                <em className="mdi mdi-upload icon-start"> </em>
                                                <span>{t('vouchers.buttons.upload_csv')}</span>
                                            </button>
                                        )}
                                    </div>
                                    {csvParser.progress >= 2 && (
                                        <div className={`csv-upload-progress ${csvParser.progress == 3 ? 'done' : ''}`}>
                                            <div className="csv-upload-icon">
                                                {csvParser.progress == 2 && <div className="mdi mdi-loading" />}
                                                {csvParser.progress == 3 && (
                                                    <div className="mdi mdi-check" data-dusk="successUploadIcon" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="csv-upload-actions">
                                        {csvParser.csvFile && csvParser.progress < 2 && (
                                            <div className="csv-file">
                                                <div
                                                    className={`block block-file ${
                                                        csvParser.isValid ? '' : 'has-error'
                                                    }`}>
                                                    <div className="file-error mdi mdi-close-circle" />
                                                    <div className="file-name">{csvParser.csvFile.name}</div>
                                                    <div className="file-size">{fileSize(csvParser.csvFile.name)}</div>
                                                    <div
                                                        className="file-remove mdi mdi-close"
                                                        onClick={() => reset()}
                                                    />
                                                </div>

                                                {!csvParser.isValid && type == 'fund_voucher' && (
                                                    <div className="text-left">
                                                        {csvParser.errors.csvHasBsnWhileNotAllowed && (
                                                            <div className="form-error">
                                                                BSN field is present while BSN is not enabled for the
                                                                organization
                                                            </div>
                                                        )}
                                                        {csvParser.errors.csvAmountMissing && (
                                                            <div className="form-error">
                                                                De kolom `amount` &amp mist in het bulkbestand.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.csvProductIdPresent && (
                                                            <div className="form-error">
                                                                De kolom `product_id` mag niet in het bestand zitten.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.invalidAmountField && (
                                                            <div className="form-error">
                                                                Het totaal aantal budget van het gewenste aantal
                                                                tegoeden overschrijd het gestorte bedrag op het fonds.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.invalidPerVoucherAmount && (
                                                            <div className="form-error">
                                                                Één of meer tegoeden gaan over het maximale bedrag per
                                                                tegoed. (limiet is:
                                                                {currencyFormat(fund.limit_per_voucher)}).
                                                            </div>
                                                        )}
                                                        {csvParser.errors.hasInvalidFundIds && (
                                                            <div className="form-error">
                                                                De kolom `fund_id` in het bulkbestand bevat verkeerde
                                                                fonds identificatienummers
                                                                {currencyFormat(fund.limit_per_voucher)}).
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!csvParser.isValid && type == 'product_voucher' && (
                                                    <div className="text-left">
                                                        {csvParser.errors.csvHasBsnWhileNotAllowed && (
                                                            <div className="form-error">
                                                                BSN field is present while BSN is not enabled for the
                                                                organization
                                                            </div>
                                                        )}
                                                        {csvParser.errors.csvHasMissingProductId && (
                                                            <div className="form-error">
                                                                De kolom `product_id` mist in het bestand.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.hasAmountField && (
                                                            <div className="form-error">
                                                                De kolom `amount` mag niet in het bestand zitten.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.csvProductsInvalidUnknownIds.length > 0 && (
                                                            <div className="form-error">
                                                                De kolom `product_id` in het bulkbestand bevat verkeerde
                                                                product identificatienummers
                                                                {csvParser.errors.csvProductsInvalidUnknownIdsList}. De
                                                                nummers van deze producten zijn incorrect of de
                                                                producten zijn uitverkocht.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.csvProductsInvalidStockIds.length > 0 && (
                                                            <div className="form-error">
                                                                De kolom `product_id` in het bulkbestand bevat
                                                                identificatienummers
                                                                {csvParser.errors.csvProductsInvalidStockIdsList}. van
                                                                aanbod dat uitverkocht is.
                                                            </div>
                                                        )}
                                                        {csvParser.errors.hasInvalidFundIds && (
                                                            <div className="form-error">
                                                                De kolom `fund_id` in het bulkbestand bevat verkeerde
                                                                fonds identificatienummers
                                                                {csvParser.errors.hasInvalidFundIdsList}. Deze nummers
                                                                horen niet bij de door u geselecteerde organisatie.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {csvParser.progress == 1 && csvParser.isValid && (
                                            <div className="text-center">
                                                {!loading && (
                                                    <button
                                                        className="button button-primary"
                                                        onClick={() => csvParser.uploadToServer()}
                                                        data-dusk="uploadFileButton">
                                                        {t('csv_upload.buttons.upload')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button
                        className="button button-primary"
                        onClick={() => modal.close()}
                        id="close"
                        data-dusk="closeModalButton">
                        {t('modal_funds_add.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
