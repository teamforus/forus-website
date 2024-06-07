import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useParams } from 'react-router-dom';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import ModalNotification from '../../modals/ModalNotification';
import useOpenModal from '../../../hooks/useOpenModal';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import useSetProgress from '../../../hooks/useSetProgress';
import OrganizationsFundsShowFormulasCard from './elements/OrganizationsFundsShowFormulasCard';
import OrganizationsFundsShowCriteriaCard from './elements/OrganizationsFundsShowCriteriaCard';
import OrganizationsFundsShowStatisticsCard from './elements/OrganizationsFundsShowStatisticsCard';
import OrganizationsFundsShowDescriptionCard from './elements/OrganizationsFundsShowDescriptionCard';
import OrganizationsFundsShowTopUpsCard from './elements/OrganizationsFundsShowTopUpsCard';
import OrganizationsFundsShowImplementationsCard from './elements/OrganizationsFundsShowImplementationsCard';
import OrganizationsFundsShowIdentitiesCard from './elements/OrganizationsFundsShowIdentitiesCard';
import { createEnumParam, useQueryParam, withDefault } from 'use-query-params';

export default function OrganizationsFundsShow() {
    const fundId = useParams().fundId;

    const openModal = useOpenModal();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);

    const [viewType, setViewType] = useQueryParam(
        'view',
        withDefault(createEnumParam(['description', 'formulas', 'statistics', 'criteria']), 'description'),
        { removeDefaultsFromUrl: true },
    );

    const canManageFunds = useMemo(() => hasPermission(activeOrganization, 'manage_funds'), [activeOrganization]);
    const canViewFinances = useMemo(() => hasPermission(activeOrganization, 'view_finances'), [activeOrganization]);

    const canViewIdentities = useMemo(
        () => hasPermission(activeOrganization, ['manage_implementation_notifications', 'manage_vouchers']),
        [activeOrganization],
    );

    const canViewImplementation = useMemo(
        () => hasPermission(activeOrganization, 'manage_implementation'),
        [activeOrganization],
    );

    const availableViewTables = useMemo(() => {
        return [
            canViewFinances ? 'top_ups' : null,
            canViewIdentities ? 'identities' : null,
            canViewImplementation ? 'implementations' : null,
        ].filter((item) => item);
    }, [canViewImplementation, canViewFinances, canViewIdentities]);

    const defaultViewTable = useMemo(() => {
        if (fund?.is_configured && availableViewTables.includes('top_ups')) {
            return 'top_ups';
        }

        if (availableViewTables.includes('implementations')) {
            return 'implementations';
        }

        return availableViewTables.includes('identities') ? 'identities' : null;
    }, [availableViewTables, fund?.is_configured]);

    const [viewTable, setViewTable] = useQueryParam(
        'table_view',
        withDefault(createEnumParam(availableViewTables), defaultViewTable),
        { removeDefaultsFromUrl: true },
    );

    const viewTypes = useMemo<Array<{ key: 'top_ups' | 'identities' | 'implementations'; name: string }>>(
        () => [
            ...(fund?.is_configured && canViewFinances
                ? [{ key: 'top_ups' as 'top_ups' | 'identities' | 'implementations', name: 'Webshop' }]
                : []),
            ...(canViewImplementation
                ? [
                      {
                          key: 'implementations' as 'top_ups' | 'identities' | 'implementations',
                          name: 'Bekijk aanvullingen',
                      },
                  ]
                : []),
            ...(canViewIdentities
                ? [{ key: 'identities' as 'top_ups' | 'identities' | 'implementations', name: 'Aanvragers' }]
                : []),
        ],
        [canViewImplementation, canViewFinances, canViewIdentities, fund?.is_configured],
    );

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, parseInt(fundId), { stats: 'budget' })
            .then((res) => setFund(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId]);

    const deleteFund = useCallback(
        (fund: Fund) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    icon={'product-error'}
                    title={translate('fund_card_sponsor.confirm_delete.title')}
                    description={translate('fund_card_sponsor.confirm_delete.description')}
                    buttonCancel={{ onClick: () => modal.close() }}
                    buttonSubmit={{
                        onClick: () => {
                            fundService.destroy(activeOrganization.id, fund.id).then(() => {
                                modal.close();
                                navigateState('organization-funds', { organizationId: activeOrganization.id });
                            });
                        },
                    }}
                />
            ));
        },
        [activeOrganization.id, fundService, navigateState, openModal, translate],
    );

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="organization-funds"
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    {translate('page_state_titles.funds')}
                </StateNavLink>

                <div className="breadcrumb-item active">{fund.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <div className="block block-fund">
                        <div className="fund-overview">
                            <div className="fund-media">
                                <img
                                    className="fund-media-img"
                                    src={fund.logo?.sizes.thumbnail || './assets/img/placeholders/fund-thumbnail.png'}
                                    alt={''}
                                />
                            </div>

                            <div className="fund-details">
                                <div className="fund-header">
                                    <div className="fund-name">{fund.name}</div>
                                    {fund.state == 'active' && (
                                        <div className="tag tag-success tag-sm">
                                            {translate('components.organization_funds.states.active')}
                                        </div>
                                    )}

                                    {fund.state == 'paused' && (
                                        <div className="tag tag-warning tag-sm">
                                            {translate('components.organization_funds.states.paused')}
                                        </div>
                                    )}

                                    {fund.state == 'closed' && (
                                        <div className="tag tag-default tag-sm">
                                            {translate('components.organization_funds.states.closed')}
                                        </div>
                                    )}
                                </div>

                                <div className="fund-description">{fund.description_short}</div>
                            </div>
                        </div>

                        <div className="fund-actions">
                            <div className="button-group flex-end">
                                {canManageFunds && activeOrganization.allow_2fa_restrictions && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-security"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-security icon-start" />
                                        {translate('fund_card_sponsor.buttons.security')}
                                    </StateNavLink>
                                )}

                                {canManageFunds && fund.state == 'waiting' && (
                                    <button className="button button-default" onClick={() => deleteFund(fund)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        Verwijderen
                                    </button>
                                )}

                                {hasPermission(fund.organization, ['manage_funds', 'manage_fund_texts']) && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-edit"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        Bewerken
                                    </StateNavLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col">
                            <div className="card-title">
                                {translate(`funds_show.labels.base_card.header.${viewType}`)}
                            </div>
                        </div>

                        <div className="flex">
                            <div className="block block-inline-filters">
                                <div className="flex">
                                    <div>
                                        <div className="block block-label-tabs pull-right">
                                            <div className="label-tab-set">
                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewType == 'description' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewType('description')}>
                                                    Beschrijving
                                                </div>

                                                {canManageFunds && (
                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'formulas' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('formulas')}>
                                                        Rekenregels
                                                    </div>
                                                )}

                                                {canViewFinances && (
                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'statistics' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('statistics')}>
                                                        Statistieken
                                                    </div>
                                                )}

                                                {canManageFunds && (
                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'criteria' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('criteria')}>
                                                        Voorwaarden
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewType == 'description' && <OrganizationsFundsShowDescriptionCard fund={fund} />}
                {viewType == 'formulas' && <OrganizationsFundsShowFormulasCard fund={fund} />}
                {viewType == 'criteria' && <OrganizationsFundsShowCriteriaCard fund={fund} setFund={setFund} />}

                {viewType == 'statistics' && (
                    <OrganizationsFundsShowStatisticsCard fund={fund} organization={activeOrganization} />
                )}
            </div>

            {viewTable === 'top_ups' && (
                <OrganizationsFundsShowTopUpsCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}

            {viewTable === 'implementations' && (
                <OrganizationsFundsShowImplementationsCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}

            {viewTable === 'identities' && (
                <OrganizationsFundsShowIdentitiesCard
                    fund={fund}
                    viewType={viewTable}
                    viewTypes={viewTypes}
                    setViewType={setViewTable}
                />
            )}
        </Fragment>
    );
}
