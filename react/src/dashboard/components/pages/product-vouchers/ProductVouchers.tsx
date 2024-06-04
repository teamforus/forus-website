import React, { Fragment, useCallback, useEffect, useState } from 'react';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useTranslation } from 'react-i18next';
import { PaginationData } from '../../../props/ApiResponses';
import Voucher from '../../../props/models/Voucher';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { hasPermission } from '../../../helpers/utils';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalFundSelect from '../../modals/ModalFundSelect';
import Fund from '../../../props/models/Fund';
import ModalVoucherCreate from '../../modals/ModalVoucherCreate';
import ModalVouchersUpload from '../../modals/ModalVouchersUpload';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import { useFundService } from '../../../services/FundService';
import useVoucherService from '../../../services/VoucherService';
import Implementation from '../../../props/models/Implementation';
import { useImplementationService } from '../../../services/ImplementationService';
import useVoucherExportService from '../../../services/exports/useVoucherExportService';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import useSetProgress from '../../../hooks/useSetProgress';
import { useNavigate } from 'react-router-dom';
import { strLimit } from '../../../helpers/string';
import TableRowActions from '../../elements/tables/TableRowActions';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import ModalVoucherQRCode from '../../modals/ModalVoucherQRCode';

export default function ProductVouchers() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();
    const voucherExportService = useVoucherExportService();

    const [paginatorKey] = useState<string>('product-vouchers');
    const [loading, setLoading] = useState<boolean>(true);
    const [funds, setFunds] = useState<Array<Partial<Fund>>>([]);
    const [shownVoucherMenus, setShownVoucherMenus] = useState<Array<number>>([]);
    const [vouchers, setVouchers] = useState<PaginationData<Voucher>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);

    const [grantedOptions] = useState(voucherService.getGrantedOptions());
    const [inUseOptions] = useState(voucherService.getInUseOptions());
    const [voucherStateOptions] = useState(voucherService.getStates());
    const [sourcesOptions] = useState(voucherService.getSourcesOptions());
    const [hasPayoutsOptions] = useState(voucherService.getHasPayoutsOptions());

    const filter = useFilter({
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
        count_per_identity_min: 0,
        count_per_identity_max: null,
        type: 'product_voucher',
        source: 'all',
        fund_id: null,
        implementation_id: null,
        sort_by: 'created_at',
        sort_order: 'desc',
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const fetchFunds = useCallback(() => {
        fundService.list(activeOrganization.id, { per_page: 100, configured: 1 }).then((res) => {
            const data = res.data.data;

            data.unshift({
                id: null,
                name: 'Alle fondsen',
            });

            setFunds(data);
        });
    }, [activeOrganization.id, fundService]);

    const fetchVouchers = useCallback(() => {
        setProgress(0);
        setLoading(true);
        voucherService
            .index(activeOrganization.id, filter.activeValues)
            .then((res) => {
                setVouchers(res.data);
            })
            .finally(() => {
                setProgress(100);
                setLoading(false);
            });
    }, [activeOrganization.id, filter.activeValues, setProgress, voucherService]);

    const createVoucher = useCallback(() => {
        openModal((modal) => (
            <ModalFundSelect
                modal={modal}
                fund_id={filter.activeValues.fund_id}
                funds={funds}
                onSelect={(fund) => {
                    openModal((modal) => (
                        <ModalVoucherCreate modal={modal} fund={fund} onCreated={() => fetchVouchers()} />
                    ));
                }}
            />
        ));
    }, [fetchVouchers, filter.activeValues.fund_id, funds, openModal]);

    const uploadVouchersCsv = useCallback(() => {
        openModal((modal) => (
            <ModalFundSelect
                modal={modal}
                fund_id={filter.activeValues.fund_id}
                funds={funds}
                onSelect={(fund) => {
                    openModal((modal) => (
                        <ModalVouchersUpload
                            modal={modal}
                            fund={fund}
                            funds={!fund.id ? funds : funds.filter((fund) => fund.id)}
                            organization={activeOrganization}
                            onCompleted={() => fetchVouchers()}
                        />
                    ));
                }}
            />
        ));
    }, [activeOrganization, fetchVouchers, filter.activeValues.fund_id, funds, openModal]);

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]));
    }, [activeOrganization.id, implementationService]);

    const exportVouchers = useCallback(() => {
        voucherExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, voucherExportService]);

    const showTooltip = useCallback(
        (target) => {
            vouchers.data.forEach((voucher) => (voucher.showTooltip = voucher == target));
            setVouchers({ data: vouchers.data, meta: vouchers.meta });
        },
        [vouchers?.data, vouchers?.meta],
    );

    const hideTooltip = useCallback((target) => {
        window.setTimeout(() => (target.showTooltip = false), 0);
    }, []);

    const showQrCode = useCallback(
        (e, voucher: Voucher) => {
            e.stopPropagation();
            e.preventDefault();

            setShownVoucherMenus([]);

            openModal((modal) => (
                <ModalVoucherQRCode
                    modal={modal}
                    voucher={voucher}
                    organization={activeOrganization}
                    onSent={() => fetchVouchers()}
                    onAssigned={() => fetchVouchers()}
                />
            ));
        },
        [activeOrganization, fetchVouchers, openModal],
    );

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    if (!vouchers) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card" data-dusk={`vouchersCard${vouchers.data.length > 0 ? vouchers.data[0].fund_id : ''}`}>
                <div className={`card-header ${loading ? 'card-header-inactive' : ''}`}>
                    <div className="flex">
                        <div className="flex flex-grow">
                            <div className="card-title">
                                {t('vouchers.header.title')}&nbsp;
                                <span className="span-count">{vouchers?.meta?.total}</span>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="block block-inline-filters">
                                {hasPermission(activeOrganization, 'manage_vouchers') && (
                                    <Fragment>
                                        <button
                                            id="create_voucher"
                                            className="button button-primary"
                                            onClick={() => createVoucher()}>
                                            <em className="mdi mdi-plus-circle icon-start" />
                                            {t('vouchers.buttons.add_new')}
                                        </button>

                                        <button
                                            id="voucher_upload_csv"
                                            className="button button-primary"
                                            onClick={() => uploadVouchersCsv()}
                                            data-dusk="uploadVouchersBatchButton">
                                            <em className="mdi mdi-upload icon-start" />
                                            {t('vouchers.buttons.upload_csv')}
                                        </button>
                                    </Fragment>
                                )}

                                <div className="form">
                                    <div className="form-group">
                                        <SelectControl
                                            className="form-control inline-filter-control"
                                            propKey={'id'}
                                            optionsComponent={SelectControlOptions}
                                            options={funds}
                                            value={filter.activeValues.fund_id}
                                            placeholder={t('vouchers.labels.fund')}
                                            allowSearch={false}
                                            onChange={(fund_id: number) => filter.update({ fund_id })}
                                        />
                                    </div>
                                </div>

                                {filter.show && (
                                    <div className="button button-text" onClick={filter.resetFilters}>
                                        <em className="mdi mdi-close icon-start" />
                                        <span>{t('vouchers.buttons.clear_filter')}</span>
                                    </div>
                                )}

                                {!filter.show && (
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={filter.values.q || ''}
                                                data-dusk="searchVoucher"
                                                placeholder={t('vouchers.labels.search')}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <ClickOutside className="form" onClickOutside={() => filter.setShow(false)}>
                                    <div className="inline-filters-dropdown pull-right">
                                        {filter.show && (
                                            <div className="inline-filters-dropdown-content">
                                                <div className="arrow-box bg-dim">
                                                    <div className="arrow" />
                                                </div>

                                                <div className="form">
                                                    <FilterItemToggle show={true} label={t('vouchers.labels.search')}>
                                                        <input
                                                            className="form-control"
                                                            data-dusk="searchReimbursement"
                                                            value={filter.values.q || ''}
                                                            onChange={(e) => filter.update({ q: e.target.value })}
                                                            placeholder={t('vouchers.labels.search')}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.source')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'value'}
                                                            allowSearch={false}
                                                            value={filter.values.source}
                                                            options={sourcesOptions}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(source: string) => filter.update({ source })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.state')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'value'}
                                                            allowSearch={false}
                                                            value={filter.values.state}
                                                            options={voucherStateOptions}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(state: string) => filter.update({ state })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle
                                                        label={t('vouchers.labels.voucher_count_per_identity')}>
                                                        <div className="row">
                                                            <div className="col col-sm-6">
                                                                <input
                                                                    className="form-control"
                                                                    min={0}
                                                                    type="number"
                                                                    value={filter.values.count_per_identity_min || ''}
                                                                    onChange={(e) =>
                                                                        filter.update({
                                                                            count_per_identity_min: parseInt(
                                                                                e.target.value,
                                                                            ),
                                                                        })
                                                                    }
                                                                    placeholder={t('transactions.labels.amount_min')}
                                                                />
                                                            </div>

                                                            <div className="col col-sm-6">
                                                                <input
                                                                    className="form-control"
                                                                    min={0}
                                                                    type="number"
                                                                    value={filter.values.count_per_identity_max || ''}
                                                                    onChange={(e) =>
                                                                        filter.update({
                                                                            count_per_identity_max: parseInt(
                                                                                e.target.value,
                                                                            ),
                                                                        })
                                                                    }
                                                                    placeholder={t('transactions.labels.amount_max')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.in_use')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'value'}
                                                            allowSearch={false}
                                                            value={filter.values.in_use}
                                                            options={inUseOptions}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(in_use: number) => filter.update({ in_use })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.granted')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'value'}
                                                            allowSearch={false}
                                                            value={filter.values.granted}
                                                            options={grantedOptions}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(granted: number) => filter.update({ granted })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('transactions.labels.amount')}>
                                                        <div className="row">
                                                            <div className="col col-lg-6">
                                                                <input
                                                                    className="form-control"
                                                                    min={0}
                                                                    type="number"
                                                                    value={filter.values.amount_min || ''}
                                                                    onChange={(e) =>
                                                                        filter.update({
                                                                            amount_min: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder={t('transactions.labels.amount_min')}
                                                                />
                                                            </div>

                                                            <div className="col col-lg-6">
                                                                <input
                                                                    className="form-control"
                                                                    min={0}
                                                                    type="number"
                                                                    value={filter.values.amount_max || ''}
                                                                    onChange={(e) =>
                                                                        filter.update({
                                                                            amount_max: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder={t('transactions.labels.amount_max')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.from')}>
                                                        <DatePickerControl
                                                            value={dateParse(filter.values.from)}
                                                            placeholder={t('dd-MM-yyyy')}
                                                            onChange={(from: Date) => {
                                                                filter.update({ from: dateFormat(from) });
                                                            }}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.to')}>
                                                        <DatePickerControl
                                                            value={dateParse(filter.values.to)}
                                                            placeholder={t('dd-MM-yyyy')}
                                                            onChange={(to: Date) => {
                                                                filter.update({ to: dateFormat(to) });
                                                            }}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('reimbursements.labels.fund')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'id'}
                                                            allowSearch={false}
                                                            value={filter.values.fund_id}
                                                            options={funds}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(fund_id: number) => filter.update({ fund_id })}
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('reimbursements.labels.implementation')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'id'}
                                                            allowSearch={false}
                                                            value={filter.values.implementation_id}
                                                            options={implementations}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(implementation_id: string) =>
                                                                filter.update({ implementation_id })
                                                            }
                                                        />
                                                    </FilterItemToggle>

                                                    <FilterItemToggle label={t('vouchers.labels.has_payouts')}>
                                                        <SelectControl
                                                            className="form-control"
                                                            propKey={'value'}
                                                            allowSearch={false}
                                                            value={filter.values.has_payouts || ''}
                                                            options={hasPayoutsOptions}
                                                            optionsComponent={SelectControlOptions}
                                                            onChange={(has_payouts: string) =>
                                                                filter.update({ has_payouts })
                                                            }
                                                        />
                                                    </FilterItemToggle>

                                                    {hasPermission(activeOrganization, 'manage_vouchers') && (
                                                        <div className="form-actions">
                                                            <button
                                                                className="button button-primary button-wide"
                                                                onClick={() => exportVouchers()}
                                                                disabled={vouchers.meta.total == 0}>
                                                                <em className="mdi mdi-download icon-start"> </em>
                                                                {t('components.dropdown.export', {
                                                                    total: vouchers.meta.total,
                                                                })}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            onClick={() => filter.setShow(!filter.show)}
                                            className="button button-default button-icon">
                                            <em className="mdi mdi-filter-outline" />
                                        </div>
                                    </div>
                                </ClickOutside>
                            </div>
                        </div>
                    </div>
                </div>

                {!loading && vouchers.data.length > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <div className="table-container table-container-2">
                                    <div className="table-scroll">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>{t('vouchers.labels.id')}</th>
                                                    <th>{t('vouchers.labels.assigned_to')}</th>
                                                    <th>{t('vouchers.labels.source')}</th>
                                                    <th>{t('product_vouchers.labels.product')}</th>
                                                    <th>{t('product_vouchers.labels.note')}</th>
                                                    <th>{t('product_vouchers.labels.fund')}</th>
                                                    <th className="nowrap">
                                                        {t('product_vouchers.labels.created_at')}
                                                    </th>
                                                    <th className="nowrap">{t('product_vouchers.labels.expire_at')}</th>
                                                    <th className="nowrap">{t('product_vouchers.labels.in_use')}</th>
                                                    <th className="nowrap">{t('vouchers.labels.has_payouts')}</th>
                                                    <th>{t('vouchers.labels.assigned')}</th>
                                                    <th>&nbsp;</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {vouchers.data.map((voucher) => (
                                                    <tr
                                                        key={voucher.id}
                                                        data-dusk={'voucherItem' + voucher.id}
                                                        onClick={() =>
                                                            navigate(
                                                                getStateRouteUrl('vouchers-show', {
                                                                    organizationId: activeOrganization.id,
                                                                    id: voucher.id,
                                                                }),
                                                            )
                                                        }>
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
                                                                            {voucher.identity_bsn ||
                                                                                voucher.relation_bsn}
                                                                        </span>
                                                                        &nbsp;
                                                                    </span>
                                                                )}

                                                                {(voucher.client_uid ||
                                                                    (!voucher.identity_email &&
                                                                        voucher.activation_code) ||
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
                                                            {voucher.note && (
                                                                <em
                                                                    className={`td-icon mdi mdi-information block block-tooltip-details pull-left ${
                                                                        voucher.showTooltip ? 'active' : ''
                                                                    }`}
                                                                    onClick={() => showTooltip(voucher)}>
                                                                    {voucher.showTooltip && (
                                                                        <ClickOutside
                                                                            className="tooltip-content"
                                                                            onClickOutside={() => hideTooltip(voucher)}>
                                                                            <div className="tooltip-content">
                                                                                <div
                                                                                    className="tooltip-text"
                                                                                    title={voucher.note}>
                                                                                    {strLimit(voucher.note || '-', 128)}
                                                                                </div>
                                                                            </div>
                                                                        </ClickOutside>
                                                                    )}
                                                                </em>
                                                            )}

                                                            {!voucher.note && <div className="text-muted">-</div>}
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
                                                                            {t('product_vouchers.labels.no')}
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
                                                                            <div>{t('vouchers.labels.yes')}</div>
                                                                        </Fragment>
                                                                    ) : (
                                                                        <Fragment>
                                                                            <em className="mdi mdi-close" />
                                                                            <div>{t('vouchers.labels.no')}</div>
                                                                        </Fragment>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="td-boolean">
                                                                {voucher.expired ? (
                                                                    <Fragment>
                                                                        <em className="mdi mdi-close" />
                                                                        <span className="text-md text-muted-dark">
                                                                            Verlopen
                                                                        </span>
                                                                    </Fragment>
                                                                ) : (
                                                                    <Fragment>
                                                                        {voucher.state === 'active' && (
                                                                            <em className="mdi mdi-check-circle" />
                                                                        )}

                                                                        {(voucher.state === 'pending' ||
                                                                            voucher.state === 'deactivated') && (
                                                                            <em className="mdi mdi-close" />
                                                                        )}

                                                                        <span className="block block-tooltip-details block-tooltip-hover text-md text-muted-dark">
                                                                            {voucher.state_locale}
                                                                            <div className="tooltip-content tooltip-content-left tooltip-content-fit">
                                                                                <div className="tooltip-text">
                                                                                    <span>
                                                                                        <span className="text-primary text-sm text-strong">
                                                                                            E-MAIL:
                                                                                        </span>
                                                                                        <br />
                                                                                        <span className="text-strong">
                                                                                            {strLimit(
                                                                                                voucher.identity_email,
                                                                                                32,
                                                                                            ) || 'Niet toegewezen'}
                                                                                        </span>
                                                                                    </span>

                                                                                    {(voucher.identity_bsn ||
                                                                                        voucher.relation_bsn) && (
                                                                                        <span>
                                                                                            <br />
                                                                                            <span className="text-primary text-sm text-strong">
                                                                                                BSN:
                                                                                            </span>
                                                                                            <br />
                                                                                            <span className="text-strong">
                                                                                                {voucher.identity_bsn ||
                                                                                                    voucher.relation_bsn}
                                                                                            </span>
                                                                                        </span>
                                                                                    )}

                                                                                    {voucher.activation_code && (
                                                                                        <span>
                                                                                            <br />
                                                                                            <span className="text-primary text-sm text-strong">
                                                                                                CODE:
                                                                                            </span>
                                                                                            <br />
                                                                                            <span className="text-strong">
                                                                                                {
                                                                                                    voucher.activation_code
                                                                                                }
                                                                                            </span>
                                                                                        </span>
                                                                                    )}

                                                                                    {(voucher.client_uid ||
                                                                                        voucher.activation_code) && (
                                                                                        <span>
                                                                                            <br />
                                                                                            <span className="text-primary text-sm text-strong">
                                                                                                UNIEK NUMMER:
                                                                                            </span>
                                                                                            <br />
                                                                                            <span className="text-strong">
                                                                                                {voucher.client_uid ||
                                                                                                    'Nee'}
                                                                                            </span>
                                                                                        </span>
                                                                                    )}

                                                                                    {(voucher.client_uid ||
                                                                                        voucher.activation_code) && (
                                                                                        <span>
                                                                                            <br />
                                                                                            <span className="text-primary text-sm text-strong">
                                                                                                PASNUMMER:
                                                                                            </span>
                                                                                            <br />
                                                                                            <span className="text-strong">
                                                                                                {voucher.client_uid ||
                                                                                                    'Nee'}
                                                                                            </span>
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </span>
                                                                    </Fragment>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td />
                                                    </tr>
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
                                                            {t('vouchers.labels.actions')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    </th>
                                                </tr>

                                                {vouchers.data.map((voucher, index: number) => (
                                                    <tr data-dusk={`voucherItem${voucher.id}`} key={index}>
                                                        <td>
                                                            <div
                                                                className={`actions ${
                                                                    shownVoucherMenus.indexOf(voucher.id) != -1
                                                                        ? 'active'
                                                                        : ''
                                                                }`}>
                                                                <TableRowActions
                                                                    actions={shownVoucherMenus}
                                                                    setActions={(actions: Array<number>) =>
                                                                        setShownVoucherMenus(actions)
                                                                    }
                                                                    modelItem={voucher}>
                                                                    <div className="dropdown dropdown-actions">
                                                                        <StateNavLink
                                                                            className="dropdown-item"
                                                                            name={'vouchers-show'}
                                                                            params={{
                                                                                organizationId: activeOrganization.id,
                                                                                id: voucher.id,
                                                                            }}>
                                                                            <em className={'mdi mdi-eye icon-start'} />
                                                                            Bekijken
                                                                        </StateNavLink>

                                                                        {hasPermission(
                                                                            activeOrganization,
                                                                            'manage_vouchers',
                                                                        ) &&
                                                                            !voucher.is_granted &&
                                                                            !voucher.expired &&
                                                                            voucher.state != 'deactivated' && (
                                                                                <Fragment>
                                                                                    <a
                                                                                        className={`dropdown-item ${
                                                                                            voucher.state === 'active'
                                                                                                ? 'disabled'
                                                                                                : ''
                                                                                        }`}
                                                                                        onClick={(e) =>
                                                                                            showQrCode(e, voucher)
                                                                                        }>
                                                                                        <em className="mdi mdi-bookmark icon-start" />
                                                                                        Activeren
                                                                                    </a>

                                                                                    <a
                                                                                        className={`dropdown-item ${
                                                                                            voucher.state === 'pending'
                                                                                                ? 'disabled'
                                                                                                : ''
                                                                                        }`}
                                                                                        onClick={(e) =>
                                                                                            showQrCode(e, voucher)
                                                                                        }>
                                                                                        <em className="mdi mdi-qrcode icon-start" />
                                                                                        QR-code
                                                                                    </a>
                                                                                </Fragment>
                                                                            )}
                                                                    </div>
                                                                </TableRowActions>
                                                            </div>
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

                {!loading && vouchers.meta.total == 0 && (
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-title">Geen vouchers gevonden</div>
                        </div>
                    </div>
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

            {funds?.length == 0 && (
                <Fragment>
                    {hasPermission(activeOrganization, 'manage_funds') ? (
                        <EmptyCard
                            description={'Je hebt momenteel geen fondsen.'}
                            button={{
                                text: 'Fonds toevoegen',
                                to: getStateRouteUrl('organization-funds', {
                                    organizationId: activeOrganization.id,
                                }),
                            }}
                        />
                    ) : (
                        <EmptyCard description={'Je hebt momenteel geen fondsen.'} />
                    )}
                </Fragment>
            )}
        </Fragment>
    );
}
