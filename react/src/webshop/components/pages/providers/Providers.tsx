import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import UIControlSearch from '../../../../dashboard/components/elements/forms/ui-controls/UIControlSearch';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { useBusinessTypeService } from '../../../../dashboard/services/BusinessTypeService';
import BusinessType from '../../../../dashboard/props/models/BusinessType';
import { useProviderService } from '../../../services/ProviderService';
import Office from '../../../../dashboard/props/models/Office';
import ProvidersListItem from '../../elements/lists/providers-list/ProvidersListItem';
import { GoogleMap } from '../../../../dashboard/components/elements/google-map/GoogleMap';
import MapMarkerProviderOffice from '../../elements/map-markers/MapMarkerProviderOffice';
import Provider from '../../../props/models/Provider';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';

export default function Providers() {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const providersService = useProviderService();
    const businessTypeService = useBusinessTypeService();
    const productCategoryService = useProductCategoryService();

    const [sortByOptions] = useState([
        { id: 1, label: 'Naam (oplopend)', value: { order_by: 'name', order_dir: 'asc' } },
        { id: 2, label: 'Naam (aflopend)', value: { order_by: 'name', order_dir: 'desc' } },
    ]);

    const [sortBy, setSortBy] = useState(sortByOptions[0]);
    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<Partial<BusinessType>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);
    const [productSubCategories, setProductSubCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const [showMap, setShowMap] = useState(false);

    const [offices, setOffices] = useState<Array<Office>>(null);
    const [providers, setProviders] = useState<PaginationData<Provider>>(null);

    const [productCategoryId, setProductCategoryId] = useState<number>(null);
    const [productSubCategoryId, setProductSubCategoryId] = useState<number>(null);

    const [distances] = useState([
        { id: null, name: 'Overal' },
        { id: 3, name: '< 3 km' },
        { id: 5, name: '< 5 km' },
        { id: 10, name: '< 10 km' },
        { id: 15, name: '< 15 km' },
        { id: 25, name: '< 25 km' },
        { id: 50, name: '< 50 km' },
        { id: 75, name: '< 75 km' },
    ]);

    const buildQuery = useCallback(
        (values) => ({
            q: values.q,
            page: values.page,
            fund_id: values.fund_id || null,
            business_type_id: values.business_type_id || null,
            product_category_id: values.product_category_id || null,
            postcode: values.postcode || '',
            distance: values.distance || null,
            ...sortBy.value,
        }),
        [sortBy],
    );

    const {
        values: filterValues,
        update: filterUpdate,
        activeValues: filterActiveValues,
    } = useFilter({
        q: '',
        fund_id: null,
        business_type_id: null,
        product_category_id: null,
        postcode: '',
        distance: null,
    });

    const countFiltersApplied = useMemo(() => {
        return [filterActiveValues.q, filterActiveValues.fund_id, filterActiveValues.business_type_id].filter(
            (value) => value,
        ).length;
    }, [filterActiveValues]);

    const fetchProviders = useCallback(
        (query) => {
            setErrors(null);
            setProgress(0);

            providersService
                .search(query)
                .then((res) => setProviders(res.data))
                .catch((err: ResponseError) => setErrors(err.data.errors))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    const fetchProvidersMap = useCallback(
        (query) => {
            setErrors(null);
            setProgress(0);

            providersService
                .search({ ...query, per_page: 1000 })
                .then((res) => setOffices(res.data.data.reduce((arr, provider) => arr.concat(provider.offices), [])))
                .catch((err: ResponseError) => setErrors(err.data.errors))
                .finally(() => setProgress(100));
        },
        [providersService, setProgress],
    );

    // todo: query filters
    /*const updateState = useCallback((query, location = 'replace') => {
        $state.go('providers', {
            q: query.q || '',
            page: query.page,
            fund_id: query.fund_id,
            postcode: query.postcode,
            distance: query.distance,
            business_type_id: query.business_type_id,
            product_category_id: query.product_category_id,
            show_map: showMap,
            show_menu: showModalFilters,
            order_by: query.order_by,
            order_dir: query.order_dir,
        }, { location });
    }, []);*/

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ has_products: 1 })
            .then((res) => setFunds([{ id: null, name: 'Alle tegoeden...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ parent_id: 'null', per_page: 9999, used: 1 })
            .then((res) => setBusinessTypes([{ id: null, name: 'Alle typen...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) => setProductCategories([{ id: null, name: 'Selecteer categorie...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress]);

    useEffect(() => {
        fetchFunds();
        fetchBusinessTypes();
        fetchProductCategories();
    }, [fetchFunds, fetchBusinessTypes, fetchProductCategories]);

    useEffect(() => {
        if (productCategoryId) {
            productCategoryService
                .list({
                    parent_id: productCategoryId,
                    per_page: 1000,
                    used: 1,
                })
                .then((res) => {
                    setProductSubCategoryId(null);
                    setProductSubCategories(
                        res.data.meta.total
                            ? [{ name: 'Selecteer subcategorie...', id: null }, ...res.data.data]
                            : null,
                    );
                });
        } else {
            setProductSubCategoryId(null);
            setProductSubCategories(null);
        }

        filterUpdate({ product_category_id: productCategoryId });
    }, [filterUpdate, productCategoryId, productCategoryService]);

    useEffect(() => {
        filterUpdate({ product_category_id: productSubCategoryId });
    }, [filterUpdate, productSubCategoryId]);

    useEffect(() => {
        if (showMap) {
            fetchProvidersMap(buildQuery(filterActiveValues));
        } else {
            fetchProviders(buildQuery(filterActiveValues));
        }
    }, [filterActiveValues, fetchProvidersMap, fetchProviders, buildQuery, showMap]);

    return (
        <BlockShowcasePage
            showCaseClassName={showMap ? 'block-showcase-fullscreen' : ''}
            countFiltersApplied={countFiltersApplied}
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Aanbieders
                    </div>
                </div>
            }
            aside={
                funds &&
                appConfigs &&
                businessTypes &&
                productCategories && (
                    <Fragment>
                        <div className="showcase-aside-block">
                            {showMap && (
                                <div className="showcase-subtitle">Selecteer een aanbieder voor meer informatie</div>
                            )}
                            <div className="form-group">
                                <UIControlSearch
                                    value={filterValues.q}
                                    onChangeValue={(q) => filterUpdate({ q })}
                                    ariaLabel={'Zoeken'}
                                    placeholder={'Zoek aanbieder'}
                                />

                                <FormError error={errors?.q} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="business_type_id">
                                    Type aanbieder
                                </label>
                                <SelectControl
                                    propKey={'id'}
                                    options={businessTypes}
                                    value={filterValues.business_type_id}
                                    onChange={(business_type_id?: number) => filterUpdate({ business_type_id })}
                                    placeholder="Selecteer type..."
                                    id="business_type_id"
                                    optionsComponent={SelectControlOptions}
                                />
                                <FormError error={errors?.business_type_id} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_category">
                                    Categorie
                                </label>
                                <SelectControl
                                    id={'select_category'}
                                    propKey={'id'}
                                    value={productCategoryId}
                                    allowSearch={true}
                                    onChange={(id: number) => setProductCategoryId(id)}
                                    options={productCategories || []}
                                    placeholder={productCategories?.[0]?.name}
                                    optionsComponent={SelectControlOptions}
                                />
                                {productCategoryId === filterValues.product_category_id && (
                                    <FormError error={errors?.product_category_id} />
                                )}
                            </div>
                            {productSubCategories?.length > 1 && (
                                <div className="form-group">
                                    <label className="form-label" htmlFor="select_sub_category">
                                        Subcategorie
                                    </label>
                                    <SelectControl
                                        id={'select_sub_category'}
                                        propKey={'id'}
                                        value={productSubCategoryId}
                                        allowSearch={true}
                                        onChange={(id: number) => setProductSubCategoryId(id)}
                                        options={productSubCategories || []}
                                        placeholder={productSubCategories?.[0]?.name}
                                        optionsComponent={SelectControlOptions}
                                    />
                                    {productSubCategoryId === filterValues.product_category_id && (
                                        <FormError error={errors?.product_category_id} />
                                    )}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label" htmlFor="select_fund">
                                    Tegoeden
                                </label>
                                {funds && (
                                    <SelectControl
                                        id={'select_fund'}
                                        propKey={'id'}
                                        value={filterValues.fund_id}
                                        allowSearch={true}
                                        onChange={(fund_id: number) => filterUpdate({ fund_id })}
                                        options={funds || []}
                                        placeholder={funds?.[0]?.name}
                                        optionsComponent={SelectControlOptions}
                                    />
                                )}
                            </div>
                            <div className="row">
                                <div className="col col-md-6">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="postcode">
                                            Postcode
                                        </label>
                                        <input
                                            className="form-control"
                                            id="postcode"
                                            value={filterValues.postcode}
                                            onChange={(e) => filterUpdate({ postcode: e.target.value })}
                                            placeholder="Postcode"
                                            type="text"
                                            aria-label="Postcode..."
                                        />
                                        <FormError error={errors?.postcode} />
                                    </div>
                                </div>
                                <div className="col col-md-6">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="distance">
                                            Afstand
                                        </label>

                                        <SelectControl
                                            id={'select_fund'}
                                            propKey={'id'}
                                            value={filterValues.distance}
                                            allowSearch={true}
                                            onChange={(distance: number) => filterUpdate({ distance })}
                                            options={distances || []}
                                            placeholder={distances?.[0]?.name}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={errors?.distance} />
                                    </div>
                                </div>
                            </div>
                            {showMap && (
                                <div className="showcase-result">
                                    Er zijn <div className="showcase-result-count">{providers.meta.total}</div>{' '}
                                    aanbieders gevonden
                                </div>
                            )}
                        </div>

                        {!showMap && appConfigs.pages.provider && (
                            <StateNavLink name={'sign-up'} className="button button-primary hide-sm">
                                <em className="mdi mdi-store-outline" aria-hidden="true" />
                                Aanmelden als aanbieder
                                <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                            </StateNavLink>
                        )}
                    </Fragment>
                )
            }>
            {appConfigs && providers && (
                <Fragment>
                    <div className="showcase-content-header showcase-content-header-compact">
                        <h1 className="showcase-filters-title">
                            <span>Aanbieders</span>
                            <div className="showcase-filters-title-count">{providers?.meta.total}</div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className={`showcase-filters-item ${showMap ? 'hide-sm' : ''}`}>
                                    <label className="form-label">Sorteer</label>
                                    <SelectControl
                                        id={'sort_by'}
                                        allowSearch={false}
                                        propKey={'id'}
                                        propValue={'label'}
                                        value={sortBy.id}
                                        options={sortByOptions}
                                        onChange={(id: number) => {
                                            setSortBy(sortByOptions.find((value) => value.id == id));
                                        }}
                                        placeholder="Sorteer"
                                        optionsComponent={SelectControlOptions}
                                    />
                                </div>
                                {appConfigs?.show_providers_map && (
                                    <div
                                        className={`block block-label-tabs pull-right ${
                                            showMap ? 'block-label-tabs-sm' : ''
                                        }`}>
                                        <button
                                            className={`label-tab label-tab-sm ${showMap ? '' : 'active'}`}
                                            onClick={() => setShowMap(false)}
                                            aria-pressed={!showMap}>
                                            <em className="mdi mdi-format-list-text icon-start" />
                                            Lijst
                                        </button>
                                        <button
                                            className={`label-tab label-tab-sm ${showMap ? 'active' : ''}`}
                                            onClick={() => setShowMap(true)}
                                            aria-pressed={showMap}>
                                            <em className="mdi mdi-map-marker-radius icon-start" />
                                            Kaart
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {appConfigs.pages.providers && <CmsBlocks page={appConfigs.pages.providers} />}
                    {!showMap && providers?.data.length > 0 && (
                        <div className="block block-organizations" id="providers_list">
                            {providers.data.map((provider) => (
                                <ProvidersListItem key={provider.id} provider={provider} display={'list'} />
                            ))}

                            {providers.meta.last_page > 1 && (
                                <div className="card">
                                    <div className="card-section">
                                        <Paginator
                                            meta={providers.meta}
                                            filters={filterValues}
                                            count-buttons={5}
                                            updateFilters={filterUpdate}
                                            buttonClass={'button-primary-outline'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {providers?.data?.length == 0 && !showMap && (
                        <EmptyBlock
                            title={translate('block_providers.empty.title')}
                            description={translate('block_providers.empty.subtitle')}
                            hideLink={true}
                            svgIcon={'reimbursements'}
                        />
                    )}
                    {showMap && (
                        <div className="block block-google-map">
                            {offices && (
                                <GoogleMap
                                    appConfigs={appConfigs}
                                    mapPointers={offices}
                                    mapGestureHandling={'greedy'}
                                    mapGestureHandlingMobile={'greedy'}
                                    markerTemplate={(office: Office) => <MapMarkerProviderOffice office={office} />}
                                />
                            )}
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcasePage>
    );
}
