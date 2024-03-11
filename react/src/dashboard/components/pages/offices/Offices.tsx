import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import useFilter from '../../../hooks/useFilter';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { hasPermission } from '../../../helpers/utils';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Office from '../../../props/models/Office';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useOpenModal from '../../../hooks/useOpenModal';
import useOfficeService from '../../../services/OfficeService';
import OfficeSchedule from '../../../props/models/OfficeSchedule';
import ModalNotification from '../../modals/ModalNotification';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useSetProgress from '../../../hooks/useSetProgress';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';

interface OfficeLocal extends Office {
    scheduleByDay: { [key: string]: OfficeSchedule };
}

export default function Offices() {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();
    const navigate = useNavigate();

    const officeService = useOfficeService();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();

    const [weekDays] = useState(officeService.scheduleWeekDays());
    const [offices, setOffices] = useState<Array<OfficeLocal>>(null);

    const filter = useFilter({
        q: '',
        per_page: 100,
    });

    const fetchOffices = useCallback(() => {
        setProgress(0);

        officeService
            .list(activeOrganization.id, filter.activeValues)
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
    }, [setProgress, officeService, activeOrganization.id, filter.activeValues]);

    const confirmDelete = useCallback(
        (office) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    title={t('offices.confirm_delete.title')}
                    description={t('offices.confirm_delete.description')}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            officeService
                                .destroy(office.organization_id, office.id)
                                .then(() => {
                                    fetchOffices();
                                    pushSuccess('Vestiging is verwijderd.');
                                })
                                .catch((err: ResponseError) => pushDanger(err.data.message));
                        },
                    }}
                    buttonCancel={{
                        onClick: () => modal.close(),
                    }}
                />
            ));
        },
        [fetchOffices, officeService, openModal, pushDanger, pushSuccess, t],
    );

    const confirmHasEmployees = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={t('offices.confirm_has_employees.title')}
                description_text={t('offices.confirm_has_employees.description')}
                buttonCancel={{
                    text: t('offices.confirm_has_employees.buttons.cancel'),
                    onClick: modal.close,
                }}
                buttonSubmit={{
                    type: 'primary',
                    text: t('offices.confirm_has_employees.buttons.confirm'),
                    onClick: () => {
                        modal.close();
                        navigate(getStateRouteUrl('employees', { organizationId: activeOrganization.id }));
                    },
                }}
            />
        ));
    }, [activeOrganization.id, navigate, openModal, t]);

    const deleteOffice = useCallback(
        (office: Office) => {
            if (!office.employees_count) {
                return confirmDelete(office);
            }

            return confirmHasEmployees();
        },
        [confirmDelete, confirmHasEmployees],
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
                <div className="card card-office-settings">
                    <div className="card-header">
                        <div className="flex-row">
                            <div className="flex-col flex-grow">
                                <div className="card-title">
                                    {t('offices.labels.offices')} ({offices?.length})
                                </div>
                            </div>

                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <StateNavLink
                                        name={'offices-create'}
                                        params={{ organizationId: activeOrganization.id }}
                                        className="button button-primary">
                                        <em className="mdi mdi-plus-circle icon-start" />
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
                </div>
            )}

            {offices?.map((office) => (
                <div className="card" key={office.id}>
                    <div className="card-section">
                        <div className="card-section-actions">
                            <NavLink
                                className="button button-default"
                                to={getStateRouteUrl('offices-edit', {
                                    id: office.id,
                                    organizationId: office.organization_id,
                                })}>
                                <em className="mdi mdi-pen icon-start" />
                                {t('offices.buttons.adjust')}
                            </NavLink>
                            {offices.length > 1 && (
                                <a className="button button-default" onClick={() => deleteOffice(office)}>
                                    <em className="mdi mdi-delete icon-start" />
                                    {t('offices.buttons.delete')}
                                </a>
                            )}
                            {office.lat && office.lon && (
                                <a
                                    className="button button-primary"
                                    href={`https://www.google.com/maps/place/${office.lat},${office.lon}`}
                                    rel="noreferrer"
                                    target="_blank">
                                    <em className="mdi mdi-map-marker icon-start" />
                                    {t('offices.buttons.map')}
                                </a>
                            )}
                        </div>

                        <div className="card-block card-block-provider">
                            <div className="provider-img">
                                <img
                                    src={
                                        office.photo?.sizes.thumbnail ||
                                        assetUrl('/assets/img/placeholders/office-thumbnail.png')
                                    }
                                    alt={''}
                                />
                            </div>
                            <div className="provider-details">
                                <NavLink
                                    className="provider-title"
                                    to={getStateRouteUrl('offices-edit', {
                                        id: office.id,
                                        organizationId: office.organization_id,
                                    })}>
                                    {office.address}
                                </NavLink>
                                <div className="provider-branch-name">{office.branch_name || 'Geen naam'}</div>
                            </div>
                        </div>

                        <div className="card-block card-block-listing card-block-listing-inline">
                            <div className="card-block-listing-label">{t('offices.labels.phone')}</div>
                            {office.phone ? (
                                <strong>{office.phone}</strong>
                            ) : (
                                <span className="text-muted">{t('offices.labels.none')}</span>
                            )}
                        </div>

                        <div className="card-block card-block-listing card-block-listing-inline">
                            <div className="card-block-listing-label">{t('offices.labels.branch_number')}</div>
                            {office.phone ? (
                                <strong>{office.branch_number}</strong>
                            ) : (
                                <span className="text-muted">{t('offices.labels.none')}</span>
                            )}
                        </div>

                        <div className="card-block card-block-listing card-block-listing-inline">
                            <div className="card-block-listing-label">{t('offices.labels.branch_id')}</div>
                            {office.phone ? (
                                <strong>{office.branch_id}</strong>
                            ) : (
                                <span className="text-muted">{t('offices.labels.none')}</span>
                            )}
                        </div>
                    </div>

                    {office.schedule.length != 0 && (
                        <div className="card-section card-section-primary">
                            <div className="card-block card-block-schedule">
                                <div className="row">
                                    <div className="col col-xs-12">
                                        <div className="card-block-schedule-title">{t('offices.labels.hours')}</div>
                                    </div>
                                    <div className="col col-xs-12">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

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
