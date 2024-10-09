import React, { Fragment, useMemo, useState } from 'react';
import classNames from 'classnames';
import FundRequest from '../../../props/models/FundRequest';

export default function FundRequestStateLabel({ fundRequest }: { fundRequest: FundRequest }) {
    const [stateLabels] = useState({
        pending: { label: 'primary-light', icon: 'circle-outline' },
        declined: { label: 'danger', icon: 'circle-off-outline' },
        approved: { label: 'success', icon: 'circle-slice-8' },
        approved_partly: { label: 'success', icon: 'circle-slice-4' },
        disregarded: { label: 'default', icon: 'circle-outline' },
        assigned: { label: 'default', icon: 'circle-outline' },
        clarification_requested: { label: 'warning', icon: 'circle-outline' },
    });

    const hasPendingClarifications = useMemo(() => {
        return fundRequest.records
            .map((record) => record.clarifications)
            .filter((clarifications) => clarifications.length).length;
    }, [fundRequest]);

    const localState = useMemo(() => {
        if (fundRequest.state == 'pending' && fundRequest.employee) {
            return hasPendingClarifications
                ? { key: 'clarification_requested', label: 'Aanvullende informatie benodigd' }
                : { key: 'assigned', label: 'In behandeling' };
        }

        return { key: fundRequest.state, label: fundRequest.employee ? fundRequest.state_locale : 'Beoordelaar nodig' };
    }, [fundRequest, hasPendingClarifications]);

    return (
        <Fragment>
            {fundRequest.state == 'pending' && fundRequest.employee ? (
                <Fragment>
                    {hasPendingClarifications ? (
                        <div
                            className={classNames(
                                'label',
                                'label-tag',
                                'label-round',
                                `label-${stateLabels.clarification_requested?.label}`,
                            )}>
                            <em
                                className={classNames(
                                    'mdi',
                                    `mdi-${stateLabels.clarification_requested?.icon}`,
                                    `icon-start`,
                                )}
                            />
                            Aanvullende informatie benodigd
                        </div>
                    ) : (
                        <div className="label label-tag label-round label-primary">
                            <em className="mdi mdi-circle-outline icon-start" />
                            In behandeling
                        </div>
                    )}
                </Fragment>
            ) : (
                <div
                    className={classNames(
                        'label',
                        'label-tag',
                        'label-round',
                        `label-${stateLabels[localState.key]?.label}`,
                    )}>
                    <em className={classNames('mdi', `mdi-${stateLabels[localState.key]?.icon}`, `icon-start`)} />
                    {localState.label}
                </div>
            )}
        </Fragment>
    );
}
