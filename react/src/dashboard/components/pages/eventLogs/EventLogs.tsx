import React, { useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useFilter from '../../../hooks/useFilter';
import EventLogsTable from './elements/EventLogsTable';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';

export default function EventLogs() {
    const activeOrganization = useActiveOrganization();
    const paginatorService = usePaginatorService();
    const [paginatorKey] = useState('event_logs');

    const filter = useFilter(
        {
            q: '',
            loggable: ['fund', 'bank_connection', 'employees'],
            per_page: paginatorService.getPerPage(paginatorKey),
            order_by: 'created_at',
            order_dir: 'desc',
        },
        ['q'],
    );

    return <EventLogsTable filter={filter} organization={activeOrganization} />;
}
