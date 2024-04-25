import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import Tooltip from '../../elements/tooltip/Tooltip';
import { groupBy } from 'lodash';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import SystemNotification from '../../../props/models/SystemNotification';

type NotificationGroup = {
    group: string;
    groupLabel: string;
    notifications: Array<
        SystemNotification & {
            title: string;
            description: string;
            state: {
                state: string;
                stateLabel: string;
            };
            icons: Array<{
                icon: string;
                color: string;
                tooltip: {
                    heading: string;
                    text: string;
                };
            }>;
        }
    >;
};

export default function ImplementationsNotifications() {
    const { t } = useTranslation();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [implementation, setImplementation] = useState<Implementation>(null);
    const [implementations, setImplementations] = useState<PaginationData<Implementation>>(null);
    const [notifications, setNotifications] = useState<PaginationData<SystemNotification>>(null);
    const [notificationGroups, setNotificationGroups] = useState<Array<NotificationGroup>>(null);

    const [groupLabels] = useState({
        requester_fund_request: 'Deelnemers aanvraag en beoordeling',
        requester_vouchers: 'Deelnemers tegoeden',
        requester_transactions: 'Deelnemers reserveringen en transacties',
        provider_fund_requests: 'Aanbieder aanvraag en beoordeling',
        requester_reimbursements: 'Declaraties',
        provider_voucher_and_transactions: 'Aanbieder reserveringen en transacties',
        sponsor: 'Sponsor',
        other: 'Overig',
    });

    const notificationIconColor = useCallback((notification: SystemNotification, type: string) => {
        const templateChanged = notification.templates.filter((item) => item.type == type).length > 0;

        if (!notification.channels.includes(type)) {
            return 'text-muted-light';
        }

        if (!notification.enable_all || !notification['enable_' + type]) {
            return 'text-danger-dark';
        }

        return templateChanged ? 'text-primary-dark' : 'text-success-dark';
    }, []);

    const notificationIcon = useCallback((notification: SystemNotification, type: string) => {
        const iconOff = {
            mail: 'email-off-outline',
            push: 'cellphone-off',
            database: 'bell-off-outline',
        }[type];

        const iconsOn = {
            mail: 'email',
            push: 'cellphone',
            database: 'bell',
        }[type];

        if (!notification.channels.includes(type) || !notification.enable_all || !notification['enable_' + type]) {
            return iconOff;
        }

        return iconsOn;
    }, []);

    const notificationIconTooltip = useCallback(
        (notification: SystemNotification, type: string) => {
            const heading = t(`system_notifications.types.${type}.title`);
            const templateChanged = notification.templates.filter((item) => item.type == type).length > 0;

            if (!notification.channels.includes(type)) {
                return { heading, text: t(`system_notifications.tooltips.channel_not_available`) };
            }

            if (!notification.enable_all || !notification['enable_' + type]) {
                return { heading, text: t(`system_notifications.tooltips.disabled_by_you`) };
            }

            return {
                heading,
                text: t('system_notifications.tooltips.' + (templateChanged ? 'enabled_edited' : 'enabled_default')),
            };
        },
        [t],
    );

    const fetchImplementationNotifications = useCallback(() => {
        if (implementation) {
            implementationNotificationsService
                .list(activeOrganization.id, implementation.id)
                .then((res) => setNotifications(res.data))
                .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
        }
    }, [implementation, implementationNotificationsService, activeOrganization.id, pushDanger]);

    const selectImplementation = useCallback(
        (item: Implementation) => {
            setImplementation(item);
            fetchImplementationNotifications();
        },
        [fetchImplementationNotifications],
    );

    const mapNotifications = useCallback(
        (notifications: Array<SystemNotification>) => {
            const groupOrder = Object.keys(groupLabels);

            const list = notifications.map((notification) => {
                const title = t('system_notifications.notifications.' + notification.key + '.title');
                const description = t('system_notifications.notifications.' + notification.key + '.description');
                const state = implementationNotificationsService.notificationToStateLabel(notification);

                const icons = ['mail', 'push', 'database'].map((type) => ({
                    icon: notificationIcon(notification, type),
                    color: notificationIconColor(notification, type),
                    tooltip: notificationIconTooltip(notification, type),
                }));

                return { ...notification, state, title, description, icons };
            });

            const grouped = groupBy(list, 'group');

            const groups = Object.keys(grouped)
                .map((group) => ({ group, groupLabel: groupLabels[group], notifications: grouped[group] }))
                .map((item) => ({ ...item, notifications: item.notifications.sort((a, b) => a.order - b.order) }))
                .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));

            setNotificationGroups(groups);
        },
        [
            t,
            groupLabels,
            notificationIcon,
            notificationIconColor,
            notificationIconTooltip,
            implementationNotificationsService,
        ],
    );

    const fetchImplementations = useCallback(() => {
        implementationService
            .list(activeOrganization.id)
            .then((res) => setImplementations(res.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [implementationService, activeOrganization.id, pushDanger]);

    useEffect(() => fetchImplementations(), [fetchImplementations]);

    useEffect(() => {
        if (implementations && implementations.meta.total > 0) {
            selectImplementation(implementations.data[0]);
        }
    }, [implementations, selectImplementation]);

    useEffect(() => {
        if (notifications) {
            mapNotifications(notifications.data);
        }
    }, [mapNotifications, notifications]);

    if (!implementations || !notificationGroups) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {implementations.data.length > 1 && (
                <Fragment>
                    <div className="card-heading">{t('system_notifications.header.title')}</div>

                    <div className="block block-choose-organization">
                        {implementations.data.map((item) => (
                            <div key={item.id} className="organization-item" onClick={() => selectImplementation(item)}>
                                <div
                                    className={`organization-item-inner ${
                                        implementation.id == item.id ? 'active' : ''
                                    }`}>
                                    <div className="organization-logo">
                                        <img
                                            src={item.logo || './assets/img/placeholders/organization-thumbnail.png'}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="organization-name">{item.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Fragment>
            )}

            {implementations.meta.total > 0 && (
                <div className="card-heading">
                    <div className="flex flex-horizontal">
                        <div className="flex flex-grow flex-vertical flex-center">
                            <div>
                                Systeemberichten
                                <Tooltip text={t('system_notifications.header.tooltip')} />
                            </div>
                        </div>
                        <div className="flex">
                            <div className="button-group">
                                {activeOrganization.allow_custom_fund_notifications && (
                                    <StateNavLink
                                        name={'implementation-notifications-send'}
                                        params={{
                                            organizationId: activeOrganization.id,
                                            id: implementation.id,
                                        }}
                                        className="button button-default">
                                        <em className="mdi mdi-email-outline icon-start" />
                                        Verstuur een aangepast bericht
                                    </StateNavLink>
                                )}

                                <StateNavLink
                                    name={'implementation-notifications-branding'}
                                    params={{
                                        organizationId: activeOrganization.id,
                                        id: implementation.id,
                                    }}
                                    className="button button-primary">
                                    <em className="mdi mdi-cog-outline icon-start" />
                                    Handtekening en huisstijl
                                </StateNavLink>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {notificationGroups.map((notificationGroup, index) => (
                <div className="card card-collapsed" key={index}>
                    <div className="card-header">
                        <div className="card-title">{notificationGroup.groupLabel}</div>
                    </div>
                    <div className="card-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th>Omschrijving</th>
                                            <th className="nowrap">Kanalen</th>
                                            <th className="nowrap">Status</th>
                                            <th className="nowrap text-right">Bekijken</th>
                                        </tr>
                                        {notificationGroup.notifications.map((notification) => (
                                            <tr key={notification.id}>
                                                <td className="td-grow">
                                                    <div>
                                                        {notification.editable ? (
                                                            <em className="mdi mdi-pencil-outline text-muted-dark">
                                                                {' '}
                                                            </em>
                                                        ) : (
                                                            <em className="mdi mdi-lock-outline text-muted-dark"> </em>
                                                        )}
                                                        <span>{notification.title}</span>
                                                    </div>
                                                    <small>{notification.description}</small>
                                                </td>
                                                <td className="nowrap">
                                                    <div className="td-icons">
                                                        {notification.icons.map((icon, index) => (
                                                            <em
                                                                key={index}
                                                                className={`block block-tooltip-details block-tooltip-hover mdi mdi-${icon.icon} ${icon.color}`}>
                                                                <div className="tooltip-content tooltip-content-fit tooltip-content-ghost">
                                                                    <div className="tooltip-heading text-left">
                                                                        {icon.tooltip.heading}
                                                                    </div>
                                                                    <div className="tooltip-text text-left">
                                                                        {icon.tooltip.text}
                                                                    </div>
                                                                </div>
                                                            </em>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="nowrap">
                                                    <div
                                                        className={`label label-round nowrap ${
                                                            {
                                                                active: 'label-success',
                                                                inactive: 'label-danger',
                                                                active_partly: 'label-warning',
                                                            }[notification.state.state]
                                                        }`}>
                                                        {notification.state.stateLabel}
                                                    </div>
                                                </td>

                                                <td className="nowrap">
                                                    <div className="button-group flex-end">
                                                        <StateNavLink
                                                            name={'implementation-notifications-edit'}
                                                            params={{
                                                                organizationId: activeOrganization.id,
                                                                implementationId: implementation.id,
                                                                id: notification.id,
                                                            }}
                                                            className="button button-default">
                                                            <em className="mdi mdi-eye-outline icon-start" />
                                                            Bekijken
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
                </div>
            ))}

            {implementations?.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">
                            De systeemberichten zijn niet beschikbaar, omdat er geen webshop configuratie is voor deze
                            organisatie.
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
