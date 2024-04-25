import React, { useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import useImplementationNotificationService from '../../../services/ImplementationNotificationService';
import SystemNotification from '../../../props/models/SystemNotification';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SystemNotificationEditor from './elements/SystemNotificationEditor';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';

export default function ImplementationsNotificationsEdit() {
    const { id, implementationId } = useParams();
    const { t } = useTranslation();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const implementationService = useImplementationService();
    const implementationNotificationsService = useImplementationNotificationService();

    const [implementation, setImplementation] = useState<Implementation>(null);
    const [notification, setNotification] = useState<SystemNotification>(null);
    const [funds, setFunds] = useState<Array<Fund>>(null);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(implementationId))
            .then((res) => setImplementation(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [implementationService, activeOrganization.id, implementationId, pushDanger]);

    const fetchNotification = useCallback(() => {
        implementationNotificationsService
            .read(activeOrganization.id, parseInt(implementationId), parseInt(id))
            .then((res) => setNotification(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [implementationNotificationsService, activeOrganization.id, implementationId, id, pushDanger]);

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, {
                implementation_id: parseInt(implementationId),
                with_archived: 1,
                stats: 'min',
            })
            .then((res) => setFunds(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [fundService, activeOrganization.id, implementationId, pushDanger]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);
    useEffect(() => fetchNotification(), [fetchNotification]);
    useEffect(() => fetchFunds(), [fetchFunds]);

    if (!implementation || !notification || !funds) {
        return <LoadingCard />;
    }

    return (
        <div className="form">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'implementation-notifications'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    Bijbetalingen
                </StateNavLink>
                <div className="breadcrumb-item active">
                    {t(`system_notifications.notifications.${notification.key}.title`)}
                </div>
            </div>

            <SystemNotificationEditor
                funds={funds}
                implementation={implementation}
                organization={activeOrganization}
                notification={notification}
                onChange={(notification) => setNotification(notification)}
            />
        </div>
    );
}
