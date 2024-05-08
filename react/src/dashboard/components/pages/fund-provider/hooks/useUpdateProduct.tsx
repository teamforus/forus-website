import React, { useCallback } from 'react';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import usePushDanger from '../../../../hooks/usePushDanger';
import { useFundService } from '../../../../services/FundService';
import FundProvider from '../../../../props/models/FundProvider';
import useStopActionConfirmation from './useStopActionConfirmation';
import Product from '../../../../props/models/Product';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import ModalNotification from '../../../modals/ModalNotification';
import Organization from '../../../../props/models/Organization';
import { useTranslation } from 'react-i18next';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useOrganizationService } from '../../../../services/OrganizationService';

export default function useUpdateProduct() {
    const { t } = useTranslation();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const fundService = useFundService();
    const stopActionConfirmation = useStopActionConfirmation();

    const organizationService = useOrganizationService();

    const updateProduct = useCallback(
        (fundProvider: FundProvider, query: object) => {
            return new Promise<FundProvider>((resolve, reject) => {
                fundService
                    .updateProvider(fundProvider.fund.organization_id, fundProvider.fund.id, fundProvider.id, query)
                    .then((res: ApiResponseSingle<FundProvider>) => {
                        pushSuccess('Opgeslagen!');
                        resolve(res.data.data);
                    })
                    .catch((err: ResponseError) => {
                        pushDanger('Mislukt!', err.data.message);
                        reject();
                    });
            });
        },
        [fundService, pushDanger, pushSuccess],
    );

    const disableProduct = useCallback(
        (fundProvider: FundProvider, product: Product): Promise<FundProvider> => {
            return new Promise<FundProvider>((resolve) => {
                stopActionConfirmation()
                    .then(() =>
                        updateProduct(fundProvider, {
                            enable_products: [],
                            disable_products: [product.id],
                        }).then((res: FundProvider) => resolve(res)),
                    )
                    .catch((err) => err);
            });
        },
        [stopActionConfirmation, updateProduct],
    );

    const deleteProduct = useCallback(
        (organization: Organization, fundProvider: FundProvider, product: Product) => {
            return new Promise<boolean>((resolve) => {
                openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        title="Weet u zeker dat u het aanbod wilt verwijderen?"
                        description={`U staat op het punt om ${product.name} te verwijderen. Weet u zeker dat u dit aanbod wilt verwijderen?`}
                        buttonCancel={{
                            text: t('modal.buttons.cancel'),
                            onClick: () => modal.close(),
                        }}
                        buttonSubmit={{
                            text: t('modal.buttons.confirm'),
                            onClick: () => {
                                modal.close();
                                organizationService
                                    .sponsorProductDelete(organization.id, fundProvider.organization_id, product.id)
                                    .then(() => resolve(true));
                            },
                        }}
                    />
                ));
            });
        },
        [openModal, organizationService, t],
    );

    return {
        updateProduct,
        deleteProduct,
        disableProduct,
    };
}
