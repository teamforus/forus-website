import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushDanger from '../../../hooks/usePushDanger';
import { createEnumParam } from 'use-query-params';
import Paginator from '../../../modules/paginator/components/Paginator';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import { NavLink } from 'react-router-dom';
import useFundUnsubscribeService from '../../../services/FundUnsubscribeService';
import FundProviderUnsubscribe from '../../../props/models/FundProviderUnsubscribe';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import SponsorFundUnsubscriptionTableItem from './elements/SponsorFundUnsubscriptionTableItem';

export default function SponsorFundUnsubscriptions() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const fundUnsubscribeService = useFundUnsubscribeService();

    const [loading, setLoading] = useState(false);
    const [noteTooltip, setNoteTooltip] = useState(null);
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
            queryParams: { state: createEnumParam(['pending', 'approved', 'canceled']) },
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

    useEffect(() => fetchFundUnsubscribes(), [fetchFundUnsubscribes]);

    if (!fundUnsubscribes) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <NavLink
                className="button button-text"
                to={getStateRouteUrl('sponsor-provider-organizations', {
                    organizationId: activeOrganization.id,
                })}>
                <em className="mdi mdi-arrow-left icon-start" />
                Terug naar de vorige pagina
            </NavLink>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <span>Afmeldingen</span>
                                <span className="span-count">{fundUnsubscribes.meta.total}</span>
                            </div>
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

                {!loading && fundUnsubscribes.meta.total > 0 && (
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
                                                unsubscription={unsubscription}
                                                organization={activeOrganization}
                                                key={unsubscription.fund_provider.organization.id}
                                                noteTooltip={noteTooltip}
                                                setNoteTooltip={setNoteTooltip}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && fundUnsubscribes.meta.total == 0 && (
                    <EmptyCard type={'card-section'} title={'Geen fondsen gevonden'} />
                )}

                {!loading && fundUnsubscribes.meta && (
                    <div className="card-section" hidden={fundUnsubscribes.meta.last_page < 2}>
                        <Paginator
                            meta={fundUnsubscribes.meta}
                            filters={filterValues}
                            updateFilters={filtersUpdate}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}

                {loading && (
                    <div className="card-section">
                        <div className="card-loading">
                            <div className="mdi mdi-loading mdi-spin" />
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
