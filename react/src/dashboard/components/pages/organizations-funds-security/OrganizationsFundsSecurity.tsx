import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useFormBuilder from '../../../hooks/useFormBuilder';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import Fund from '../../../props/models/Fund';
import { useParams } from 'react-router-dom';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useFundService } from '../../../services/FundService';
import usePushDanger from '../../../hooks/usePushDanger';
import { ResponseError } from '../../../props/ApiResponses';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useTranslation } from 'react-i18next';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import Auth2FAForm from './elements/Auth2FAForm';
import LoadingCard from '../../elements/loading-card/LoadingCard';

export default function OrganizationsFundsSecurity() {
    const { t } = useTranslation();

    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();

    const [fund, setFund] = useState<Fund>(null);
    const [global2FA, setGlobal2FA] = useState(null);

    const fund_id = parseInt(useParams().fundId);

    const [auth2FARequiredOptions] = useState([
        {
            value: 'global',
            name: 'Gebruik standaard instelling',
        },
        {
            value: 'optional',
            name: 'Optioneel',
        },
        {
            value: 'restrict_features',
            name: '2FA vereisen voor geselecteerde functies',
        },
        {
            value: 'required',
            name: '2FA vereisen om in te loggen',
        },
    ]);

    const form = useFormBuilder<{
        auth_2fa_policy?: 'optional' | 'required' | 'restrict_features' | 'global';
        auth_2fa_remember_ip?: boolean;
        auth_2fa_restrict_emails?: boolean;
        auth_2fa_restrict_auth_sessions?: boolean;
        auth_2fa_restrict_reimbursements?: boolean;
    }>(null, (values) => {
        setProgress(0);

        fundService
            .update(activeOrganization.id, fund_id, values)
            .then(() => {
                pushSuccess('Opgeslagen!');
            })
            .catch((err: ResponseError) => {
                pushDanger('Mislukt!', err.data?.message || 'Onbekende foutmelding.');
                form.setErrors(err.data.errors);
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    const { update: updateForm } = form;

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .read(activeOrganization.id, fund_id)
            .then((res) => {
                setFund(res.data.data);
                setGlobal2FA(res.data.data?.organization_funds_2fa);
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, fundService, fund_id, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        if (fund) {
            updateForm({
                auth_2fa_policy: fund.auth_2fa_policy,
                auth_2fa_remember_ip: fund.auth_2fa_remember_ip,
                auth_2fa_restrict_emails: fund.auth_2fa_restrict_emails,
                auth_2fa_restrict_auth_sessions: fund.auth_2fa_restrict_auth_sessions,
                auth_2fa_restrict_reimbursements: fund.auth_2fa_restrict_reimbursements,
            });
        }
    }, [updateForm, fund]);

    if (!fund) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {activeOrganization && (
                <div className="block block-breadcrumbs">
                    <StateNavLink
                        className="breadcrumb-item"
                        name={'organization-funds'}
                        params={{ organizationId: activeOrganization.id }}>
                        Fondsen
                    </StateNavLink>
                    {fund ? (
                        <div className="breadcrumb-item active">{fund.name}</div>
                    ) : (
                        <div className="breadcrumb-item active">{t('funds_edit.header.title_add')}</div>
                    )}
                </div>
            )}

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Tweefactorauthenticatie voor aanvragers</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-xs-12">
                                <div className="form-group form-group-inline">
                                    <div className="form-label">2FA beperkingen</div>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            propKey={'value'}
                                            allowSearch={false}
                                            value={form.values?.auth_2fa_policy}
                                            options={auth2FARequiredOptions}
                                            optionsComponent={SelectControlOptions}
                                            onChange={(
                                                auth_2fa_policy:
                                                    | 'global'
                                                    | 'optional'
                                                    | 'required'
                                                    | 'restrict_features',
                                            ) => form.update({ auth_2fa_policy })}
                                        />
                                    </div>
                                </div>

                                {form.values?.auth_2fa_policy == 'global' && (
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">&nbsp;</div>
                                        <div className="form-offset">
                                            <SelectControl
                                                className="form-control disabled"
                                                propKey={'value'}
                                                allowSearch={false}
                                                value={fund.organization_funds_2fa.auth_2fa_policy}
                                                options={auth2FARequiredOptions}
                                                optionsComponent={SelectControlOptions}
                                                disabled={true}
                                                onChange={() => null}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Auth2FAForm
                                    formValues={form.values}
                                    setFormValues={updateForm}
                                    formErrors={form.errors}
                                    disabled={false}
                                    show={form.values?.auth_2fa_policy != 'global'}
                                />
                                <Auth2FAForm
                                    formValues={global2FA}
                                    setFormValues={() => null}
                                    formErrors={form.errors}
                                    disabled={true}
                                    show={form.values?.auth_2fa_policy == 'global'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <StateNavLink
                                name={'organization-funds'}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-default">
                                Annuleer
                            </StateNavLink>
                            <button type="submit" className="button button-primary">
                                Bevestig
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
