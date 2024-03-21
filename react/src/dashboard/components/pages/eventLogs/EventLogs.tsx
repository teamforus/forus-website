import React from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import EventLogsTable from './elements/EventLogsTable';

export default function EventLogs() {
    const activeOrganization = useActiveOrganization();

    return <EventLogsTable loggable={['fund', 'bank_connection', 'employees']} organization={activeOrganization} />;
}
