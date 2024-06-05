import React, { useMemo } from 'react';
import ProductsListItem from './ProductsListItem';
import Product from '../../../../props/models/Product';

export default function ProductsList({
    type = 'budget',
    large = false,
    display = 'grid',
    products = [],
    setProducts = null,
}: {
    type?: 'budget' | 'subsidies';
    large?: boolean;
    display: 'grid' | 'list' | 'search';
    products?: Array<Product>;
    setProducts?: (products: Array<Product>) => void;
}) {
    const blockClass = useMemo(
        () => ({
            'budget.grid': `block-products${large ? ' block-products-lg' : ''}`,
            'subsidies.grid': `block-products${large ? ' block-products-lg' : ''}`,

            'budget.list': 'block-products-list',
            'subsidies.list': 'block-products-list',
        }),
        [large],
    );

    return (
        <div className={`block ${blockClass[`${type}.${display}`]}`}>
            {products?.map((product) => (
                <ProductsListItem
                    key={product.id}
                    product={product}
                    productType={type}
                    display={display}
                    onToggleBookmark={(product) => {
                        setProducts?.(
                            products.map((item) => {
                                return item.id === product.id ? { ...item, bookmarked: product.bookmarked } : item;
                            }),
                        );
                    }}
                />
            ))}
        </div>
    );
}
