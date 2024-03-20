import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { PaginationData } from '../../../props/ApiResponses';
import FundSelector from '../../elements/fund-selector/FundSelector';
import Fund from '../../../props/models/Fund';
import Reimbursement from '../../../props/models/Reimbursement';
import { useTranslation } from 'react-i18next';
import { useReimbursementsService } from '../../../services/ReimbursementService';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { useFundService } from '../../../services/FundService';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import { strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import { hasPermission } from '../../../helpers/utils';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import useReimbursementExportService from '../../../services/exports/useReimbursementExportService';
import { useImplementationService } from '../../../services/ImplementationService';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import Implementation from '../../../props/models/Implementation';

export default function Reimbursements() {
    const { t } = useTranslation();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const reimbursementService = useReimbursementsService();
    const paginatorService = usePaginatorService();
    const reimbursementExportService = useReimbursementExportService();
    const implementationService = useImplementationService();

    const [fund, setFund] = useState<Fund>(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);
    const [reimbursements, setReimbursements] = useState<PaginationData<Reimbursement>>(null);
    const [paginatorKey] = useState('reimbursements');
    const [stateLabels] = useState({
        pending: 'label-default',
        approved: 'label-success',
        declined: 'label-danger',
    });

    const archivedOptions = useMemo(() => {
        return reimbursementService.getArchivedOptions();
    }, [reimbursementService]);

    const statesOptions = useMemo(() => {
        return reimbursementService.getStateOptions();
    }, [reimbursementService]);

    const expiredOptions = useMemo(() => {
        return reimbursementService.getExpiredOptions();
    }, [reimbursementService]);

    const deactivatedOptions = useMemo(() => {
        return reimbursementService.getDeactivatedOptions();
    }, [reimbursementService]);

    const filter = useFilter({
        q: '',
        implementation_id: null,
        state: null,
        amount_min: null,
        amount_max: null,
        expired: null,
        archived: 0,
        deactivated: null,
        from: null,
        to: null,
        fund_id: null,
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const setArchivedOption = useCallback(
        (archived: number) => {
            filter.update({
                expired: null,
                archived: archived,
                deactivated: null,
            });
        },
        [filter],
    );

    const fetchFunds = useCallback(async () => {
        const res = await fundService.list(activeOrganization.id, { per_page: 100, configured: 1 });
        return res.data;
    }, [activeOrganization.id, fundService]);

    const fetchReimbursements = useCallback(() => {
        reimbursementService
            .list(activeOrganization.id, {
                ...filter.values,
                fund_id: fund?.id,
            })
            .then((res) => {
                setReimbursements(res.data);
            });
    }, [activeOrganization.id, filter.values, fund?.id, reimbursementService]);

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, {
                per_page: 100,
            })
            .then((res) => {
                setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]);
            });
    }, [activeOrganization.id, implementationService]);

    const exportReimbursements = useCallback(() => {
        reimbursementExportService.exportData(activeOrganization.id, {
            ...filter.activeValues,
            per_page: null,
        });
    }, [activeOrganization.id, filter.activeValues, reimbursementExportService]);

    const onFundSelect = useCallback((fund: Fund) => {
        setFund(fund);
    }, []);

    useEffect(() => {
        fetchFunds().then((funds) => {
            const activeFund = fundService.getLastSelectedFund(funds.data) || funds.data[0];

            setFunds(funds);
            setFund(activeFund);
        });
    }, [fetchFunds, fundService]);

    useEffect(() => {
        fetchReimbursements();
    }, [fetchReimbursements]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    return (
        <Fragment>
            <FundSelector fund={fund} funds={funds?.data} onFundSelect={onFundSelect}></FundSelector>

            {reimbursements && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex-row">
                            <div className="flex flex-grow">
                                <div className="card-title">
                                    <span className="card-title">{t('reimbursements.header.title')}</span>
                                    <span className="span-count">{reimbursements?.meta?.total}</span>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <StateNavLink
                                        name="reimbursement-categories-edit"
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-default button-sm">
                                        <em className="mdi mdi-cog icon-start" />
                                        Categorieën
                                    </StateNavLink>

                                    <div className="flex form">
                                        <div>
                                            <div className="block block-label-tabs">
                                                <div className="label-tab-set">
                                                    {archivedOptions.map((viewType) => (
                                                        <div
                                                            key={viewType.value}
                                                            onClick={() => setArchivedOption(viewType.value)}
                                                            className={
                                                                'label-tab label-tab-sm ' +
                                                                (filter.values.archived == viewType.value
                                                                    ? 'active'
                                                                    : '')
                                                            }
                                                            data-dusk={
                                                                'reimbursementsFilter' +
                                                                (viewType.value ? 'Archived' : 'Active')
                                                            }>
                                                            {viewType.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {filter.show && (
                                        <div className="button button-text" onClick={filter.resetFilters}>
                                            <em className="mdi mdi-close icon-start" />
                                            <span>{t('reimbursements.buttons.clear_filter')}</span>
                                        </div>
                                    )}

                                    {!filter.show && (
                                        <div className="form">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={filter.values.q}
                                                    data-dusk="searchReimbursement"
                                                    placeholder={t('reimbursements.labels.search')}
                                                    onChange={(e) => filter.update({ q: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="form">
                                        <ClickOutside onClickOutside={() => filter.setShow(false)}>
                                            <div className="inline-filters-dropdown pull-right">
                                                {filter.show && (
                                                    <div className="inline-filters-dropdown-content">
                                                        <div className="arrow-box bg-dim">
                                                            <div className="arrow" />
                                                        </div>

                                                        <div className="form">
                                                            <FilterItemToggle label={t('reimbursements.labels.search')}>
                                                                <input
                                                                    className="form-control"
                                                                    data-dusk="searchReimbursement"
                                                                    value={filter.values.q}
                                                                    onChange={(e) =>
                                                                        filter.update({ q: e.target.value })
                                                                    }
                                                                    placeholder={t('reimbursements.labels.search')}
                                                                />
                                                            </FilterItemToggle>

                                                            <FilterItemToggle label={t('reimbursements.labels.state')}>
                                                                <SelectControl
                                                                    className="form-control"
                                                                    propKey={'value'}
                                                                    allowSearch={false}
                                                                    value={filter.values.state}
                                                                    options={statesOptions}
                                                                    optionsComponent={SelectControlOptions}
                                                                    onChange={(state: string) =>
                                                                        filter.update({ state })
                                                                    }
                                                                />
                                                            </FilterItemToggle>

                                                            {filter.values.archived == 1 && (
                                                                <Fragment>
                                                                    <FilterItemToggle
                                                                        label={t('reimbursements.labels.expired')}>
                                                                        <SelectControl
                                                                            className="form-control"
                                                                            propKey={'value'}
                                                                            allowSearch={false}
                                                                            value={filter.values.expired}
                                                                            options={expiredOptions}
                                                                            optionsComponent={SelectControlOptions}
                                                                            onChange={(expired: string) =>
                                                                                filter.update({ expired })
                                                                            }
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={t('reimbursements.labels.deactivated')}>
                                                                        <SelectControl
                                                                            className="form-control"
                                                                            propKey={'value'}
                                                                            allowSearch={false}
                                                                            value={filter.values.deactivated}
                                                                            options={deactivatedOptions}
                                                                            optionsComponent={SelectControlOptions}
                                                                            onChange={(deactivated: string) =>
                                                                                filter.update({ deactivated })
                                                                            }
                                                                        />
                                                                    </FilterItemToggle>
                                                                </Fragment>
                                                            )}

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
                                                                            placeholder={t(
                                                                                'transactions.labels.amount_min',
                                                                            )}
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
                                                                            placeholder={t(
                                                                                'transactions.labels.amount_max',
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </FilterItemToggle>

                                                            <FilterItemToggle label={t('reimbursements.labels.from')}>
                                                                <DatePickerControl
                                                                    value={dateParse(filter.values.from)}
                                                                    placeholder={t('dd-MM-yyyy')}
                                                                    onChange={(from: Date) => {
                                                                        filter.update({ from: dateFormat(from) });
                                                                    }}
                                                                />
                                                            </FilterItemToggle>

                                                            <FilterItemToggle label={t('reimbursements.labels.to')}>
                                                                <DatePickerControl
                                                                    value={dateParse(filter.values.to)}
                                                                    placeholder={t('dd-MM-yyyy')}
                                                                    onChange={(to: Date) => {
                                                                        filter.update({ to: dateFormat(to) });
                                                                    }}
                                                                />
                                                            </FilterItemToggle>

                                                            <FilterItemToggle
                                                                label={t('reimbursements.labels.implementation')}>
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

                                                            <div className="form-actions">
                                                                <button
                                                                    className="button button-primary button-wide"
                                                                    onClick={() => exportReimbursements()}
                                                                    disabled={reimbursements.meta.total == 0}>
                                                                    <em className="mdi mdi-download icon-start"> </em>
                                                                    {t('components.dropdown.export', {
                                                                        total: reimbursements.meta.total,
                                                                    })}
                                                                </button>
                                                            </div>
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
                    </div>

                    {reimbursements.data.length > 0 && (
                        <div className="card-section" data-dusk="reimbursementsList">
                            <div className="card-block card-block-table">
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>{t('reimbursements.labels.identity')}</th>
                                                <th>{t('reimbursements.labels.fund')}</th>
                                                <th>{t('reimbursements.labels.amount')}</th>
                                                <th>{t('reimbursements.labels.created_at')}</th>
                                                <th>{t('reimbursements.labels.lead_time')}</th>
                                                <th>{t('reimbursements.labels.employee')}</th>
                                                <th>{t('reimbursements.labels.expired')}</th>
                                                <th>{t('reimbursements.labels.state')}</th>
                                                <th>{t('reimbursements.labels.transaction')}</th>
                                                <th className="nowrap text-right">
                                                    {t('reimbursements.labels.actions')}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reimbursements.data.map((reimbursement) => (
                                                <tr
                                                    key={reimbursement.id}
                                                    data-dusk={'reimbursement' + reimbursement.id}
                                                    className={"reimbursement.expired ? 'tr-warning' : ''"}>
                                                    <td>
                                                        {/* Email */}
                                                        <strong
                                                            className="text-primary"
                                                            data-dusk="{{ 'reimbursementIdentityEmail' + reimbursement.id }}">
                                                            {strLimit(reimbursement.identity_email, 25) ||
                                                                'Geen E-mail'}
                                                        </strong>

                                                        {/* BSN */}
                                                        {activeOrganization.bsn_enabled && (
                                                            <span className="text-strong text-md text-muted-dark">
                                                                <br />
                                                                {reimbursement.identity_bsn
                                                                    ? 'BSN: ' + reimbursement.identity_bsn
                                                                    : 'Geen BSN'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong className="text-primary">
                                                            {strLimit(reimbursement.fund.name, 25)}
                                                        </strong>
                                                        <br />
                                                        <span className="text-strong text-md text-muted-dark">
                                                            {strLimit(reimbursement.implementation_name, 25)}
                                                        </span>
                                                    </td>

                                                    {/* Amount */}
                                                    <td
                                                        className="nowrap"
                                                        data-dusk={'reimbursementAmount' + reimbursement.id}>
                                                        {reimbursement.amount_locale}
                                                    </td>

                                                    <td>
                                                        <strong className="text-primary">
                                                            {reimbursement.created_at_locale.split(' - ')[0]}
                                                        </strong>
                                                        <br />
                                                        <strong className="text-strong text-md text-muted-dark">
                                                            {reimbursement.created_at_locale.split(' - ')[1]}
                                                        </strong>
                                                    </td>

                                                    <td>{reimbursement.lead_time_locale}</td>

                                                    <td
                                                        className={
                                                            reimbursement.employee ? 'text-primary' : 'text-muted-dark'
                                                        }>
                                                        {strLimit(
                                                            reimbursement.employee?.email || 'Niet toegewezen',
                                                            25,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={
                                                            reimbursement.expired ? 'text-primary' : 'text-muted-dark'
                                                        }>
                                                        {reimbursement.expired ? 'Ja' : 'Nee'}
                                                    </td>

                                                    <td>
                                                        <div
                                                            className={`label ${
                                                                stateLabels[reimbursement.state] || ''
                                                            }`}
                                                            data-dusk={'reimbursementState' + reimbursement.id}>
                                                            {reimbursement.state_locale}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {reimbursement.voucher_transaction ? (
                                                            <Fragment>
                                                                {reimbursement.voucher_transaction.state_locale ==
                                                                    'pending' && (
                                                                    <label className="label-default">
                                                                        {reimbursement.voucher_transaction.state_locale}
                                                                    </label>
                                                                )}

                                                                {reimbursement.voucher_transaction.state_locale ==
                                                                    'success' && (
                                                                    <label className="label-success">
                                                                        {reimbursement.voucher_transaction.state_locale}
                                                                    </label>
                                                                )}

                                                                {reimbursement.voucher_transaction.state_locale ==
                                                                    'canceled' && (
                                                                    <label className="label-danger">
                                                                        {reimbursement.voucher_transaction.state_locale}
                                                                    </label>
                                                                )}
                                                            </Fragment>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="button-group flex-end">
                                                            <StateNavLink
                                                                name={'reimbursements-view'}
                                                                params={{
                                                                    organizationId: activeOrganization.id,
                                                                    id: reimbursement.id,
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

                    {reimbursements.meta && (
                        <div className="card-section">
                            <Paginator
                                meta={reimbursements.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}

                    {reimbursements.meta.total == 0 && (
                        <div className="card-section">
                            <div className="block block-empty text-center">
                                <div className="empty-title">Geen declaraties gevonden</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {funds?.data.length == 0 && (
                <div>
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
                </div>
            )}
        </Fragment>
    );
}
