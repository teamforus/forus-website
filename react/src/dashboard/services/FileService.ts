import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import { saveAs } from 'file-saver';
import File from '../props/models/File';
import { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';

export class FileService<T = File> {
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

    public download(file: File): Promise<ResponseSimple<ArrayBuffer>> {
        return this.apiRequest.get(`${this.prefix}/${file.uid}/download`, {}, { responseType: 'arraybuffer' });
    }

    public downloadBlob(file: File): Promise<ResponseSimple<Blob>> {
        return this.apiRequest.get(`${this.prefix}/${file.uid}/download`, {}, { responseType: 'blob' });
    }

    public store(file: Blob) {
        const formData = new FormData();

        formData.append('file', file);

        return this.apiRequest.post(this.prefix, formData, { headers: { 'Content-Type': undefined } });
    }

    // Demo
    public storeWithProgress(data: {
        file: File | Blob;
        preview?: File | Blob;
        type: string;
        onProgress: (e: { progress: number }, xhr: XMLHttpRequest) => void;
    }) {
        return this.storeData(
            [['file', data.file], ['type', data.type], ...(data.preview ? [['file_preview', data.preview]] : [])],
            { onProgress: data.onProgress },
        );
    }

    public storeData(
        append = [],
        config?: {
            onProgress?: (e: { progress: number }, xhr: XMLHttpRequest) => void;
            onAbort?: () => void;
        },
    ): Promise<ApiResponseSingle<T>> {
        const formData = new FormData();

        append.forEach((item) => formData.append(item[0], item[1]));

        return this.apiRequest.post(this.prefix, formData, (cfg) => ({
            ...cfg,
            headers: { ...cfg?.headers, 'Content-Type': undefined },
            onProgress: config?.onProgress,
            onAbort: config?.onAbort,
        }));
    }

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
}
export function useFileService(): FileService {
    return useState(new FileService())[0];
}
