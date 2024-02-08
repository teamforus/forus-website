import { ResponseSimple, ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import MollieConnection from '../props/models/MollieConnection';
import ApiRequestService from './ApiRequestService';

export class MollieConnectionService<T = MollieConnection> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     */
    public prefix = '/platform/organizations';

    /**
     * Active connection
     */
    public getActive(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/mollie-connection`) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Store mollie connection
     */
    public store(organizationId: number, data: object): Promise<ResponseSimple<{ url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection`, data) as Promise<
            ResponseSimple<{ url: string }>
        >;
    }

    /**
     * Connect mollie account
     */
    public connect(organizationId: number): Promise<ResponseSimple<{ url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection/connect`) as Promise<
            ResponseSimple<{ url: string }>
        >;
    }

    /**
     * Fetch active connection
     */
    public fetch(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/mollie-connection/fetch`) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Update active connection
     */
    public update(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/mollie-connection`, data) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Delete active connection
     */
    public delete(organizationId: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/mollie-connection`) as Promise<null>;
    }

    /**
     * Store profile
     */
    public storeProfile(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection/profiles`, data) as Promise<
            ApiResponseSingle<T>
        >;
    }

    /**
     * Update profile by id
     */
    public updateProfile(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/mollie-connection/profiles/${id}`,
            data,
        ) as Promise<ApiResponseSingle<T>>;
    }
}
export default function useMollieConnectionService(): MollieConnectionService {
    return useState(new MollieConnectionService())[0];
}
