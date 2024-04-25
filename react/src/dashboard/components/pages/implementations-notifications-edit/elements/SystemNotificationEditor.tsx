import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToggleControl from '../../../elements/forms/controls/ToggleControl';
import useImplementationNotificationService from '../../../../services/ImplementationNotificationService';
import { keyBy } from 'lodash';
import Implementation from '../../../../props/models/Implementation';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import SystemNotification from '../../../../props/models/SystemNotification';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';
import SystemNotificationTemplateEditor from './SystemNotificationTemplateEditor';
import Fund from '../../../../props/models/Fund';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

export default function SystemNotificationEditor({
    funds,
    implementation,
    organization,
    notification,
    onChange,
}: {
    funds: Array<Fund>;
    implementation: Implementation;
    organization: Organization;
    notification: SystemNotification;
    onChange: (notification: SystemNotification) => void;
}) {
    const { t } = useTranslation();

    const pushSuccess = usePushSuccess();

    const implementationNotificationsService = useImplementationNotificationService();

    const [fund, setFund] = useState(null);
    const [state, setState] = useState(null);
    const [templates, setTemplates] = useState(null);

    const [notificationToggleLabel] = useState({
        disabled: `Uitgezet, alle kanalen zijn uitgezet.`,
        enabled_all: 'Aangezet, alle kanalen zijn aangezet.',
        enabled_partial: 'Aangezet, sommige kanalen staan afzonderlijk uit.',
    });

    const toggleSwitched = useCallback(() => {
        const data = { enable_all: !notification.enable_all };
        const hasDisabledChannels = implementationNotificationsService.notificationHasDisabledChannels(notification);

        const message = data.enable_all
            ? hasDisabledChannels
                ? notificationToggleLabel.enabled_partial
                : notificationToggleLabel.enabled_all
            : notificationToggleLabel.disabled;

        implementationNotificationsService
            .update(organization.id, implementation.id, notification.id, data)
            .then((res) => {
                onChange(res.data.data);
                pushSuccess('Opgeslagen', message);
            });
    }, [
        onChange,
        pushSuccess,
        notification,
        organization.id,
        implementation.id,
        implementationNotificationsService,
        notificationToggleLabel.disabled,
        notificationToggleLabel.enabled_all,
        notificationToggleLabel.enabled_partial,
    ]);

    const getTemplatesByFund = useCallback(() => {
        return keyBy(
            implementationNotificationsService.templatesToFront(
                notification.templates.filter((template) => {
                    return template.fund_id == fund?.id;
                }),
            ),
            'type',
        );
    }, [fund?.id, implementationNotificationsService, notification.templates]);

    const getTemplatesByImplementation = useCallback(() => {
        return keyBy(
            implementationNotificationsService.templatesToFront(
                notification.templates.filter((template) => {
                    return !template.fund_id;
                }),
            ),
            'type',
        );
    }, [implementationNotificationsService, notification.templates]);

    const getDefaultTemplates = useCallback(() => {
        return keyBy(implementationNotificationsService.templatesToFront(notification.templates_default), 'type');
    }, [implementationNotificationsService, notification.templates_default]);

    const updateTemplates = useCallback(() => {
        const channels: {
            mail?: boolean;
            push?: boolean;
            database?: boolean;
        } = notification.channels.reduce((obj, channel) => ({ ...obj, [channel]: true }), {});

        const templatesDefault = getDefaultTemplates();
        const templatesImplementation = getTemplatesByImplementation();
        const templatesFund = fund?.id ? getTemplatesByFund() : null;

        const templates = {
            mail: channels.mail ? templatesFund?.mail || templatesImplementation?.mail || templatesDefault.mail : null,
            push: channels.push ? templatesFund?.push || templatesImplementation?.push || templatesDefault.push : null,
            database: channels.database
                ? templatesFund?.database || templatesImplementation.database || templatesDefault.database
                : null,
        };

        setTemplates(templates);
    }, [fund, getDefaultTemplates, getTemplatesByFund, getTemplatesByImplementation, notification.channels]);

    useEffect(() => updateTemplates(), [updateTemplates]);

    useEffect(
        () => setState(implementationNotificationsService.notificationToStateLabel(notification)),
        [implementationNotificationsService, notification],
    );

    if (!templates || !notification) {
        return <LoadingCard />;
    }

    return (
        <div className="block block-system-notification-editor">
            <div className="card card-collapsed">
                <div className={`card-header ${notification.enable_all ? '' : 'card-header-danger'}`}>
                    <div className="flex flex-row">
                        <div className="flex flex-pad flex-grow">
                            <div className={`card-title ${notification.enable_all ? '' : 'text-muted-dark'}`}>
                                <em className="mdi mdi-web" />
                                <span>{notification.title}</span>
                                <span>{t(`system_notifications.notifications.${notification.key}.title`)}</span>
                            </div>
                        </div>

                        {notification.editable && (
                            <div className="flex flex-pad flex-vertical flex-center">
                                <ToggleControl
                                    id={'enable_all'}
                                    className="form-toggle-danger"
                                    checked={notification.enable_all}
                                    title={notification.enable_all ? '' : notificationToggleLabel.disabled}
                                    onChange={() => toggleSwitched()}
                                    labelRight={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {funds.length > 0 && (
                    <div className={`card-section ${notification.enable_all ? '' : 'card-section-danger'}`}>
                        <div className="card-block card-block-keyvalue">
                            <div className="keyvalue-item flex">
                                <div className="keyvalue-key text-right flex flex-vertical flex-center">
                                    <div className="text-strong">Kies een fonds</div>
                                </div>
                                <div className="keyvalue-value">
                                    <div className="col col-xs-12 col-lg-8">
                                        <SelectControl
                                            className="form-control"
                                            placeholder="Kies een fonds"
                                            propKey={'id'}
                                            options={[{ id: null, name: 'Alle fondsen' }, ...funds]}
                                            value={fund?.id}
                                            onChange={(value?: number) =>
                                                setFund(funds.filter((item) => item.id === value)[0])
                                            }
                                            optionsComponent={SelectControlOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`card-section ${notification.enable_all ? '' : 'card-section-danger'}`}>
                    <div className="card-block card-block-keyvalue">
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Status</div>
                            </div>
                            <div className="keyvalue-value">
                                <div
                                    className={`transition-background label label-round ${
                                        {
                                            active: 'label-success',
                                            inactive: 'label-danger',
                                            active_partly: 'label-warning',
                                        }[state.state]
                                    }`}>
                                    {state.stateLabel}
                                </div>
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Beschrijving</div>
                            </div>
                            <div className="keyvalue-value">
                                {t(`system_notifications.notifications.${notification.key}.description`)}
                            </div>
                        </div>
                        <div className="keyvalue-item">
                            <div className="keyvalue-key text-right">
                                <div className="text-strong">Aanspreekvorm</div>
                            </div>
                            <div className="keyvalue-value">
                                {implementation.informal_communication ? 'Je/jouw' : 'U/uw'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SystemNotificationTemplateEditor
                type="mail"
                fund={fund}
                implementation={implementation}
                organization={organization}
                notification={notification}
                template={templates.mail}
                onChange={(data) => onChange({ ...notification, ...data })}
            />

            {templates.push && (
                <SystemNotificationTemplateEditor
                    type="push"
                    implementation={implementation}
                    organization={organization}
                    fund={fund}
                    notification={notification}
                    template={templates.push}
                    onChange={(data) => onChange({ ...notification, ...data })}
                />
            )}

            {templates.database && (
                <SystemNotificationTemplateEditor
                    type="database"
                    implementation={implementation}
                    organization={organization}
                    fund={fund}
                    notification={notification}
                    template={templates.database}
                    onChange={(data) => onChange({ ...notification, ...data })}
                />
            )}
        </div>
    );
}
