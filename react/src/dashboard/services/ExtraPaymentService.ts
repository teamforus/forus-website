import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ExtraPayment from '../props/models/ExtraPayment';

export class ExtraPaymentService<T = ExtraPayment> {
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
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/reservation-extra-payments`, data);
    }

    /**
     * Read product
     */
    public read(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/reservation-extra-payments/${id}`);
    }
}

export default function useExtraPaymentService(): ExtraPaymentService {
    return useState(new ExtraPaymentService())[0];
}
