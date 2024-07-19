import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import SocialImpact from './elements/SocialImpact';
import SocialDomain from './elements/SocialDomain';
import PlatformAspects from './elements/PlatformAspects';
import Strategy from './elements/Strategy';
import Municipalities from './elements/Municipalities';
import Collaborations from './elements/Collaborations';
import LearnMore from '../../elements/LearnMore';
import HeaderContent from './elements/HeaderContent';

export default function Home() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    useEffect(() => {
        setTitle('Home page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="section section-header">
                <div className="wrapper hide-sm">
                    <HeaderContent />
                </div>
                <div className="show-sm">
                    <HeaderContent />
                </div>
            </div>

            <div className="main-content">
                <div className="wrapper">
                    <div className="block block-project">
                        <div className="block-project-main-content">
                            <div className="block-project-label">Nieuws</div>
                            <div className="block-project-title">Naar een merkbaar en meetbaar verschil!</div>
                            <div className="block-project-description">
                                Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente
                                Eemsdelta en Gemeente Westerkwartier.
                            </div>
                            <div className="block-project-actions">
                                <div className="button button-light-outline">Lees meer</div>
                            </div>
                        </div>

                        <div className="block-project-image">
                            <img src={assetUrl(`/assets/img/project-block.jpg`)} alt="" />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <SocialImpact />
                </div>

                <div className="wrapper">
                    <div className="separator-dashed">
                        <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />
                    </div>
                </div>

                <div className="wrapper">
                    <PlatformAspects />
                </div>

                <div className="wrapper">
                    <SocialDomain />
                </div>

                <div className="wrapper">
                    <Strategy />
                </div>

                <div className="wrapper">
                    <Municipalities />
                </div>

                <Collaborations />

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we samen kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                    />
                </div>
            </div>
        </Fragment>
    );
}
