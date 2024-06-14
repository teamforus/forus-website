import React, { Fragment, useCallback, useEffect, useState } from 'react';
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
import { strLimit } from '../../../helpers/string';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../hooks/useTranslate';
import VouchersTableNoFundsBlock from './elements/VouchersTableNoFundsBlock';
import useVoucherTableOptions from './hooks/useVoucherTableOptions';
import { VouchersTableFiltersProps } from './elements/VouchersTableFilters';
import Tooltip from '../../elements/tooltip/Tooltip';
import VouchersTableHeader from './elements/VouchersTableHeader';
import VouchersTableRowStatus from './elements/VouchersTableRowStatus';
import VouchersTableRowActions from './elements/VouchersTableRowActions';

export default function ProductVouchers() {
    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState<boolean>(true);
    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
    const [paginatorKey] = useState<string>('product-vouchers');
    const [shownVoucherMenuId, setShownVoucherMenuId] = useState<number>(null);

    const { funds } = useVoucherTableOptions(activeOrganization);

    const filter = useFilter<VouchersTableFiltersProps>(
        {
            q: '',
            granted: null,
            amount_min: null,
            amount_max: null,
            date_type: 'created_at',
            from: null,
            to: null,
            state: null,
            in_use: null,
            has_payouts: null,
            count_per_identity_min: null,
            count_per_identity_max: null,
            type: 'product_voucher',
            source: 'all',
            fund_id: null,
            implementation_id: null,
            sort_by: 'created_at',
            sort_order: 'desc',
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        ['q', 'amount_min', 'amount_max', 'count_per_identity_min', 'count_per_identity_max'],
    );

    const fetchVouchers = useCallback(() => {
        setProgress(0);
        setLoading(true);

        voucherService
            .index(activeOrganization.id, filter.activeValues)
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
                type={'product_vouchers'}
            />

            {!loading && vouchers.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <div className="table-container table-container-2">
                                <div className="table-scroll">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>{translate('vouchers.labels.id')}</th>
                                                <th>{translate('vouchers.labels.assigned_to')}</th>
                                                <th>{translate('vouchers.labels.source')}</th>
                                                <th>{translate('product_vouchers.labels.product')}</th>
                                                <th>{translate('product_vouchers.labels.note')}</th>
                                                <th>{translate('product_vouchers.labels.fund')}</th>
                                                <th className="nowrap">
                                                    {translate('product_vouchers.labels.created_at')}
                                                </th>
                                                <th className="nowrap">
                                                    {translate('product_vouchers.labels.expire_at')}
                                                </th>
                                                <th className="nowrap">
                                                    {translate('product_vouchers.labels.in_use')}
                                                </th>
                                                <th className="nowrap">{translate('vouchers.labels.has_payouts')}</th>
                                                <th>{translate('vouchers.labels.assigned')}</th>
                                                <th>&nbsp;</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {vouchers.data.map((voucher) => (
                                                <StateNavLink
                                                    key={voucher.id}
                                                    customElement={'tr'}
                                                    className="clickable"
                                                    name={'vouchers-show'}
                                                    params={{ id: voucher.id, organizationId: activeOrganization.id }}
                                                    dataDusk={`voucherItem${voucher.id}`}>
                                                    <td>{voucher.id}</td>
                                                    <td>
                                                        <div>
                                                            <strong className="text-primary">
                                                                {strLimit(voucher.identity_email, 32) ||
                                                                    voucher.activation_code ||
                                                                    'Niet toegewezen'}
                                                            </strong>
                                                        </div>

                                                        <div className="text-strong text-md text-muted">
                                                            {(voucher.identity_bsn || voucher.relation_bsn) && (
                                                                <span>
                                                                    BSN:&nbsp;
                                                                    <span className="text-muted-dark">
                                                                        {voucher.identity_bsn || voucher.relation_bsn}
                                                                    </span>
                                                                    &nbsp;
                                                                </span>
                                                            )}

                                                            {(voucher.client_uid ||
                                                                (!voucher.identity_email && voucher.activation_code) ||
                                                                (!voucher.identity_bsn &&
                                                                    !voucher.relation_bsn &&
                                                                    voucher.physical_card.code)) && (
                                                                <span>
                                                                    NR:&nbsp;
                                                                    <span className="text-muted-dark">
                                                                        {voucher.client_uid ||
                                                                            voucher.physical_card.code ||
                                                                            'Nee'}
                                                                    </span>
                                                                    &nbsp;
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="text-md text-muted-dark text-medium">
                                                            {voucher.source_locale}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="text-primary text-medium">
                                                            {strLimit(voucher.product.organization.name, 32)}
                                                        </div>
                                                        <div className="text-strong text-md text-muted-dark">
                                                            {strLimit(voucher.product.name, 32)}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {voucher.note ? (
                                                            <Tooltip
                                                                type={'primary'}
                                                                text={strLimit(voucher.note || '-', 128)}
                                                            />
                                                        ) : (
                                                            <div className="text-muted">-</div>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="text-primary text-medium">
                                                            {strLimit(voucher.fund.name, 32)}
                                                        </div>

                                                        <div className="text-strong text-md text-muted-dark">
                                                            {strLimit(voucher.fund.implementation.name, 32)}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="text-medium text-primary">
                                                            {voucher.created_at_locale.split(' - ')[0]}
                                                        </div>

                                                        <div className="text-strong text-md text-muted-dark">
                                                            {voucher.created_at_locale.split(' - ')[1]}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="text-medium text-primary">
                                                            {voucher.expire_at_locale.split(',')[0]}
                                                        </div>

                                                        <div className="text-strong text-md text-muted-dark">
                                                            {voucher.expire_at_locale.split(',')[1]}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="td-boolean flex-vertical">
                                                            <div className="text-primary">
                                                                {voucher.in_use ? (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-check-circle" />
                                                                        <div className="text-primary">
                                                                            {
                                                                                voucher.first_use_date_locale.split(
                                                                                    ',',
                                                                                )[0]
                                                                            }
                                                                        </div>
                                                                        <div className="text-strong text-md text-muted-dark">
                                                                            {
                                                                                voucher.first_use_date_locale.split(
                                                                                    ',',
                                                                                )[1]
                                                                            }
                                                                        </div>
                                                                    </Fragment>
                                                                ) : (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-close" />
                                                                        {translate('product_vouchers.labels.no')}
                                                                    </Fragment>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="td-boolean flex-vertical">
                                                            <div className="text-primary">
                                                                {voucher.has_payouts ? (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-check-circle" />
                                                                        <div>{translate('vouchers.labels.yes')}</div>
                                                                    </Fragment>
                                                                ) : (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-close" />
                                                                        <div>{translate('vouchers.labels.no')}</div>
                                                                    </Fragment>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <VouchersTableRowStatus voucher={voucher} />
                                                    </td>

                                                    <td />
                                                </StateNavLink>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-scroll-actions">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>
                                                    <span>
                                                        {translate('vouchers.labels.actions')}
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    </span>
                                                </th>
                                            </tr>

                                            {vouchers.data.map((voucher, index: number) => (
                                                <tr data-dusk={`voucherItem${voucher.id}`} key={index}>
                                                    <td>
                                                        <VouchersTableRowActions
                                                            fund={funds.find((fund) => fund.id === voucher.fund_id)}
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
