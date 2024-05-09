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

    public list(data = {}): Promise<ApiResponse<T, { total_unseen: number }>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }
}

export function useNotificationService(): NotificationService {
    return useState(new NotificationService())[0];
}
