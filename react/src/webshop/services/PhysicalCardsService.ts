import { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import PhysicalCard from '../props/models/PhysicalCard';

export class PhysicalCardsService<T = PhysicalCard> {
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

    public store(voucher_address: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${voucher_address}/physical-cards`, data);
    }

    public destroy(voucher_address: string, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${voucher_address}/physical-cards/${id}`);
    }
}

export function usePhysicalCardsService(): PhysicalCardsService {
    return useState(new PhysicalCardsService())[0];
}
