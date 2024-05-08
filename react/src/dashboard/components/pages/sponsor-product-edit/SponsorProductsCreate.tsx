import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import { ResponseError } from '../../../props/ApiResponses';
import ProductsForm from '../products-edit/elements/ProductsForm';
import { useFundService } from '../../../services/FundService';
import usePushDanger from '../../../hooks/usePushDanger';
import useSetProgress from '../../../hooks/useSetProgress';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { NumberParam, useQueryParams } from 'use-query-params';

export default function SponsorProductsCreate() {
    const { fundId, fundProviderId } = useParams();

    const [{ source_id }] = useQueryParams({
        source_id: NumberParam,
    });

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

    return <ProductsForm organization={activeOrganization} fund_provider={fundProvider} source_id={source_id} />;
}
