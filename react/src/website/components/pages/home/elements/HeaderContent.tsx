import React from 'react';

export default function HeaderContent() {
    return (
        <div className="header-content">
            <div className="header-info">
                <div className="header-title">Het platform voor sociale regelingen</div>
                <div className="header-description">
                    Forus biedt een flexibel, modulair platform dat het gehele uitgifteproces van sociale regelingen
                    faciliteert. Ons doel is om de toegang tot hulp laagdrempeliger te maken en zelfredzaamheid te
                    bevorderen.
                </div>
            </div>
            <div className="header-actions">
                <div className="button-group hide-sm">
                    <div className="button button-primary button-sm">Gratis demo</div>
                    <div className="button button-dark button-sm">Ontdek de functies van ons platform</div>
                </div>

                <div className="button-group show-sm-flex">
                    <div className="button button-primary">Gratis demo</div>
                    <div className="button button-dark">Ontdek de functies van ons platform</div>
                </div>
            </div>
        </div>
    );
}
