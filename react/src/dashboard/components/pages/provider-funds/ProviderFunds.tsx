import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useTranslation } from 'react-i18next';
import useProviderFundService from '../../../services/ProviderFundService';
import { ResponseError } from '../../../props/ApiResponses';
import usePushDanger from '../../../hooks/usePushDanger';
import ProviderFundsTable from './elements/ProviderFundsTable';
import ProviderFundUnsubscriptionsTable from './elements/ProviderFundUnsubscriptionsTable';
import ProviderAvailableFundsTable from './elements/ProviderAvailableFundsTable';
import ProviderFundInvitationsTable from './elements/ProviderFundInvitationsTable';

export default function ProviderFunds() {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();
    const providerFundService = useProviderFundService();

    const [tab, setTab] = useState('active');
    const [fundsAvailable, setFundsAvailable] = useState(null);

    const fetchFunds = useCallback(() => {
        providerFundService
            .listAvailableFunds(activeOrganization.id, { per_page: 1 })
            .then((res) => setFundsAvailable(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message));
    }, [activeOrganization.id, providerFundService, pushDanger]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!fundsAvailable) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading flex-row">
                <div className="flex-col flex-grow">{t('provider_funds.title.main')}</div>
                <div className="flex-col">
                    <div className="block block-label-tabs nowrap">
                        <div className="label-tab-set">
                            <div
                                className={`label-tab label-tab-sm ${tab == 'active' ? 'active' : ''}`}
                                onClick={() => setTab('active')}>
                                {t('provider_funds.tabs.active')} ({fundsAvailable.meta.totals.active})
                            </div>
                            <div
                                className={`label-tab label-tab-sm ${tab == 'pending_rejected' ? 'active' : ''}`}
                                onClick={() => setTab('pending_rejected')}>
                                {t('provider_funds.tabs.pending_rejected')} ({fundsAvailable.meta.totals.pending})
                            </div>

                            <div
                                className={`label-tab label-tab-sm ${tab == 'available' ? 'active' : ''}`}
                                onClick={() => setTab('available')}>
                                {t('provider_funds.tabs.available')} ({fundsAvailable.meta.totals.available})
                            </div>

                            <div
                                className={`label-tab label-tab-sm ${tab == 'archived' ? 'active' : ''}`}
                                onClick={() => setTab('archived')}>
                                {t('provider_funds.tabs.archived')} ({fundsAvailable.meta.totals.archived})
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-col">
                    <div className="block block-label-tabs nowrap">
                        <div className="label-tab-set">
                            <div
                                className={`label-tab label-tab-sm ${tab == 'invitations' ? 'active' : ''}`}
                                onClick={() => setTab('invitations')}>
                                {t('provider_funds.tabs.invitations')} ({fundsAvailable.meta.totals.invitations})
                            </div>

                            <div
                                className={`label-tab label-tab-sm ${tab == 'invitations_archived' ? 'active' : ''}`}
                                onClick={() => setTab('invitations_archived')}>
                                {t('provider_funds.tabs.invitations_archived')} (
                                {fundsAvailable.meta.totals.invitations_archived})
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-col">
                    <div className="block block-label-tabs nowrap">
                        <div className="label-tab-set">
                            <div
                                className={`label-tab label-tab-sm ${tab == 'unsubscriptions' ? 'active' : ''}`}
                                onClick={() => setTab('unsubscriptions')}>
                                <em className="mdi mdi-close-circle-outline label-tab-icon-start" />
                                {t('provider_funds.tabs.unsubscriptions')} ({fundsAvailable.meta.totals.unsubscriptions}
                                )
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active funds */}
            {tab == 'active' && (
                <ProviderFundsTable type={'active'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Pending and rejected funds */}
            {tab == 'pending_rejected' && (
                <ProviderFundsTable type={'pending_rejected'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Archived funds */}
            {tab == 'archived' && (
                <ProviderFundsTable type={'archived'} organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Fund unsubscription requests */}
            {tab == 'unsubscriptions' && (
                <ProviderFundUnsubscriptionsTable organization={activeOrganization} onChange={fetchFunds} />
            )}

            {/* Available funds */}
            {tab == 'available' && (
                <ProviderAvailableFundsTable
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}

            {/* Fund invitations */}
            {tab == 'invitations' && (
                <ProviderFundInvitationsTable
                    type="invitations"
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}

            {/* Expired and close funds (archive) */}
            {tab == 'invitations_archived' && (
                <ProviderFundInvitationsTable
                    type="invitations_archived"
                    organization={activeOrganization}
                    onChange={() => {
                        fetchFunds();
                        setTab('pending_rejected');
                    }}
                />
            )}
        </Fragment>
    );
}
