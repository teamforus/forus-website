import { useTranslation } from 'react-i18next';
import type { FlatNamespace } from 'i18next';
import type { $Tuple } from 'react-i18next/helpers';
import { useCallback } from 'react';

export default function useTranslate<Ns extends FlatNamespace | $Tuple<FlatNamespace>>() {
    const { t } = useTranslation();

    return useCallback(
        (ns: Ns, options?: object, fallback?: string) => {
            const value = t(ns as string, options);

            return !value || value === ns ? t(fallback || (ns as string), options) : value;
        },
        [t],
    );
}
