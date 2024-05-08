import React, { Fragment } from 'react';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization, { SponsorProviderOrganization } from '../../../../props/models/Organization';
import ThSortable from '../../../elements/tables/ThSortable';
import { useTranslation } from 'react-i18next';
import FilterModel from '../../../../types/FilterModel';
import FilterScope from '../../../../types/FilterScope';
import ProviderTableItem from './ProviderTableItem';

export default function ProviderTable({
    organization,
    providers,
    paginatorKey,
    filter,
}: {
    organization: Organization;
    providers: PaginationData<SponsorProviderOrganization>;
    paginatorKey: string;
    filter: FilterScope<FilterModel>;
}) {
    const { t } = useTranslation();

    return (
        <Fragment>
            {providers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable label={t('provider_organizations.labels.organization_name')} />
                                        <ThSortable label={t('provider_organizations.labels.last_active')} />
                                        <ThSortable label={t('provider_organizations.labels.product_count')} />
                                        <ThSortable label={t('provider_organizations.labels.funds_count')} />
                                        <ThSortable
                                            className="text-right"
                                            label={t('provider_organizations.labels.actions')}
                                        />
                                    </tr>
                                </tbody>

                                {providers.data.map((providerOrganization) => (
                                    <ProviderTableItem
                                        key={providerOrganization.id}
                                        organization={organization}
                                        providerOrganization={providerOrganization}
                                    />
                                ))}
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {providers.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen logboeken gevonden</div>
                    </div>
                </div>
            )}

            {providers.meta && (
                <div className="card-section">
                    <Paginator
                        meta={providers.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </Fragment>
    );
}
