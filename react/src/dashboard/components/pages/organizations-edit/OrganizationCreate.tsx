import React, { useEffect } from 'react';
import OrganizationForm from './elements/OrganizationForm';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { useNavigateState } from '../../../modules/state_router/Router';

export default function OrganizationCreate() {
    const authIdentity = useAuthIdentity();
    const navigateState = useNavigateState();

    useEffect(() => {
        if (!authIdentity) {
            return navigateState('home');
        }
    }, [authIdentity, navigateState]);

    return <OrganizationForm />;
}
