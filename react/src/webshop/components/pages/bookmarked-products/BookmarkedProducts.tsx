import React, { Fragment, useCallback, useEffect, useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import EmptyBlock from '../../elements/empty-block/EmptyBlock';
import Paginator from '../../../../dashboard/modules/paginator/components/Paginator';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import { PaginationData } from '../../../../dashboard/props/ApiResponses';
import Product from '../../../props/models/Product';
import useFilter from '../../../../dashboard/hooks/useFilter';
import { useProductService } from '../../../services/ProductService';
import ProductsList from '../../elements/lists/products-list/ProductsList';
import { useNavigateState } from '../../../modules/state_router/Router';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';

export default function BookmarkedProducts() {
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const productService = useProductService();

    const [products, setProducts] = useState<PaginationData<Product>>(null);
    const [sortByOptions] = useState(productService.getSortOptions());
    const [sortBy /*, setSortBy*/] = useState(sortByOptions[0]);
    const [displayType, setDisplayType] = useState<'list' | 'grid'>('list');

    const filters = useFilter({
        page: 1,
        bookmarked: 1,
        ...sortBy.value,
    });

    const { update: filtersUpdate } = filters;

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .list(filters.activeValues)
            .then((res) => setProducts(res.data))
            .finally(() => setProgress(100));
    }, [productService, filters.activeValues, setProgress]);

    useEffect(() => {
        filtersUpdate((values) => ({ ...values, ...sortBy.value }));
    }, [sortBy, filtersUpdate]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // todo: query filters
    /*$ctrl.updateState = (query = {}, location = 'replace') => {
        $state.go(
            'bookmarked-products',
            { display_type: $ctrl.display_type },
            { location },
        );
    };*/

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink name={'home'} className="breadcrumb-item">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active" aria-current="location">
                        Mijn verlanglijstje
                    </div>
                </div>
            }
            profileHeader={
                products && (
                    <div className="profile-content-header clearfix">
                        <div className="profile-content-title">
                            <div className="pull-left">
                                <div className="profile-content-title-count">{products.meta.total}</div>
                                <h1 className="profile-content-header">Mijn verlanglijstje</h1>
                            </div>
                        </div>
                        <div className="block block-label-tabs form pull-right">
                            {/*todo: fix styles*/}
                            {/*<div className="showcase-filters-item">
                                <label className="form-label">Sorteer</label>
                                <SelectControl
                                    id="sort_by"
                                    allowSearch={false}
                                    propKey={'id'}
                                    propValue={'label'}
                                    value={sortBy}
                                    options={sortByOptions}
                                    placeholder="Sorteer"
                                    onChange={(sortBy: number) => {
                                        setSortBy(sortByOptions?.find((item) => item.id == sortBy));
                                    }}
                                />
                            </div>*/}
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
                )
            }>
            {products && (
                <Fragment>
                    {products.meta.total > 0 ? (
                        <ProductsList display={displayType} products={products.data} />
                    ) : (
                        <EmptyBlock
                            title="Er zijn nog geen aanbiedingen toegevoegd."
                            svgIcon="reimbursements"
                            hideLink={true}
                            button={{
                                iconEnd: true,
                                icon: 'arrow-right',
                                type: 'primary',
                                text: 'Bekijk het aanbod',
                                onClick: () => navigateState('products'),
                            }}
                        />
                    )}

                    {products.meta.last_page > 1 && (
                        <div className="card">
                            <div className="card-section">
                                <Paginator
                                    meta={products.meta}
                                    filters={filters.values}
                                    updateFilters={filters.update}
                                    buttonClass={'button-primary-outline'}
                                />
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
