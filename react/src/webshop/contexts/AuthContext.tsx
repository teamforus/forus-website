import React, { useCallback, useState } from 'react';
import { createContext, useEffect } from 'react';
import Identity from '../../dashboard/props/models/Identity';
import { useAuthService } from '../../dashboard/services/AuthService';
import { getStateRouteUrl, useStateRoutes } from '../modules/state_router/Router';
import { useNavigate } from 'react-router-dom';
import events from '../../dashboard/helpers/events';
import { ResponseError } from '../../dashboard/props/ApiResponses';
import Identity2FAState from '../../dashboard/props/models/Identity2FAState';
import { useIdentity2FAService } from '../../dashboard/services/Identity2FAService';
import useSetProgress from '../../dashboard/hooks/useSetProgress';
import { useIdentityService } from '../../dashboard/services/IdentityService';
import { useNavigateState } from '../modules/state_router/Router';
import useOpenModal from '../../dashboard/hooks/useOpenModal';
import ModalNotification from '../components/modals/ModalNotification';
import useAppConfigs from '../hooks/useAppConfigs';
import useTranslate from '../../dashboard/hooks/useTranslate';

interface AuthMemoProps {
    token?: string;
    signOut?: (
        e?: React.MouseEvent,
        needConfirmation?: boolean,
        deleteToken?: boolean,
        redirect?: boolean | string | (() => void),
    ) => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    isSignedIn?: boolean;
    setToken?: (token: string) => void;
    updateIdentity?: () => Promise<{ identity: Identity; identity2FAState: Identity2FAState }>;
}

const authContext = createContext<AuthMemoProps>(null);
const { Provider } = authContext;

const getToken = () => {
    const token = localStorage?.getItem('active_account');

    return token && token != 'null' ? token : null;
};

const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const authService = useAuthService();
    const appConfigs = useAppConfigs();
    const identity2FAService = useIdentity2FAService();
    const { route } = useStateRoutes();
    const translate = useTranslate();
    const [token, setToken] = useState(getToken());
    const [identity, setIdentity] = useState<Identity>(null);
    const identityService = useIdentityService();
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);
    const navigate = useNavigate();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();

    const signOut = useCallback(
        (e: React.MouseEvent = null, needConfirmation = false, deleteToken = true, redirect = 'home') => {
            e?.preventDefault();
            e?.stopPropagation();

            if (needConfirmation) {
                return openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        type={'confirm'}
                        title={'Uitloggen'}
                        header={translate(`logout.title_${appConfigs?.communication_type}`)}
                        mdiIconType={'primary'}
                        mdiIconClass={'help-circle-outline'}
                        onConfirm={() => signOut()}
                    />
                ));
            }

            if (deleteToken) {
                identityService.deleteToken().then();
            }

            setToken(null);
            setIdentity(null);
            setIdentity2FAState(null);

            if (redirect && typeof redirect == 'function') {
                redirect();
            }

            if (redirect && typeof redirect == 'string') {
                navigateState(redirect);
            }
        },
        [appConfigs?.communication_type, identityService, navigateState, openModal, translate],
    );

    const updateIdentity = useCallback(async () => {
        const identity = await authService.identity().then((res) => {
            setIdentity(res.data);
            return res.data;
        });

        const identity2FAState = await identity2FAService.status().then((res) => {
            setIdentity2FAState(res.data.data);
            return res.data.data;
        });

        return { identity, identity2FAState };
    }, [authService, identity2FAService]);

    useEffect(() => {
        localStorage.active_account = token;
    }, [token]);

    useEffect(() => {
        if (token && !identity) {
            updateIdentity().then();
            return;
        }

        if (!token && route?.state?.protected) {
            navigate(getStateRouteUrl('start'));
            return;
        }
    }, [updateIdentity, token, navigate, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (data: CustomEvent<ResponseError<{ error?: string }>>) => {
            if (data.detail.status != 401) {
                return;
            }

            setProgress(100);

            if (data.detail.data.error === '2fa') {
                return navigate(getStateRouteUrl('auth-2fa'));
            }

            return navigate(getStateRouteUrl('sign-out'));
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [navigate, setProgress]);

    return (
        <Provider
            value={{
                token,
                setToken,
                identity,
                identity2FAState,
                setIdentity,
                setIdentity2FAState,
                updateIdentity,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
