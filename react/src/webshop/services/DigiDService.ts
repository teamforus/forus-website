import ApiResponse, { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Tag from '../../dashboard/props/models/Tag';

export class DigiDService<T = Tag> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/digid';

    /**
     * Fetch list
     */
    public list(data: object): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public start(data: object): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(this.prefix, data);
    }

    public startFundRequest(fund_id: number) {
        return this.start({ fund_id, request: 'fund_request' });
    }

    public startAuthRestore() {
        return this.start({ request: 'auth' });
    }
}

export function useDigiDService(): DigiDService {
    return useState(new DigiDService())[0];
}
