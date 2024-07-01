import React, { useEffect, useState } from 'react';
import useAppConfigs from '../../hooks/useAppConfigs';
import useAssetUrl from '../../hooks/useAssetUrl';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import classNames from 'classnames';

import StateNavLink from '../../modules/state_router/StateNavLink';
import IconSponsor from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/sponsor-icon.svg';
import IconProvider from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/provider-icon.svg';
import IconValidator from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/validator-icon.svg';

export default function LayoutHeader() {
    const authIdentity = useAuthIdentity();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();

    const [showMenu, setShowMenu] = useState(true);

    useEffect(() => {
        setShowMenu(false);
    }, []);

    if (!appConfigs) {
        return null;
    }

    return (
        <div className="layout-header">
            <div className="layout-header-wrapper">
                <StateNavLink name={'home'} className="layout-header-logo">
                    <img src={assetUrl('/assets/img/logo.svg')} alt="" />
                </StateNavLink>
                <div className="layout-header-menu">
                    <StateNavLink name={'home'} className="layout-header-menu-item">
                        Home
                    </StateNavLink>
                    <StateNavLink name={'platform'} className="layout-header-menu-item">
                        Platform
                    </StateNavLink>
                    <StateNavLink name={'about'} className="layout-header-menu-item">
                        Over ons
                    </StateNavLink>
                    <StateNavLink name={'contacts'} className="layout-header-menu-item">
                        Contact
                    </StateNavLink>
                </div>
                {authIdentity ? (
                    <div
                        className={classNames('layout-header-auth clickable', showMenu && 'active')}
                        onClick={() => setShowMenu(!showMenu)}>
                        <div className="layout-header-auth-content">
                            <div className="layout-header-auth-details">
                                <div className="layout-header-auth-details-identifier">
                                    {authIdentity?.email || authIdentity?.address}
                                </div>
                                <div className="layout-header-auth-details-label">Uw profiel</div>
                            </div>
                            <div className="layout-header-auth-media">
                                <img src={assetUrl('/assets/img/website-profile.svg')} alt="" />
                            </div>
                        </div>
                        <div className="layout-header-auth-toggle">
                            <em className="mdi mdi-menu-down" />
                        </div>
                        {showMenu && (
                            <div className="layout-header-auth-menu" onClick={(e) => e.stopPropagation()}>
                                {appConfigs.fronts?.url_sponsor && (
                                    <a
                                        className="layout-header-auth-menu-item"
                                        href={appConfigs.fronts?.url_sponsor}
                                        onClick={() => setShowMenu(false)}
                                        target={'_blank'}
                                        rel="noreferrer">
                                        <IconSponsor />
                                        Sponsor
                                    </a>
                                )}
                                {appConfigs.fronts?.url_provider && (
                                    <a
                                        className="layout-header-auth-menu-item"
                                        href={appConfigs.fronts?.url_provider}
                                        onClick={() => setShowMenu(false)}
                                        target={'_blank'}
                                        rel="noreferrer">
                                        <IconProvider /> Aanbieder
                                    </a>
                                )}
                                {appConfigs.fronts?.url_validator && (
                                    <a
                                        className="layout-header-auth-menu-item"
                                        href={appConfigs.fronts?.url_validator}
                                        onClick={() => setShowMenu(false)}
                                        target={'_blank'}
                                        rel="noreferrer">
                                        <IconValidator /> Beoordelaar
                                    </a>
                                )}
                                <div className="layout-header-auth-menu-separator" />
                                <StateNavLink name={'sign-out'} className="layout-header-auth-menu-item">
                                    <em className="mdi mdi-logout" />
                                    Uitloggen
                                </StateNavLink>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="layout-header-auth">
                        <div className="button-group">
                            <StateNavLink name={'sign-in'} className="button button-light button-sm">
                                Inloggen
                            </StateNavLink>
                            <div className="button button-primary button-sm">Gratis demo</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
