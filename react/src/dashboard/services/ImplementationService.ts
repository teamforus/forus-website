import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
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
     * Read implementation
     */
    public read(organizationId: number, implementationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/implementations/${implementationId}`, data);
    }

    public updatePreCheckBanner(
        organizationId: number,
        implementationId: number,
        data: object,
    ): Promise<ApiResponse<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/pre-check-banner`,
            data,
        );
    }
}

export function useImplementationService(): ImplementationService {
    return useState(new ImplementationService())[0];
}
