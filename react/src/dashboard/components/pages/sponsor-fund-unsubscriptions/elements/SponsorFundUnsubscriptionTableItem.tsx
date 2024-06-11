import React, { useState } from 'react';
import { strLimit } from '../../../../helpers/string';
import Organization from '../../../../props/models/Organization';
import ClickOutside from '../../../elements/click-outside/ClickOutside';
import FundProviderUnsubscribe from '../../../../props/models/FundProviderUnsubscribe';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { useNavigateState } from '../../../../modules/state_router/Router';

export default function SponsorFundUnsubscriptionTableItem({
    organization,
    unsubscription,
    noteTooltip,
    setNoteTooltip,
}: {
    organization: Organization;
    unsubscription: FundProviderUnsubscribe;
    noteTooltip?: number;
    setNoteTooltip: (item: number) => void;
}) {
    const assetUrl = useAssetUrl();
    const navigateState = useNavigateState();

    const [stateClasses] = useState({
        approved: 'success',
        pending: 'warning',
        overdue: 'danger',
        canceled: 'default',
    });

    return (
        <tr
            key={unsubscription.fund_provider.organization.id}
            className={'cursor-pointer'}
            onClick={() =>
                navigateState('sponsor-provider-organization', {
                    organizationId: organization.id,
                    id: unsubscription.fund_provider.organization.id,
                })
            }>
            <td>
                <div className="td-entity-main">
                    <div className="td-entity-main-media">
                        <img
                            className="td-media td-media-sm td-media-round"
                            src={
                                unsubscription.fund_provider.organization.logo?.sizes.thumbnail ||
                                assetUrl('/assets/img/placeholders/fund-thumbnail.png')
                            }
                            alt={''}
                        />
                    </div>

                    <div className="td-entity-main-content">
                        <div
                            className="text-strong text-primary"
                            title={unsubscription.fund_provider.organization.name || '-'}>
                            {strLimit(unsubscription.fund_provider.organization.name, 32)}
                        </div>
                    </div>
                </div>
            </td>

            <td title={unsubscription.fund_provider.fund.name || '-'}>
                {strLimit(unsubscription.fund_provider.fund.name, 25)}
            </td>

            <td className="nowrap">
                <div className="text-strong text-md text-muted-dark">{unsubscription.created_at_locale}</div>
            </td>

            <td title={unsubscription.note}>
                <div className="flex">
                    <span>{strLimit(unsubscription.note, 25)}</span>
                    &nbsp;
                    {unsubscription.note.length >= 25 && (
                        <em
                            className={`td-icon mdi mdi-information block block-tooltip-details ${
                                noteTooltip === unsubscription.fund_provider.organization.id ? 'active' : ''
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setNoteTooltip(unsubscription.fund_provider.organization.id);
                            }}>
                            {noteTooltip === unsubscription.fund_provider.organization.id && (
                                <ClickOutside
                                    className="tooltip-content"
                                    onClickOutside={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setNoteTooltip(null);
                                    }}>
                                    <div title={unsubscription.note} className="tooltip-text">
                                        {strLimit(unsubscription.note, 512)}
                                    </div>
                                </ClickOutside>
                            )}
                        </em>
                    )}
                </div>
            </td>

            <td className="nowrap">
                <div className={`tag tag-sm tag-${stateClasses[unsubscription.state] || 'default'}`}>
                    {unsubscription.state_locale}
                </div>
            </td>

            <td className="nowrap text-right">
                <div className={unsubscription.is_expired ? 'text-danger' : 'text-muted-dark'}>
                    {unsubscription.is_expired && <em className="mdi mdi-alert" />}
                    &nbsp;
                    <strong className="text-strong text-md">{unsubscription.unsubscribe_at_locale}</strong>
                </div>
            </td>
        </tr>
    );
}
