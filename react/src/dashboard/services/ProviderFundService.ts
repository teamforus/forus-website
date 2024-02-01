import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import FundProvider from '../props/models/FundProvider';
import Fund from '../props/models/Fund';
import Organization from '../props/models/Organization';
import Tag from '../props/models/Tag';
import Implementation from "../props/models/Implementation";

export class ProviderFundService<T = FundProvider> {
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
    public listAvailableFunds(
        organizationId: number,
        data: object = {},
    ): Promise<
        ApiResponse<Fund> & {
            data: {
                meta: {
                    totals: {
                        active: number;
                        pending: number;
                        available: number;
                        archived: number;
                        invitations: number;
                        invitations_archived: number;
                        unsubscriptions: number;
                    };
                    tags: Array<Tag>;
                    organizations: Array<Organization>;
                    implementations: Array<Implementation>;
                };
            };
        }
    > {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds-available`, data);
    }

    /**
     * Fetch list
     */
    public listFunds(organizationId: number, data: object = {}): Promise<ApiResponse<FundProvider>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds`, data);
    }

    /**
     * Fetch list
     */
    public readFundProvider(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/provider/funds/${id}`, data);
    }

    /**
     * Fetch list
     */
    public applyForFund(organizationId: number, fund_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/provider/funds`, { fund_id });
    }

    /**
     * Fetch list
     */
    public cancelApplication(organizationId: number, id: number, data: object = {}): Promise<null> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/provider/funds/${id}`, data);
    }
}
export default function useProviderFundService(): ProviderFundService {
    return useState(new ProviderFundService())[0];
}
