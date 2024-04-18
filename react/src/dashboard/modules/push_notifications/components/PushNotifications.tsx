import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pushNotificationContext } from '../context/PushNotificationsContext';

export default function PushNotifications({
    group = 'default',
    maxCount = 4,
    className = '',
}: {
    group?: string;
    maxCount?: number;
    className?: string;
}) {
    const { notifications, popNotification } = useContext(pushNotificationContext);
    const [visible, setVisible] = useState({});

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
        const listNew = notificationsList.filter((item) => !Object.keys(visible).includes(item.id));
        const listOld = notificationsList.filter((item) => Object.keys(visible).includes(item.id));

        const total = listOld.length + listNew.length;

        if (total > maxCount) {
            listOld.slice(maxCount - listNew.length).forEach((item) => {
                setTimeout(() => setVisibility(item.id, false), 0);
                setTimeout(() => removeNotificationElement(item.id), 300);
            });
        }

        listNew.forEach((item) => {
            setTimeout(() => setVisibility(item.id, true), 300);
            setTimeout(() => removeNotification(item.id), item.timeout);
        });
    }, [notificationsList, removeNotificationElement, removeNotification, setVisibility, visible, maxCount]);

    return (
        <div className={`block block-push-notifications ${className}`}>
            <div className="inner" role="alert">
                {notificationsList?.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification notification-${notification.type} ${
                            visible?.[notification?.id] ? 'shown' : ''
                        }`}
                        role="status"
                        data-dusk={`${notification.type}Notification`}>
                        <div
                            className="notification-close mdi mdi-close"
                            onClick={() => removeNotification(notification.id)}
                        />

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

                        {notification.button && (
                            <div className="notification-button">
                                <div className="button button-primary" onClick={notification.button.onClick}>
                                    <em className={`mdi mdi-${notification.button.icon}`} aria-hidden="true" />
                                    {notification.button.text}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
