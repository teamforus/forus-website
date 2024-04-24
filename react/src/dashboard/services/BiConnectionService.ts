import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import BiConnection from '../props/models/BiConnection';
import BiConnectionDataType from '../props/models/BiConnectionDataType';

export class BiConnectionService<T = BiConnection> {
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

    public active(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/bi-connection`);
    }

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/bi-connection`, data);
    }

    public update(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/bi-connection`, data);
    }

    public resetToken(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/bi-connection/reset`);
    }

    public availableDataTypes(organizationId: number): Promise<ApiResponse<BiConnectionDataType>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/bi-connection/data-types`);
    }
}

export function useBiConnectionService(): BiConnectionService {
    return useState(new BiConnectionService())[0];
}
