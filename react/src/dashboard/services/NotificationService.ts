import ApiRequestService from './ApiRequestService';
import { useState } from 'react';
import ApiResponse from '../props/ApiResponses';
import Notification from '../props/models/Notification';

export class NotificationService<T = Notification> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/notifications';

    public list(data = {}) {
        return this.apiRequest.get<ApiResponse<T>>(`${this.prefix}`, data);
    }
}

export function useNotificationService(): NotificationService {
    return useState(new NotificationService())[0];
}
