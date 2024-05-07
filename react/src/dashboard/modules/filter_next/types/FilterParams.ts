import { Dispatch, SetStateAction } from 'react';

export type FilterModel = {
    q?: string;
    per_page?: number;
    page?: number;
    order_by?: string;
    order_dir?: string;
    [key: string]: number | string | boolean | Array<number | string | boolean>;
};

export type FilterScope<T> = {
    show: boolean;
    setShow: Dispatch<SetStateAction<boolean>>;
    values: Partial<T>;
    activeValues: Partial<T>;
    update: FilterSetter<Partial<T>>;
    resetFilters: () => void;
    touch: () => void;
};

export type FilterState<T> = [
    Partial<T & FilterModel>,
    Partial<T & FilterModel>,
    FilterSetter<Partial<T>>,
    FilterScope<T & FilterModel>,
];

export type FilterSetter<T = FilterModel> = (values: T | ((values: T) => T), reset?: boolean) => void;
