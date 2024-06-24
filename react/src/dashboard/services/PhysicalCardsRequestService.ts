import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import PhysicalCard from '../props/models/PhysicalCard';
import { ApiResponseSingle } from '../props/ApiResponses';

export class PhysicalCardsRequestService<T = PhysicalCard> {
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
     * Store
     */
    public store(organizationId: number, voucherAddress: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests`,
            data,
        );
    }

    /**
     * Validate
     */
    public validate(organizationId: number, voucherAddress: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests/validate`,
            data,
        );
    }
}
export function usePhysicalCardsRequestService(): PhysicalCardsRequestService {
    return useState(new PhysicalCardsRequestService())[0];
}
