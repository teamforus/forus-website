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
        return this.apiRequest.get(`${this.prefix}/${organizationId}/mollie-connection`);
    }

    /**
     * Store mollie connection
     */
    public store(organizationId: number, data: object): Promise<ResponseSimple<{ url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection`, data);
    }

    /**
     * Connect mollie account
     */
    public connect(organizationId: number): Promise<ResponseSimple<{ url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection/connect`);
    }

    /**
     * Fetch active connection
     */
    public fetch(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/mollie-connection/fetch`);
    }

    /**
     * Update active connection
     */
    public update(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/mollie-connection`, data);
    }

    /**
     * Delete active connection
     */
    public delete(organizationId: number): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/mollie-connection`);
    }

    /**
     * Store profile
     */
    public storeProfile(organizationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/mollie-connection/profiles`, data);
    }

    /**
     * Update profile by id
     */
    public updateProfile(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/mollie-connection/profiles/${id}`, data);
    }
}
export default function useMollieConnectionService(): MollieConnectionService {
    return useState(new MollieConnectionService())[0];
}
