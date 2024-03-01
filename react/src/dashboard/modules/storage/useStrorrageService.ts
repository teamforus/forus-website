import { useCallback } from 'react';

export default function useStorageService() {
    const isPlainObject = useCallback((obj) => {
        return typeof obj == 'object' && !Array.isArray(obj) && !!obj;
    }, []);

    const getCollectionAll = useCallback(
        (collection_name: string) => {
            try {
                const collection = JSON.parse(localStorage.getItem(collection_name));

                return isPlainObject(collection) ? collection : {};
            } catch (e) {
                return {};
            }
        },
        [isPlainObject],
    );

    const setCollectionItem = useCallback(
        (collection_name, key, value) => {
            const collection = {
                ...getCollectionAll(collection_name),
                [key]: value,
            };

            localStorage.setItem(collection_name, JSON.stringify(collection));
        },
        [getCollectionAll],
    );

    const getCollectionItem = useCallback(
        (collection_name: string, key, _default = null) => {
            try {
                const collection = JSON.parse(localStorage.getItem(collection_name));

                return isPlainObject(collection) ? collection[key] || _default : _default;
            } catch (e) {
                return _default;
            }
        },
        [isPlainObject],
    );

    const setCollectionAll = useCallback(
        (collection_name: string, values: object) => {
            if (!isPlainObject(values)) {
                values = {};
            }

            localStorage.setItem(collection_name, JSON.stringify(values));
        },
        [isPlainObject],
    );

    const resetCollection = useCallback((collection_name: string) => {
        localStorage.setItem(collection_name, JSON.stringify({}));
    }, []);

    return {
        getCollectionAll,
        setCollectionItem,
        getCollectionItem,
        setCollectionAll,
        resetCollection,
    };
}
