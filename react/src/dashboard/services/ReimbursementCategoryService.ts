import { useState } from 'react';
import ApiResponse, { ApiResponseSingle } from '../props/ApiResponses';
import ApiRequestService from './ApiRequestService';
import ReimbursementCategory from '../props/models/ReimbursementCategory';

export class ReimbursementCategoryService<T = ReimbursementCategory> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations/';

    /**
     * Fetch list
     */
    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix + organizationId}/reimbursement-categories`, data);
    }

    /**
     * Fetch list
     */
    public show(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix + organizationId}/reimbursement-categories/${id}`);
    }

    /**
     * Fetch by id
     */
    public update(organizationId: number, id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix + organizationId}/reimbursement-categories/${id}`, data);
    }

    /**
     * Store reimbursement category
     */
    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/reimbursement-categories`, data);
    }

    public destroy(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix + organizationId}/reimbursement-categories/${id}`);
    }
}

export function useReimbursementCategoryService(): ReimbursementCategoryService {
    return useState(new ReimbursementCategoryService())[0];
}
