import React, { useState, useCallback } from 'react';
import { createContext } from 'react';
import { uniqueId } from 'lodash';
import ButtonType from '../../../../props/elements/ButtonType';
import useStorageService from '../../storage/useStrorrageService';

interface NotificationConfig {
    type?: 'success' | 'danger' | 'info';
    icon?: string;
}

interface Notification extends NotificationConfig {
    title: string;
    message: string;
}

export interface PushNotification extends Notification {
    id?: string;
    timerShow?: number;
    timerHide?: number;
    timerPop?: number;
    group?: string;
    imageSrc?: string;
    button?: ButtonType;
}

interface PushNotificationMemo {
    pushRaw: (notification: PushNotification) => string;
    pushInfo: (title: string, message?: string, notification?: NotificationConfig) => string;
    pushDanger: (title: string, message?: string, notification?: NotificationConfig) => string;
    pushSuccess: (title: string, message?: string, notification?: NotificationConfig) => string;
    notifications: Array<PushNotification>;
    setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
    popNotification: (id: string) => void;
    pushNotification: (notification: PushNotification) => void;
    setDismissTimeValue: (type: string, time: number) => void;
    getSystemDismissTime: () => number | undefined;
    getBookmarksDismissTime: () => number | undefined;
    pushNotificationStorageKey: string;
}

const pushNotificationContext = createContext<PushNotificationMemo>(null);
const { Provider } = pushNotificationContext;

const PushNotificationsProvider = ({ children }: { children: React.ReactElement | React.ReactElement[] }) => {
    const storage = useStorageService();

    const [total] = useState(4);
    const [notifications, setNotifications] = useState<Array<PushNotification>>([]);
    const [pushNotificationStorageKey] = useState('identity_push_notification_preferences');

    const popNotification = useCallback((id: string) => {
        setNotifications((notifications) => {
            return [...notifications.filter((item) => item.id !== id)];
        });
    }, []);

    const pushNotification = useCallback(
        (notification: PushNotification) => {
            notification.id = uniqueId();
            notification.group = notification.group ? notification.group : 'default';

            setNotifications((notifications) => {
                notifications.slice(total).forEach((notification) => {
                    window.clearTimeout(notification.timerPop);
                    window.clearTimeout(notification.timerShow);
                    popNotification(notification.id);
                });

                return [notification, ...notifications];
            });

            return notification.id;
        },
        [total, popNotification],
    );

    const pushSuccess = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'check', type: 'success', ...notification });
        },
        [pushNotification],
    );

    const pushDanger = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'close', type: 'danger', ...notification });
        },
        [pushNotification],
    );

    const pushInfo = useCallback(
        (title: string, message = '', notification?: NotificationConfig) => {
            return pushNotification({ title, message, icon: 'close', type: 'info', ...notification });
        },
        [pushNotification],
    );

    const pushRaw = useCallback(
        (notification: PushNotification) => {
            return pushNotification(notification);
        },
        [pushNotification],
    );

    const setDismissTimeValue = useCallback(
        (storageKey: string, time: number) => {
            storage.setCollectionItem(pushNotificationStorageKey, storageKey, time);
        },
        [pushNotificationStorageKey, storage],
    );

    const getDismissTimeValue = useCallback(
        (storageKey): number | undefined => {
            const value = storage.getCollectionItem(pushNotificationStorageKey, storageKey);

            return (value == 0 || value) && !isNaN(parseInt(value)) ? parseInt(value) : undefined;
        },
        [pushNotificationStorageKey, storage],
    );

    const getSystemDismissTime = useCallback(() => {
        return getDismissTimeValue('system');
    }, [getDismissTimeValue]);

    const getBookmarksDismissTime = useCallback(() => {
        return getDismissTimeValue('bookmarks');
    }, [getDismissTimeValue]);

    return (
        <Provider
            value={{
                pushRaw,
                pushInfo,
                pushDanger,
                pushSuccess,
                notifications,
                setNotifications,
                popNotification,
                pushNotification,
                setDismissTimeValue,
                getSystemDismissTime,
                getBookmarksDismissTime,
                pushNotificationStorageKey,
            }}>
            {children}
        </Provider>
    );
};

export { PushNotificationsProvider, pushNotificationContext };
