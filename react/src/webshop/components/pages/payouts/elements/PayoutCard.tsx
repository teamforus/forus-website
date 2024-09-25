import React, { useState } from 'react';
import PayoutTransaction from '../../../../../dashboard/props/models/PayoutTransaction';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function PayoutCard({ payoutTransaction }: { payoutTransaction: PayoutTransaction }) {
    const assetUrl = useAssetUrl();

    const [showMore, setShowMore] = useState(false);

    if (!payoutTransaction) {
        return null;
    }

    return (
        <div className="payout-item">
            <div className="payout-photo">
                <img
                    src={
                        payoutTransaction?.fund?.logo?.sizes?.thumbnail ||
                        payoutTransaction?.fund?.logo?.sizes?.small ||
                        assetUrl('/assets/img/placeholders/payout.svg')
                    }
                    alt=""
                />
            </div>

            <div className="payout-content">
                <div className="payout-content-main">
                    <div className="payout-details">
                        <div className="payout-name">{payoutTransaction.fund.name}</div>
                        <div className="payout-organization-name">{payoutTransaction.fund.organization_name}</div>
                        <div className="payout-price">{payoutTransaction.amount_locale}</div>

                        <button
                            type={'button'}
                            className="button button-text button-xs payout-read-more"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(!showMore);
                            }}
                            aria-expanded={showMore}
                            aria-controls="payout-details-extra">
                            {showMore ? 'Minder informatie' : 'Meer informatie'}
                            <em className={`mdi ${showMore ? 'mdi-chevron-up' : 'mdi-chevron-down'} icon-right`} />
                        </button>

                        <div className="payout-status-label">
                            {payoutTransaction.state === 'pending' && (
                                <div className="label label-warning">{payoutTransaction.state_locale}</div>
                            )}

                            {payoutTransaction.state === 'success' && (
                                <div className="label label-success">{payoutTransaction.state_locale}</div>
                            )}

                            {payoutTransaction.state === 'canceled' && (
                                <div className="label label-default">{payoutTransaction.state_locale}</div>
                            )}
                        </div>

                        <div className="payout-date">
                            <div className="payout-date-label">Uitbetaald op</div>
                            <div className="payout-date-value">{payoutTransaction.transfer_at_locale}</div>
                        </div>
                    </div>

                    {showMore && (
                        <div className={'payout-details-extra'} id="payout-details-extra">
                            <div className="block block-key-value-list block-key-value-list-pane">
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">ID:</div>
                                    <div className="key-value-list-item-value">{payoutTransaction.id}</div>
                                </div>
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">IBAN (van)</div>
                                    <div className="key-value-list-item-value">{payoutTransaction.iban_from}</div>
                                </div>
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">IBAN (naar)</div>
                                    <div className="key-value-list-item-value">{payoutTransaction.iban_to}</div>
                                </div>
                                <div className="block-key-value-list-item">
                                    <div className="key-value-list-item-label">IBAN naam (naar)</div>
                                    <div className="key-value-list-item-value">{payoutTransaction.iban_to_name}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
