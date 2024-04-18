import React, { Fragment, useContext, useMemo } from 'react';
import { classList } from '../../dashboard/helpers/utils';
import { useStateRoutes } from '../../dashboard/modules/state_router/Router';
import Modals from '../../dashboard/modules/modals/components/Modals';
import PushNotifications from '../../dashboard/modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../../dashboard/modules/modals/context/ModalContext';
import LoadingBar from '../../dashboard/modules/loading_bar/components/LoadingBar';
import { LayoutType } from '../../dashboard/modules/state_router/RouterProps';
import useAuthIdentity from '../hooks/useAuthIdentity';
import SkipLinks from './elements/SkipLinks';
import useEnvData from '../hooks/useEnvData';
import useAppConfigs from '../hooks/useAppConfigs';
import LayoutFooter from './elements/LayoutFooter';
import LayoutMobileMenu from './elements/LayoutMobileMenu';
import Printable from '../../dashboard/modules/printable/components/Printable';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { route } = useStateRoutes();

    const { modals } = useContext(modalsContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const layout = route?.state?.layout;
    const authIdentity = useAuthIdentity();

    const isReady = useMemo(() => {
        return !!envData && !!appConfigs && (!route.state?.protected || authIdentity);
    }, [authIdentity, route.state, envData, appConfigs]);

    return (
        <Fragment>
            <div
                className={classList([route?.state?.name == 'fund-request' ? 'signup-layout' : ''])}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'fixed',
                    overflow: modals.length > 0 ? 'hidden' : 'auto',
                }}>
                <SkipLinks />
                <LoadingBar />

                {[LayoutType.dashboard, LayoutType.landing].includes(layout) && <>{/*<LayoutHeader />*/}</>}

                <div className="app app-container">
                    {layout == LayoutType.dashboard && <>{/*<LayoutAside />*/}</>}

                    {isReady && (
                        <section className={`${layout == LayoutType.dashboard ? 'app app-content' : ''}`}>
                            {children}
                        </section>
                    )}
                </div>

                <LayoutMobileMenu />
                <LayoutFooter />

                <Modals />

                <PushNotifications group={'default'} />
                <PushNotifications group={'bookmarks'} className={'block-push-notifications-bookmarks'} maxCount={1} />
            </div>

            <Printable />
        </Fragment>
    );
};
