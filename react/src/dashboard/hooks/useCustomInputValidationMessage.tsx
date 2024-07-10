import React, { useCallback } from 'react';

export type InputValidationTexts = {
    patternMismatch?: string;
    rangeOverflow?: string;
    typeMismatch?: string;
    tooLong?: string;
    tooShort?: string;
    valueMissing?: string;
};

export default function useCustomInputValidationMessage() {
    return useCallback((element: HTMLInputElement, messages: InputValidationTexts = null) => {
        element.setCustomValidity('');

        if (messages?.valueMissing && element.validity.valueMissing) {
            element.setCustomValidity(messages.valueMissing);
        }

        if (messages?.typeMismatch && element.validity.typeMismatch) {
            element.setCustomValidity(messages.typeMismatch);
        }

        if (messages?.tooLong && element.validity.tooLong) {
            element.setCustomValidity(messages.tooLong);
        }

        if (messages?.tooShort && element.validity.tooShort) {
            element.setCustomValidity(messages.tooShort);
        }

        if (messages?.patternMismatch && element.validity.patternMismatch) {
            element.setCustomValidity(messages.patternMismatch);
        }
    }, []);
}
