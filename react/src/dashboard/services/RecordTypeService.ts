import ApiResponse from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import RecordType from '../props/models/RecordType';

export class RecordTypeService<T = RecordType> {
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
    public list(data: object = {}): Promise<{ data: Array<T> }> {
        return this.apiRequest.get(`${this.prefix}/identity/record-types`, data);
    }
}

export default function useRecordTypeService(): RecordTypeService {
    return useState(new RecordTypeService())[0];
}
