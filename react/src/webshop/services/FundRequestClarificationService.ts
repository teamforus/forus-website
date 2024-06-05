import { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import FundRequestClarification from '../../dashboard/props/models/FundRequestClarification';

export class FundRequestClarificationService<T = FundRequestClarification> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/fund-requests';

    public update(request_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${request_id}/clarifications/${id}`, data);
    }
}

export function useFundRequestClarificationService(): FundRequestClarificationService {
    return useState(new FundRequestClarificationService())[0];
}
