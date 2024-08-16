import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PageSelector from './elements/PageSelector';
import Banner from './elements/Banner';
import BlockLabelsInformationGeneral from './elements/information/BlockLabelsInformationGeneral';
import BlockLabelsFinancialDashboard from './elements/information/BlockLabelsFinancialDashboard';

export default function Information() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Real-time management-informatie');
    const [bannerLabel] = useState('Actueel inzicht in de effectiviteit van de regelingen');
    const [bannerDescription] = useState(
        [
            'Met real-time managementinformatie kunt u direct het succes van de regelingen inzien en uw beleid ',
            'daarop afstemmen voor betere resultaten. U krijgt inzicht in het gebruik van sociale regelingen en de impact die ze hebben op de lokale economie.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Real-time managementinformatie: Impact monitoren en evalueren');
    }, [setTitle]);

    return (
        <Fragment>
            <Banner type={'information'} title={bannerTitle} description={bannerDescription} labelText={bannerLabel} />

            <div className="main-content">
                <div className="wrapper">
                    <PageSelector activeType={'information'} />

                    <div className="block block-text">
                        <div className="block-text-description block-text-description-sm">
                            Als sponsor hebt u de mogelijkheid om de impact van de fondsen te monitoren en te evalueren
                            via de statistiekenpagina in de beheeromgeving. Hier vindt u verschillende gegevens over de
                            uitgifte van de regelingen. Door periodieke rapportages op te stellen en diverse filters te
                            gebruiken, kunt u een nauwkeurige analyse uitvoeren en uw beleid hierop afstemmen voor
                            optimale resultaten.
                            <br />
                            <br />
                            Zo kunt u zien hoe de fondsen worden gebruikt, bij welke aanbieders deelnemers hun budgetten
                            besteden, in welke wijk van de gemeente dit gebeurt, en welke soorten producten of diensten
                            het meest populair zijn onder de deelnemers.
                        </div>
                        <div className="block-text-banner">
                            <img
                                className={'hide-sm'}
                                src={assetUrl(`/assets/img/funds-information-management-banner.jpg`)}
                                alt="Inzichten in de effectiviteit van regelingen"
                            />
                            <img
                                className={'show-sm'}
                                src={assetUrl(`/assets/img/funds-information-management-banner-mobile.jpg`)}
                                alt="Inzichten in de effectiviteit van regelingen"
                            />
                        </div>
                        <div className="block-text-title block-text-title-sm">
                            Het financiële statistiekenoverzicht omvat gegevens over:
                        </div>
                        <BlockLabelsInformationGeneral />
                    </div>
                </div>

                <div className="separator-dashed" style={{ marginTop: '100px' }}>
                    <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />
                </div>

                <div className="wrapper">
                    <div className="block block-with-image">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    U kunt de financiële statistieken inzien via de beheeromgeving of u kunt de gegevens
                                    exporteren. Deze optie is vooral handig bij het creëren van aangepaste rapportages,
                                    het combineren van gegevens voor een uitgebreide analyse, het delen van resultaten
                                    met anderen die geen toegang hebben tot de beheeromgeving, of wanneer u offline
                                    toegang nodig hebt. Het stelt u in staat om geïnformeerde beslissingen te nemen die
                                    uw doelstellingen effectief ondersteunen.
                                </div>
                                <br />
                                <BlockLabelsFinancialDashboard />
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/information-financial.png')}
                                    alt="Aangepaste rapportages in het Forus-platform"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-title block-with-image-title-md">
                                    Ervaar de Forus-oplossing in actie
                                </div>
                                <div className="block-with-image-description block-with-image-description-sm">
                                    Vraag een gratis demo aan
                                </div>
                                <div className="block-with-image-actions">
                                    <button className="button button-primary">Gratis demo aanvragen</button>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/information-experience.png')}
                                    alt="Financiële inzichten op het Forus-platform: voorbeelden en toepassingen"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
