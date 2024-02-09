import events from '../helpers/events';
import EnvDataProp from '../../props/EnvData';

export default class ApiRequestService<T = null> {
    protected static host = '';
    protected static envData: EnvDataProp = null;

    public static setEnvData(envData: EnvDataProp) {
        ApiRequestService.envData = envData;
    }

    public static setHost(host: string) {
        ApiRequestService.host = host;
    }

    /**
     * Get API url
     */
    public static getHost() {
        let host = ApiRequestService.host;

        while (host[host.length - 1] === '/') {
            host = host.slice(0, host.length - 1);
        }

        return host;
    }

    /**
     * Make request headers
     */
    private makeHeaders() {
        return {
            Accept: 'application/json',
            'Accept-Language': localStorage.locale || 'nl',
            'Client-Key': ApiRequestService.envData?.client_key,
            'Client-Type': ApiRequestService.envData?.client_type,
            'Content-Type': 'application/json',
            ...(localStorage.active_account ? { Authorization: 'Bearer ' + localStorage.active_account } : {}),
        };
    }

    /**
     * Make GET Request
     *
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public get<G = T>(
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<G> {
        return this.ajax<G>('GET', endpoint, data, headers, callback);
    }

    /**
     * Make POST Request
     *
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public post<P = T>(
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<P> {
        return this.ajax<P>('POST', endpoint, data, headers, callback);
    }

    /**
     * Make PATCH Request
     *
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public patch<P = T>(
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<P> {
        return this.ajax<P>('PATCH', endpoint, data, headers, callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Make PUT Request
     *
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public put<P = T>(
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<P> {
        return this.ajax<P>('PUT', endpoint, data, headers, callback);
    }

    /**
     * Make DELETE Request
     *
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public delete<D = T>(
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<D> {
        return this.ajax<D>('DELETE', endpoint, data, headers, callback);
    }

    /**
     * Make AJAX Request
     *
     * @param method
     * @param endpoint
     * @param data
     * @param headers
     * @param callback
     */
    public ajax<A>(
        method: string,
        endpoint: string,
        data: object = {},
        headers: object = {},
        callback: ((config: object) => object) | object = {},
    ): Promise<A> {
        return new Promise((resolve, reject) => {
            let getQueryString = '';
            let params = { method, headers: { ...this.makeHeaders(), ...headers } };

            Object.keys(params.headers).forEach((key: string) => {
                if (params.headers[key] === undefined) {
                    delete params.headers[key];
                }
            });

            if (typeof data === 'object' && !(data instanceof FormData)) {
                data = { ...data };
            }

            if (method === 'GET') {
                getQueryString = this.dataToGetQueryString(data);
            } else {
                if (data instanceof FormData) {
                    delete params.headers['Content-Type'];
                    params = { ...params, ...{ body: data } };
                } else {
                    params = { ...params, ...{ body: JSON.stringify(data) } };
                }
            }

            const config = typeof callback === 'function' ? callback(params) : { ...params, ...callback };
            const xhr = new XMLHttpRequest();

            xhr.open(method, this.endpointToUrl(endpoint, getQueryString), true);

            Object.keys(config.headers).forEach((key: string) => {
                xhr.setRequestHeader(key, config.headers[key]);
            });

            if (config?.onProgress) {
                xhr.upload.onprogress = function (event) {
                    if (event.lengthComputable) {
                        config?.onProgress({ progress: (event.loaded / event.total) * 100 });
                    }
                };
            }

            if (config?.onXhr) {
                xhr.onabort = config?.onAbort;
            }

            if (config?.responseType) {
                xhr.responseType = config?.responseType;
            }

            if (config?.onXhr) {
                config.onXhr(xhr);
            }

            xhr.onload = async () => {
                const isText = !xhr.responseType || xhr.responseType == 'text';

                const resData = {
                    data: isText ? this.parseJson(xhr.responseText) : xhr.response,
                    status: xhr.status,
                    response: xhr,
                };

                if (resData.status === 200 || resData.status === 201 || resData.status === 204) {
                    resolve(resData as A);
                } else {
                    if (resData.status == 401) {
                        return events.publish('api-response:401', resData);
                    }

                    reject(resData);
                }
            };

            xhr.onerror = () => reject({ data: null, status: xhr.status, response: xhr });

            if (method === 'GET') {
                xhr.send();
            } else {
                xhr.send(config.body);
            }
        });
    }

    /**
     * @param res
     * @private
     */
    private parseJson(res: string): unknown {
        try {
            return JSON.parse(res);
        } catch (e) {
            return null;
        }
    }

    /**
     * Build GET query parameters string
     * @param data
     * @private
     */
    private dataToGetQueryString(data: object) {
        const props = Object.keys(data);
        const queryParams: Array<string> = [];

        props.forEach((prop: string) => {
            if (Array.isArray(data[prop])) {
                data[prop].forEach((element: unknown) =>
                    queryParams.push(prop + '[]=' + encodeURIComponent(element?.toString())),
                );
            } else {
                if (data[prop] !== null && data[prop] !== undefined) {
                    queryParams.push(prop + '=' + encodeURIComponent(data[prop]));
                }
            }
        });

        return queryParams.length > 0 ? '?' + queryParams.join('&') : '';
    }

    /**
     * @param endpoint
     * @param getParamsString
     */
    public endpointToUrl(endpoint: string, getParamsString = '') {
        return ApiRequestService.getHost() + (endpoint || '') + getParamsString;
    }
}
