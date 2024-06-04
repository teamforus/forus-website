import ApiResponse from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import PreCheck from '../props/models/PreCheck';

export class PreCheckService<T = PreCheck> {
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
    public list(organizationId: number, implementationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/pre-checks`,
            data,
        );
    }

    /**
     * Sync pre-checks
     */
    public sync(organizationId: number, implementationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/pre-checks/sync`,
            data,
        );
    }
}

export default function usePreCheckService(): PreCheckService {
    return useState(new PreCheckService())[0];
}
