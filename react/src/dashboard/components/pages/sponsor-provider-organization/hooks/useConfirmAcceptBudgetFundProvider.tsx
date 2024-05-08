import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalExportDataSelect from '../../../modals/ModalExportDataSelect';
import FundProvider from '../../../../props/models/FundProvider';
import { useTranslation } from 'react-i18next';

export default function useConfirmAcceptBudgetFundProvider() {
    const { t } = useTranslation();
    const openModal = useOpenModal();

    return useCallback(
        (fundProvider: FundProvider): Promise<object> => {
            return new Promise<object>((resolve) => {
                const state = 'accepted';

                const fields = [
                    {
                        key: 'allow_budget',
                        value: 'allow_budget',
                        name: 'Tegoed scannen',
                        label: 'Tegoed scannen',
                        selected: fundProvider.state === 'pending' || fundProvider.allow_budget,
                        icon: '',
                    },
                    {
                        key: 'allow_products',
                        value: 'allow_products',
                        name: 'Aanbod accepteren',
                        label: 'Aanbod accepteren',
                        selected: fundProvider.state === 'pending' || fundProvider.allow_products,
                        icon: '',
                    },
                ];

                openModal((modal) => (
                    <ModalExportDataSelect
                        modal={modal}
                        title={t(`modals.danger_zone.sponsor_provider_organization_state.${state}.title`)}
                        description={t(`modals.danger_zone.sponsor_provider_organization_state.${state}.description`)}
                        required={false}
                        sections={[
                            {
                                type: 'checkbox',
                                key: 'fields',
                                fields: fields,
                                fieldsPerRow: 2,
                                selectAll: false,
                                title: t(`modals.danger_zone.sponsor_provider_organization_state.${state}.options`),
                            },
                        ]}
                        onSuccess={(data: { fields: Array<string> }) => {
                            modal.close();
                            resolve({
                                state,
                                allow_budget: data.fields.includes('allow_budget'),
                                allow_products: data.fields.includes('allow_products'),
                            });
                        }}
                    />
                ));
            });
        },
        [openModal, t],
    );
}
