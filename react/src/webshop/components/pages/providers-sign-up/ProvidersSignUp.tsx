import React, { useMemo } from 'react';
import useEnvData from '../../../hooks/useEnvData';
import { TopNavbar } from '../../elements/top-navbar/TopNavbar';
import useCmsPage from '../cms-pages/hooks/useCmsPage';
import Markdown from '../../elements/markdown/Markdown';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useAppConfigs from '../../../hooks/useAppConfigs';

export default function ProvidersSignUp() {
    const page = useCmsPage('provider');
    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();

    const providerPanelUrl = useMemo(() => {
        return appConfigs?.fronts.url_provider || '';
    }, [appConfigs?.fronts.url_provider]);

    const signUpUrlParams = useMemo(() => {
        const params = envData.config?.provider_sign_up_filters || {};
        const paramKeys = Object.keys(params);

        return [
            paramKeys.length > 0 ? '?' : '',
            paramKeys.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&'),
        ].join('');
    }, [envData.config?.provider_sign_up_filters]);

    if (!page) {
        return null;
    }

    return (
        <div className={`block block-showcase`}>
            <TopNavbar />

            <main id="main-content">
                <section className="section section-details">
                    <div className="wrapper flex flex-vertical">
                        <div
                            className={`flex flex-vertical ${
                                page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                            }`}>
                            {page.description_html && (
                                <div className="block block-steps">
                                    <div className="wrapper">
                                        <div className="block-steps-description">
                                            <Markdown
                                                content={page.description_html}
                                                align={page.description_alignment}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(!page.description_html || page.description_position !== 'replace') && (
                                <div className="block block-sign_up-provider">
                                    <div className="sign_up-overview">
                                        <div className="block block-steps">
                                            <div className="block block-markdown">
                                                <h1 className="sr-only">Aanmelden</h1>
                                                <h1>Aanmelden als aanbieder</h1>
                                                <p>
                                                    Door het online formulier in te vullen meldt u uw organisatie aan
                                                    als aanbieder. Het invullen duurt ongeveer 15 minuten.
                                                </p>
                                                <p>Lees de instructie in elke stap goed door.</p>
                                                <p>
                                                    <a
                                                        className="button button-primary-outline"
                                                        href={providerPanelUrl + 'sign-up' + signUpUrlParams}
                                                        target="_self">
                                                        Aanmelden
                                                        <em
                                                            className="mdi mdi-arrow-right icon-right"
                                                            aria-hidden="true"
                                                        />
                                                    </a>
                                                </p>
                                                <p>
                                                    Heeft u al een account?{' '}
                                                    <a href={providerPanelUrl} target="_self">
                                                        Log dan in
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sign_up-images">
                                        <div className="sign_up-image">
                                            <img src={assetUrl('/assets/img/provider-sign_up-preview.svg')} alt="" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
