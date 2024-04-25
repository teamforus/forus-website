import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Implementation from '../props/models/Implementation';

export class ImplementationService<T = Implementation> {
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
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations`, data);
    }

    /**
     * Store notification by id
     */
    public store(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/implementations`, data);
    }

    /**
     * Fetch by id
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${id}`);
    }

    /**
     * Update email branding
     */
    public updateEmailBranding(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/implementations/${id}/email-branding`, data);
    }
}
export default function useImplementationService(): ImplementationService {
    return useState(new ImplementationService())[0];
}
