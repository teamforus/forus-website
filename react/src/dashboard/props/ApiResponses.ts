export type ApiPaginationMetaProp = {
    to: number;
    from: number;
    path: string;
    total: number;
    per_page: number;
    last_page: number;
    current_page: number;
    links: {
        active: boolean;
        label: string;
        url: string;
    };
    [key: string]: string | number | boolean | object | Array<unknown>;
};

interface BaseResponse {
    status: number;
    response: Response;
}

export interface PaginationData<T> {
    data: Array<T>;
    meta: ApiPaginationMetaProp;
}

export interface ApiResponse<T> extends BaseResponse {
    data: PaginationData<T>;
}

export interface ApiResponseSingle<T> extends BaseResponse {
    data: { data: T };
}

export interface ResponseProp<T> extends BaseResponse {
    data: { data: T | Array<T> };
}

export interface ResponseErrorData {
    [key: string]: Array<string>;
}

export interface ResponseError<T = { message: string; errors: ResponseErrorData }> extends BaseResponse {
    data: T;
}

export interface ResponseErrorThrottled<T = { meta: { title: string; message: string } }> extends BaseResponse {
    data: T;
}

export interface ResponseSimple<T> extends BaseResponse {
    data: T;
}

export default ApiResponse;
