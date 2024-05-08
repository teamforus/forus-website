import { useContext } from 'react';
import { pushNotificationContext } from '../modules/push_notifications/context/PushNotificationsContext';

export default function usePopNotification() {
    return useContext(pushNotificationContext).popNotification;
}
