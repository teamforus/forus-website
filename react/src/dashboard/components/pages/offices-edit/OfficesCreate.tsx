import React from 'react';
import OfficesForm from './elements/OfficesForm';
import useActiveOrganization from '../../../hooks/useActiveOrganization';

export default function OfficesCreate() {
    const activeOrganization = useActiveOrganization();

    return <OfficesForm organization={activeOrganization} />;
}
