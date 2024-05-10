import { useState } from 'react';

export class ToastService {
    private toast: { show: boolean; description: string } = { show: false, description: '' };

    public setToast = (description: string) => {
        this.toast = {
            show: !!description,
            description: description,
        };
    };

    public getToast = () => {
        return this.toast;
    };
}

export default function useToastService(): ToastService {
    return useState(new ToastService())[0];
}
