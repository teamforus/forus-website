import React, { useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function SignOut() {
    const { signOut, token } = useContext(authContext);
    const navigate = useNavigate();

    useEffect(() => {
        token ? signOut() : navigate(getStateRouteUrl('home'));
    }, [signOut, token, navigate]);

    return <></>;
}
