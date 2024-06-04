import React, { useEffect } from 'react';
import { useNavigateState } from '../../../modules/state_router/Router';
import { useQueryParams, StringParam } from 'use-query-params';
import { useAuthService } from '../../../services/AuthService';

export default function Redirect() {
    const [{ target }] = useQueryParams({ target: StringParam });
    const navigateState = useNavigateState();
    const authService = useAuthService();

    useEffect(() => {
        if (!target || !authService.handleAuthTarget(target)) {
            return navigateState('home');
        }
    }, [target, authService, navigateState]);

    return <></>;
}
