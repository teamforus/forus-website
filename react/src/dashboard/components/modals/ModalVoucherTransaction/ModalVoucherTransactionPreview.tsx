import React, { useMemo } from 'react';
import Reimbursement from '../../../props/models/Reimbursement';
import Organization from '../../../props/models/Organization';
import { currencyFormat } from '../../../helpers/string';
import useTranslate from '../../../hooks/useTranslate';

export default function ModalVoucherTransactionPreview({
    formValues,
    providers,
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
    providers?: Array<Partial<Organization>>;
    organization: Organization;
    reimbursement: Partial<Reimbursement>;
}) {
    const translate = useTranslate();

    const providersById = useMemo(() => {
        return providers?.reduce((list, item) => ({ ...list, [item.id]: item }), {});
    }, [providers]);

    return (
        <div className="modal-section">
            <div className="row">
                <div className="col col-lg-8 col-lg-offset-2">
                    <div className="block block-compact-datalist">
                        {formValues.target === 'provider' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{translate('modals.modal_voucher_transaction.labels.provider')}</strong>
                                </div>
                                <div className="datalist-value">
                                    {providersById?.[formValues.organization_id]?.name}
                                </div>
                            </div>
                        )}

                        {formValues.target === 'iban' && (
                            <div className="datalist-row">
                                <div className="datalist-key text-primary text-right">
                                    <strong>{translate('modals.modal_voucher_transaction.labels.target_iban')}</strong>
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
                                    <strong>{translate('modals.modal_voucher_transaction.labels.target_name')}</strong>
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
                                <strong>{translate('modals.modal_voucher_transaction.labels.organization')}</strong>
                            </div>
                            <div className="datalist-value">{organization.name}</div>
                        </div>

                        <div className="datalist-row">
                            <div className="datalist-key text-primary text-right">
                                <strong>{translate('modals.modal_voucher_transaction.labels.amount')}</strong>
                            </div>
                            <div className="datalist-value">{currencyFormat(parseFloat(formValues.amount))}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
