import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useFundService } from '../../../services/FundService';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import ModalNotification from '../../modals/ModalNotification';
import useOpenModal from '../../../hooks/useOpenModal';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import FundCriteriaEditor from './elements/FundCriteriaEditor';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import { currencyFormat } from '../../../helpers/string';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import ThSortable from '../../elements/tables/ThSortable';
import FundTopUpTransaction from '../../../props/models/FundTopUpTransaction';
import Paginator from '../../../modules/paginator/components/Paginator';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import Implementation from '../../../props/models/Implementation';
import Identity from '../../../props/models/Identity';
import ModalFundInviteProviders from '../../modals/ModalFundInviteProviders';
import usePushSuccess from '../../../hooks/usePushSuccess';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import TableRowActions from '../../elements/tables/TableRowActions';
import useFundIdentitiesExportService from '../../../services/exports/useFundIdentitiesExportService';
import FundCriterion from '../../../props/models/FundCriterion';
import usePushDanger from '../../../hooks/usePushDanger';

export default function OrganizationsFundsShow() {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const openModal = useOpenModal();
    const navigate = useNavigate();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const organizationService = useOrganizationService();
    const fundIdentitiesExportService = useFundIdentitiesExportService();

    const [fund, setFund] = useState<Fund>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [viewType, setViewType] = useState<string>('top_ups');
    const [identitiesActive, setIdentitiesActive] = useState<number>(0);
    const [viewGeneralType, setViewGeneralType] = useState<string>('description');
    const [lastQueryIdentities, setLastQueryIdentities] = useState<string>('');
    const [lastQueryTopUpTransactions, setLastQueryTopUpTransactions] = useState<string>('');
    const [identitiesWithoutEmail, setIdentitiesWithoutEmail] = useState<number>(0);
    const [lastQueryImplementations, setLastQueryImplementations] = useState<string>('');
    const [identities, setIdentities] = useState<PaginationData<Identity>>(null);
    const [shownImplementationMenus, setShownImplementationMenus] = useState<Array<number>>([]);
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);
    const [topUpTransactions, setTopUpTransactions] = useState<PaginationData<FundTopUpTransaction>>(null);
    const [validatorOrganizations, setValidatorOrganizations] = useState<PaginationData<Organization>>(null);

    const [topUpPaginationPerPageKey] = useState('fund_top_up_per_page');
    const [implementationPaginationPerPageKey] = useState('fund_implementation_per_page');
    const [identitiesPaginationPerPageKey] = useState('fund_identities_per_page');

    const fund_id = useParams().fundId;

    const topUpTransactionFilters = useFilter({
        q: '',
        amount_min: null,
        amount_max: null,
        from: null,
        to: null,
        per_page: paginatorService.getPerPage(topUpPaginationPerPageKey),
    });

    const implementationsFilters = useFilter({
        per_page: paginatorService.getPerPage(implementationPaginationPerPageKey),
    });

    const identitiesFilters = useFilter({
        per_page: paginatorService.getPerPage(identitiesPaginationPerPageKey),
    });

    const fundTransform = useCallback(
        (fund: Fund) => {
            return {
                ...fund,
                canAccessFund: fund.state != 'closed',
                canInviteProviders: hasPermission(activeOrganization, 'manage_funds') && fund.state != 'closed',
                providersDescription: [
                    `${fund.provider_organizations_count}`,
                    `(${fund.provider_employees_count} ${t('fund_card_sponsor.labels.employees')})`,
                ].join(' '),
            };
        },
        [activeOrganization, t],
    );

    const transformImplementations = useCallback(() => {
        setLastQueryImplementations(implementationsFilters.activeValues.q);

        if (
            !implementationsFilters.activeValues.q ||
            fund.implementation.name?.toLowerCase().includes(implementationsFilters.activeValues.q?.toLowerCase())
        ) {
            setImplementations({
                data: [fund.implementation],
                meta: {
                    total: 1,
                    current_page: 1,
                    per_page: implementationsFilters.activeValues.per_page,
                    from: 1,
                    to: 1,
                    last_page: 1,
                    path: '',
                    links: { active: false, label: '', url: '' },
                },
            });
        } else {
            setImplementations({
                data: [],
                meta: {
                    total: 0,
                    current_page: 1,
                    per_page: implementationsFilters.activeValues.per_page,
                    from: 0,
                    to: 0,
                    last_page: 1,
                    path: '',
                    links: { active: false, label: '', url: '' },
                },
            });
        }
    }, [implementationsFilters.activeValues.q, implementationsFilters.activeValues.per_page, fund?.implementation]);

    const fetchFund = useCallback(() => {
        fundService.read(activeOrganization.id, parseInt(fund_id), { stats: 'budget' }).then((res) => {
            setFund(fundTransform(res.data.data));
        });
    }, [fundService, activeOrganization.id, fund_id, fundTransform]);

    const fetchTopUps = useCallback(() => {
        fundService
            .listTopUpTransactions(activeOrganization.id, parseInt(fund_id), topUpTransactionFilters.activeValues)
            .then((res) => {
                setTopUpTransactions(res.data);
                setLastQueryTopUpTransactions(topUpTransactionFilters.activeValues.q);
            });
    }, [fundService, activeOrganization.id, fund_id, topUpTransactionFilters.activeValues]);

    const fetchIdentities = useCallback(() => {
        fundService
            .listIdentities(activeOrganization.id, parseInt(fund_id), identitiesFilters.activeValues)
            .then((res) => {
                setIdentities(res.data);
                setIdentitiesActive(res.data.meta.counts['active']);
                setIdentitiesWithoutEmail(res.data.meta.counts['without_email']);
                setLastQueryIdentities(identitiesFilters.activeValues.q);
            });
    }, [fundService, activeOrganization.id, fund_id, identitiesFilters.activeValues]);

    const fetchValidatorOrganizations = useCallback(() => {
        organizationService.readListValidators(activeOrganization.id, { per_page: 100 }).then((res) => {
            setValidatorOrganizations(res.data);
        });
    }, [activeOrganization.id, organizationService]);

    const fetchRecordTypes = useCallback(() => {
        recordTypeService.list().then((res) => {
            setRecordTypes(res.data);
        });
    }, [recordTypeService]);

    const exportIdentities = useCallback(() => {
        fundIdentitiesExportService.exportData(activeOrganization.id, fund.id, identitiesFilters.activeValues);
    }, [activeOrganization.id, fund?.id, fundIdentitiesExportService, identitiesFilters.activeValues]);

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterion>) => {
            fundService
                .updateCriteria(fund.organization_id, fund.id, criteria)
                .then((res) => {
                    fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger(err.data.message || 'Error!'));
        },
        [fund, fundService, pushDanger, pushSuccess],
    );

    const inviteProvider = useCallback(
        (fund: Fund) => {
            if (fund.canInviteProviders) {
                openModal((modal) => (
                    <ModalFundInviteProviders
                        fund={fund}
                        modal={modal}
                        onSubmit={(res) => {
                            pushSuccess(
                                'Aanbieders uitgenodigd!',
                                `${res.length} uitnodigingen verstuurt naar aanbieders!`,
                            );

                            setTimeout(() => {
                                document.location.reload();
                            }, 2000);
                        }}
                    />
                ));
            }
        },
        [openModal, pushSuccess],
    );

    const deleteFund = useCallback(
        (fund: Fund) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={t('fund_card_sponsor.confirm_delete.title')}
                    description={t('fund_card_sponsor.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            fundService.destroy(activeOrganization.id, fund.id).then(() => {
                                navigate(
                                    getStateRouteUrl('organization-funds', { organizationId: activeOrganization.id }),
                                );
                            });
                        },
                    }}
                />
            ));
        },
        [activeOrganization.id, fundService, navigate, openModal, t],
    );

    useEffect(() => {
        if (viewType == 'top_ups') {
            fetchTopUps();
        }

        if (viewType == 'implementations') {
            transformImplementations();
        }

        if (viewType == 'identities') {
            fetchIdentities();
        }
    }, [transformImplementations, fetchTopUps, viewType, fetchIdentities]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchValidatorOrganizations();
    }, [fetchValidatorOrganizations]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="organization-funds"
                    params={{ organizationId: activeOrganization.id }}>
                    {t('page_state_titles.funds')}
                </StateNavLink>

                <div className="breadcrumb-item active">{fund.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <div className="block block-fund">
                        <div className="fund-overview">
                            <div className="fund-media">
                                <img
                                    className="fund-media-img"
                                    src={fund.logo?.sizes.thumbnail || './assets/img/placeholders/fund-thumbnail.png'}
                                    alt={''}
                                />
                            </div>

                            <div className="fund-details">
                                <div className="fund-header">
                                    <div className="fund-name">{fund.name}</div>
                                    {fund.state == 'active' && (
                                        <div className="tag tag-success tag-sm">
                                            {t('components.organization_funds.states.active')}
                                        </div>
                                    )}

                                    {fund.state == 'paused' && (
                                        <div className="tag tag-warning tag-sm">
                                            {t('components.organization_funds.states.paused')}
                                        </div>
                                    )}

                                    {fund.state == 'closed' && (
                                        <div className="tag tag-default tag-sm">
                                            {t('components.organization_funds.states.closed')}
                                        </div>
                                    )}
                                </div>

                                <div className="fund-description">{fund.description_short}</div>
                            </div>
                        </div>

                        <div className="fund-actions">
                            <div className="button-group flex-end">
                                {hasPermission(activeOrganization, 'manage_funds') &&
                                    activeOrganization.allow_2fa_restrictions && (
                                        <StateNavLink
                                            className="button button-default"
                                            name="funds-security"
                                            params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                            <em className="mdi mdi-security icon-start" />
                                            {t('fund_card_sponsor.buttons.security')}
                                        </StateNavLink>
                                    )}

                                {hasPermission(fund.organization, 'manage_funds') && fund.state == 'waiting' && (
                                    <button className="button button-default" onClick={() => deleteFund(fund)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        Verwijderen
                                    </button>
                                )}

                                {hasPermission(fund.organization, ['manage_funds', 'manage_fund_texts']) && (
                                    <StateNavLink
                                        className="button button-default"
                                        name="funds-edit"
                                        params={{ organizationId: activeOrganization.id, fundId: fund.id }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        Bewerken
                                    </StateNavLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-col">
                            <div className="card-title">
                                {t(`funds_show.labels.base_card.header.${viewGeneralType}`)}
                            </div>
                        </div>

                        <div className="flex">
                            <div className="block block-inline-filters">
                                <div className="flex">
                                    <div>
                                        <div className="block block-label-tabs pull-right">
                                            <div className="label-tab-set">
                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'description' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('description')}>
                                                    Beschrijving
                                                </div>

                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'statistics' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('statistics')}>
                                                    Statistieken
                                                </div>

                                                <div
                                                    className={`label-tab label-tab-sm ${
                                                        viewGeneralType == 'criteria' ? 'active' : ''
                                                    }`}
                                                    onClick={() => setViewGeneralType('criteria')}>
                                                    Voorwaarden
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewGeneralType == 'description' && (
                    <div className="card-section">
                        <div className="fund-description">
                            {fund.description_html && (
                                <div className="description-body">
                                    <div className="arrow-box border bg-dim">
                                        <div className="arrow" />
                                    </div>

                                    <div className="block block-markdown">
                                        <TranslateHtml i18n={fund.description_html} />
                                    </div>
                                </div>
                            )}

                            {!fund.description_html && (
                                <div className="description-body">
                                    <div className="arrow-box border bg-dim">
                                        <div className="arrow" />
                                    </div>
                                    Geen data
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewGeneralType == 'criteria' && (
                    <div className="card-section card-section-primary">
                        <div className="form">
                            <FundCriteriaEditor
                                fund={fund}
                                organization={fund.organization}
                                criteria={fund.criteria}
                                isEditable={fund.criteria_editable}
                                recordTypes={recordTypes}
                                setCriteria={(criteria) => setFund({ ...fund, criteria })}
                                saveButton={true}
                                onSaveCriteria={(criteria) => {
                                    saveCriteria(criteria);
                                }}
                                validatorOrganizations={validatorOrganizations.data}
                            />
                        </div>
                    </div>
                )}

                {viewGeneralType == 'statistics' && fund.is_configured && (
                    <div className="card-section card-section-warning">
                        <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                            <a className="keyvalue-item col col-lg-3">
                                <div className="keyvalue-key">{t('fund_card_sponsor.labels.your_employees')}</div>
                                <div
                                    className="keyvalue-value"
                                    onClick={() =>
                                        navigate(
                                            getStateRouteUrl('employees', {
                                                organizationId: fund.organization_id,
                                            }),
                                        )
                                    }>
                                    <span>{fund.sponsor_count}</span>
                                    <span className="icon mdi mdi-account-multiple-plus" />
                                </div>
                            </a>

                            <div
                                className={`keyvalue-item col col-lg-3 ${
                                    !fund.canInviteProviders ? 'keyvalue-item-disabled' : ''
                                }`}
                                onClick={() => inviteProvider(fund)}>
                                <div className="keyvalue-key">{t('fund_card_sponsor.labels.providers')}</div>
                                <div className="keyvalue-value">
                                    <span>{fund.providersDescription}</span>
                                    <em className="icon mdi mdi-account-multiple-plus" />
                                </div>
                            </div>

                            <a
                                className={`keyvalue-item col col-lg-3 ${
                                    !fund.canAccessFund ? 'keyvalue-item-disabled' : ''
                                }`}
                                onClick={() =>
                                    navigate(
                                        getStateRouteUrl('csv-validation', {
                                            fundId: fund.organization_id,
                                        }),
                                    )
                                }>
                                <div className="keyvalue-key">{t('fund_card_sponsor.labels.applicants')}</div>
                                <div className="keyvalue-value">
                                    <span>{fund.requester_count}</span>

                                    {fund.canAccessFund && <span className="icon mdi mdi-account-multiple-plus" />}
                                </div>
                            </a>
                        </div>
                    </div>
                )}

                {viewGeneralType == 'statistics' && (
                    <div className="card-section card-section-primary">
                        <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                            <div className="keyvalue-item col col-lg-3">
                                <div className="keyvalue-key">Gestort</div>
                                <div className="keyvalue-value">
                                    {currencyFormat(parseInt(fund.budget.total.toString()))}
                                </div>
                            </div>

                            <div className="keyvalue-item col col-lg-3">
                                <div className="keyvalue-key">Gebruikt</div>
                                <div className="keyvalue-value">
                                    {currencyFormat(parseInt(fund.budget.used.toString()))}
                                </div>
                            </div>

                            <div className="keyvalue-item col col-lg-3">
                                <div className="keyvalue-key">Resterend</div>
                                <div className="keyvalue-value">
                                    {currencyFormat(
                                        parseInt(fund.budget.total.toString()) - parseInt(fund.budget.used.toString()),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex-row">
                        <div className="flex-grow">
                            <div className="flex-col">
                                <div className="card-title">
                                    {t(`funds_show.titles.${viewType}`)}

                                    {viewType == 'top_ups' && <span>&nbsp;{topUpTransactions?.meta?.total}</span>}
                                    {viewType == 'implementations' && <span>&nbsp;{implementations?.meta?.total}</span>}
                                    {viewType == 'identities' && <span>&nbsp;{identities?.meta?.total}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex-row">
                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <div className="flex">
                                        <div>
                                            <div className="block block-label-tabs pull-right">
                                                <div className="label-tab-set">
                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'top_ups' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('top_ups')}>
                                                        Bekijk aanvullingen
                                                    </div>

                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'implementations' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('implementations')}>
                                                        Webshop
                                                    </div>

                                                    <div
                                                        className={`label-tab label-tab-sm ${
                                                            viewType == 'identities' ? 'active' : ''
                                                        }`}
                                                        onClick={() => setViewType('identities')}>
                                                        Aanvragers
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {viewType == 'top_ups' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {topUpTransactionFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => topUpTransactionFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!topUpTransactionFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={topUpTransactionFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    topUpTransactionFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => topUpTransactionFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {topUpTransactionFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={t(
                                                                            'funds_show.top_up_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            defaultValue={
                                                                                topUpTransactionFilters.values.q
                                                                            }
                                                                            onChange={(e) =>
                                                                                topUpTransactionFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={t(
                                                                                'funds_show.top_up_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={t(
                                                                            'funds_show.top_up_table.filters.amount',
                                                                        )}>
                                                                        <div className="row">
                                                                            <div className="col col-lg-6">
                                                                                <input
                                                                                    className="form-control"
                                                                                    min={0}
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        topUpTransactionFilters.values
                                                                                            .amount_min || ''
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        topUpTransactionFilters.update({
                                                                                            amount_min: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    placeholder={t(
                                                                                        'funds_show.top_up_table.filters.amount_min',
                                                                                    )}
                                                                                />
                                                                            </div>

                                                                            <div className="col col-lg-6">
                                                                                <input
                                                                                    className="form-control"
                                                                                    min={0}
                                                                                    type="number"
                                                                                    defaultValue={
                                                                                        topUpTransactionFilters.values
                                                                                            .amount_max || ''
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        topUpTransactionFilters.update({
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

                                                                    <FilterItemToggle
                                                                        label={t(
                                                                            'funds_show.top_up_table.filters.from',
                                                                        )}>
                                                                        <DatePickerControl
                                                                            value={dateParse(
                                                                                topUpTransactionFilters.values.from,
                                                                            )}
                                                                            placeholder={t('dd-MM-yyyy')}
                                                                            onChange={(from: Date) => {
                                                                                topUpTransactionFilters.update({
                                                                                    from: dateFormat(from),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <FilterItemToggle
                                                                        label={t('funds_show.top_up_table.filters.to')}>
                                                                        <DatePickerControl
                                                                            value={dateParse(
                                                                                topUpTransactionFilters.values.to,
                                                                            )}
                                                                            placeholder={t('dd-MM-yyyy')}
                                                                            onChange={(to: Date) => {
                                                                                topUpTransactionFilters.update({
                                                                                    to: dateFormat(to),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </FilterItemToggle>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                topUpTransactionFilters.setShow(
                                                                    !topUpTransactionFilters.show,
                                                                )
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}

                                    {viewType == 'implementations' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {implementationsFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => implementationsFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!implementationsFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={implementationsFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    implementationsFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => implementationsFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {implementationsFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={t(
                                                                            'funds_show.implementations_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            value={implementationsFilters.values.q}
                                                                            onChange={(e) =>
                                                                                implementationsFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={t(
                                                                                'funds_show.implementations_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                implementationsFilters.setShow(
                                                                    !implementationsFilters.show,
                                                                )
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}

                                    {viewType == 'identities' && (
                                        <div className="flex-col">
                                            <div className="block block-inline-filters">
                                                {identitiesFilters.show && (
                                                    <div
                                                        className="button button-text"
                                                        onClick={() => identitiesFilters.resetFilters()}>
                                                        <em className="mdi mdi-close icon-start"></em>
                                                        Wis filters
                                                    </div>
                                                )}

                                                {!identitiesFilters.show && (
                                                    <div className="form">
                                                        <div className="form-group">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={identitiesFilters.values.q}
                                                                placeholder="Zoeken"
                                                                onChange={(e) =>
                                                                    identitiesFilters.update({
                                                                        q: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <ClickOutside
                                                    className="form"
                                                    onClickOutside={() => identitiesFilters.setShow(false)}>
                                                    <div className="inline-filters-dropdown pull-right">
                                                        {identitiesFilters.show && (
                                                            <div className="inline-filters-dropdown-content">
                                                                <div className="arrow-box bg-dim">
                                                                    <div className="arrow" />
                                                                </div>

                                                                <div className="form">
                                                                    <FilterItemToggle
                                                                        show={true}
                                                                        label={t(
                                                                            'funds_show.top_up_table.filters.search',
                                                                        )}>
                                                                        <input
                                                                            className="form-control"
                                                                            value={identitiesFilters.values.q}
                                                                            onChange={(e) =>
                                                                                identitiesFilters.update({
                                                                                    q: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder={t(
                                                                                'funds_show.top_up_table.filters.search',
                                                                            )}
                                                                        />
                                                                    </FilterItemToggle>

                                                                    <div className="form-actions">
                                                                        <button
                                                                            className="button button-primary button-wide"
                                                                            onClick={() => exportIdentities()}>
                                                                            <em className="mdi mdi-download icon-start" />
                                                                            <span>
                                                                                {t('components.dropdown.export', {
                                                                                    total: identities.meta.total,
                                                                                })}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="button button-default button-icon"
                                                            onClick={() =>
                                                                identitiesFilters.setShow(!identitiesFilters.show)
                                                            }>
                                                            <em className="mdi mdi-filter-outline" />
                                                        </div>
                                                    </div>
                                                </ClickOutside>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewType == 'top_ups' && topUpTransactions?.meta?.total > 0 && (
                    <div className="card-section card-section-padless">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable
                                            filter={topUpTransactionFilters}
                                            label={t('funds_show.top_up_table.columns.code')}
                                            value="code"
                                        />
                                        <ThSortable
                                            filter={topUpTransactionFilters}
                                            label={t('funds_show.top_up_table.columns.iban')}
                                            value="iban"
                                        />
                                        <ThSortable
                                            filter={topUpTransactionFilters}
                                            label={t('funds_show.top_up_table.columns.amount')}
                                            value="amount"
                                        />
                                        <ThSortable
                                            className="text-right"
                                            filter={topUpTransactionFilters}
                                            label={t('funds_show.top_up_table.columns.date')}
                                            value="created_at"
                                        />
                                    </tr>
                                </thead>

                                <tbody>
                                    {topUpTransactions.data.map((top_up_transaction: FundTopUpTransaction) => (
                                        <tr key={top_up_transaction.id}>
                                            <td>{top_up_transaction.code}</td>
                                            <td className={!top_up_transaction.iban ? 'text-muted' : ''}>
                                                {top_up_transaction.iban || 'Geen IBAN'}
                                            </td>
                                            <td>{top_up_transaction.amount_locale}</td>
                                            <td className="text-right">{top_up_transaction.created_at_locale}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewType == 'top_ups' && topUpTransactions && topUpTransactions.meta.total > 0 && (
                    <div className={'card-section card-section-narrow'}>
                        <Paginator
                            meta={topUpTransactions.meta}
                            filters={topUpTransactionFilters.activeValues}
                            updateFilters={topUpTransactionFilters.update}
                        />
                    </div>
                )}

                {viewType == 'top_ups' && topUpTransactions?.meta?.total == 0 && (
                    <EmptyCard
                        title="No top-ups"
                        description={
                            lastQueryTopUpTransactions
                                ? 'Could not find any top-ups for ' + lastQueryTopUpTransactions
                                : 'No top-ups'
                        }
                    />
                )}

                {viewType == 'implementations' && (
                    <div className="card-section card-section-padless">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="td-narrow">Afbeelding</th>
                                        <th>Naam</th>
                                        <th>Status</th>
                                        <th>Acties</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {implementations?.data?.map((implementation: Implementation) => (
                                        <tr key={implementation?.id}>
                                            <td className="td-narrow">
                                                <img
                                                    className="td-media"
                                                    src={
                                                        implementation?.logo ||
                                                        './assets/img/placeholders/organization-thumbnail.png'
                                                    }
                                                    alt={''}></img>
                                            </td>
                                            <td>{implementation?.name}</td>
                                            {fund.state == 'active' && (
                                                <td>
                                                    <div className="label label-success">Zichtbaar</div>
                                                </td>
                                            )}
                                            {fund.state != 'active' && (
                                                <td>
                                                    <div className="label label-success">Onzichtbaar</div>
                                                </td>
                                            )}

                                            <td className="td-narrow text-right">
                                                <TableRowActions
                                                    actions={shownImplementationMenus}
                                                    setActions={(actions: Array<number>) =>
                                                        setShownImplementationMenus(actions)
                                                    }
                                                    modelItem={implementation}>
                                                    <div className="dropdown dropdown-actions">
                                                        <a
                                                            className="dropdown-item"
                                                            target="_blank"
                                                            href={implementation?.url_webshop + 'funds/' + fund.id}
                                                            rel="noreferrer">
                                                            <em className="mdi mdi-open-in-new icon-start" /> Bekijk op
                                                            webshop
                                                        </a>

                                                        {hasPermission(
                                                            activeOrganization,
                                                            'manage_implementation_cms',
                                                        ) && (
                                                            <NavLink
                                                                className="dropdown-item"
                                                                to={getStateRouteUrl('implementation-view', {
                                                                    organizationId: fund.organization_id,
                                                                    id: implementation?.id,
                                                                })}>
                                                                <div className="mdi mdi-store-outline icon-start" />
                                                                Ga naar CMS
                                                            </NavLink>
                                                        )}
                                                    </div>
                                                </TableRowActions>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewType == 'implementations' && implementations && (
                    <div className="card-section card-section-narrow">
                        <Paginator
                            meta={implementations.meta}
                            filters={implementationsFilters.activeValues}
                            updateFilters={implementationsFilters.update}
                        />
                    </div>
                )}

                {viewType == 'implementations' && implementations?.meta?.total == 0 && (
                    <EmptyCard
                        title="No webshops"
                        description={
                            lastQueryImplementations
                                ? 'Could not find any webshops for ' + lastQueryImplementations
                                : ''
                        }
                    />
                )}

                {viewType == 'identities' && identities?.meta?.total > 0 && (
                    <div className="card-section card-section-padless">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable filter={identitiesFilters} label={'ID'} value="id" />
                                        <ThSortable filter={identitiesFilters} label={'E-mail'} value="email" />
                                        <ThSortable
                                            filter={identitiesFilters}
                                            label={'Totaal aantal vouchers'}
                                            value="count_vouchers"
                                        />
                                        <ThSortable
                                            filter={identitiesFilters}
                                            label={'Actieve vouchers'}
                                            value="count_vouchers_active"
                                        />
                                        <ThSortable
                                            filter={identitiesFilters}
                                            label={'Actieve vouchers met saldo'}
                                            value="count_vouchers_active_with_balance"
                                        />
                                        <th className="nowrap text-right">{t('identities.labels.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {identities.data.map((identity: Identity, index: number) => (
                                        <tr key={index}>
                                            <td>{identity.id}</td>
                                            <td>{identity.email}</td>
                                            <td>{identity.count_vouchers}</td>
                                            <td>{identity.count_vouchers_active}</td>
                                            <td>{identity.count_vouchers_active_with_balance}</td>
                                            <td>
                                                <NavLink
                                                    className="button button-primary button-sm pull-right"
                                                    to={getStateRouteUrl('identities-show', {
                                                        organizationId: fund.organization_id,
                                                        id: identity.id,
                                                        fundId: fund.id,
                                                    })}>
                                                    <div className="icon-start mdi mdi-eye-outline"></div>
                                                    Bekijken
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewType == 'identities' && identities?.meta?.total == 0 && (
                    <EmptyCard
                        title={'Geen gebruikers gevonden'}
                        description={lastQueryIdentities ? 'Geen gebruikers gevonden voor ' + lastQueryIdentities : ''}
                    />
                )}

                {viewType == 'identities' && identities && identities?.meta.total > 0 && (
                    <div className="card-section card-section-narrow">
                        <Paginator
                            meta={identities.meta}
                            filters={identitiesFilters.activeValues}
                            updateFilters={identitiesFilters.update}
                        />
                    </div>
                )}

                {viewType == 'identities' && identities && identities.meta.total > 0 && (
                    <div className="card-section card-section-primary">
                        <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                            <div className="keyvalue-item col col-lg-4">
                                <div className="keyvalue-key">Aanvragers met vouchers</div>
                                <div className="keyvalue-value">
                                    <span>{identitiesActive}</span>
                                    <span className="icon mdi mdi-account-multiple-outline" />
                                </div>
                            </div>

                            <div className="keyvalue-item col col-lg-4">
                                <div className="keyvalue-key">Aanvragers zonder e-mailadres</div>
                                <div className="keyvalue-value">
                                    <span>{identitiesWithoutEmail}</span>
                                    <span className="icon mdi mdi-email-off-outline" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
