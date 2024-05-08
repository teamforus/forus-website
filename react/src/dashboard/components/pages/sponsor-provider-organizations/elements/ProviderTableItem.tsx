import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';
import { strLimit } from '../../../../helpers/string';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import Organization, { SponsorProviderOrganization } from '../../../../props/models/Organization';
import FundProviderTable from './FundProviderTable';
import { useTranslation } from 'react-i18next';
import { useOrganizationService } from '../../../../services/OrganizationService';
import usePushDanger from '../../../../hooks/usePushDanger';
import useFilter from '../../../../hooks/useFilter';
import FundProvider from '../../../../props/models/FundProvider';
import useSetProgress from '../../../../hooks/useSetProgress';

export default function ProviderTableItem({
    organization,
    providerOrganization,
}: {
    organization: Organization;
    providerOrganization: SponsorProviderOrganization;
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const organizationService = useOrganizationService();

    const [fundProviders, setFundProviders] = useState<PaginationData<FundProvider>>(null);
    const [showFundProviders, setShowFundProviders] = useState(false);

    const filter = useFilter({ q: '', per_page: 10, organization_id: providerOrganization.id });

    const fetchFundProviders = useCallback(() => {
        setProgress(0);

        organizationService
            .listProviders(organization.id, filter.activeValues)
            .then((res) => setFundProviders(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [filter.activeValues, organization.id, organizationService, pushDanger, setProgress]);

    useEffect(() => {
        if (showFundProviders) {
            fetchFundProviders();
        }
    }, [fetchFundProviders, showFundProviders]);

    return (
        <tbody>
            <tr
                onClick={() =>
                    navigate(
                        getStateRouteUrl('sponsor-provider-organization', {
                            id: providerOrganization.id,
                            organizationId: organization.id,
                        }),
                    )
                }>
                <td
                    onClick={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();

                        setShowFundProviders(!showFundProviders);
                    }}>
                    <div className="td-collapsable clickable">
                        <div className="collapsable-icon">
                            <div
                                className={`mdi icon-collapse ${
                                    showFundProviders ? 'mdi-menu-down' : 'mdi-menu-right'
                                }`}
                            />
                        </div>
                        <div className="collapsable-media">
                            <img
                                className="td-media td-media-sm"
                                src={
                                    providerOrganization.logo?.sizes?.thumbnail ||
                                    './assets/img/placeholders/organization-thumbnail.png'
                                }
                                alt={providerOrganization.name}
                            />
                        </div>
                        <div className="collapsable-content">
                            <div className="text-primary text-medium">{strLimit(providerOrganization.name, 40)}</div>
                        </div>
                    </div>
                </td>
                <td>{providerOrganization.last_activity_locale}</td>
                <td>{providerOrganization.products_count}</td>
                <td>{providerOrganization.funds.length}</td>
                <td className="text-right">
                    <NavLink
                        to={getStateRouteUrl('sponsor-provider-organization', {
                            id: providerOrganization.id,
                            organizationId: organization.id,
                        })}
                        className="button button-primary button-sm">
                        <em className="mdi mdi-eye-outline icon-start" />
                        {t('provider_organizations.buttons.view')}
                    </NavLink>
                </td>
            </tr>

            {showFundProviders && fundProviders && (
                <FundProviderTable organization={organization} fundProviders={fundProviders} filter={filter} />
            )}
        </tbody>
    );
}
