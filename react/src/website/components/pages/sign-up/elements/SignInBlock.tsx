import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function SignInBlock() {
    return (
        <div className="block block-text text-left">
            <div className="hide-sm block-text-title block-text-title-sm block-text-no-margin">
                Heeft u al een account?
            </div>
            <div className="show-sm block-text-title">Heeft u al een account?</div>

            <StateNavLink name={'sign-in'} className="hide-sm button button-primary block-text-actions">
                Inloggen
            </StateNavLink>

            <StateNavLink name={'sign-in'} className="show-sm button button-primary button-fill block-text-actions">
                Inloggen
            </StateNavLink>
        </div>
    );
}
