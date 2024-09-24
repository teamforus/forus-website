import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pushNotificationContext } from '../context/PushNotificationsContext';
import StateNavLink from '../../../../webshop/modules/state_router/StateNavLink';

export default function PushNotifications({
    group = 'default',
    maxCount = 0,
    className = '',
    showConfig = true,
    maxVisibleCount = 3,
    defaultDismissTimeout = 5,
}: {
    group?: string;
    maxCount?: number;
    className?: string;
    showConfig?: boolean;
    maxVisibleCount?: number;
    defaultDismissTimeout?: number;
}) {
    const { notifications, popNotification, getSystemDismissTime, getBookmarksDismissTime } =
        useContext(pushNotificationContext);

    const [visible, setVisible] = useState({});
    const [notificationsListVisible, setNotificationsListVisible] = useState([]);
    const [showAll, setShowAll] = useState(false);

    const dismissTime = useMemo<number>(() => {
        if (group === 'default') {
            return getSystemDismissTime() === undefined ? defaultDismissTimeout : getSystemDismissTime();
        }

        if (group === 'bookmarks') {
            return getBookmarksDismissTime() === undefined ? defaultDismissTimeout : getBookmarksDismissTime();
        }

        return defaultDismissTimeout;
    }, [defaultDismissTimeout, getBookmarksDismissTime, getSystemDismissTime, group]);

    const notificationsList = useMemo(() => {
        return notifications.filter((notification) => notification.group === group);
    }, [notifications, group]);

    const setVisibility = useCallback(
        (id: string, visible: boolean) => {
            setVisible((value) => ({ ...value, [id]: visible }));
        },
        [setVisible],
    );

    const removeNotificationElement = useCallback(
        (id: string) => {
            popNotification(id);
            setVisible((value) => {
                const newValue = { ...value };
                delete newValue[id];
                return { ...newValue };
            });
        },
        [popNotification],
    );

    const removeNotification = useCallback(
        (id: string) => {
            notificationsList
                .filter((item) => item.id === id)
                .forEach((item) => {
                    setTimeout(() => setVisibility(item.id, false));
                    setTimeout(() => removeNotificationElement(item.id), 300);
                });
        },
        [notificationsList, removeNotificationElement, setVisibility],
    );

    useEffect(() => {
        if (maxCount > 0 && notificationsList.length > maxCount) {
            notificationsList.slice(maxCount).forEach((item) => {
                setTimeout(() => setVisibility(item.id, false), 0);
                setTimeout(() => removeNotificationElement(item.id), 300);
            });
        }

        if (showAll) {
            notificationsList.forEach((item) => {
                setTimeout(() => setVisibility(item.id, true), 300);
                dismissTime && setTimeout(() => removeNotification(item.id), dismissTime * 1000);
            });

            setNotificationsListVisible(notificationsList);
        } else {
            notificationsList.slice(0, maxVisibleCount).forEach((item) => {
                setTimeout(() => setVisibility(item.id, true), 300);
                dismissTime && setTimeout(() => removeNotification(item.id), dismissTime * 1000);
            });

            notificationsList.slice(maxVisibleCount).forEach((item) => {
                setTimeout(() => setVisibility(item.id, false), 0);
            });

            setNotificationsListVisible(notificationsList.slice(0, maxVisibleCount));
        }
    }, [
        showAll,
        maxCount,
        dismissTime,
        setVisibility,
        maxVisibleCount,
        notificationsList,
        removeNotification,
        removeNotificationElement,
    ]);

    useEffect(() => {
        if (notificationsList?.length <= maxVisibleCount) {
            setShowAll(false);
        }
    }, [maxVisibleCount, notificationsList]);

    return (
        <div className={`block block-push-notifications ${className}`}>
            {showConfig && notificationsListVisible.length > 0 && (
                <div className="notification-setting">
                    <span>
                        {dismissTime
                            ? `Automatisch sluiten na ${dismissTime} seconden`
                            : 'Automatisch sluiten is uitgeschakeld'}
                    </span>
                    <span className="dot"></span>
                    <StateNavLink
                        name={'preferences-notifications'}
                        state={{ scrollTo: 'push_notification_preferences' }}>
                        Aanpassen
                    </StateNavLink>
                </div>
            )}
            <div className={`inner ${showAll ? 'show-all' : ''}`} role="alert">
                {notificationsListVisible?.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification notification-${notification.type} ${
                            visible?.[notification?.id] ? 'shown' : ''
                        }`}
                        role="status"
                        data-dusk={`${notification.type}Notification`}>
                        {notification.icon && <div className={`notification-icon mdi mdi-${notification.icon}`} />}

                        {notification.imageSrc && (
                            <div className="notification-image">
                                <img src={notification.imageSrc} alt="notification" />
                            </div>
                        )}

                        <div className="notification-details">
                            {notification.title && (
                                <strong className={'notification-title'}>{notification.title}</strong>
                            )}
                            {notification.message && (
                                <span className={'notification-description'}>{notification.message}</span>
                            )}
                        </div>

                        {showConfig && (
                            <div className="notification-setting-inline">
                                <span>
                                    {dismissTime
                                        ? `Automatisch sluiten na ${dismissTime} seconden`
                                        : 'Automatisch sluiten is uitgeschakeld'}
                                </span>
                                <span className="dot"></span>
                                <StateNavLink
                                    name={'preferences-notifications'}
                                    state={{ scrollTo: 'push_notification_preferences' }}>
                                    Aanpassen
                                </StateNavLink>
                            </div>
                        )}

                        {notification.button && (
                            <div className="notification-button">
                                <div className="button button-primary" onClick={notification.button.onClick}>
                                    <em className={`mdi mdi-${notification.button.icon}`} aria-hidden="true" />
                                    {notification.button.text}
                                </div>
                            </div>
                        )}

                        <div
                            className="notification-close mdi mdi-close"
                            onClick={() => removeNotification(notification.id)}
                        />
                    </div>
                ))}
            </div>

            {notificationsList?.length > maxVisibleCount && (
                <button className="button button-show-all" onClick={() => setShowAll(!showAll)}>
                    <span>
                        {showAll
                            ? `Hide +${notificationsList.length - maxVisibleCount} notifications`
                            : `Show +${notificationsList.length - maxVisibleCount} notifications`}
                    </span>

                    {showAll ? (
                        <em className={`mdi mdi-chevron-up`}></em>
                    ) : (
                        <em className={`mdi mdi-chevron-down`}></em>
                    )}
                </button>
            )}
        </div>
    );
}
