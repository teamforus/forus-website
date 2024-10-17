import React from 'react';

import CollaborationsCarousel from '../../../elements/CollaborationsCarousel';

export default function Collaborations() {
    return (
        <div className="block block-collaborations">
            <div className="block-collaborations-content">
                <div className="block-collaborations-title">Samenwerkingen</div>
                <div className="block-collaborations-subtitle">
                    Forus werkt samen met en laat zich inspireren door diverse organisaties die bijdragen aan
                    veiligheid, wetenschappelijke onderbouwing van best practices, digitale toegankelijkheid,
                    onafhankelijke audits en visie op de architectuur van onze applicatie.
                </div>
            </div>

            <CollaborationsCarousel />
        </div>
    );
}
