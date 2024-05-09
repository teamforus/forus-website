import { useContext, useEffect } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { authContext } from '../../../contexts/AuthContext';
import { useAuthService } from '../../../services/AuthService';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../modules/state_router/Router';

export default function AuthLink() {
    const { setToken } = useContext(authContext);
    const { onAuthRedirect, handleAuthTarget } = useAuthService();
    const identityService = useIdentityService();

    const pushDanger = usePushDanger();
    const navigateState = useNavigateState();

    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    useEffect(() => {
        identityService
            .exchangeShortToken(query.token)
            .then((res) => {
                setToken(res.data.access_token);

                if (!handleAuthTarget(query.target)) {
                    onAuthRedirect().then();
                }
            })
            .catch(() => {
                pushDanger('Deze link is reeds gebruikt of ongeldig.');
                navigateState('home');
            });
    }, [
        handleAuthTarget,
        identityService,
        navigateState,
        onAuthRedirect,
        pushDanger,
        query?.target,
        query?.token,
        setToken,
    ]);

    return null;
}
