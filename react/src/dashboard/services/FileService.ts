import { useState } from 'react';
import Employee from '../props/models/Employee';
import ApiRequestService from './ApiRequestService';
import { saveAs } from 'file-saver';
import File from '../props/models/File';
import { ResponseSimple } from '../props/ApiResponses';

export class FileService<T = Employee> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/files';

    /**
     * Fetch list
     */
    public downloadFile = (
        name: string,
        data: Blob | ArrayBuffer | string,
        contentType = 'text/csv;charset=utf-8;',
    ) => {
        saveAs(data instanceof Blob ? data : new Blob([data], { type: contentType }), name);
    };

    public base64ToBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            byteArrays.push(new Uint8Array(byteNumbers));
        }

        return new Blob(byteArrays, { type: contentType });
    };

    public download(file: File): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${file.uid}/download`, {}, { responseType: 'arraybuffer' });
    }

    public downloadBlob(file: File): Promise<ResponseSimple<Blob>> {
        return this.apiRequest.get(`${this.prefix}/${file.uid}/download`, {}, { responseType: 'blob' });
    }

    public downloadUrl(file: File) {
        return this.apiRequest.endpointToUrl(`${this.prefix}/${file.uid}/download`);
    }

    public store(file) {
        const formData = new FormData();

        formData.append('file', file);

        return this.apiRequest.post(this.prefix, formData, { headers: { 'Content-Type': undefined } });
    }

    public storeValidate(file: Blob) {
        const formData = new FormData();

        formData.append('file', file);

        return this.apiRequest.post(`${this.prefix}/validate`, formData, { headers: { 'Content-Type': undefined } });
    }

    public storeAll(files: Array<Blob>) {
        return Promise.all(files.map(this.store));
    }

    public storeValidateAll(files: Array<Blob>) {
        return Promise.all(files.map(this.storeValidate));
    }

    // Demo
    public storeWithProgress(file: File | Blob, type: string, onProgress: (e: { progress: number }) => void) {
        const append = [
            ['file', file],
            ['type', type],
        ];

        return this.storeData(append, { onProgress });
    }

    public storeData(
        append = [],
        config?: {
            onProgress?: (e: { progress: number }) => void;
            onXhr?: (xhr: XMLHttpRequest) => void;
            onAbort?: (e) => void;
        },
    ) {
        const formData = new FormData();

        append.forEach((item) => formData.append(item[0], item[1]));

        return this.apiRequest.post(this.prefix, formData, (cfg) => ({
            ...cfg,
            headers: { ...cfg?.headers, 'Content-Type': undefined },
            onProgress: config?.onProgress,
            onXhr: config?.onXhr,
            onAbort: config?.onAbort,
        }));
    }
}
export function useFileService(): FileService {
    return useState(new FileService())[0];
}
