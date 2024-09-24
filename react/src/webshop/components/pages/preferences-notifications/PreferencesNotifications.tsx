import React, { useState } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import NotificationPreferencesCards from './elements/NotificationPreferencesCards';
import PushNotificationPreferencesCard from './elements/PushNotificationPreferencesCard';

export default function PreferencesNotifications() {
    const translate = useTranslate();

    const [loadedNotification, setLoadedNotification] = useState<boolean>(false);
    const [loadedPushNotification, setLoadedPushNotification] = useState<boolean>(false);

    return (
        <BlockShowcaseProfile
            breadcrumbs={
                <div className="block block-breadcrumbs">
                    <StateNavLink className="breadcrumb-item" name="home">
                        Home
                    </StateNavLink>
                    <div className="breadcrumb-item active">
                        {translate('notification_preferences.title_preferences')}
                    </div>
                </div>
            }
            profileHeader={
                <div className="profile-content-header clearfix">
                    <div className="profile-content-title">
                        <div className="pull-left">
                            <h1 className="profile-content-header">Notificatievoorkeuren</h1>
                        </div>
                    </div>
                </div>
            }>
            <NotificationPreferencesCards setLoaded={setLoadedNotification} />

            <PushNotificationPreferencesCard
                componentsLoaded={loadedNotification && loadedPushNotification}
                setLoaded={setLoadedPushNotification}
            />
        </BlockShowcaseProfile>
    );
}
