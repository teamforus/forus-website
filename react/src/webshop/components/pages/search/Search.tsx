import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { mainContext } from '../../../contexts/MainContext';
import { SearchResultItem, useSearchService } from '../../../services/SearchService';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { useFundService } from '../../../services/FundService';
import { useOrganizationService } from '../../../../dashboard/services/OrganizationService';
import Fund from '../../../props/models/Fund';
import useProductCategoryService from '../../../../dashboard/services/ProductCategoryService';
import ProductCategory from '../../../../dashboard/props/models/ProductCategory';
import Organization from '../../../../dashboard/props/models/Organization';
import SelectControl from '../../../../dashboard/components/elements/select-control/SelectControl';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import SearchItemsList from './elements/SearchItemsList';
import { useVoucherService } from '../../../services/VoucherService';
import Voucher from '../../../../dashboard/props/models/Voucher';
import BlockShowcasePage from '../../elements/block-showcase/BlockShowcasePage';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';

// todo: query filters
export default function Search() {
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const searchService = useSearchService();
    const voucherService = useVoucherService();
    const organizationService = useOrganizationService();
    const productCategoryService = useProductCategoryService();

    const { searchFilter } = useContext(mainContext);

    const [displayType, setDisplayType] = useState<'list' | 'grid'>('list');
    const [searchItems, setSearchItems] = useState(null);

    // Search direction
    const [sortByOptions] = useState([
        { name: 'Oudste eerst', value: 'date', filters: { order_by: 'created_at', order_dir: 'asc' } },
        { name: 'Nieuwe eerst', value: 'newest', filters: { order_by: 'created_at', order_dir: 'desc' } },
    ]);

    const [sortBy, setSortBy] = useState(sortByOptions?.[1]?.value);

    // Search by resource type
    const [searchItemTypes] = useState([
        { label: 'Tegoeden', key: 'funds', checked: false },
        { label: 'Aanbod', key: 'products', checked: false },
        { label: 'Aanbieders', key: 'providers', checked: false },
    ]);

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);
    const [productCategories, setProductCategories] = useState<Array<Partial<ProductCategory>>>(null);

    const filters = useFilter({
        page: 1,
        fund_id: '',
        organization_id: '',
        product_category_id: '',
        search_item_types: searchItemTypes?.map((type) => type.key),
        overview: 0,
        with_external: 1,
    });

    const { update: filtersUpdate } = filters;

    const transformItems = useCallback(function (items, stateParams) {
        return {
            ...items,
            ...{ data: items.data.map((item: SearchResultItem) => ({ ...item, ...{ searchParams: stateParams } })) },
        };
    }, []);

    const doSearch = useCallback(
        (query: object, stateParams?: object) => {
            setProgress(0);

            searchService
                .search(query)
                .then((res) => setSearchItems(transformItems(res.data, stateParams)))
                .finally(() => setProgress(100));
        },
        [searchService, transformItems, setProgress],
    );

    const toggleType = useCallback(
        (type: string) => {
            filtersUpdate((values) => {
                const index = values.search_item_types.indexOf(type);

                if (index === -1) {
                    values.search_item_types.push(type);
                } else {
                    values.search_item_types.splice(index, 1);
                }

                return { ...values };
            });
        },
        [filtersUpdate],
    );

    const countFiltersApplied = useMemo(() => {
        return (
            Object.values(filters.activeValues).reduce((count: number, filter) => {
                return (
                    count +
                    (filter
                        ? typeof filter == 'object'
                            ? filter['id'] || (Array.isArray(filter) ? filter.length : 0)
                            : 1
                        : 0)
                );
            }, 0) - 3
        );
    }, [filters.activeValues]);

    const fetchVouchers = useCallback(() => {
        if (authIdentity) {
            setProgress(0);

            return voucherService
                .list()
                .then((res) => setVouchers(res.data.data))
                .finally(() => setProgress(100));
        }

        return setVouchers([]);
    }, [authIdentity, setProgress, voucherService]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list({ with_external: 1 })
            .then((res) => setFunds([{ id: null, name: 'Selecteer tegoeden...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ is_employee: 0, has_products: 1, per_page: 500, fund_type: 'budget' })
            .then((res) => setOrganizations([{ id: null, name: 'Selecteer aanbieders...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [organizationService, setProgress]);

    const fetchProductCategories = useCallback(() => {
        setProgress(0);

        productCategoryService
            .list({ parent_id: 'null', used: 1, per_page: 1000 })
            .then((res) => setProductCategories([{ id: null, name: 'Selecteer categorie...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [productCategoryService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    useEffect(() => {
        fetchProductCategories();
    }, [fetchProductCategories]);

    useEffect(() => {
        doSearch(
            {
                ...searchFilter.activeValues,
                ...(sortByOptions.find((value) => value.value === sortBy)?.filters || {}),
                ...filters.activeValues,
                search_item_types: [
                    filters.activeValues.search_item_types.includes('funds') ? 'funds' : null,
                    filters.activeValues.search_item_types.includes('providers') ? 'providers' : null,
                    filters.activeValues.search_item_types.includes('products') ? 'products' : null,
                ].filter((type) => type),
            },
            {
                foo: 'bar',
            },
        );
    }, [doSearch, filters.activeValues, searchFilter.activeValues, sortByOptions, sortBy]);

    return (
        <BlockShowcasePage
            countFiltersApplied={countFiltersApplied}
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name="home" className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Zoekresultaten
                    </div>
                </div>
            }
            aside={
                funds &&
                organizations &&
                productCategories && (
                    <div className="showcase-aside-block">
                        <div className="form-label">Uitgelicht</div>
                        {searchItemTypes?.map((itemType) => (
                            <div key={itemType.key} className="form-group">
                                <div
                                    className="checkbox"
                                    role="checkbox"
                                    aria-checked={filters.activeValues.search_item_types.includes(itemType.key)}>
                                    <input
                                        aria-hidden="true"
                                        type="checkbox"
                                        id={`type_${itemType.key}`}
                                        checked={filters.activeValues.search_item_types.includes(itemType.key)}
                                        onChange={() => toggleType(itemType.key)}
                                    />
                                    <label className="checkbox-label" htmlFor={`type_${itemType.key}`}>
                                        <div className="checkbox-box">
                                            <em className="mdi mdi-check" />
                                        </div>
                                        {itemType.label}
                                    </label>
                                </div>
                            </div>
                        ))}

                        {productCategories && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="category_id">
                                    Categorie
                                </label>
                                <SelectControl
                                    id="category_id"
                                    propKey="id"
                                    allowSearch={true}
                                    value={filters.values.product_category_id}
                                    onChange={(id?: string) => filters.update({ product_category_id: id })}
                                    options={productCategories}
                                    placeholder={productCategories?.[0]?.name}
                                />
                            </div>
                        )}

                        {funds && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="fund_id">
                                    Tegoeden
                                </label>
                                <SelectControl
                                    id="fund_id"
                                    propKey="id"
                                    allowSearch={true}
                                    value={filters.values.fund_id}
                                    onChange={(id?: string) => filters.update({ fund_id: id })}
                                    options={funds}
                                    placeholder={funds?.[0]?.name}
                                />
                            </div>
                        )}

                        {organizations && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="organizatie_id">
                                    Aanbieders
                                </label>
                                <SelectControl
                                    id="organizations_id"
                                    propKey="id"
                                    allowSearch={true}
                                    value={filters.values.organization_id}
                                    onChange={(id?: string) => filters.update({ organization_id: id })}
                                    options={organizations}
                                    placeholder={organizations?.[0]?.name}
                                />
                            </div>
                        )}
                    </div>
                )
            }>
            {searchItems && (
                <Fragment>
                    <div className="showcase-content-header">
                        <div className="showcase-filters-title">
                            <div className="showcase-filters-title-count">{searchItems?.meta?.total}</div>
                            {searchFilter.activeValues.q ? (
                                <div className="ellipsis">
                                    Zoekresultaten gevonden voor {`"${searchFilter.activeValues.q}"`}
                                </div>
                            ) : (
                                <div className="ellipsis">Zoekresultaten</div>
                            )}
                        </div>
                        <div className="showcase-filters-block">
                            <div className="block block-label-tabs form">
                                <div className="showcase-filters-item">
                                    <label className="form-label">Sorteer</label>
                                    <SelectControl
                                        id="sort_by"
                                        propKey={'value'}
                                        allowSearch={false}
                                        value={sortBy}
                                        options={sortByOptions}
                                        onChange={(sortBy: string) => setSortBy(sortBy)}
                                        placeholder="Sorteer"
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

                    {searchItems?.data?.length > 0 && (
                        <SearchItemsList items={searchItems.data} vouchers={vouchers} display={displayType} />
                    )}

                    {searchItems?.data?.length == 0 && (
                        <EmptyBlock
                            title={translate('block_products.labels.title')}
                            svgIcon="reimbursements"
                            description={translate('block_products.labels.subtitle')}
                            hideLink={true}
                        />
                    )}

                    {searchItems?.meta?.last_page > 1 && (
                        <div className="card">
                            <div className="card-section">
                                <Paginator
                                    meta={searchItems.meta}
                                    filters={filters.values}
                                    updateFilters={filters.update}
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
