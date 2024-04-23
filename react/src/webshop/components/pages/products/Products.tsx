import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useProductService } from '../../../services/ProductService';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { PaginationData, ResponseError } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import Organization from '../../../../dashboard/props/models/Organization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import UIControlSearch from '../../../../dashboard/components/elements/forms/ui-controls/UIControlSearch';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../../dashboard/components/elements/select-control/templates/SelectControlOptions';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useAppConfigs from '../../../hooks/useAppConfigs';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import BlockLoader from '../../../../dashboard/components/elements/block-loader/BlockLoader';

export default function Products({ fundType = 'budget' }: { fundType: 'budget' | 'subsidies' }) {
    const translate = useTranslate();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const productService = useProductService();
    const organizationService = useOrganizationService();
    const productCategoryService = useProductCategoryService();

    const setProgress = useSetProgress();

    const [sortByOptions] = useState(productService.getSortOptions());
    const [sortBy, setSortBy] = useState(sortByOptions[0]);
    const [displayType, setDisplayType] = useState<'list' | 'grid'>('list');

    const [errors, setErrors] = useState<{ [key: string]: string | Array<string> }>({});

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);
    const [productSubCategories, setProductSubCategories] = useState<Array<Partial<ProductCategory>>>(null);

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

    const {
        values: filterValues,
        update: filterUpdate,
        activeValues: filterActiveValues,
    } = useFilter({
        q: '',
        fund_id: null,
        organization_id: null,
        product_category_id: null,
        postcode: '',
        distance: null,
        bookmarked: 0,
    });

    const countFiltersApplied = useMemo(() => {
        return [
            filterActiveValues.q,
            filterActiveValues.fund_id,
            filterActiveValues.organization_id,
            filterActiveValues.product_category_id,
        ].filter((value) => value).length;
    }, [filterActiveValues]);

    const [products, setProducts] = useState<PaginationData<Product>>(null);

    const buildQuery = useCallback(
        (values = {}) => {
            const isSortingByPrice = sortBy.value.order_by === 'price';

            const orderByValue = {
                ...sortBy.value,
                order_by: isSortingByPrice ? (fundType === 'budget' ? 'price' : 'price_min') : sortBy.value.order_by,
            };

            return {
                q: values.q,
                page: values.page,
                fund_id: values.fund_id,
                organization_id: values.organization_id,
                product_category_id: values.product_category_id,
                display_type: displayType,
                fund_type: fundType,
                postcode: values.postcode || '',
                distance: values.distance || null,
                bookmarked: values.bookmarked ? 1 : 0,
                ...orderByValue,
            };
        },
        [displayType, sortBy.value, fundType],
    );

    const fetchProducts = useCallback(
        (query: object) => {
            setErrors(null);
            setProgress(0);

            productService
                .list({ fund_type: fundType, ...query })
                .then((res) => setProducts(res.data))
                .catch((e: ResponseError) => setErrors(e.data.errors))
                .finally(() => setProgress(100));
        },
        [fundType, productService, setProgress],
    );

    // todo: query filters
    /*const updateState = useCallback((query, location = 'replace') => {
        $state.go(
            fund_type == 'budget' ? 'products' : 'actions',
            {
                q: query.q || '',
                page: query.page,
                display_type: query.display_type,
                fund_id: query.fund_id,
                organization_id: query.organization_id,
                product_category_id: query.product_category_id,
                show_menu: showModalFilters,
                postcode: query.postcode,
                distance: query.distance,
                bookmarked: query.bookmarked,
                order_by: query.order_by,
                order_dir: query.order_dir,
            },
            { location },
        );
    }, []);*/

    const fetchFunds = useCallback(() => {
        fundService
            .list({ has_products: 1 })
            .then((res) => setFunds([{ id: null, name: 'Alle tegoeden...' }, ...res.data.data]));
    }, [fundService]);

    const fetchOrganizations = useCallback(() => {
        organizationService
            .list({ is_employee: 0, has_products: 1, per_page: 300, used_type: fundType })
            .then((res) => setOrganizations([{ id: null, name: 'Selecteer aanbieder...' }, ...res.data.data]));
    }, [organizationService, fundType]);

    const fetchProductCategories = useCallback(() => {
        productCategoryService
            .list({ per_page: 1000, used: 1, used_type: fundType })
            .then((res) => setProductCategories([{ id: null, name: 'Selecteer categorie...' }, ...res.data.data]));
    }, [productCategoryService, fundType]);

    useEffect(() => {
        fetchFunds();
        fetchOrganizations();
        fetchProductCategories();
    }, [fetchFunds, fetchOrganizations, fetchProductCategories]);

    useEffect(() => {
        if (productCategoryId) {
            productCategoryService
                .list({
                    parent_id: productCategoryId,
                    per_page: 1000,
                    used: 1,
                    used_type: fundType,
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
    }, [filterUpdate, fundType, productCategoryId, productCategoryService]);

    useEffect(() => {
        filterUpdate({ product_category_id: productSubCategoryId });
    }, [filterUpdate, productSubCategoryId]);

    useEffect(() => {
        fetchProducts(buildQuery(filterActiveValues));
    }, [fetchProducts, buildQuery, filterActiveValues]);

    return (
        <BlockShowcasePage
            countFiltersApplied={countFiltersApplied}
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Aanbod
                    </div>
                </div>
            }
            aside={
                organizations &&
                productCategories &&
                funds &&
                distances && (
                    <div className="showcase-aside-block">
                        {authIdentity && (
                            <div className="showcase-aside-tabs">
                                <div
                                    className={`showcase-aside-tab ${!filterActiveValues?.bookmarked ? 'active' : ''}`}
                                    onClick={() => filterUpdate({ bookmarked: 0 })}
                                    role="button">
                                    <em className="mdi mdi-tag-multiple-outline" />
                                    Volledig aanbod
                                </div>
                                <div
                                    className={`showcase-aside-tab ${filterActiveValues?.bookmarked ? 'active' : ''}`}
                                    onClick={() => filterUpdate({ bookmarked: 1 })}
                                    role="button"
                                    aria-label="toevoegen aan verlanglijstje"
                                    aria-pressed={!!filterValues.bookmarked}>
                                    <em className="mdi mdi-cards-heart-outline" />
                                    Mijn verlanglijstje
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="products_search">
                                Zoek aanbod
                            </label>
                            <UIControlSearch
                                value={filterValues.q}
                                onChangeValue={(q: string) => filterUpdate({ q })}
                                placeholder="Zoek aanbod"
                                ariaLabel="search"
                                id="products_search"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="select_provider">
                                Aanbieders
                            </label>
                            <SelectControl
                                id={'select_provider'}
                                value={filterValues.organization_id}
                                propKey={'id'}
                                allowSearch={true}
                                onChange={(organization_id: number) => filterUpdate({ organization_id })}
                                options={organizations || []}
                                placeholder={organizations?.[0]?.name}
                                optionsComponent={SelectControlOptions}
                            />
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
                    </div>
                )
            }>
            {appConfigs && products && (
                <Fragment>
                    <div className="showcase-content-header">
                        <h1 className="showcase-filters-title">
                            {filterValues.bookmarked ? 'Mijn verlanglijstje' : 'Aanbod'}
                            <div className="showcase-filters-title-count">{products?.meta?.total}</div>
                        </h1>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
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
                                <div className="label-tab-set">
                                    <div
                                        className={`label-tab label-tab-sm ${displayType == 'list' ? 'active' : ''}`}
                                        onClick={() => setDisplayType('list')}
                                        aria-pressed={displayType == 'list'}
                                        role="button">
                                        <em className="mdi mdi-format-list-text icon-start" />
                                        Lijst
                                    </div>
                                    <div
                                        className={`label-tab label-tab-sm ${displayType == 'grid' ? 'active' : ''}`}
                                        onClick={() => setDisplayType('grid')}
                                        aria-pressed={displayType == 'grid'}
                                        role="button">
                                        <em className="mdi mdi-view-grid-outline icon-start" />
                                        {"Foto's"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {appConfigs.pages.products && <CmsBlocks page={appConfigs.pages.products} />}

                    {products?.meta?.total > 0 && (
                        <ProductsList type={fundType} large={false} display={displayType} products={products.data} />
                    )}

                    {products?.meta?.total == 0 && (
                        <EmptyBlock
                            title={translate('block_products.labels.title')}
                            description={translate('block_products.labels.subtitle')}
                            hideLink={true}
                            svgIcon={'reimbursements'}
                        />
                    )}

                    {products?.meta?.last_page > 1 && (
                        <div className="card">
                            <div className="card-section">
                                <Paginator
                                    meta={products.meta}
                                    filters={filterValues}
                                    count-buttons={5}
                                    updateFilters={filterUpdate}
                                    buttonClass={'button-primary-outline'}
                                />
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcasePage>
    );
}
