import React, { useCallback, useState } from 'react';
import { createContext, useEffect } from 'react';
import Identity from '../props/models/Identity';
import Employee from '../props/models/Employee';
import { useAuthService } from '../services/AuthService';
import { getStateRouteUrl, useStateRoutes } from '../modules/state_router/Router';
import { useNavigate } from 'react-router-dom';
import events from '../helpers/events';
import { ResponseError } from '../props/ApiResponses';
import Identity2FAState from '../props/models/Identity2FAState';
import { useIdentity2FAService } from '../services/Identity2FAService';
import useSetProgress from '../hooks/useSetProgress';

interface AuthMemoProps {
    token?: string;
    signOut?: () => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    identityEmployee?: Employee;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    setIdentityEmployee?: React.Dispatch<Employee>;
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
    const identity2FAService = useIdentity2FAService();
    const { route } = useStateRoutes();
    const [token, setToken] = useState(getToken());
    const [identity, setIdentity] = useState<Identity>(null);
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);
    const [identityEmployee, setIdentityEmployee] = useState<Employee>(null);
    const navigate = useNavigate();
    const setProgress = useSetProgress();

    const signOut = useCallback(() => {
        setToken(null);
        setIdentity(null);
        setIdentity2FAState(null);
        setIdentityEmployee(null);
    }, []);

    const updateIdentity = useCallback(async () => {
        const identity = await authService.identity().then((res) => {
            setIdentity(res.data);
            setIdentityEmployee(null);
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
            navigate(getStateRouteUrl('sign-in'));
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
                identityEmployee,
                setIdentity,
                setIdentityEmployee,
                setIdentity2FAState,
                updateIdentity,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
