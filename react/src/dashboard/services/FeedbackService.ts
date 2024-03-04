import { ApiResponseSingle } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Feedback from '../props/models/Feedback';

export class FeedbackService<T = Feedback> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/feedback';
    
    /**
     * Store feedback
     */
    public store = (data: object = {}): Promise<ApiResponseSingle<T>>  => {
        return this.apiRequest.post(`${this.prefix}`, data);
    };

    public apiResourceToForm(apiResource: Feedback) {
        return {
            title: apiResource.title,
            urgency: apiResource.urgency,
        };
    }
}

export default function useProductService(): FeedbackService<Feedback> {
    return useState(new FeedbackService())[0];
}
