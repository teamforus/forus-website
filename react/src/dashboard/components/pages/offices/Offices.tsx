import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import useFilter from '../../../hooks/useFilter';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { hasPermission } from '../../../helpers/utils';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Office from '../../../props/models/Office';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useOpenModal from '../../../hooks/useOpenModal';
import useOfficeService from '../../../services/OfficeService';
import OfficeSchedule from '../../../props/models/OfficeSchedule';
import ModalNotification from '../../modals/ModalNotification';
import useSetProgress from '../../../hooks/useSetProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';

interface OfficeLocal extends Office {
    scheduleByDay: { [key: string]: OfficeSchedule };
}

export default function Offices() {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const officeService = useOfficeService();
    const setProgress = useSetProgress();

    const [weekDays] = useState(officeService.scheduleWeekDays());
    const [offices, setOffices] = useState<Array<OfficeLocal>>(null);
    const [showCollapsible, setShowCollapsible] = useState({});

    const filter = useFilter({
        q: '',
    }, ['q']);

    const fetchOffices = useCallback(() => {
        setProgress(0);

        officeService
            .list(activeOrganization.id, { per_page: 100 })
            .then((res) => {
                setOffices(
                    res.data.data.map((office) => ({
                        ...office,
                        scheduleByDay: office.schedule.reduce(
                            (item, schedule) => ({ ...item, ...{ [schedule.week_day]: schedule } }),
                            {},
                        ),
                    })),
                );
            })
            .finally(() => setProgress(100));
    }, [officeService, activeOrganization.id, setProgress]);

    const toggleCollapsable = useCallback((office_id: number) => {
        setShowCollapsible((set) => ({
            ...set,
            [office_id]: !set[office_id]
        }));
    }, []);

    const deleteOffice = useCallback(
        (office: Office) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={t('offices.confirm_delete.title')}
                    description={t('offices.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            officeService.destroy(office.organization_id, office.id).then(fetchOffices);
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [t, fetchOffices, officeService, openModal],
    );

    useEffect(() => {
        fetchOffices();
    }, [fetchOffices]);

    if (!offices) {
        return <LoadingCard />;
    }

    return (
        <>
            <div className="card">
                <div className="card-section">
                    <div className="card-section-actions">
                        {hasPermission(activeOrganization, 'manage_organization') && (
                            <NavLink
                                id="edit_office"
                                to={getStateRouteUrl('organizations-edit', { organizationId: activeOrganization.id })}
                                className="button button-default">
                                <em className="mdi mdi-pen icon-start" />
                                {t('offices.buttons.adjust')}
                            </NavLink>
                        )}
                    </div>
                    <div className="card-block card-block-provider">
                        <div className="provider-img">
                            <img
                                src={
                                    activeOrganization.logo?.sizes.thumbnail ||
                                    assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                }
                                alt={''}
                            />
                        </div>
                        <div className="provider-details">
                            <NavLink
                                className="provider-title"
                                to={getStateRouteUrl('organizations-edit', { organizationId: activeOrganization.id })}>
                                {activeOrganization.name}
                            </NavLink>
                            <div className="card-block card-block-listing card-block-listing-inline card-block-listing-variant">
                                <div className="card-block-listing-label">{t('offices.labels.mail')}</div>
                                <span className="text-primary-light">{activeOrganization.email}</span>
                            </div>
                        </div>
                    </div>
                    {activeOrganization.business_type && (
                        <div className="card-block card-block-listing">
                            <div className="card-block-listing-label">{t('offices.labels.business_type')}</div>
                            {activeOrganization.business_type.name}
                        </div>
                    )}
                </div>

                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">KVK</div>
                            <div className={`keyvalue-value ${!activeOrganization.kvk ? 'text-muted' : ''}`}>
                                {activeOrganization.kvk ? activeOrganization.kvk : 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">BTW</div>
                            <div className={`keyvalue-value ${!activeOrganization.btw ? 'text-muted' : ''}`}>
                                {activeOrganization.btw ? activeOrganization.btw : 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key">IBAN</div>
                            <div className={`keyvalue-value ${!activeOrganization.iban ? 'text-muted' : ''}`}>
                                {activeOrganization.iban ? activeOrganization.iban : 'Geen data'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {offices && (
                <div className="card">
                    <div className="card-header">
                        <div className='flex-row'>
                            <div className='flex-col flex-grow'>
                                <div className='card-title'>{t('offices.labels.offices')}</div>
                            </div>

                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <StateNavLink
                                        name={'offices-create'}
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-primary">
                                        <em className="mdi mdi-plus-circle icon-start"/>
                                        Voeg een nieuwe vestiging toe
                                    </StateNavLink>

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
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Adres</th>
                                            <th>Vestigingsnaam</th>
                                            <th>Telefonnummer</th>
                                            <th>Vestigingsnummer</th>
                                            <th>VestigingID</th>
                                            <th className="text-right nowrap th-narrow">Actie</th>
                                        </tr>
                                    </thead>

                                    {offices?.map((office) => (
                                        <tbody key={office.id}>
                                            <tr>
                                                <td onClick={() => {toggleCollapsable(office.id)}}>
                                                    <div className="td-collapsable">
                                                        <div className="collapsable-icon">
                                                            <div className={`mdi icon-collapse ${showCollapsible[office.id] ? 'mdi-menu-down' : 'mdi-menu-right'}`}>
                                                            </div>
                                                        </div>
                                                        {office.address}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{office.branch_name}</div>

                                                    {!office.branch_name && (
                                                        <div className="text-muted">Geen naam...</div>
                                                    )}
                                                </td>
                                                <td>{office.phone}</td>
                                                <td>
                                                    <div>{office.branch_number}</div>

                                                    {!office.branch_number && (
                                                        <div className="text-muted">Geen...</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div>{office.branch_id}</div>

                                                    {!office.branch_id && (
                                                        <div className="text-muted">Geen...</div>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <div className="button-group">
                                                        <StateNavLink
                                                            name='offices-edit'
                                                            params={{ organizationId: activeOrganization.id, id: office.id }}
                                                            className="button button-default button-icon">
                                                            <em className="mdi mdi-pencil-outline icon-start" />
                                                        </StateNavLink>

                                                        <a className="button button-default button-icon"
                                                            onClick={() => deleteOffice(office)}>
                                                            <em className="mdi mdi-delete icon-start" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>

                                            {showCollapsible[office.id] && (                                                        
                                                <tr className="dim">
                                                    <td className="paddless" colSpan={6}>
                                                        <div className="card-title">Openingstijden</div>

                                                        {Object.keys(weekDays)?.map((weekDayKey) => (
                                                            <div
                                                                style={{
                                                                    display:
                                                                        !office.scheduleByDay[weekDayKey]?.start_time &&
                                                                        !office.scheduleByDay[weekDayKey]?.end_time
                                                                            ? 'none'
                                                                            : undefined,
                                                                }}
                                                                className="card-block card-block-listing card-block-listing-inline card-block-listing-variant card-block-listing-no-pad"
                                                                key={weekDayKey}>
                                                                <div className="card-block-listing-label">{weekDays[weekDayKey]}</div>
                                                                {office.scheduleByDay[weekDayKey]?.start_time || 'Geen data'}
                                                                {' - '}
                                                                {office.scheduleByDay[weekDayKey]?.end_time || 'Geen data'}
                                                            </div>
                                                        ))}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>    
            )}

            {!offices?.length && (
                <EmptyCard
                    description={'Je hebt momenteel geen vestigingen.'}
                    button={{
                        text: 'Vestiging toevoegen',
                        to: getStateRouteUrl('offices-create', { organizationId: activeOrganization.id }),
                    }}
                />
            )}
        </>
    );
}
