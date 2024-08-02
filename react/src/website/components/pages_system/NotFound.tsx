import React, { Fragment } from 'react';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function NotFound({ error = '404' }: { error?: string }) {
    return (
        <Fragment>
            <h1>{error}</h1>
            <p>{error == '404' ? 'Page not found.' : 'Unknown error.'}</p>
            <div>
                <StateNavLink name="home" className="button button-primary">
                    Go home
                    <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                </StateNavLink>
            </div>
        </Fragment>
    );
}
