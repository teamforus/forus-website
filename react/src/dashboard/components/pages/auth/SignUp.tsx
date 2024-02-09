import React, { Fragment } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import WIP from '../../pages_system/WIP';
import SignUpProvider from './SignUpProvider';
import SignUpValidator from './SignUpValidator';

export default function SignUp() {
    const envData = useEnvData();

    return (
        <Fragment>
            {envData?.client_type === 'sponsor' && <WIP />}
            {envData?.client_type === 'provider' && <SignUpProvider />}
            {envData?.client_type === 'validator' && <SignUpValidator />}
        </Fragment>
    );
}
