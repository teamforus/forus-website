import React, { useMemo, useState } from 'react';
import Fund from '../../../props/models/Fund';

export default function BlockCard2FAWarning({
    fund,
    buttonPosition = 'top',
}: {
    fund: Fund;
    buttonPosition?: 'bottom' | 'top';
}) {
    const settings = useMemo(() => {
        return fund?.auth_2fa_policy == 'global' ? fund?.organization_funds_2fa : fund;
    }, [fund]);

    const hasRestrictions = useMemo(() => {
        return (
            settings?.auth_2fa_policy == 'restrict_features' &&
            (settings?.auth_2fa_restrict_emails ||
                settings?.auth_2fa_restrict_auth_sessions ||
                settings?.auth_2fa_restrict_reimbursements)
        );
    }, [settings]);

    const [showMore2FADetails, setShowMore2FADetails] = useState(false);

    if (fund && settings.auth_2fa_policy == 'optional') {
        return null;
    }

    return (
        <div className="block block-action-card block-action-card-compact block-action-card-expandable">
            <div className="flex block-action-card-main">
                <div className="block-card-logo" aria-hidden="true">
                    <em className="mdi mdi-alert" />
                </div>
                {settings.auth_2fa_policy == 'required' && (
                    <div className="block-card-details">
                        <h3 className="block-card-title">
                            Deze regeling verplicht het gebruik van tweefactorauthenticatie
                        </h3>
                        <div className="block-card-description">
                            Om gebruik te kunnen maken van deze regeling dient de gebruiker na aanvraag een tweede
                            verificatiemethode te gebruiken.
                        </div>
                    </div>
                )}

                {settings.auth_2fa_policy == 'restrict_features' && (
                    <div className="block-card-details">
                        <h3 className="block-card-title">
                            Deze regeling verplicht het gebruik van tweefactorauthenticatie voor bepaalde
                            functionaliteiten
                        </h3>
                        <div className="block-card-description">
                            Om bepaalde opties en functionaliteit te gebruiken die gekoppeld zijn aan deze regeling,
                            dient de gebruiker een tweede verificatiemethode te gebruiken.
                        </div>
                    </div>
                )}

                {hasRestrictions && (
                    <div className={`block-card-actions ${buttonPosition}`}>
                        {showMore2FADetails ? (
                            <div className="button button-text" onChange={() => setShowMore2FADetails(false)}>
                                Toon minder
                                <em className="mdi mdi-chevron-up icon-right" />
                            </div>
                        ) : (
                            <div className="button button-text" onChange={() => setShowMore2FADetails(true)}>
                                Toon meer
                                <em className="mdi mdi-chevron-right icon-right" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {hasRestrictions && showMore2FADetails && (
                <div className="block-action-card-details flex flex-vertical">
                    {settings.auth_2fa_restrict_emails && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-account-outline" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">E-mail restricties</h3>
                                <div className="block-card-description">
                                    Tweefactorauthenticatie is vereist voor het beheren van e-mailadressen.
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.auth_2fa_restrict_auth_sessions && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-shield-account" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">Sessies restricties</h3>
                                <div className="block-card-description">
                                    Tweefactorauthenticatie is vereist voor het beheren van inlog sessies.
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.auth_2fa_restrict_reimbursements && (
                        <div className="block-action-card-details-item flex">
                            <div className="block-card-logo" aria-hidden="true">
                                <em className="mdi mdi-list-box-outline" />
                            </div>
                            <div className="block-card-details">
                                <h3 className="block-card-title">Declaraties restricties</h3>
                                <div className="block-card-description">
                                    Tweefactorauthenticatie is vereist voor het indienden van declaraties.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
