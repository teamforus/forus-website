import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushDanger from '../../../hooks/usePushDanger';
import { createEnumParam, NumberParam } from 'use-query-params';
import Paginator from '../../../modules/paginator/components/Paginator';
import useTranslate from '../../../hooks/useTranslate';
import useFundUnsubscribeService from '../../../services/FundUnsubscribeService';
import FundProviderUnsubscribe from '../../../props/models/FundProviderUnsubscribe';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import SponsorFundUnsubscriptionTableItem from './elements/SponsorFundUnsubscriptionTableItem';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';

export default function SponsorFundUnsubscriptions() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const paginatorService = usePaginatorService();
    const fundUnsubscribeService = useFundUnsubscribeService();

    const [loading, setLoading] = useState(false);
    const [paginatorKey] = useState('sponsor-fund-unsubscriptions');
    const [fundUnsubscribes, setFundUnsubscribes] = useState<PaginationData<FundProviderUnsubscribe>>(null);

    const [statesOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'approved', name: 'Gearchiveerd' },
        { key: 'canceled', name: 'Geannuleerd' },
    ]);

    const [filterValues, filterActiveValues, filtersUpdate] = useFilterNext<{
        page?: number;
        state?: string;
        per_page?: number;
    }>(
        {
            page: 1,
            state: null,
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParamsRemoveDefault: true,
            queryParams: {
                page: NumberParam,
                state: createEnumParam(['pending', 'approved', 'canceled']),
                per_page: NumberParam,
            },
        },
    );

    const fetchFundUnsubscribes = useCallback(() => {
        setProgress(0);
        setLoading(true);

        fundUnsubscribeService
            .listSponsor(activeOrganization.id, filterActiveValues)
            .then((res) => setFundUnsubscribes(res.data))
            .catch((err: ResponseError) => pushDanger(err.data.message))
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [activeOrganization.id, filterActiveValues, fundUnsubscribeService, pushDanger, setProgress]);

    useEffect(() => {
        fetchFundUnsubscribes();
    }, [fetchFundUnsubscribes]);

    if (!fundUnsubscribes) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <StateNavLink
                className="button button-text"
                name={'sponsor-provider-organizations'}
                params={{ organizationId: activeOrganization.id }}>
                <em className="mdi mdi-arrow-left icon-start" />
                Terug naar de vorige pagina
            </StateNavLink>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">Afmeldingen ({fundUnsubscribes.meta.total})</div>
                        </div>

                        <div className="block block-label-tabs nowrap pull-right">
                            <div className="label-tab-set">
                                {statesOptions.map((item) => (
                                    <div
                                        key={item.key}
                                        onClick={() => filtersUpdate({ state: item.key })}
                                        className={`label-tab label-tab-sm ${
                                            filterValues.state == item.key ? 'active' : ''
                                        }`}>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <LoaderTableCard
                    loading={loading}
                    empty={fundUnsubscribes.meta.total == 0}
                    emptyText={'Geen fondsen gevonden'}>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{translate('fund_unsubscriptions.labels.provider')}</th>
                                            <th>{translate('fund_unsubscriptions.labels.fund')}</th>
                                            <th>{translate('fund_unsubscriptions.labels.created_at')}</th>
                                            <th>{translate('fund_unsubscriptions.labels.note')}</th>
                                            <th>{translate('fund_unsubscriptions.labels.status')}</th>
                                            <th className="nowrap text-right">
                                                {translate('fund_unsubscriptions.labels.unsubscription_date')}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {fundUnsubscribes.data.map((unsubscription) => (
                                            <SponsorFundUnsubscriptionTableItem
                                                key={unsubscription.id}
                                                unsubscription={unsubscription}
                                                organization={activeOrganization}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {fundUnsubscribes.meta.total > 0 && (
                        <div className="card-section">
                            <Paginator
                                meta={fundUnsubscribes.meta}
                                filters={filterValues}
                                updateFilters={filtersUpdate}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </LoaderTableCard>
            </div>
        </Fragment>
    );
}
