import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import FundRequest from '../../dashboard/props/models/FundRequest';

export class FundRequestService<T = FundRequest> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/funds';
    public prefixRequester = '/platform/fund-requests';

    /**
     * Fetch list
     */
    public index(fund_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${fund_id}/requests`, data);
    }

    public store(fund_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${fund_id}/requests`, data);
    }

    public storeValidate(fund_id: number, data: object = {}): Promise<null> {
        return this.apiRequest.post(`${this.prefix}/${fund_id}/requests/validate`, data);
    }

    public read(fund_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${fund_id}/requests/${id}`);
    }

    public indexRequester(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefixRequester}`, data);
    }

    public readRequester(id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefixRequester}/${id}`);
    }
}

export function useFundRequestService(): FundRequestService {
    return useState(new FundRequestService())[0];
}
