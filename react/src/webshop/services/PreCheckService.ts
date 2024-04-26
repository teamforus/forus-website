import ApiResponse, { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import PreCheck from '../props/models/PreCheck';
import PreCheckTotals from './types/PreCheckTotals';

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
    public prefix = '/platform/pre-checks';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public calculateTotals(data: object = {}): Promise<ResponseSimple<PreCheckTotals>> {
        return this.apiRequest.post(`${this.prefix}/calculate`, data);
    }

    public downloadPDF(data: object): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.post(`${this.prefix}/download-pdf`, data, {
            responseType: 'arraybuffer',
        });
    }
}

export function usePreCheckService(): PreCheckService {
    return useState(new PreCheckService())[0];
}
