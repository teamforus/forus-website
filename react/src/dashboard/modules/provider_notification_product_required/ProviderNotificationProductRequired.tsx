import React, { useEffect, useState } from 'react';
import ModalFundsProviderProductsRequired from '../../components/modals/ModalFundsProviderProductsRequired';
import useStorageService from '../storage/useStrorrageService';
import useOpenModal from '../../hooks/useOpenModal';
import { useStateRoutes } from '../state_router/Router';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import { useFundService } from '../../services/FundService';
import Fund from '../../props/models/Fund';

export default function ProviderNotificationProductRequired() {
    const { route } = useStateRoutes();
    const storage = useStorageService();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [providerWarningModalCanOpen, setProviderWarningModalCanOpen] = useState(false);
    const [funds, setFunds] = useState<Array<Fund>>(null);

    useEffect(() => {
        if (providerWarningModalCanOpen) {
            fundService.listFundsProviderProductsRequired(activeOrganization.id).then((res) => {
                if (res.data.data.length > 0) {
                    openModal((modal) => <ModalFundsProviderProductsRequired modal={modal} funds={res.data.data} />);
                }

                setFunds(res.data.data);
            });
        }
    }, [activeOrganization?.id, fundService, openModal, providerWarningModalCanOpen]);

    useEffect(() => {
        const canShowOnPage = route?.state?.name !== 'provider-overview';
        const modalWasClosed = storage.getCollectionWithExpiry('funds_provider_products_required');

        if (activeOrganization && canShowOnPage && !modalWasClosed && !funds) {
            setProviderWarningModalCanOpen(true);
        }
    }, [route.pathname, route?.state?.name, activeOrganization, storage, funds]);

    return null;
}
