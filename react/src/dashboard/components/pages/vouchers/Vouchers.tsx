import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { PaginationData } from '../../../props/ApiResponses';
import Voucher from '../../../props/models/Voucher';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useVoucherService from '../../../services/VoucherService';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import VouchersTableNoFundsBlock from './elements/VouchersTableNoFundsBlock';
import useVoucherTableOptions from './hooks/useVoucherTableOptions';
import { VouchersTableFiltersProps } from './elements/VouchersTableFilters';
import VouchersTableHeader from './elements/VouchersTableHeader';
import VouchersTableRowActions from './elements/VouchersTableRowActions';
import VouchersTableRow from './elements/VouchersTableRow';
import { keyBy } from 'lodash';
import useConfigurableTable from './hooks/useConfigurableTable';

export default function Vouchers() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState<boolean>(true);
    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
    const [paginatorKey] = useState<string>('vouchers');
    const [shownVoucherMenuId, setShownVoucherMenuId] = useState<number>(null);

    const { funds } = useVoucherTableOptions(activeOrganization);

    const filter = useFilter<VouchersTableFiltersProps>(
        {
            q: '',
            granted: null,
            amount_min: null,
            amount_max: null,
            amount_available_min: null,
            amount_available_max: null,
            date_type: 'created_at',
            from: null,
            to: null,
            state: null,
            in_use: null,
            has_payouts: null,
            count_per_identity_min: null,
            count_per_identity_max: null,
            type: 'fund_voucher',
            source: 'all',
            fund_id: null,
            implementation_id: null,
            sort_by: 'created_at',
            sort_order: 'desc',
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        [
            'q',
            'amount_min',
            'amount_max',
            'amount_available_min',
            'amount_available_max',
            'count_per_identity_min',
            'count_per_identity_max',
        ],
    );

    const columns = useMemo(() => {
        return voucherService.getColumns().filter((column) => {
            return (
                !filter.activeValues.fund_id ||
                !column.resourceType ||
                keyBy(funds, 'id')?.[filter?.activeValues?.fund_id]?.type == column.resourceType
            );
        });
    }, [filter.activeValues.fund_id, funds, voucherService]);

    const {
        columnKeys,
        configsElement,
        showTableTooltip,
        hideTableTooltip,
        tableConfigCategory,
        showTableConfig,
        displayTableConfig,
    } = useConfigurableTable(columns);

    const fetchVouchers = useCallback(() => {
        setProgress(0);
        setLoading(true);

        const values = filter.activeValues;

        voucherService
            .index(activeOrganization.id, {
                ...values,
                date_type: null,
                from: values.date_type === 'created_at' ? values.from : null,
                to: values.date_type === 'created_at' ? values.to : null,
                in_use_from: values.date_type === 'used_at' ? values.from : null,
                in_use_to: values.date_type === 'used_at' ? values.to : null,
            })
            .then((res) => setVouchers(res.data))
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [activeOrganization.id, filter.activeValues, setProgress, voucherService]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers) {
        return <LoadingCard />;
    }

    if (funds?.length === 0) {
        return <VouchersTableNoFundsBlock organization={activeOrganization} />;
    }

    return (
        <div className="card" data-dusk={`vouchersCard${vouchers.data.length > 0 ? vouchers.data[0].fund_id : ''}`}>
            <VouchersTableHeader
                filter={filter}
                organization={activeOrganization}
                vouchers={vouchers}
                funds={funds}
                loading={loading}
                fetchVouchers={fetchVouchers}
                type={'vouchers'}
            />

            {!loading && vouchers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        {configsElement}

                        <div className="table-wrapper">
                            <div className="table-container table-container-2">
                                <div className="table-scroll">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                {columns.map((column, index: number) => (
                                                    <th
                                                        key={index}
                                                        onMouseOver={() => showTableTooltip(column.tooltip.key)}
                                                        onMouseLeave={() => hideTableTooltip()}>
                                                        {translate(column.label)}
                                                    </th>
                                                ))}

                                                <th>&nbsp;</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {vouchers.data.map((voucher) => (
                                                <VouchersTableRow
                                                    key={voucher.id}
                                                    voucher={voucher}
                                                    organization={activeOrganization}
                                                    columnKeys={columnKeys}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-scroll-actions">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>
                                                    <div className="table-th-actions">
                                                        <div
                                                            className={`table-th-action ${
                                                                showTableConfig && tableConfigCategory == 'tooltips'
                                                                    ? 'active'
                                                                    : ''
                                                            }`}
                                                            onClick={() => displayTableConfig('tooltips')}>
                                                            <em className="mdi mdi-information-variant-circle" />
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>

                                            {vouchers.data.map((voucher, index: number) => (
                                                <tr data-dusk={`voucherItem${voucher.id}`} key={index}>
                                                    <td>
                                                        <VouchersTableRowActions
                                                            fund={funds?.find((fund) => fund.id === voucher.fund_id)}
                                                            voucher={voucher}
                                                            organization={activeOrganization}
                                                            fetchVouchers={fetchVouchers}
                                                            shownVoucherMenuId={shownVoucherMenuId}
                                                            setShownVoucherMenuId={setShownVoucherMenuId}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <LoadingCard type={'section-card'} />}

            {!loading && vouchers.meta.total == 0 && (
                <EmptyCard title={'Geen vouchers gevonden'} type={'card-section'} />
            )}

            {vouchers.meta && (
                <div className="card-section">
                    <Paginator
                        meta={vouchers.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
        </div>
    );
}
