import ApiResponse, { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import Voucher from '../../dashboard/props/models/Voucher';

export class VoucherService<T = Voucher> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/vouchers';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public get(address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${address}`);
    }

    public sendToEmail(address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${address}/send-email`);
    }

    public shareVoucher(address: string, values = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${address}/share`, values);
    }

    public destroy(address: string): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${address}`);
    }

    public deactivate(address: string, data = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${address}/deactivate`, data);
    }
}

export function useVoucherService(): VoucherService {
    return useState(new VoucherService())[0];
}
