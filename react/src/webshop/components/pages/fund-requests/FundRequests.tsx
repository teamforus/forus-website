import React, { Fragment, useCallback, useEffect, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import useFilter from '../../../../dashboard/hooks/useFilter';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import { useFundRequestService } from '../../../services/FundRequestService';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import { useNavigateState } from '../../../modules/state_router/Router';
import FundRequestCard from './elements/FundRequestCard';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';

export default function FundRequests() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const fundService = useFundService();
    const fundRequestService = useFundRequestService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [fundRequests, setFundRequests] = useState<PaginationData<FundRequest>>(null);

    const filters = useFilter({
        fund_id: null,
        archived: 0,
        page: 1,
        per_page: 15,
        order_by: 'no_answer_clarification',
        /*fund_id: $stateParams.fund_id || null,
        archived: $stateParams.archived || 0,
        page: $stateParams.page || 1,*/
    });

    // todo: query filters
    /*$ctrl.updateState = (query) => {
        $state.go(
            'fund-requests',
            {
                page: query.page,
                fund_id: query.fund_id,
                archived: query.archived,
                order_by: query.order_by,
                order_dir: query.order_dir,
            },
            { location: 'replace' },
        );
    };*/

    const fetchFunds = useCallback(() => {
        fundService
            .list({ per_page: 100 })
            .then((res) => setFunds([{ name: 'Alle tegoeden', id: null }, ...res.data.data]));
    }, [fundService]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        setProgress(0);

        fundRequestService
            .indexRequester({ ...filters.activeValues })
            .then((res) => setFundRequests(res.data))
            .finally(() => setProgress(100));
    }, [fundRequestService, filters.activeValues, setProgress]);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        {translate('fund_requests.header.title')}
                    </div>
                </div>
            }
            profileHeader={
                fundRequests && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{fundRequests.meta.total}</div>
                                <h1 className="profile-content-header">{translate('fund_requests.header.title')}</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            <div className="label-tab-set">
                                <div
                                    className={`label-tab label-tab-sm ${!filters.values.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="fundRequestsFilterActive"
                                    onClick={() => filters.update({ archived: 0 })}>
                                    Actief
                                </div>
                                <div
                                    className={`label-tab label-tab-sm ${filters.values.archived ? 'active' : ''}`}
                                    role="button"
                                    data-dusk="fundRequestsFilterArchived"
                                    onClick={() => filters.update({ archived: 1 })}>
                                    Archief
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            filters={
                funds && (
                    <div className="form form-compact">
                        <div className="profile-aside-block">
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_fund">
                                    Tegoeden
                                </label>
                                <SelectControl
                                    id="select_fund"
                                    value={filters.values.fund_id}
                                    options={funds}
                                    onChange={(fund_id?: number) => filters.update({ fund_id })}
                                    placeholder={funds?.[0]?.name}
                                />
                            </div>
                        </div>
                    </div>
                )
            }>
            {fundRequests && (
                <Fragment>
                    {fundRequests?.data?.length > 0 && (
                        <div className="block block-fund-requests" data-dusk="fundRequestsList">
                            {fundRequests.data.map((fundRequest) => (
                                <FundRequestCard key={fundRequest.id} fundRequest={fundRequest} />
                            ))}
                        </div>
                    )}

                    {fundRequests?.data?.length == 0 && (
                        <EmptyBlock
                            data-dusk="fundRequestsEmptyBlock"
                            title={translate('fund_requests.empty_block.title')}
                            description={translate('fund_requests.empty_block.subtitle')}
                            svgIcon={'fund-requests'}
                            hideLink={true}
                            button={{
                                text: translate('fund_requests.empty_block.cta'),
                                icon: 'arrow-right',
                                iconEnd: true,
                                type: 'primary',
                                onClick: (e) => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    navigateState('funds');
                                },
                            }}
                        />
                    )}

                    {fundRequests?.meta?.last_page > 1 && (
                        <div className="card">
                            <div className="card-section">
                                <Paginator
                                    meta={fundRequests.meta}
                                    filters={filters.values}
                                    updateFilters={filters.update}
                                    buttonClass={'button-primary-outline'}
                                />
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
