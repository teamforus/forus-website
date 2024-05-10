import React, { useEffect } from 'react';
import useEnvData from '../../hooks/useEnvData';
import { useNavigateState } from '../../modules/state_router/Router';

export default function ThrowError() {
    const envData = useEnvData();
    const navigateState = useNavigateState();

    useEffect(() => {
        if (!envData?.config?.allow_test_errors) {
            return navigateState('home');
        }

        throw 'Test error';
    }, [envData?.config?.allow_test_errors, navigateState]);

    return <></>;
}
