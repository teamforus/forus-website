import React from 'react';
import ProductsForm from './elements/ProductsForm';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';

export default function ProductsEdit() {
    const { id } = useParams();
    const activeOrganization = useActiveOrganization();

    return <ProductsForm organization={activeOrganization} id={id ? parseInt(id) : null} />;
}
