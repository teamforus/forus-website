import React from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function Municipalities() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-municipalities">
            <div className="block-municipalities-title">Het Forus-systeem in actie</div>
            <div className="block-municipalities-subtitle">Bekijk live toepassingen van het Forus-platform</div>

            <div className="block-municipalities-logo-list">
                <div className="block-municipalities-logo">
                    <img src={assetUrl(`/assets/img/municipality-logos/fijnder.png`)} alt="Logo van Fijnder" />
                    <div className="block-municipality-title">Fijnder</div>
                </div>
                <div className="block-municipalities-logo">
                    <img src={assetUrl(`/assets/img/municipality-logos/werkplein.png`)} alt="Logo van Werkplein" />
                    <div className="block-municipality-title">Hart van West Brabant</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/geertruidenberg.png`)}
                        alt="Logo van Gemeente Geertruidenberg"
                    />
                    <div className="block-municipality-title">Geertruidenberg</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/goeree-overflakkee.png`)}
                        alt="Logo van Gemeente Goeree-Overflakkee"
                    />
                    <div className="block-municipality-title">Goeree-Overflakkee</div>
                </div>
                <div className="block-municipalities-logo">
                    <img src={assetUrl(`/assets/img/municipality-logos/heumen.png`)} alt="Logo van Gemeente Heumen" />
                    <div className="block-municipality-title">Heumen</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/vergoedigen.png`)}
                        alt="Logo van Gemeente Nijmegen"
                    />
                    <div className="block-municipality-title">Nijmegen</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/noordoostpolder.png`)}
                        alt="Logo van Gemeente Noordoostpolder"
                    />
                    <div className="block-municipality-title">Noordoostpolder</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/oost-gelre.png`)}
                        alt="Logo van Gemeente Oost Gelre"
                    />
                    <div className="block-municipality-title">Oost Gelre</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/berkelland.png`)}
                        alt="Logo van Gemeente Berkelland"
                    />
                    <div className="block-municipality-title">Berkelland</div>
                </div>
                <div className="block-municipalities-logo">
                    <img
                        src={assetUrl(`/assets/img/municipality-logos/eemsdelta.png`)}
                        alt="Logo van Gemeente Eemsdelta"
                    />
                    <div className="block-municipality-title">Eemsdelta</div>
                </div>
            </div>
        </div>
    );
}
