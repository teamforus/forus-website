import React, { Fragment } from 'react';
import Paginator from '../../../../modules/paginator/components/Paginator';
import { PaginationData } from '../../../../props/ApiResponses';
import Organization, { SponsorProviderOrganization } from '../../../../props/models/Organization';
import ThSortable from '../../../elements/tables/ThSortable';
import FilterModel from '../../../../types/FilterModel';
import FilterScope from '../../../../types/FilterScope';
import ProvidersTableItem from './ProvidersTableItem';
import useTranslate from '../../../../hooks/useTranslate';
import EmptyCard from '../../../elements/empty-card/EmptyCard';

export default function ProvidersTable({
    filter,
    providers,
    organization,
    paginatorKey,
}: {
    filter: FilterScope<FilterModel>;
    providers: PaginationData<SponsorProviderOrganization>;
    organization: Organization;
    paginatorKey: string;
}) {
    const translate = useTranslate();

    return (
        <Fragment>
            {providers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable
                                            label={translate('provider_organizations.labels.organization_name')}
                                        />
                                        <ThSortable label={translate('provider_organizations.labels.last_active')} />
                                        <ThSortable label={translate('provider_organizations.labels.product_count')} />
                                        <ThSortable label={translate('provider_organizations.labels.funds_count')} />
                                        <ThSortable
                                            className="text-right"
                                            label={translate('provider_organizations.labels.actions')}
                                        />
                                    </tr>
                                </tbody>

                                {providers.data.map((providerOrganization) => (
                                    <ProvidersTableItem
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
                <EmptyCard title={'Je hebt nog geen verzoeken van aanbieders'} type={'card-section'} />
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
