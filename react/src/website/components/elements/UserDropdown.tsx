import React from 'react';
import IconSponsor from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/sponsor-icon.svg';
import IconProvider from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/provider-icon.svg';
import IconValidator from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/validator-icon.svg';
import StateNavLink from '../../modules/state_router/StateNavLink';
import useAppConfigs from '../../hooks/useAppConfigs';
import useUserAuthDropdown from '../../hooks/useUserAuthDropdown';
import useSetUserAuthDropdown from '../../hooks/useSetUserAuthDropdown';

export default function UserDropdown() {
    const appConfigs = useAppConfigs();

    const showUserAuthDropdown = useUserAuthDropdown();
    const setShowUserAuthDropdown = useSetUserAuthDropdown();

    if (!appConfigs || !showUserAuthDropdown) {
        return null;
    }

    return (
        <div className="layout-header-auth-menu" onClick={(e) => e.stopPropagation()}>
            {appConfigs?.fronts?.url_sponsor && (
                <a
                    className="layout-header-auth-menu-item"
                    href={appConfigs.fronts?.url_sponsor}
                    onClick={() => setShowUserAuthDropdown(false)}
                    target={'_blank'}
                    rel="noreferrer">
                    <IconSponsor />
                    Sponsor
                </a>
            )}
            {appConfigs?.fronts?.url_provider && (
                <a
                    className="layout-header-auth-menu-item"
                    href={appConfigs.fronts?.url_provider}
                    onClick={() => setShowUserAuthDropdown(false)}
                    target={'_blank'}
                    rel="noreferrer">
                    <IconProvider /> Aanbieder
                </a>
            )}
            {appConfigs?.fronts?.url_validator && (
                <a
                    className="layout-header-auth-menu-item"
                    href={appConfigs.fronts?.url_validator}
                    onClick={() => setShowUserAuthDropdown(false)}
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
    );
}
