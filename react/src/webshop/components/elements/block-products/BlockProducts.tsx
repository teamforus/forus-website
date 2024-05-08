import React from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Product from '../../../../dashboard/props/models/Product';
import EmptyBlock from '../empty-block/EmptyBlock';
import ProductsList from '../lists/products-list/ProductsList';

export default function BlockProducts({
    type = 'budget',
    display = 'grid',
    large = false,
    filters = {},
    products = null,
    setProducts = null,
    showLoadMore = true,
}: {
    type: 'budget' | 'subsidies';
    display?: 'grid' | 'list';
    large?: boolean;
    filters?: object;
    products?: Array<Product>;
    setProducts?: (products: Array<Product>) => void;
    showLoadMore?: boolean;
}) {
    const translate = useTranslate();

    return (
        <section className="section section-products" id="products">
            {products.length != 0 && (
                <StateNavLink name={type == 'budget' ? 'products' : 'actions'} params={filters}>
                    <h2 className="section-title">{translate(`block_products.header.title_${type}`)}</h2>
                </StateNavLink>
            )}

            {products?.length > 0 && (
                <ProductsList
                    type={type}
                    large={large}
                    display={display}
                    products={products}
                    setProducts={setProducts}
                />
            )}

            {products?.length == 0 && (
                <EmptyBlock
                    title={translate(`block_products.labels.title`)}
                    description={translate(`block_products.labels.subtitle`)}
                    svgIcon="reimbursements"
                    hideLink={true}
                />
            )}

            {showLoadMore && (
                <div className="block block-show-more">
                    <StateNavLink
                        className="button button-primary"
                        name={type == 'budget' ? 'products' : 'actions'}
                        params={filters}>
                        {translate(`block_products.buttons.more`)}
                        <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                    </StateNavLink>
                </div>
            )}
        </section>
    );
}
