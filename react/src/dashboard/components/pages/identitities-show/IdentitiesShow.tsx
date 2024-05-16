import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useFundService } from '../../../services/FundService';
import useSetProgress from '../../../hooks/useSetProgress';
import Fund from '../../../props/models/Fund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Identity from '../../../props/models/Identity';
import BlockCardVouchers from './elements/BlockCardVouchers';

export default function IdentitiesShow() {
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [identity, setIdentity] = useState<Identity>(null);

    const fund_id = parseInt(useParams().fundId);
    const identity_id = parseInt(useParams().id);

    const [filterValues, setFilterValues] = useState({
        q: '',
        order_by: 'id',
        order_dir: 'asc',
        per_page: 10,
        type: 'all',
        source: 'all',
        fund_id: fund_id,
        identity_address: identity?.address,
    });

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, fund_id)
            .then((res) => {
                setFund(res.data.data);
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, fund_id, setProgress]);

    const fetchIdentity = useCallback(() => {
        setProgress(0);

        fundService
            .readIdentity(activeOrganization.id, fund_id, identity_id)
            .then((res) => {
                setIdentity(res.data.data);
                setFilterValues((filterValues) => ({
                    ...filterValues,
                    identity_address: res.data.data.address,
                }));
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, fund_id, identity_id, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="funds-show"
                    params={{ organizationId: activeOrganization.id, fundId: fund_id }}>
                    {fund?.name}
                </StateNavLink>

                <div className="breadcrumb-item active">{identity?.email}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                <span>{identity?.email}</span>
                            </div>
                        </div>

                        {identity?.bsn && (
                            <div className="flex flex-self-start">
                                <div className="card-title">
                                    <span className="text-strong text-md text-primary">BSN:</span>
                                    <span className="text-strong text-md text-muted-dark">{identity.bsn}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {identity && (
                <BlockCardVouchers
                    organization={activeOrganization}
                    fund={fund}
                    filterValues={filterValues}
                    blockTitle={'Vouchers'}
                />
            )}
        </Fragment>
    );
}
