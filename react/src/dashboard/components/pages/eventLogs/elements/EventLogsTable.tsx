import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSetProgress from '../../../../hooks/useSetProgress';
import { PaginationData } from '../../../../props/ApiResponses';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ThSortable from '../../../elements/tables/ThSortable';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FilterItemToggle from '../../../elements/tables/elements/FilterItemToggle';
import CardHeaderFilter from '../../../elements/tables/elements/CardHeaderFilter';
import { useEventLogService } from '../../../../services/EventLogService';
import EventLog from '../../../../props/models/EventLog';
import { hasPermission } from '../../../../helpers/utils';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import Organization from '../../../../props/models/Organization';
import FilterScope from '../../../../types/FilterScope';
import FilterModel from '../../../../types/FilterModel';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import { strLimit } from '../../../../helpers/string';

export default function EventLogsTable({
    filter,
    organization,
    title,
    hideFilterForm,
    hideEntity,
}: {
    filter: FilterScope<FilterModel & { loggable: Array<string> }>;
    organization: Organization;
    title?: string;
    hideFilterForm?: boolean;
    hideEntity?: boolean;
}) {
    const { t } = useTranslation();

    const setProgress = useSetProgress();
    const appConfigs = useAppConfigs();

    const eventLogService = useEventLogService();
    const [logs, setLogs] = useState<PaginationData<EventLog>>(null);
    const [loggables, setLoggables] = useState([]);
    const [noteTooltip, setNoteTooltip] = useState(null);
    const [paginatorKey] = useState('event_logs');
    const permissionsMap = useMemo(() => appConfigs.event_permissions, [appConfigs?.event_permissions]);
    const baseLoggables = useMemo(
        () => [
            { key: 'fund', title: 'Fonds' },
            { key: 'employees', title: 'Medewerker' },
            { key: 'bank_connection', title: 'Bank integratie' },
            { key: 'voucher', title: 'Vouchers' },
        ],
        [],
    );

    const showNoteTooltip = useCallback((e, log) => {
        e.stopPropagation();
        setNoteTooltip(log.id);
    }, []);

    const hideNoteTooltip = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setNoteTooltip(null);
    }, []);

    const { resetFilters: resetFilters } = filter;

    const selectLoggable = useCallback(
        (key, selected) => {
            const values = filter.activeValues.loggable;
            const index = values.indexOf(key);

            if (index !== -1 && !selected) {
                values.splice(index, 1);
            } else if (selected) {
                values.push(key);
            }

            filter.update({ loggable: values });
        },
        [filter],
    );

    const fetchLogs = useCallback(
        async (query: object) => {
            setProgress(0);

            return eventLogService.list(organization.id, query).finally(() => setProgress(100));
        },
        [organization.id, setProgress, eventLogService],
    );

    useEffect(() => {
        setLoggables(
            baseLoggables.filter((item) => {
                return hasPermission(organization, permissionsMap[item.key]);
            }),
        );
    }, [organization, baseLoggables, permissionsMap]);

    useEffect(() => {
        fetchLogs(filter.activeValues).then((res) => {
            const logs = {
                meta: res.data.meta,
                data: res.data.data.map((item) => ({
                    ...item,
                    note_substr: item.note ? strLimit(item.note, 40) : null,
                })),
            };

            setLogs(logs);
        });
    }, [fetchLogs, filter.activeValues]);

    if (!logs) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex-row">
                    <div className="flex-col flex-grow">
                        <div className="card-title">
                            {title || 'Activiteitenlogboek'} ({logs.meta.total})
                        </div>
                    </div>

                    {!hideFilterForm && (
                        <div className="flex">
                            <div className="block block-inline-filters">
                                {filter.show && (
                                    <div className="button button-text" onClick={() => resetFilters()}>
                                        <em className="mdi mdi-close icon-start" />
                                        Wis filters
                                    </div>
                                )}
                                {!filter.show && (
                                    <div className="form">
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                value={filter.values.q}
                                                onChange={(e) => filter.update({ q: e.target.value })}
                                                placeholder={t('event_logs.labels.search')}
                                            />
                                        </div>
                                    </div>
                                )}

                                <CardHeaderFilter filter={filter}>
                                    <FilterItemToggle label={t('event_logs.labels.search')} show={true}>
                                        <input
                                            className="form-control"
                                            value={filter.values.q}
                                            onChange={(e) => filter.update({ q: e.target.value })}
                                            placeholder={t('event_logs.labels.search')}
                                        />
                                    </FilterItemToggle>

                                    <FilterItemToggle label={t('event_logs.labels.entities')}>
                                        {loggables.map((loggable) => (
                                            <div key={loggable.key}>
                                                <label
                                                    className="checkbox checkbox-narrow"
                                                    htmlFor={'checkbox_' + loggable.key}>
                                                    <input
                                                        onChange={(e) => selectLoggable(loggable.key, e.target.checked)}
                                                        id={'checkbox_' + loggable.key}
                                                        type="checkbox"
                                                        checked={
                                                            filter.activeValues.loggable.indexOf(loggable.key) !== -1
                                                        }
                                                    />
                                                    <div className="checkbox-label">
                                                        <div className="checkbox-box">
                                                            <div className="mdi mdi-check"></div>
                                                        </div>
                                                        {loggable.title}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </FilterItemToggle>
                                </CardHeaderFilter>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {logs.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable label={t('event_logs.labels.date')} />
                                        {!hideEntity && <ThSortable label={t('event_logs.labels.entity')} />}
                                        <ThSortable label={t('event_logs.labels.action')} />
                                        <ThSortable label={t('event_logs.labels.author')} />
                                        <ThSortable label={t('event_logs.labels.note')} />
                                    </tr>
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td>{log.created_at_locale}</td>

                                            {!hideEntity && (
                                                <td
                                                    className="nowrap"
                                                    dangerouslySetInnerHTML={{ __html: log.loggable_locale }}
                                                />
                                            )}

                                            <td dangerouslySetInnerHTML={{ __html: log.event_locale }} />

                                            {log.identity_email ? (
                                                <td>{log.identity_email}</td>
                                            ) : (
                                                <td className="text-muted">Geen e-mailadres bekend</td>
                                            )}

                                            <td>
                                                {log.note && log.note != log.note_substr && (
                                                    <a
                                                        className={`td-icon mdi mdi-information block block-tooltip-details pull-left ${
                                                            noteTooltip === log.id ? 'active' : ''
                                                        }`}
                                                        onClick={(e) => showNoteTooltip(e, log)}>
                                                        {noteTooltip && (
                                                            <ClickOutside
                                                                className="tooltip-content"
                                                                onClickOutside={hideNoteTooltip}>
                                                                <div className="tooltip-text">{log.note}</div>
                                                            </ClickOutside>
                                                        )}
                                                        &nbsp;
                                                    </a>
                                                )}

                                                {log.note ? (
                                                    <div>{log.note_substr}</div>
                                                ) : (
                                                    <div className="text-muted">Geen notitie</div>
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

            {logs.meta.last_page > 1 && (
                <div className="card-section">
                    <Paginator
                        meta={logs.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}

            {logs.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen logboeken gevonden</div>
                    </div>
                </div>
            )}
        </div>
    );
}
