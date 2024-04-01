import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import { useTranslation } from 'react-i18next';
import Organization from '../../../../../props/models/Organization';
import { useOrganizationService } from '../../../../../services/OrganizationService';

export default function SignUpStepOrganizationSelect({
    panel_type,
    onOrganizationAdd,
    onOrganizationSelect,
    onStepBack,
}: {
    panel_type: 'sponsor' | 'provider' | 'validator';
    onOrganizationAdd: () => void;
    onOrganizationSelect: (organization: Organization) => void;
    onStepBack: () => void;
}) {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();

    const organizationService = useOrganizationService();

    const [organizationsList, setOrganizationsList] = useState<Array<Organization>>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization>(null);

    const loadOrganizations = useCallback(() => {
        return new Promise<Array<Organization>>((resolve, reject) =>
            organizationService.list().then((res) => {
                setOrganizationsList(res.data.data);
                resolve(res.data.data);
            }, reject),
        );
    }, [organizationService]);

    const selectOrganization = useCallback(
        (organization: Organization) => {
            setSelectedOrganization(organization);
            onOrganizationSelect(organization);
        },
        [onOrganizationSelect],
    );

    const addOrganization = useCallback(() => {
        onOrganizationAdd();
    }, [onOrganizationAdd]);

    const back = useCallback(() => {
        onStepBack();
    }, [onStepBack]);

    useEffect(() => {
        loadOrganizations().then((organizations) => {
            if (organizations.length == 0) {
                onOrganizationAdd();
            }
        });
    }, [loadOrganizations, onOrganizationAdd]);

    return (
        <Fragment>
            <div className="sign_up-pane">
                <div className="sign_up-pane-header">
                    {t(`sign_up_${panel_type}.header.title_step_${panel_type == 'sponsor' ? 3 : 4}`)}
                </div>

                <div className="sign_up-pane-body">
                    <div className="sign_up-pane-text">
                        {t(`sign_up_${panel_type}.header.subtitle_step_${panel_type == 'sponsor' ? 3 : 4}`)}
                    </div>
                    <br />
                    <div className="sign_up-organizations">
                        {organizationsList?.map((organization) => (
                            <div
                                key={organization.id}
                                className={`sign_up-organization ${
                                    organization.id == selectedOrganization?.id ? 'active' : ''
                                }`}
                                onClick={() => selectOrganization(organization)}>
                                <div className="sign_up-organization-logo">
                                    <img
                                        src={
                                            organization.logo?.sizes?.thumbnail ||
                                            assetUrl('./assets/img/organization-no-logo.svg')
                                        }
                                        alt={''}
                                    />
                                </div>
                                <div className="sign_up-organization-title">{organization.name}</div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="button button-primary-outline button-fill visible-sm visible-xs"
                        onClick={addOrganization}>
                        <div className="mdi mdi-plus-circle-outline icon-start" />
                        {t(`sign_up_${panel_type}.buttons.organization_add`)}
                    </div>
                </div>

                <div className="sign_up-pane-body visible-md visible-lg">
                    <div className="button button-primary-outline" onClick={addOrganization}>
                        <div className="mdi mdi-plus-circle-outline icon-start" />
                        {t(`sign_up_${panel_type}.buttons.organization_add`)}
                    </div>
                </div>

                <div className="sign_up-pane-footer">
                    <div className="row">
                        <div className="col col-lg-6 text-left">
                            <div className="button button-text button-text-padless" onClick={back}>
                                <em className="mdi mdi-chevron-left icon-lefts" />
                                {t(`sign_up_${panel_type}.buttons.back`)}
                            </div>
                        </div>
                        <div className="col col-lg-6 text-right" />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
