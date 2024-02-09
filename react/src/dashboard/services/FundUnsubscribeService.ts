import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import FundProviderUnsubscribe from '../props/models/FundProviderUnsubscribe';

export class FundUnsubscribeService<T = FundProviderUnsubscribe> {
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

    public listProvider(organization_id: number, query = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/provider/fund-unsubscribes`, query);
    }

    public listSponsor(organization_id: number, query = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/sponsor/fund-unsubscribes`, query);
    }

    public store(organization_id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/provider/fund-unsubscribes`, data);
    }

    public update(organization_id: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/provider/fund-unsubscribes/${id}`, data);
    }

    public updateSponsor(organization_id: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/sponsor/fund-unsubscribes/${id}`, data);
    }
}
export default function useFundUnsubscribeService(): FundUnsubscribeService {
    return useState(new FundUnsubscribeService())[0];
}
