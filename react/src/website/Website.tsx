import { ModalsProvider } from '../dashboard/modules/modals/context/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import React, { Fragment, useContext, useEffect } from 'react';
import { LayoutWebsite } from './layout/LayoutWebsite';
import { HashRouter, Route, Routes, BrowserRouter } from 'react-router-dom';
import EnvDataProp from '../props/EnvData';
import { MainProvider, mainContext } from './contexts/MainContext';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { PushNotificationsProvider } from '../dashboard/modules/push_notifications/context/PushNotificationsContext';
import { LoadingBarProvider } from '../dashboard/modules/loading_bar/context/LoadingBarContext';
import ApiRequestService from '../dashboard/services/ApiRequestService';
import { getRoutes } from './modules/state_router/Router';
import EnvDataWebshopProp from '../props/EnvDataWebshopProp';
import { LoadScript } from '@react-google-maps/api';
import StateHashPrefixRedirect from '../dashboard/modules/state_router/StateHashPrefixRedirect';
import GoogleTagManager from './modules/google_tag_manager/GoogleTagManager';

/**
 * @param envData
 * @constructor
 */
const RouterLayout = ({ envData }: { envData: EnvDataWebshopProp }) => {
    const { setEnvData } = useContext(mainContext);

    useEffect(() => {
        setEnvData(envData);
    }, [setEnvData, envData]);

    return (
        <LayoutWebsite>
            <Routes>
                {getRoutes().map((route) => (
                    <Route key={route.state.name} path={route.state.path} element={route.element} />
                ))}
            </Routes>
        </LayoutWebsite>
    );
};

function RouterSelector({ children, envData }: { envData: EnvDataProp; children: React.ReactElement }) {
    if (envData.useHashRouter) {
        return <HashRouter basename={`/`}>{children}</HashRouter>;
    }

    return <BrowserRouter basename={`/${envData.webRoot}`}>{children}</BrowserRouter>;
}

/**
 * Dashboard
 * @param envData
 * @constructor
 */
export default function Website({ envData }: { envData: EnvDataWebshopProp }): React.ReactElement {
    envData.config.flags = envData.config?.flags || {};

    ApiRequestService.setHost(envData.config.api_url);
    ApiRequestService.setEnvData(envData as unknown as EnvDataProp);

    return (
        <Fragment>
            <LoadScript googleMapsApiKey={envData.config.google_maps_api_key} language={'nl'}>
                <PushNotificationsProvider>
                    <RouterSelector envData={envData as unknown as EnvDataProp}>
                        <LoadingBarProvider>
                            <ModalsProvider>
                                <MainProvider>
                                    <AuthProvider>
                                        <QueryParamProvider adapter={ReactRouter6Adapter}>
                                            <StateHashPrefixRedirect />
                                            <RouterLayout envData={envData} />
                                        </QueryParamProvider>
                                    </AuthProvider>
                                </MainProvider>
                            </ModalsProvider>
                        </LoadingBarProvider>
                    </RouterSelector>
                </PushNotificationsProvider>
            </LoadScript>

            <GoogleTagManager envData={envData} />
        </Fragment>
    );
}
