import React, { useCallback, useEffect, useState, createContext } from 'react';
import Identity from '../../dashboard/props/models/Identity';
import { useAuthService } from '../../dashboard/services/AuthService';
import Identity2FAState from '../../dashboard/props/models/Identity2FAState';
import { useIdentity2FAService } from '../../dashboard/services/Identity2FAService';

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
    const identity2FAService = useIdentity2FAService();
    const [token, setToken] = useState(getToken());
    const [identity, setIdentity] = useState<Identity>(null);
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);

    const fetchIdentity = useCallback(async () => {
        const identity = token
            ? await authService
                  .identity()
                  .then((res) => res.data)
                  .catch(() => null)
            : null;

        setIdentity(identity);

        return identity;
    }, [authService, token]);

    const fetchIdentity2FA = useCallback(async () => {
        const identity2FAState = token
            ? await identity2FAService
                  .status()
                  .then((res) => res.data.data)
                  .catch(() => null)
            : null;

        setIdentity2FAState(identity2FAState);

        return identity2FAState;
    }, [identity2FAService, token]);

    const updateIdentity = useCallback(async () => {
        const identity = await fetchIdentity();
        const identity2FAState = await fetchIdentity2FA();

        return { identity, identity2FAState };
    }, [fetchIdentity, fetchIdentity2FA]);

    useEffect(() => {
        localStorage.active_account = token;
    }, [token]);

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
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
