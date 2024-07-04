import React, { Fragment, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import ProviderFinancialTable from './elements/ProviderFinancialTable';
import FinancialStatistics from './elements/FinancialStatistics';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FinancialChart from './elements/FinancialChart';
import FinancialFilters, { FinancialFiltersQuery } from './elements/FinancialFilters';
import { useFundService } from '../../../services/FundService';
import useSetProgress from '../../../hooks/useSetProgress';
import { ProviderFinancialStatistics, ProviderFinancialFilterOptions } from './types/FinancialStatisticTypes';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useTranslate from '../../../hooks/useTranslate';

export default function FinancialDashboard() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const fundService = useFundService();

    const [options, setOptions] = useState<ProviderFinancialFilterOptions>(null);
    const [chartData, setChartData] = useState<ProviderFinancialStatistics>(null);
    const [externalFilters, setExternalFilters] = useState<FinancialFiltersQuery>(null);

    useEffect(() => {
        // wait for external filters to prevent not filtered requests
        if (externalFilters) {
            setProgress(0);

            fundService
                .readFinances(activeOrganization.id, externalFilters)
                .then((res) => setChartData(res.data))
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
                .finally(() => setProgress(100));
        }
    }, [activeOrganization.id, fundService, externalFilters, setProgress, pushDanger]);

    useEffect(() => {
        fundService
            .readFinances(activeOrganization.id, { filters: 1 })
            .then((res) => setOptions(res.data.filters))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    if (!options) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">{translate('financial_dashboard.header.title')}</div>
            <div className="block block-financial-dashboard">
                <FinancialFilters options={options} onChange={setExternalFilters} />

                {chartData && (
                    <Fragment>
                        <FinancialChart chartData={chartData} />
                        <FinancialStatistics chartData={chartData} />
                        <ProviderFinancialTable externalFilters={externalFilters} />
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}
