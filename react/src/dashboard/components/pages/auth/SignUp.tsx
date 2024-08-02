import React, { Fragment } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import SignUpProvider from './SignUpProvider';
import SignUpValidator from './SignUpValidator';
import SignUpSponsor from './SignUpSponsor';

export default function SignUp() {
    const envData = useEnvData();

    return (
        <Fragment>
            {envData?.client_type === 'sponsor' && <SignUpSponsor />}
            {envData?.client_type === 'provider' && <SignUpProvider />}
            {envData?.client_type === 'validator' && <SignUpValidator />}
        </Fragment>
    );
}
