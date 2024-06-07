import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useFilter from '../../../hooks/useFilter';
import { useFileService } from '../../../services/FileService';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import CardHeaderFilter from '../../elements/tables/elements/CardHeaderFilter';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../../elements/select-control/SelectControl';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useTranslation } from 'react-i18next';
import useFundUnsubscribeService from '../../../services/FundUnsubscribeService';
import { SponsorProviderOrganization } from '../../../props/models/Organization';
import ProviderTable from './elements/ProviderTable';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import useSetProgress from '../../../hooks/useSetProgress';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

export default function SponsorProviderOrganizations() {
    const { t } = useTranslation();

    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fileService = useFileService();
    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();
    const implementationService = useImplementationService();
    const fundUnsubscribeService = useFundUnsubscribeService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [providerOrganizations, setProviderOrganizations] =
        useState<PaginationData<SponsorProviderOrganization>>(null);
    const [requests, setRequests] = useState(null);
    const [paginatorKey] = useState('provider_organizations');
    const [requestsExpired, setRequestsExpired] = useState(null);
    const [requestsPending, setRequestsPending] = useState(null);

    const NullableNumberParam = withDefault(NumberParam, null);
    const [params, setQueryParams] = useQueryParams({
        q: StringParam,
        order_by: StringParam,
        fund_id: NullableNumberParam,
        allow_budget: NullableNumberParam,
        has_products: NullableNumberParam,
        allow_products: NullableNumberParam,
        implementation_id: NullableNumberParam,
        allow_extra_payments: NullableNumberParam,
    });

    const [orderByOptions] = useState([
        { value: 'application_date', name: 'Nieuwste eerst' },
        { value: 'name', name: 'Naam aflopend' },
    ]);

    const filter = useFilter({
        q: params.q || '',
        fund_id: params.fund_id,
        order_by: params.order_by || orderByOptions[0].value,
        per_page: paginatorService.getPerPage(paginatorKey),
        allow_budget: params.allow_budget,
        has_products: params.has_products,
        allow_products: params.allow_products,
        implementation_id: params.implementation_id,
        allow_extra_payments: params.allow_extra_payments,
    });

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties' }, ...res.data.data]))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, implementationService, pushDanger]);

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setFunds([{ id: null, name: 'Alle fondsen' }, ...res.data.data]))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    const fetchProviderOrganizations = useCallback(() => {
        setProgress(0);
        setQueryParams({ ...filter.activeValues });

        const query = {
            ...filter.activeValues,
            ...{
                order_dir: filter.activeValues.order_by == 'name' ? 'asc' : 'desc',
                allow_products: filter.activeValues.allow_products === -1 ? 'some' : filter.activeValues.allow_products,
            },
        };

        organizationService
            .providerOrganizations(activeOrganization.id, query)
            .then((res) => setProviderOrganizations(res.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, filter.activeValues, organizationService, pushDanger, setProgress, setQueryParams]);

    const fetchFundUnsubscribes = useCallback(() => {
        fundUnsubscribeService
            .listSponsor(activeOrganization.id, { per_page: 1000 })
            .then((res) => {
                setRequests(res.data.data.length);
                setRequestsExpired(res.data.data.filter((item) => item.state == 'overdue').length);
                setRequestsPending(res.data.data.filter((item) => item.state == 'pending').length);
            })
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
    }, [activeOrganization.id, fundUnsubscribeService, pushDanger]);

    const doExport = useCallback(
        (exportType: string) => {
            organizationService
                .providerOrganizationsExport(activeOrganization.id, { ...filter.activeValues, export_type: exportType })
                .then((res) => {
                    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    const fileName = `providers_${activeOrganization.id}_${dateTime}.${exportType}`;

                    fileService.downloadFile(fileName, res.data, res.headers['content-type']);
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
        },
        [pushDanger, fileService, filter.activeValues, activeOrganization, organizationService],
    );

    const exportList = useCallback(() => {
        openModal((modal) => (
            <ModalExportTypeLegacy
                modal={modal}
                onSubmit={(exportType) => {
                    doExport(exportType);
                }}
            />
        ));
    }, [doExport, openModal]);

    useEffect(() => fetchFunds(), [fetchFunds]);
    useEffect(() => fetchImplementations(), [fetchImplementations]);
    useEffect(() => fetchFundUnsubscribes(), [fetchFundUnsubscribes]);
    useEffect(() => fetchProviderOrganizations(), [fetchProviderOrganizations]);

    if (!funds || !implementations || !providerOrganizations) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card">
                {requests > 0 && (
                    <div
                        className={`card-block card-block-requests card-block-requests${
                            requestsExpired > 0 ? '-danger' : requestsPending > 0 ? '-warning' : ''
                        }`}>
                        <NavLink
                            to={getStateRouteUrl('sponsor-fund-unsubscriptions', {
                                organizationId: activeOrganization.id,
                            })}
                            className="card-section flex">
                            {requestsExpired > 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert" />
                                    Urgente afmeldingen ({requestsExpired})
                                </div>
                            )}

                            {requestsExpired == 0 && requestsPending > 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert-circle" />
                                    Afmeldingen ({requestsPending})
                                </div>
                            )}

                            {requestsExpired == 0 && requestsPending == 0 && (
                                <div className="card-heading">
                                    <em className="mdi mdi-alert-circle" />
                                    Geen nieuwe afmeldingen
                                </div>
                            )}

                            <NavLink
                                to={getStateRouteUrl('sponsor-fund-unsubscriptions', {
                                    organizationId: activeOrganization.id,
                                })}
                                className="button button-text pull-right">
                                Bekijken
                                <em className="mdi mdi-arrow-right icon-end" />
                            </NavLink>
                        </NavLink>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                {t('provider_organizations.header.title')}
                                &nbsp;
                                <span className="span-count">{providerOrganizations.meta.total}</span>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="block block-inline-filters">
                                {filter.show && (
                                    <div className="button button-text" onClick={() => filter.resetFilters()}>
                                        <em className="mdi mdi-close icon-start" />
                                        Wis filter
                                    </div>
                                )}
                                {!filter.show && (
                                    <div className="form">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">Sorteer op:</label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    className={'form-control form-control-text nowrap'}
                                                    options={orderByOptions}
                                                    propKey={'value'}
                                                    allowSearch={false}
                                                    value={filter.values.order_by}
                                                    optionsComponent={SelectControlOptions}
                                                    onChange={(order_by: string) => filter.update({ order_by })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                value={filter.values.q}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                                placeholder={t('event_logs.labels.search')}
                                            />
                                        </div>
                                    </div>
                                )}

                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label="Accepteer budget">
                                        <div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_yes"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filter.update({ allow_budget: 1 })}
                                                    defaultValue={1}
                                                    checked={filter.values.allow_budget === 1}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_yes">
                                                    <div className="radio-circle" />
                                                    Ja
                                                </label>
                                            </div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_no"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filter.update({ allow_budget: 0 })}
                                                    defaultValue={0}
                                                    checked={filter.values.allow_budget === 0}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_no">
                                                    <div className="radio-circle" />
                                                    Nee
                                                </label>
                                            </div>
                                            <div className="radio">
                                                <input
                                                    id="allow_budget_all"
                                                    type="radio"
                                                    name="allow_budget"
                                                    onChange={() => filter.update({ allow_budget: null })}
                                                    defaultValue={null}
                                                    checked={filter.values.allow_budget === null}
                                                />
                                                <label className="radio-label" htmlFor="allow_budget_all">
                                                    <div className="radio-circle" />
                                                    Alles
                                                </label>
                                            </div>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Accepteer aanbiedingen">
                                        <div className="radio">
                                            <input
                                                id="allow_products_yes"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filter.update({ allow_products: 1 })}
                                                defaultValue={1}
                                                checked={filter.values.allow_products === 1}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_yes">
                                                <div className="radio-circle" />
                                                Alle aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_some"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filter.update({ allow_products: -1 })}
                                                defaultValue={-1}
                                                checked={filter.values.allow_products === -1}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_some">
                                                <div className="radio-circle" />
                                                Sommige aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_no"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filter.update({ allow_products: 0 })}
                                                defaultValue={0}
                                                checked={filter.values.allow_products === 0}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_no">
                                                <div className="radio-circle" />
                                                Geen aanbiedingen
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_products_all"
                                                type="radio"
                                                name="allow_products"
                                                onChange={() => filter.update({ allow_products: null })}
                                                defaultValue={null}
                                                checked={filter.values.allow_products === null}
                                            />
                                            <label className="radio-label" htmlFor="allow_products_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Levert producten">
                                        <div className="radio">
                                            <input
                                                id="has_products_yes"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filter.update({ has_products: 1 })}
                                                defaultValue={1}
                                                checked={filter.values.has_products === 1}
                                            />
                                            <label className="radio-label" htmlFor="has_products_yes">
                                                <div className="radio-circle" />
                                                Ja
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="has_products_no"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filter.update({ has_products: 0 })}
                                                defaultValue={0}
                                                checked={filter.values.has_products === 0}
                                            />
                                            <label className="radio-label" htmlFor="has_products_no">
                                                <div className="radio-circle" />
                                                Nee
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="has_products_all"
                                                type="radio"
                                                name="has_products"
                                                onChange={() => filter.update({ has_products: null })}
                                                defaultValue={null}
                                                checked={filter.values.has_products === null}
                                            />
                                            <label className="radio-label" htmlFor="has_products_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Betaalmethode toestaan">
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_yes"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filter.update({ allow_extra_payments: 1 })}
                                                defaultValue={1}
                                                checked={filter.values.allow_extra_payments === 1}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_yes">
                                                <div className="radio-circle" />
                                                Ja
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_no"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filter.update({ allow_extra_payments: 0 })}
                                                defaultValue={0}
                                                checked={filter.values.allow_extra_payments === 0}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_no">
                                                <div className="radio-circle" />
                                                Nee
                                            </label>
                                        </div>
                                        <div className="radio">
                                            <input
                                                id="allow_extra_payments_all"
                                                type="radio"
                                                name="allow_extra_payments"
                                                onChange={() => filter.update({ allow_extra_payments: null })}
                                                defaultValue={null}
                                                checked={filter.values.allow_extra_payments === null}
                                            />
                                            <label className="radio-label" htmlFor="allow_extra_payments_all">
                                                <div className="radio-circle" />
                                                Alles
                                            </label>
                                        </div>
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Fondsen">
                                        <SelectControl
                                            className={'form-control'}
                                            options={funds}
                                            propKey={'id'}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            value={filter.values.fund_id}
                                            onChange={(fund_id: number) => filter.update({ fund_id })}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label="Implementatie">
                                        <SelectControl
                                            className={'form-control'}
                                            options={implementations}
                                            propKey={'id'}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            value={filter.values.implementation_id}
                                            onChange={(implementation_id: number) =>
                                                filter.update({ implementation_id })
                                            }
                                        />
                                    </FilterItemToggle>

                                    <div className="form-actions">
                                        {providerOrganizations && (
                                            <button
                                                className="button button-primary button-wide"
                                                disabled={providerOrganizations.meta.total == 0}
                                                onClick={() => exportList()}>
                                                <em className="mdi mdi-download icon-start" />
                                                {t('components.dropdown.export', {
                                                    total: providerOrganizations.meta.total,
                                                })}
                                            </button>
                                        )}
                                    </div>
                                </CardHeaderFilter>
                            </div>
                        </div>
                    </div>
                </div>

                <ProviderTable
                    providers={providerOrganizations}
                    organization={activeOrganization}
                    paginatorKey={paginatorKey}
                    filter={filter}
                />
            </div>
        </Fragment>
    );
}
