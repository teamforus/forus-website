import React from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useFilter from '../../../hooks/useFilter';
import EventLogsTable from './elements/EventLogsTable';

export default function EventLogs() {
    const activeOrganization = useActiveOrganization();

    const filter = useFilter(
        {
            q: '',
            loggable: ['fund', 'bank_connection', 'employees'],
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        ['q'],
    );

    return <EventLogsTable filter={filter} organization={activeOrganization} />;
}
