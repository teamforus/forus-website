import React, { Fragment, useEffect } from 'react';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useAssetUrl from '../../hooks/useAssetUrl';
import BlockDashedSeparator from '../pages/home/elements/BlockDashedSeparator';
import LearnMore from '../elements/LearnMore';
import { useNavigateState } from '../../modules/state_router/Router';
import { useLocation } from 'react-router-dom';

export default function NotFound({ error = '404' }: { error?: string }) {
    const assetUrl = useAssetUrl();
    const navigateState = useNavigateState();
    const location = useLocation();

    useEffect(() => {
        switch (location.pathname) {
            case '/news':
                navigateState('about-us-innovation');
                break;
            case '/research':
                navigateState('about-us-innovation');
                break;
            case '/systeem':
                navigateState('basic-functions');
                break;
            case '/me':
                navigateState('me-app');
                break;
            case '/nu':
                navigateState('about');
                break;
        }
    }, [location, location.hash, navigateState]);

    return (
        <Fragment>
            <div className="wrapper">
                <div className="block block-error-page">
                    <div className="page-not-found-title">{error}</div>
                    <div className="page-not-found-subtitle">
                        De pagina die u probeert te bereiken bestaat niet (meer).
                    </div>
                    <div className="page-not-found-actions">
                        <StateNavLink name="home" className="button button-primary">
                            <span>Ga terug</span>
                        </StateNavLink>
                        <StateNavLink name="home" className="button button-dark">
                            <span>Naar home</span>
                        </StateNavLink>
                    </div>
                    <div className="page-not-found-image">
                        <img src={assetUrl('/assets/img/404.svg')} alt="" />
                    </div>
                </div>
            </div>

            <BlockDashedSeparator />

            <div className="wrapper">
                <div className="block block-about-us">
                    <div className="block-about-us-title">Misschien bent u ook geïnteresseerd in:</div>
                    <div className="block-about-us-images">
                        <div className="block-about-us-image">
                            <div className="block-about-us-image-overlay-hover" />
                            <div className="block-about-us-image-overlay" />
                            <img className="hide-sm" src={assetUrl('/assets/img/about-us-1.jpg')} alt="" />
                            <img className="show-sm" src={assetUrl('/assets/img/about-us-1-mobile.jpg')} alt="" />
                            <div className="block-about-us-image-info">
                                <div className="block-about-us-image-title">Ons platform</div>
                                <div className="block-about-us-image-subtitle">
                                    Een reis naar een samenleving waar iedereen een kans krijgt om mee te doen
                                </div>
                                <StateNavLink name="about-us" className="block-about-us-link">
                                    <span>Leer meer</span>
                                    <em className="mdi mdi-arrow-right icon-right" />
                                </StateNavLink>
                            </div>
                        </div>
                        <div className="block-about-us-image">
                            <div className="block-about-us-image-overlay-hover" />
                            <div className="block-about-us-image-overlay" />
                            <img className="hide-sm" src={assetUrl('/assets/img/about-us-2.jpg')} alt="" />
                            <img className="show-sm" src={assetUrl('/assets/img/about-us-2-mobile.jpg')} alt="" />
                            <div className="block-about-us-image-info">
                                <div className="block-about-us-image-title">
                                    Naar een merkbaar en meetbaar verschil!
                                </div>
                                <div className="block-about-us-image-subtitle">
                                    Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente
                                    Eemsdelta en Gemeente Westerkwartier.
                                </div>
                                <StateNavLink name="about-us-innovation" className="block-about-us-link">
                                    <span>Leer meer</span>
                                    <em className="mdi mdi-arrow-right icon-right" />
                                </StateNavLink>
                            </div>
                        </div>
                    </div>
                </div>

                <LearnMore
                    title={'Klaar om uw impact te vergroten?'}
                    hideAboutUsButton={true}
                    description={
                        'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                    }
                />
            </div>
        </Fragment>
    );
}
