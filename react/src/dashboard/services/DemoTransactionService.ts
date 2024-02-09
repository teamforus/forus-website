import { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import DemoTransaction from '../props/models/DemoTransaction';

export class DemoTransactionService<T = DemoTransaction> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/demo/transactions';

    public store(): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(this.prefix);
    }

    public update(token: string, values: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${token}`, values);
    }

    public read(token: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${token}`);
    }
}

export default function useDemoTransactionService(): DemoTransactionService {
    return useState(new DemoTransactionService())[0];
}
