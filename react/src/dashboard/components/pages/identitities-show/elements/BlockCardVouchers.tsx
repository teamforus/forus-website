import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import Voucher from '../../../../props/models/Voucher';
import { useTranslation } from 'react-i18next';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useFilter from '../../../../hooks/useFilter';
import useVoucherService from '../../../../services/VoucherService';
import usePushDanger from '../../../../hooks/usePushDanger';

export default function BlockCardVouchers({
    organization,
    fund,
    filterValues,
    blockTitle = '',
}: {
    organization: Organization;
    fund: Fund;
    filterValues: {
        order_by: string;
        order_dir: string;
        per_page: number;
        type: string;
        source: string;
        fund_id: number;
        identity_address: string;
    };
    blockTitle: string;
}) {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();

    const voucherService = useVoucherService();

    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);

    const filter = useFilter(filterValues);

    const fetchVouchers = useCallback(() => {
        voucherService
            .index(organization.id, filter?.activeValues)
            .then((res) => {
                setVouchers(res.data);
            })
            .catch((res: ResponseError) => pushDanger('Error!', res.data.message));
    }, [filter?.activeValues, organization.id, pushDanger, voucherService]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    return (
        <Fragment>
            <div className="card">
                <div className="card-header">
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                {(blockTitle || 'Vouchers') + ' (' + vouchers?.meta.total + ')'}
                            </div>
                        </div>
                    </div>
                </div>

                {vouchers?.data.length > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {fund.type == 'budget' && <th>{t('vouchers.labels.amount')}</th>}
                                            <th>{t('vouchers.labels.note')}</th>
                                            <th className="nowrap">{t('vouchers.labels.created_date')}</th>
                                            {fund.state !== 'closed' && (
                                                <Fragment>
                                                    <th className="nowrap">{t('vouchers.labels.expire_date')}</th>
                                                    <th className="nowrap">{t('vouchers.labels.used')}</th>
                                                </Fragment>
                                            )}
                                            <th>{t('vouchers.labels.assigned')}</th>
                                            <th className="nowrap text-right">{t('vouchers.labels.actions')}</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {vouchers.data.map((voucher) => (
                                            <tr key={voucher.id}>
                                                {fund.type == 'budget' && (
                                                    <td>{currencyFormat(parseFloat(voucher.amount))}</td>
                                                )}
                                                <td>
                                                    {voucher.note && (
                                                        <em
                                                            className={`td-icon mdi mdi-information block block-tooltip-details pull-left ${
                                                                voucher.showTooltip ? 'active' : ''
                                                            }`}>
                                                            {voucher.showTooltip && (
                                                                <div className="tooltip-content">
                                                                    <div className="tooltip-text" title={voucher.note}>
                                                                        {strLimit(voucher.note || '-', 128)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </em>
                                                    )}
                                                </td>

                                                <td>
                                                    <strong className="text-primary">
                                                        {voucher.created_at_locale.split(' - ')[0]}
                                                    </strong>
                                                    <br />
                                                    <strong className="text-strong text-md text-muted-dark">
                                                        {voucher.created_at_locale.split(' - ')[1]}
                                                    </strong>
                                                </td>

                                                {fund.state !== 'closed' && (
                                                    <td>
                                                        <strong className="text-strong text-md text-muted-dark">
                                                            {voucher.expire_at_locale}
                                                        </strong>
                                                    </td>
                                                )}

                                                {fund.state !== 'closed' && (
                                                    <td>
                                                        <div className="td-boolean flex-vertical">
                                                            <div className="flex text-primary">
                                                                {voucher.in_use ? (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-check-circle" />
                                                                        <strong>{voucher.first_use_date_locale}</strong>
                                                                    </Fragment>
                                                                ) : (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-close" />
                                                                        <strong>
                                                                            {t('product_vouchers.labels.no')}
                                                                        </strong>
                                                                    </Fragment>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}

                                                <td>
                                                    {voucher.expired ? (
                                                        <div className="td-boolean">
                                                            <em className="mdi mdi-close" />
                                                            <span className="text-md text-muted-dark">Verlopen</span>
                                                        </div>
                                                    ) : (
                                                        <div className="td-boolean">
                                                            {voucher.state === 'active' && (
                                                                <em className="mdi mdi-check-circle" />
                                                            )}

                                                            {(voucher.state === 'pending' ||
                                                                voucher.state === 'deactivated') && (
                                                                <em className="mdi mdi-close" />
                                                            )}

                                                            <span className="block text-md text-muted-dark">
                                                                {voucher.state_locale}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="button-group flex-end">
                                                        <StateNavLink
                                                            name="vouchers-show"
                                                            params={{
                                                                organizationId: organization.id,
                                                                fundId: fund?.id,
                                                                voucherId: voucher?.id,
                                                            }}
                                                            className="button button-primary button-icon pull-right">
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                        </StateNavLink>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {vouchers?.meta && (
                    <div className="card-section" hidden={vouchers?.meta?.last_page == 1}>
                        <Paginator
                            meta={vouchers?.meta}
                            filters={filter?.activeValues}
                            updateFilters={filter?.update}
                        />
                    </div>
                )}

                {vouchers?.meta?.total == 0 && (
                    <div className="block block-empty text-center">
                        <div className="empty-details">Geen vouchers gevonden</div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
