import React, { Fragment, useContext, useEffect, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import { useTranslation } from 'react-i18next';
import UIControlText from '../../../../elements/forms/ui-controls/UIControlText';
import FormError from '../../../../elements/forms/errors/FormError';
import QrCode from '../../../../elements/qr-code/QrCode';
import AppLinks from '../../../../elements/app-links/AppLinks';
import EmailProviderLink from '../EmailProviderLink';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../../props/ApiResponses';
import { useIdentityService } from '../../../../../services/IdentityService';
import useEnvData from '../../../../../hooks/useEnvData';
import ProgressStorage from '../../../../../helpers/ProgressStorage';
import { authContext } from '../../../../../contexts/AuthContext';

export default function SignUpStepProfileCreate({ panel_type }: { panel_type: 'sponsor' | 'provider' | 'validator' }) {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();
    const envData = useEnvData();

    const { setToken } = useContext(authContext);

    const identityService = useIdentityService();

    const [hasApp, setHasApp] = useState(null);
    const [tmpAuthToken, setTmpAuthToken] = useState(null);
    const [authEmailSent, setAuthEmailSent] = useState(null);
    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState(null);
    const [progressStorage] = useState(new ProgressStorage(`${panel_type}-sign_up`));

    const formSignUp = useFormBuilder(
        {
            email: '',
            target: 'newSignup',
            confirm: true,
        },
        (values) => {
            const resolveErrors = (err: ResponseError) => {
                formSignUp.setIsLocked(false);
                formSignUp.setErrors(err.data.errors);
            };

            return identityService.validateEmail(values).then((res) => {
                const source = `${envData.client_key}_${envData.client_type}`;

                if (!res.data.email.used) {
                    identityService.make(values).then(
                        () => setAuthEmailSent(true),
                        (res) => resolveErrors(res),
                    );
                } else {
                    identityService.makeAuthEmailToken(values.email, source, 'newSignup').then(
                        () => setAuthEmailRestoreSent(true),
                        (res) => resolveErrors(res),
                    );
                }
            }, resolveErrors);
        },
    );

    useEffect(() => {
        setHasApp(JSON.parse(progressStorage.get('hasApp', 'false')));
        console.log('tmpAuthToken: ', tmpAuthToken);
    }, [progressStorage, tmpAuthToken]);

    useEffect(() => {
        let timer = null;
        progressStorage.set('hasApp', `${hasApp}`);

        if (!hasApp) {
            return;
        }

        const checkCallback = (access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                    setHasApp(false);
                    progressStorage.set('step', '4');
                } else if (res.data.message == 'pending') {
                    timer = setTimeout(() => checkCallback(access_token), 2500);
                } else {
                    document.location.reload();
                }
            });
        };

        identityService.makeAuthToken().then((res) => {
            setTmpAuthToken(res.data.auth_token);
            timer = window.setTimeout(() => checkCallback(res.data.access_token), 2500);
        }, console.error);

        return () => window.clearTimeout(timer);
    }, [hasApp, identityService, progressStorage, setToken]);

    return (
        <Fragment>
            <div className="sign_up-pane">
                <div className="sign_up-pane-header">
                    {t(`sign_up_${panel_type}.header.title_step_${panel_type == 'sponsor' ? 2 : 3}`)}
                </div>

                {!authEmailSent && !authEmailRestoreSent && !hasApp && (
                    <div className="sign_up-pane-body">
                        <div className="sign_up-pane-text">{t(`sign_up_${panel_type}.labels.terms`)}</div>

                        <form className="form" onSubmit={formSignUp.submit}>
                            <div className="row">
                                <div className="col col-md-7 col-xs-12">
                                    <div className="form-group">
                                        <label className="form-label">E-mailadres</label>
                                        <UIControlText
                                            value={formSignUp.values.email}
                                            onChange={(e) => formSignUp.update({ email: e.target.value })}
                                            className={'large'}
                                            placeholder={'e-mail@e-mail.nl'}
                                        />
                                        <FormError
                                            error={
                                                formSignUp.errors.email || formSignUp.errors['records.primary_email']
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="col col-md-5 col-xs-12">
                                    <div className="form-group">
                                        <label className="form-label">&nbsp;</label>
                                        <button
                                            type="submit"
                                            className={`button button-primary button-fill ${
                                                formSignUp.values.email ? '' : 'button-disabled'
                                            }`}>
                                            {t(`sign_up_${panel_type}.app_instruction.create_profile`)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="sign_up-pane-link visible-md visible-lg" onClick={() => setHasApp(true)}>
                            {t(`sign_up_${panel_type}.no_app.to_app`)}
                        </div>
                    </div>
                )}

                {!authEmailSent && !authEmailRestoreSent && hasApp && (
                    <div className="sign_up-pane-body">
                        <div className="sign_up-pane-heading">{t(`sign_up_${panel_type}.app.title`)}</div>

                        <div className="sign_up-pane-auth">
                            <div className="sign_up-pane-auth-content">
                                {t(`sign_up_${panel_type}.app.description_top`)
                                    ?.split('\n')
                                    ?.map((line, index) => (
                                        <div key={index} className="sign_up-pane-text">
                                            {line}
                                        </div>
                                    ))}

                                <div className="sign_up-pane-auth-qr_code visible-sm visible-xs">
                                    {tmpAuthToken && (
                                        <QrCode
                                            logo={assetUrl('/assets/img/me-logo-react.png')}
                                            value={JSON.stringify({
                                                type: 'auth_token',
                                                value: tmpAuthToken,
                                            })}
                                        />
                                    )}
                                </div>

                                {t(`sign_up_${panel_type}.app.description_bottom`)
                                    ?.split('\n')
                                    ?.map((line, index) => (
                                        <div key={index} className="sign_up-pane-text">
                                            {line}
                                        </div>
                                    ))}
                                <AppLinks />
                            </div>

                            <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                                {tmpAuthToken && (
                                    <QrCode
                                        logo={assetUrl('/assets/img/me-logo-react.png')}
                                        value={JSON.stringify({ type: 'auth_token', value: tmpAuthToken })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="sign_up-pane-link visible-md visible-lg" onClick={() => setHasApp(false)}>
                            {t(`sign_up_${panel_type}.app.no_app`)}
                        </div>
                    </div>
                )}

                {(authEmailSent || authEmailRestoreSent) && (
                    <div className="sign_up-pane-body text-center">
                        <div className="sign_up-pane-media">
                            <img src={assetUrl('/assets/img/email_confirmed.svg')} alt={''} />
                        </div>
                        <div className="sign_up-pane-heading sign_up-pane-heading-lg text-primary-mid">
                            {t(`sign_up_${panel_type}.labels.confirm_email`)}
                        </div>
                        <div className="sign_up-pane-text text-center">
                            {t(`sign_up_${panel_type}.labels.confirm_email_description`)}
                            <span className="sign_up-pane-link text-underline">&nbsp;{formSignUp.values.email}</span>
                            <br />
                            <br />
                            <EmailProviderLink email={formSignUp.values?.email} />
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
