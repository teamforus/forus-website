import { ApiResponseSingle } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';

export type SearchResultItem = {
    id: number;
    item_type: 'fund' | 'provider' | 'product';
    name: string;
};

export type SearchResultGroup = {
    count: number;
    items: Array<SearchResultItem>;
};

export type SearchResult = {
    funds: SearchResultGroup;
    products: SearchResultGroup;
    providers: SearchResultGroup;
};

export class SearchService<T = SearchResult> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/search';

    /**
     * Fetch list
     */
    public search(data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }
}

export function useSearchService(): SearchService {
    return useState(new SearchService())[0];
}
