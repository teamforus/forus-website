import React, { useMemo } from 'react';
import { getStateRouteUrl, useStateRoutes } from '../../modules/state_router/Router';
import { useNavigate } from 'react-router-dom';
import useEnvData from '../../hooks/useEnvData';

export default function SkipLinks() {
    const envData = useEnvData();
    const route = useStateRoutes();
    const navigate = useNavigate();

    const mainContentUrl = useMemo(() => {
        if (!envData || !route?.route?.state?.name) {
            return null;
        }

        return getStateRouteUrl(route.route.state.name, route.route?.params) + '#main-content';
    }, [route?.route, envData]);

    return (
        <div className="skiplinks" role="navigation">
            {mainContentUrl && (
                <a
                    className="sr-only sr-only-focusable"
                    href="#"
                    onKeyDown={(e) => (e.key == 'enter' ? navigate(mainContentUrl) : null)}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(mainContentUrl);
                    }}>
                    Naar hoofdinhoud
                </a>
            )}
        </div>
    );
}
