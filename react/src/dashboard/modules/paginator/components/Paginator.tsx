import React, { useCallback, useEffect, useState } from 'react';
import FilterModel from '../../../types/FilterModel';
import FilterSetter from '../../../types/FilterSetter';
import { ApiPaginationMetaProp } from '../../../props/ApiResponses';
import { useTranslation } from 'react-i18next';
import usePaginatorService from '../services/usePaginatorService';
import SelectControl from '../../../components/elements/select-control/SelectControl';
import SelectControlOptions from '../../../components/elements/select-control/templates/SelectControlOptions';
import { clickOnKeyEnter } from '../../../helpers/wcag';

export default function Paginator({
    meta,
    filters,
    countButtons = 5,
    updateFilters,
    buttonClass = 'button-default',
    buttonClassActive = 'button-primary',
    perPageKey,
    className = '',
}: {
    meta: ApiPaginationMetaProp;
    filters: FilterModel;
    updateFilters: FilterSetter;
    countButtons?: number;
    buttonClass?: string;
    buttonClassActive?: string;
    perPageKey?: string;
    className?: string;
}) {
    const { t } = useTranslation();
    const [pages, setPages] = useState([]);
    const { perPageOptions, setPerPage } = usePaginatorService();

    const getPages = useCallback((meta, countButtons = 5) => {
        let fromPage = Math.max(1, meta.current_page - Math.round(countButtons / 2 - 1));
        const pages = [];

        if (countButtons > meta.last_page - fromPage) {
            fromPage = Math.max(1, meta.last_page - countButtons + 1);
        }

        while (pages.length < countButtons && fromPage <= meta.last_page) {
            pages.push(fromPage++);
        }

        return pages;
    }, []);

    const setPage = useCallback(
        (page) => {
            updateFilters({ ...filters, page });
        },
        [filters, updateFilters],
    );

    const onChangePerPage = useCallback(
        (per_page: number) => {
            setPerPage(perPageKey, per_page);
            updateFilters({ page: 1, per_page });
        },
        [perPageKey, setPerPage, updateFilters],
    );

    useEffect(() => {
        setPages(getPages(meta, countButtons));

        if (meta.last_page < meta.current_page) {
            updateFilters({ page: 1, per_page: meta.per_page });
        }
    }, [meta, countButtons, getPages, updateFilters]);

    useEffect(() => {
        if (perPageKey && !perPageOptions.map((option) => option.key).includes(filters.per_page)) {
            onChangePerPage(perPageOptions[0].key);
        }
    }, [filters.per_page, onChangePerPage, perPageKey, perPageOptions]);

    useEffect(() => {
        if (meta && meta.current_page > meta.last_page) {
            setPage(meta.last_page);
        }
    }, [meta, setPage]);

    return (
        <div className={`table-pagination form ${className}`}>
            {meta.from && meta.to && (
                <div className="form">
                    <div className="table-pagination-counter">
                        {perPageKey && (
                            <SelectControl
                                className={'form-control'}
                                options={perPageOptions}
                                optionsComponent={SelectControlOptions}
                                propKey={'key'}
                                allowSearch={false}
                                value={meta.per_page}
                                onChange={onChangePerPage}
                            />
                        )}

                        <div className="table-pagination-counter-info">
                            <span className="text-strong">{`${meta.from}-${meta.to} `}</span>
                            &nbsp;
                            {t('paginator.labels.from')}
                            &nbsp;
                            <span className="text-strong">{meta.total}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-pagination-navigation">
                <div
                    role={'button'}
                    onClick={() => setPage(1)}
                    onKeyDown={clickOnKeyEnter}
                    tabIndex={meta.current_page === 1 ? undefined : 0}
                    className={`button ${buttonClass} ${meta.current_page === 1 ? ' disabled' : ''}`}>
                    {t('paginator.buttons.first')}
                </div>
                {pages.map((page, key) => (
                    <div
                        key={key}
                        role={'button'}
                        tabIndex={0}
                        onClick={() => setPage(page)}
                        onKeyDown={clickOnKeyEnter}
                        className={`button ${page === meta.current_page ? buttonClassActive : buttonClass}`}>
                        {page}
                    </div>
                ))}
                <div
                    role={'button'}
                    onClick={() => setPage(meta.last_page)}
                    onKeyDown={clickOnKeyEnter}
                    tabIndex={meta.current_page === meta.last_page ? undefined : 0}
                    className={`button ${buttonClass} ${meta.current_page === meta.last_page ? ' disabled' : ''}`}>
                    {t('paginator.buttons.last')}
                </div>
            </div>
        </div>
    );
}
