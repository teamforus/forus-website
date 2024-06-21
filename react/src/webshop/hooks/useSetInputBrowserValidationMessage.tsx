import React, { useCallback } from 'react';

export default function useSetInputBrowserValidationMessage() {
    return useCallback((e: React.ChangeEvent<HTMLInputElement>, err: string) => {
        e.target.setCustomValidity('');

        if (!e.target.validity.valid) {
            e.target.setCustomValidity(err);
        }

        e.target.reportValidity();
    }, []);
}
