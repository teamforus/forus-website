import React from 'react';
import { useTranslation } from 'react-i18next';
import Reimbursement from '../../../props/models/Reimbursement';
import Organization from '../../../props/models/Organization';
import { currencyFormat } from '../../../helpers/string';

export default function ModalVoucherTransactionPreview({
    formValues,
    providersList,
    organization,
    reimbursement,
}: {
    formValues: {
        target?: string;
        organization_id?: number;
        target_iban?: string;
        target_name?: string;
        amount?: string;
        iban_source?: string;
    };
    providersList: object;
    organization: Organization;
    reimbursement: Reimbursement;
}) {
    const { t } = useTranslation();

    return (
        <div className="modal-section">
            <div className="row">
                <div className="col col-lg-8 col-lg-offset-2">
                    <div className="block block-compact-datalist">
                        {formValues.target === 'provider' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{t('modals.modal_voucher_transaction.labels.provider')}</strong>
                                </div>
                                <div className="datalist-value">{providersList[formValues.organization_id].name}</div>
                            </div>
                        )}

                        {formValues.target === 'iban' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{t('modals.modal_voucher_transaction.labels.target_iban')}</strong>
                                </div>

                                {formValues.iban_source === 'reimbursement' && (
                                    <div className="datalist-value">{reimbursement.iban}</div>
                                )}

                                {formValues.iban_source === 'manual' && (
                                    <div className="datalist-value">{formValues.target_iban}</div>
                                )}
                            </div>
                        )}

                        {formValues.target === 'iban' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{t('modals.modal_voucher_transaction.labels.target_name')}</strong>
                                </div>

                                {formValues.iban_source === 'reimbursement' && (
                                    <div className="datalist-value">{reimbursement.iban_name}</div>
                                )}

                                {formValues.iban_source === 'manual' && (
                                    <div className="datalist-value">{formValues.target_name}</div>
                                )}
                            </div>
                        )}

                        <div className="datalist-row">
                            <div className="datalist-key text-primary text-right">
                                <strong>{t('modals.modal_voucher_transaction.labels.organization')}</strong>
                            </div>
                            <div className="datalist-value">{organization.name}</div>
                        </div>

                        <div className="datalist-row">
                            <div className="datalist-key text-primary text-right">
                                <strong>{t('modals.modal_voucher_transaction.labels.amount')}</strong>
                            </div>
                            <div className="datalist-value">{currencyFormat(parseFloat(formValues.amount))}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
