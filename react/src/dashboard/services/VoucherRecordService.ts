import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import VoucherRecord from '../props/models/VoucherRecord';

export class VoucherRecordService<T = VoucherRecord> {
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
    public list(organizationId: number, voucher_id: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/voucher-records`,
            data,
        );
    }

    public store(organizationId: number, voucher_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/voucher-records`,
            data,
        );
    }

    public show(organizationId: number, voucher_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`,
        );
    }

    public update(
        organizationId: number,
        voucher_id: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`,
            data,
        );
    }

    public destroy(organizationId: number, voucher_id: number, id: number): Promise<ApiResponse<null>> {
        return this.apiRequest.delete(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucher_id}/voucher-records/${id}`,
        );
    }
}

export default function useVoucherRecordService(): VoucherRecordService {
    return useState(new VoucherRecordService())[0];
}
