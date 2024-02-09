import React from 'react';
import { useTranslation } from 'react-i18next';
import MollieConnection from '../../../../props/models/MollieConnection';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';

export default function MollieConnectionDetails({ mollieConnection }: { mollieConnection: MollieConnection }) {
    const { t } = useTranslation();

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">{t('mollie_connection.titles.general_information')}</div>
            </div>

            <div className="card-section">
                <div className="card-block card-block-keyvalue card-block-keyvalue-bordered">
                    <KeyValueItem label={t('mollie_connection.labels.completed_at')}>
                        {mollieConnection.completed_at_locale}
                    </KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.organization_name')}>
                        {mollieConnection.organization_name}
                    </KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.registration_number')}>
                        {mollieConnection.registration_number}
                    </KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.vat')}>{mollieConnection.vat_number}</KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.business_type')}>
                        {mollieConnection.business_type}
                    </KeyValueItem>
                </div>

                <div className="card-block card-block-keyvalue card-block-keyvalue-bordered">
                    <KeyValueItem label={t('mollie_connection.labels.address')}>{mollieConnection.street}</KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.country')}>
                        {mollieConnection.country_code}
                    </KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.city')}>{mollieConnection.city}</KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.postcode')}>
                        {mollieConnection.postcode}
                    </KeyValueItem>
                </div>

                <div className="card-block card-block-keyvalue">
                    <KeyValueItem label={t('mollie_connection.labels.first_name')}>
                        {mollieConnection.first_name}
                    </KeyValueItem>

                    <KeyValueItem label={t('mollie_connection.labels.last_name')}>
                        {mollieConnection.last_name}
                    </KeyValueItem>
                </div>
            </div>
        </div>
    );
}
