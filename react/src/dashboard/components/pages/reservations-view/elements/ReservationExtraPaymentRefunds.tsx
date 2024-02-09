import React from 'react';
import ExtraPaymentRefund from '../../../../props/models/ExtraPaymentRefund';
import { useTranslation } from 'react-i18next';

export default function ReservationExtraPaymentRefunds({ refunds }: { refunds: Array<ExtraPaymentRefund> }) {
    const { t } = useTranslation();

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            <span>{t('reservation.header.refunds.title')}</span>
                            &nbsp;
                            <span className="span-count">{refunds.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-table form">
                    <div className="table-wrapper">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <th>{t('reservation.labels.refund_date')}</th>
                                    <th>{t('reservation.labels.refund_amount')}</th>
                                    <th>{t('reservation.labels.status')}</th>
                                </tr>
                                {refunds?.map((refund) => (
                                    <tr key={refund.id}>
                                        <td>
                                            <strong className="text-strong text-md text-muted-dark">
                                                {refund.created_at_locale}
                                            </strong>
                                        </td>
                                        <td>{refund.amount_locale}</td>
                                        <td>
                                            {refund.state == 'refunded' && (
                                                <div className="tag tag-sm tag-success">{refund.state_locale}</div>
                                            )}

                                            {['canceled', 'failed'].includes(refund.state) && (
                                                <div className="tag tag-sm tag-danger">{refund.state_locale}</div>
                                            )}

                                            {!['refunded', 'canceled', 'failed'].includes(refund.state) && (
                                                <div className="tag tag-sm tag-warning">{refund.state_locale}</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
