import ApiResponse from '../props/ApiResponses';
import { useState } from 'react';
import EventLog from '../props/models/EventLog';
import ApiRequestService from './ApiRequestService';

export class EventLogService<T = EventLog> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Fetch list
     */
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/logs`, data) as Promise<ApiResponse<T>>;
    }
}
export function useEventLogService(): EventLogService {
    return useState(new EventLogService())[0];
}
