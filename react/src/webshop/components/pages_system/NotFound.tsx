import React from 'react';
import { TopNavbar } from '../elements/top-navbar/TopNavbar';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function NotFound({ error = '404' }: { error?: string }) {
    const translate = useTranslate();

    return (
        <div className="block block-error-page">
            <TopNavbar />

            <div className="wrapper">
                <main id="main-content">
                    <div className="page-not-found-title">{error}</div>
                    <div className="page-not-found-subtitle">{translate(`error_page.${error}.title`)}</div>
                    <div>
                        <StateNavLink name="home" className="button button-primary">
                            <span>{translate(`error_page.${error}.button`)}</span>
                            <em className="mdi mdi-arrow-right icon-right" aria-hidden="true" />
                        </StateNavLink>
                    </div>
                </main>
            </div>
        </div>
    );
}
