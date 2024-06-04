import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Office from '../../dashboard/props/models/Office';

export class OfficeService<T = Office> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/offices';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public read(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`);
    }

    public scheduleWeekFullDays = () => {
        return { 0: 'Maandag', 1: 'Dinsdag', 2: 'Woensdag', 3: 'Donderdag', 4: 'Vrijdag', 5: 'Zaterdag', 6: 'Zondag' };
    };
}

export function useOfficeService(): OfficeService {
    return useState(new OfficeService())[0];
}
