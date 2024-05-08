import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import { ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import ProductsForm from '../products-edit/elements/ProductsForm';

export default function SponsorProductsEdit() {
    const { id, fundId, fundProviderId } = useParams();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const [fundProvider, setFundProvider] = useState(null);

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, fundProviderId, pushDanger]);

    useEffect(() => fetchFundProvider(), [fetchFundProvider]);

    if (!fundProvider) {
        return <LoadingCard />;
    }

    return (
        <ProductsForm organization={activeOrganization} fund_provider={fundProvider} id={id ? parseInt(id) : null} />
    );
}
