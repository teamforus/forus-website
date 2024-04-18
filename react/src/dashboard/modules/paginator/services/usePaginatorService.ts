import { useCallback, useState } from 'react';
import useStorageService from '../../storage/useStrorrageService';

export default function usePaginatorService() {
    const collectionKey = 'pagination';
    const storage = useStorageService();

    const [perPageOptions] = useState([
        { key: 10, name: 10 },
        { key: 25, name: 25 },
        { key: 50, name: 50 },
    ]);

    const validPerPage = useCallback(
        (perPage: number) => {
            return perPage && perPageOptions.find((option) => option.key == perPage);
        },
        [perPageOptions],
    );

    const getPerPageValue = useCallback(
        (storageKey) => {
            return storage.getCollectionItem(collectionKey, `per_page_${storageKey}`);
        },
        [storage],
    );

    const setPerPageValue = useCallback(
        (storageKey: string, perPage: number) => {
            storage.setCollectionItem(collectionKey, `per_page_${storageKey}`, perPage);
        },
        [storage],
    );

    const getPerPage = useCallback(
        (storageKey: string, defaultPerPage = 10) => {
            return validPerPage(getPerPageValue(storageKey)) ? getPerPageValue(storageKey) : defaultPerPage;
        },
        [getPerPageValue, validPerPage],
    );

    const setPerPage = useCallback(
        (storageKey, perPage) => {
            if (validPerPage(perPage)) {
                setPerPageValue(storageKey, perPage);
            }
        },
        [setPerPageValue, validPerPage],
    );

    const syncPageFilters = useCallback(
        (filters, storageKey) => {
            const value = getPerPage(storageKey);

            return {
                ...filters,
                values: { ...filters.values, per_page: value },
                defaultValues: { ...filters.defaultValues, per_page: value },
            };
        },
        [getPerPage],
    );

    return {
        getPerPage,
        setPerPage,
        perPageOptions,
        syncPageFilters,
    };
}
