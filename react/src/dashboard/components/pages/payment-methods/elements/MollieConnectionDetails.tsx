import React from 'react';
import { useTranslation } from 'react-i18next';
import MollieConnection from '../../../../props/models/MollieConnection';
import KeyValueItem from './KeyValueItem';

export default function MollieConnectionDetails({ mollieConnection }: { mollieConnection: MollieConnection }) {
    const { t } = useTranslation();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{t('mollie_connection.titles.general_information')}</div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-keyvalue card-block-keyvalue-bordered">
                    <KeyValueItem
                        label={t('mollie_connection.labels.completed_at')}
                        value={mollieConnection.completed_at_locale}
                    />

                    <KeyValueItem
                        label={t('mollie_connection.labels.organization_name')}
                        value={mollieConnection.organization_name}
                    />

                    <KeyValueItem
                        label={t('mollie_connection.labels.registration_number')}
                        value={mollieConnection.registration_number}
                    />

                    <KeyValueItem label={t('mollie_connection.labels.vat')} value={mollieConnection.vat_number} />

                    <KeyValueItem
                        label={t('mollie_connection.labels.business_type')}
                        value={mollieConnection.business_type}
                    />
                </div>

                <div className="card-block card-block-keyvalue card-block-keyvalue-bordered">
                    <KeyValueItem label={t('mollie_connection.labels.address')} value={mollieConnection.street} />

                    <KeyValueItem label={t('mollie_connection.labels.country')} value={mollieConnection.country_code} />

                    <KeyValueItem label={t('mollie_connection.labels.city')} value={mollieConnection.city} />

                    <KeyValueItem label={t('mollie_connection.labels.postcode')} value={mollieConnection.postcode} />
                </div>

                <div className="card-block card-block-keyvalue">
                    <KeyValueItem
                        label={t('mollie_connection.labels.first_name')}
                        value={mollieConnection.first_name}
                    />

                    <KeyValueItem label={t('mollie_connection.labels.last_name')} value={mollieConnection.last_name} />
                </div>
            </div>
        </div>
    );
}
