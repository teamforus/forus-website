import { useState } from 'react';
import ApiRequestService from './ApiRequestService';

export class ShareService<T = null> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public sendEmail = (values: object) => {
        return this.apiRequest.post('/platform/share/email', values);
    };

    public sendSms = (values: object) => {
        return this.apiRequest.post('/platform/share/sms', values);
    };
}

export default function useShareService(): ShareService {
    return useState(new ShareService())[0];
}
