import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import Fund from '../../../props/models/Fund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { hasPermission } from '../../../helpers/utils';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useFundService } from '../../../services/FundService';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useFilter from '../../../hooks/useFilter';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSetProgress from '../../../hooks/useSetProgress';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import { useImplementationService } from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import { currencyFormat, strLimit } from '../../../helpers/string';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import { StringParam, useQueryParams } from 'use-query-params';
import Paginator from '../../../modules/paginator/components/Paginator';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { NavLink, useNavigate } from 'react-router-dom';
import ModalFundTopUp from '../../modals/ModalFundTopUp';

export default function OrganizationFunds() {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();
    const navigate = useNavigate();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const implementationService = useImplementationService();

    const [paginatorKey] = useState<string>('organization_funds');
    const [shownFundMenus, setShownFundMenus] = useState<Array<number>>([]);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);

    const [statesOptions] = useState([
        { key: null, name: 'Alle' },
        { key: 'active', name: t(`components.organization_funds.states.active`) },
        { key: 'paused', name: t(`components.organization_funds.states.paused`) },
        { key: 'closed', name: t(`components.organization_funds.states.closed`) },
    ]);

    const [stateLabels] = useState({
        active: 'label-success',
        paused: 'label-warning',
        closed: 'label-default',
    });

    const [{ funds_type }, setQueryParams] = useQueryParams({
        funds_type: StringParam,
    });

    const filter = useFilter({
        q: '',
        state: null,
        funds_type: null,
        implementation_id: null,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization.id, {
                ...filter.activeValues,
                with_archived: 1,
                with_external: 1,
                stats: 'min',
                archived: funds_type == 'archived' ? 1 : 0,
                per_page: filter.activeValues.per_page,
            })
            .then((res) => {
                setFunds(res.data);
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, filter.activeValues, fundService, funds_type, setProgress]);

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]));
    }, [activeOrganization.id, implementationService]);

    const askConfirmation = useCallback(
        (type: string, onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t(`modals.danger_zone.${type}.title`)}
                    description={t(`modals.danger_zone.${type}.description`)}
                    buttonCancel={{
                        text: t(`modals.danger_zone.${type}.buttons.cancel`),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: t(`modals.danger_zone.${type}.buttons.confirm`),
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal, t],
    );

    const archiveFund = useCallback(
        (fund: Fund) => {
            askConfirmation('archive_fund', () => {
                fundService.archive(fund.organization_id, fund.id).then(
                    () => {
                        setQueryParams({ funds_type: 'archived' });
                        pushSuccess('Opgeslagen!');
                    },
                    (err: ResponseError) => pushDanger(err.data.message || 'Error!'),
                );
            });
        },
        [askConfirmation, fundService, pushDanger, pushSuccess, setQueryParams],
    );

    const restoreFund = useCallback(
        (e, fund: Fund) => {
            e?.stopPropagation();
            e?.preventDefault();

            askConfirmation('restore_fund', () => {
                fundService.unarchive(fund.organization_id, fund.id).then(
                    () => {
                        setQueryParams({ funds_type: 'active' });
                        pushSuccess('Opgeslagen!');
                    },
                    (err: ResponseError) => pushDanger(err.data.message || 'Error!'),
                );
            });
        },
        [askConfirmation, fundService, pushDanger, pushSuccess, setQueryParams],
    );

    const setTopUpInProgress = useCallback(
        (fund: Fund, inProgress = false) => {
            fund.topUpInProgress = inProgress;
            setFunds({ ...funds });
        },
        [funds],
    );

    const topUpModal = useCallback(
        (fund: Fund) => {
            if (!fund.topUpInProgress) {
                setTopUpInProgress(fund, true);

                openModal((modal) => (
                    <ModalFundTopUp
                        modal={modal}
                        fund={fund}
                        onClose={() => {
                            setTopUpInProgress(fund, false);
                        }}
                    />
                ));
            }
        },
        [openModal, setTopUpInProgress],
    );

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    useEffect(() => {
        if (!funds_type) {
            setQueryParams({ funds_type: 'active' });
        }
    }, [funds_type, setQueryParams]);

    if (!funds) {
        return <LoadingCard />;
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col flex-grow">
                            <div className="card-title" data-dusk="fundsTitle">
                                <span>{t('components.organization_funds.title')}</span>
                                <span className="span-count">{funds.meta.total}</span>
                            </div>
                        </div>

                        <div className="flex">
                            <div className="block block-inline-filters">
                                {hasPermission(activeOrganization, 'manage_funds') && (
                                    <StateNavLink
                                        name={'funds-create'}
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-primary button-sm">
                                        <em className="mdi mdi-plus-circle icon-start" />
                                        {t('components.organization_funds.buttons.add')}
                                    </StateNavLink>
                                )}

                                {activeOrganization.allow_2fa_restrictions &&
                                    hasPermission(activeOrganization, 'manage_organization') && (
                                        <NavLink
                                            className="button button-default button-sm"
                                            to={
                                                getStateRouteUrl('organization-security', {
                                                    organizationId: activeOrganization.id,
                                                }) + '?view_type=funds'
                                            }>
                                            <em className="mdi mdi-security icon-start" />
                                            {t('components.organization_funds.buttons.security')}
                                        </NavLink>
                                    )}

                                <div className="form">
                                    <div className="flex">
                                        <div>
                                            <div className="block block-label-tabs">
                                                <div className="label-tab-set">
                                                    <div
                                                        onClick={() => setQueryParams({ funds_type: 'active' })}
                                                        className={`label-tab label-tab-sm ${
                                                            funds_type == 'active' ? 'active' : ''
                                                        }`}>
                                                        Lopend ({funds.meta.unarchived_funds_total})
                                                    </div>

                                                    <div
                                                        onClick={() => setQueryParams({ funds_type: 'archived' })}
                                                        className={`label-tab label-tab-sm ${
                                                            funds_type == 'archived' ? 'active' : ''
                                                        }`}>
                                                        Archief ({funds.meta.archived_funds_total})
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex">
                                    {filter.show && (
                                        <div className="button button-text" onClick={filter.resetFilters}>
                                            <em className="mdi mdi-close icon-start" />
                                            Wis filters
                                        </div>
                                    )}

                                    {!filter.show && (
                                        <div className="form">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Zoeken"
                                                    value={filter.values.q}
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
                                                        <FilterItemToggle
                                                            show={true}
                                                            label={t('components.organization_funds.filters.search')}>
                                                            <input
                                                                className="form-control"
                                                                value={filter.values.q}
                                                                onChange={(e) => filter.update({ q: e.target.value })}
                                                                placeholder={t(
                                                                    'components.organization_funds.filters.search',
                                                                )}
                                                            />
                                                        </FilterItemToggle>

                                                        <FilterItemToggle
                                                            label={t('components.organization_funds.filters.state')}>
                                                            <SelectControl
                                                                className="form-control"
                                                                propKey={'key'}
                                                                allowSearch={false}
                                                                value={filter.values.state}
                                                                options={statesOptions}
                                                                optionsComponent={SelectControlOptions}
                                                                onChange={(state: string) => filter.update({ state })}
                                                            />
                                                        </FilterItemToggle>

                                                        <FilterItemToggle
                                                            label={t(
                                                                'components.organization_funds.filters.implementation',
                                                            )}>
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
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className="button button-default button-icon"
                                                onClick={() => filter.setShow(!filter.show)}>
                                                <em className="mdi mdi-filter-outline" />
                                            </div>
                                        </div>
                                    </ClickOutside>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {funds.meta.total > 0 && (
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{t('components.organization_funds.labels.name')}</th>
                                            <th>{t('components.organization_funds.labels.implementation')}</th>
                                            {funds_type == 'active' && (
                                                <Fragment>
                                                    <th>{t('components.organization_funds.labels.remaining')}</th>
                                                    <th>{t('components.organization_funds.labels.requester_count')}</th>
                                                </Fragment>
                                            )}
                                            <th>{t('components.organization_funds.labels.status')}</th>
                                            <th className="th-narrow text-right">
                                                {t('components.organization_funds.labels.actions')}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {funds.data.map((fund) => (
                                            <tr
                                                key={fund.id}
                                                onClick={() =>
                                                    navigate(
                                                        getStateRouteUrl('funds-show', {
                                                            organizationId: activeOrganization.id,
                                                            fundId: fund.id,
                                                        }),
                                                    )
                                                }>
                                                <td style={{ cursor: 'pointer' }}>
                                                    <div className="td-entity-main">
                                                        <div className="td-entity-main-media">
                                                            <img
                                                                className="td-media td-media-sm td-media-round"
                                                                src={
                                                                    fund.logo?.sizes.thumbnail ||
                                                                    './assets/img/placeholders/fund-thumbnail.png'
                                                                }
                                                                alt={''}
                                                            />
                                                        </div>

                                                        <div className="td-entity-main-content">
                                                            <div
                                                                className="text-strong text-primary"
                                                                title={fund.name || '-'}>
                                                                {strLimit(fund.name, 50)}
                                                            </div>
                                                            <div className="text-muted-dark">{fund.type_locale}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td
                                                    className="text-strong text-muted-dark"
                                                    style={{ cursor: 'pointer' }}>
                                                    {fund.implementation?.name}
                                                </td>

                                                {!fund.archived && (
                                                    <td style={{ cursor: 'pointer' }}>
                                                        {currencyFormat(fund.budget?.total - fund.budget?.used)}
                                                    </td>
                                                )}

                                                {!fund.archived && (
                                                    <td
                                                        className="text-strong text-muted-dark"
                                                        style={{ cursor: 'pointer' }}>
                                                        {fund.requester_count}
                                                    </td>
                                                )}

                                                <td>
                                                    {!fund.archived && stateLabels[fund.state] && (
                                                        <span className={`label ${stateLabels[fund.state] || ''}`}>
                                                            {t(`components.organization_funds.states.${fund.state}`)}
                                                        </span>
                                                    )}

                                                    {fund.archived && (
                                                        <span className="label label-default">
                                                            {t('components.organization_funds.states.archived')}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="td-narrow text-right">
                                                    {!fund.archived && (
                                                        <TableRowActions
                                                            actions={shownFundMenus}
                                                            setActions={(actions: Array<number>) =>
                                                                setShownFundMenus(actions)
                                                            }
                                                            modelItem={fund}>
                                                            <div className="dropdown dropdown-actions">
                                                                <NavLink
                                                                    className="dropdown-item"
                                                                    to={getStateRouteUrl('funds-show', {
                                                                        organizationId: activeOrganization.id,
                                                                        fundId: fund.id,
                                                                    })}>
                                                                    <em className="mdi mdi-eye icon-start" /> Bekijken
                                                                </NavLink>

                                                                <NavLink
                                                                    className="dropdown-item"
                                                                    to={getStateRouteUrl('funds-edit', {
                                                                        organizationId: activeOrganization.id,
                                                                        fundId: fund.id,
                                                                    })}>
                                                                    <em className="mdi mdi-pencil icon-start" />
                                                                    Bewerken
                                                                </NavLink>

                                                                <NavLink
                                                                    className="dropdown-item"
                                                                    to={getStateRouteUrl('funds-security', {
                                                                        organizationId: activeOrganization.id,
                                                                        fundId: fund.id,
                                                                    })}>
                                                                    <em className="mdi mdi-security icon-start" />
                                                                    Beveiliging
                                                                </NavLink>

                                                                {fund.balance_provider == 'top_ups' &&
                                                                    fund.key &&
                                                                    fund.state != 'closed' && (
                                                                        <a
                                                                            className={`dropdown-item ${
                                                                                !fund.organization.has_bank_connection
                                                                                    ? 'disabled'
                                                                                    : ''
                                                                            }`}
                                                                            onClick={() => topUpModal(fund)}>
                                                                            <em className="mdi mdi-plus-circle icon-start" />
                                                                            Budget toevoegen
                                                                        </a>
                                                                    )}

                                                                <a
                                                                    className={`dropdown-item ${
                                                                        fund.key && fund.state != 'closed'
                                                                            ? 'disabled'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() => archiveFund(fund)}>
                                                                    <em className="mdi mdi-download-box-outline icon-start" />
                                                                    {t('components.organization_funds.buttons.archive')}
                                                                </a>
                                                            </div>
                                                        </TableRowActions>
                                                    )}

                                                    {fund.archived &&
                                                        hasPermission(activeOrganization, 'manage_funds') && (
                                                            <button
                                                                className="button button-primary"
                                                                onClick={(e) => restoreFund(e, fund)}>
                                                                <em className="mdi mdi-lock-reset icon-start" />
                                                                {t('components.organization_funds.buttons.restore')}
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {funds.meta.total == 0 && (
                    <div className="card-section">
                        <div className="block block-empty text-center">
                            <div className="empty-title">Geen fondsen gevonden</div>
                        </div>
                    </div>
                )}

                {funds.meta && (
                    <div className="card-section">
                        <Paginator
                            meta={funds.meta}
                            filters={filter.values}
                            updateFilters={filter.update}
                            perPageKey={paginatorKey}
                        />
                    </div>
                )}
            </div>

            {funds?.data.length == 0 && (
                <Fragment>
                    {hasPermission(activeOrganization, 'manage_funds') ? (
                        <EmptyCard
                            description={'Je hebt momenteel geen fondsen.'}
                            button={{
                                text: 'Fonds toevoegen',
                                to: getStateRouteUrl('funds-create', {
                                    organizationId: activeOrganization.id,
                                }),
                            }}
                        />
                    ) : (
                        <EmptyCard description={'Je hebt momenteel geen fondsen.'} />
                    )}
                </Fragment>
            )}
        </>
    );
}
