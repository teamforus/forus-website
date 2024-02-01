import React from 'react';
import ProductsForm from './elements/ProductsForm';
import useActiveOrganization from '../../../hooks/useActiveOrganization';

export default function ProductsCreate() {
    const activeOrganization = useActiveOrganization();

    return <ProductsForm organization={activeOrganization} />;
}
