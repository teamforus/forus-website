import ApiRequestService from './ApiRequestService';
import Identity from '../props/models/Identity';
import { useState } from 'react';

export class AuthService<T = { data: Identity }> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public identity() {
        return this.apiRequest.get('/identity');
    }
}

export function useAuthService(): AuthService {
    return useState(new AuthService())[0];
}
