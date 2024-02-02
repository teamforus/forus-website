import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
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
                <div className="card-heading">
                    {t('offices.labels.offices')} ({offices?.length})
                    {hasPermission(activeOrganization, 'manage_offices') && (
                        <NavLink
                            className="link"
                            id="create_office"
                            to={getStateRouteUrl('offices-create', { organizationId: activeOrganization.id })}>
                            <em className="mdi mdi-plus-circle" />
                            {t('offices.buttons.add')}
                        </NavLink>
                    )}
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
                                <div className="card-block card-block-listing card-block-listing-inline card-block-listing-variant">
                                    <div className="card-block-listing-label">{t('offices.labels.phone')}</div>
                                    {office.phone ? (
                                        <span className="text-primary-light">{office.phone}</span>
                                    ) : (
                                        <span className="text-muted">{t('offices.labels.none')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {office.schedule.length != 0 && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-xs-12">
                                    <small>{t('offices.labels.hours')}</small>
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
