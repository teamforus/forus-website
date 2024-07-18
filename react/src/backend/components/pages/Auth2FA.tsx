import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';
import PincodeControl from '../../../dashboard/components/elements/forms/controls/PincodeControl';
import { useIdentityService } from '../../../dashboard/services/IdentityService';
import { useIdentity2FAService } from '../../../dashboard/services/Identity2FAService';
import { authContext } from '../../contexts/AuthContext';
import { ResponseError, ResponseSimple } from '../../../dashboard/props/ApiResponses';
import Identity2FAState from '../../../dashboard/props/models/Identity2FAState';
import Modal2FASetup from '../../../dashboard/components/modals/Modal2FASetup';

export default function Auth2FA({
    type,
    mobile,
    exchangeToken,
}: {
    type?: string;
    mobile: boolean;
    exchangeToken?: string;
}) {
    const [step, setStep] = useState(null);
    const [state, setState] = useState(null);
    const [pinCode, setPinCode] = useState('');
    const [pinCodeError, setPinCodeError] = useState(null);
    const [exchangeError, setExchangeError] = useState(null);
    const [exchangeSuccess, setExchangeSuccess] = useState(null);
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [showMissingText, setShowMissingText] = useState(null);
    const [paneHidden, setPaneHidden] = useState(null);
    const [auth2FAState, setAuth2FAState] = useState<Identity2FAState>(null);

    const [providerTypes, setProviderTypes] = useState<
        Array<{
            type: 'phone' | 'authenticator';
            title: string;
            subtitle: string;
        }>
    >(null);

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();

    const identityService = useIdentityService();
    const identity2FAService = useIdentity2FAService();
    const authToken = useContext(authContext).token;
    const { setToken, updateIdentity } = useContext(authContext);

    const submit = useCallback(() => {
        if (pinCode.length < 6) {
            return;
        }

        identityService.authorizeAuthCode(pinCode, true).then(
            () => {
                setState('success');
                identityService.deleteToken().then((r) => r);
            },
            (err: ResponseError) => {
                if (err.status !== 403) {
                    return setPinCodeError(err.data.message);
                }

                setState('error');
            },
        );
    }, [identityService, pinCode]);

    const auth2FA = useCallback(
        (type: string, auth = false) => {
            setPaneHidden(true);

            openModal((modal) => (
                <Modal2FASetup
                    auth={auth}
                    type={type}
                    modal={modal}
                    onReady={() => document.location.reload()}
                    onCancel={() => setPaneHidden(false)}
                    assetUrl={assetUrl}
                    auth2FAState={auth2FAState}
                    showInfoBox={false}
                />
            ));
        },
        [assetUrl, auth2FAState, openModal],
    );

    const initPinCode = useCallback(() => {
        if (mobile) {
            identityService.storeShared2FA().then((res) => {
                setState('app');
                setRedirectUrl(res.data.redirect_url);

                setTimeout(() => setShowMissingText(true), 2500);

                return setTimeout(() => {
                    document.querySelector<HTMLElement>('.block-missing-app .button').click();
                }, 100);
            });
        } else {
            setState('pin_code');
        }
    }, [identityService, mobile]);

    const onReady = useCallback(() => {
        identity2FAService.status().then(
            (res) => {
                const { required, confirmed, active_providers, provider_types } = res.data.data;

                setPaneHidden(false);
                setProviderTypes(provider_types);

                if (!required || confirmed) {
                    return initPinCode();
                }

                setState('auth_2fa');

                if (active_providers.length == 0) {
                    setStep('setup');
                }

                if (active_providers.length > 0) {
                    setStep('auth');
                    setProviderTypes(
                        provider_types.filter((provider_type) =>
                            active_providers
                                .map((auth_2fa) => auth_2fa.provider_type.type)
                                .includes(provider_type.type),
                        ),
                    );
                }

                setAuth2FAState(res.data.data);
            },
            () => setState('error'),
        );
    }, [identity2FAService, initPinCode]);

    const checkAccessTokenStatus = useCallback(() => {
        identityService
            .checkAccessToken(authToken)
            .then((res) => (res.data.message === 'active' ? onReady() : setState('error')));
    }, [authToken, identityService, onReady]);

    useEffect(() => {
        if (exchangeError) {
            updateIdentity().then((identity) => (identity ? checkAccessTokenStatus() : setState('error')));
        }
    }, [checkAccessTokenStatus, exchangeError, updateIdentity]);

    useEffect(() => {
        if (exchangeSuccess) {
            setTimeout(() => onReady(), 0);
        }
    }, [exchangeSuccess, onReady]);

    useEffect(() => {
        if (!type || !exchangeToken || !['email_sign_in', 'email_confirmation'].includes(type)) {
            return setState('error');
        }

        const promise =
            type === 'email_sign_in'
                ? identityService.authorizeAuthEmailToken(exchangeToken)
                : identityService.exchangeConfirmationToken(exchangeToken);

        promise.then(
            (res: ResponseSimple<{ access_token: string }>) => {
                setToken(res.data.access_token);
                setExchangeSuccess(true);
            },
            () => setExchangeError(true),
        );
    }, [identityService, onReady, setToken, exchangeToken, type]);

    if (!state) {
        return <></>;
    }

    return (
        <Fragment>
            {state == 'app' && (
                <div className="block block-missing-app">
                    {showMissingText && (
                        <p>Open deze link op het zelfde apparaat waar het aanmeldverzoek is aangevraagd.</p>
                    )}

                    <a className="button button-primary" href={redirectUrl}>
                        OPEN ME APP
                    </a>
                </div>
            )}

            {state !== 'auth_2fa' ? (
                <form className="block block-auth-pin_code" onSubmit={(e) => e?.preventDefault()}>
                    {state === 'pin_code' && (
                        <div className="pin_code-content">
                            <div className="pin_code-title">Aanmelden</div>
                            <div className="pin_code-subtitle">
                                1. Kies in de app voor “Koppelen”
                                <br />
                                2. Vul de koppelcode hieronder in
                            </div>

                            <PincodeControl
                                blockSize={6}
                                blockCount={1}
                                valueType="num"
                                value={pinCode}
                                onChange={(value) => setPinCode(value)}
                            />

                            {pinCodeError && <div className="pin_code-input-error">{pinCodeError}</div>}

                            <button
                                className="button button-primary button-wide flex-start"
                                type="button"
                                onClick={() => submit()}
                                disabled={pinCode.length < 6}>
                                Koppel
                            </button>
                        </div>
                    )}

                    {state === 'success' && (
                        <div className="pin_code-content text-center">
                            <div className="pin_code-title">Succes!</div>
                            <div className="pin_code-subtitle">Uw e-mailadres is bevestigd</div>
                            <div className="pin_code-media">
                                <img
                                    className="pin_code-media-img"
                                    src={assetUrl('/assets/img/sign_in-pin_code-success.svg')}
                                    alt=""
                                />
                            </div>
                            <div className="pin_code-link" onClick={() => setState('details')}>
                                Hoe nu verder?
                            </div>
                        </div>
                    )}

                    {state === 'details' && (
                        <div className="pin_code-content text-center">
                            <div className="pin_code-title">Succes!</div>
                            <div className="pin_code-subtitle">Uw e-mailadres is bevestigd</div>
                            <div className="pin_code-media pin_code-media-small">
                                <img
                                    className="pin_code-media-img"
                                    src={assetUrl('/assets/img/sign_in-pin_code-success.svg')}
                                    alt=""
                                />
                            </div>
                            <div className="pin_code-details-block">
                                <div className="pin_code-details-title">Ingelogd op de Me-app?</div>
                                <div className="pin_code-details-info">
                                    Ga verder in de app.
                                    <br />U mag dit scherm sluiten.
                                </div>
                            </div>
                            <div className="pin_code-details-block">
                                <div className="pin_code-details-title">Was u bezig met een aanmelding?</div>
                                <div className="pin_code-details-info">
                                    Ga terug naar het aanmeldformulier om uw
                                    <br />
                                    aanmelding af te ronden.
                                </div>
                            </div>
                        </div>
                    )}

                    {state === 'error' && (
                        <div className="pin_code-content text-center">
                            <div className="pin_code-title">Toegang verlopen</div>
                            <div className="pin_code-subtitle">
                                Ga in de app terug naar het vorige scherm, en vul opnieuw uw
                                <br />
                                e-mailadres in om een nieuwe inlog e-mail te verzenden.
                            </div>
                            <div className="pin_code-media">
                                <img
                                    className="pin_code-media-img"
                                    src={assetUrl('/assets/img/sign_in-pin_code-error.svg')}
                                    alt=""
                                />
                            </div>
                        </div>
                    )}

                    {state === 'pin_code' && (
                        <div className="pin_code-instruction">
                            <img
                                className="pin_code-instruction-image"
                                src={assetUrl('/assets/img/sign_in-pin_code-instruction.png')}
                                alt=""
                            />
                        </div>
                    )}
                </form>
            ) : (
                <div className="block block-sign_up block-sign_up-fixed">
                    <div className="block-wrapper">
                        {step == 'setup' && !paneHidden && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading text-strong">
                                        Tweefactorauthenticatie instellen
                                    </div>
                                    <div className="sign_up-pane-text">
                                        Tweefactorauthenticatie is vereist om in te kunnen loggen, kies één van
                                        onderstaande opties om verder te gaan.
                                    </div>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-text">
                                        <div className="sign_up-pane-heading">Kies een optie</div>
                                    </div>
                                    <div className="sign_up-options">
                                        {providerTypes.map((provider_type) => (
                                            <div
                                                key={provider_type.type}
                                                className="sign_up-option"
                                                onClick={() => auth2FA(provider_type.type)}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl(`/assets/img/icon-2fa-${provider_type.type}.svg`)}
                                                        alt={provider_type.title}
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">{provider_type.title}</div>
                                                    <div className="sign_up-option-description">
                                                        {provider_type.subtitle}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'auth' && !paneHidden && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-heading text-strong">Tweefactorauthenticatie</div>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-text">
                                        <div className="sign_up-pane-heading">Kies een optie</div>
                                    </div>
                                    <div className="sign_up-options">
                                        {providerTypes.map((provider_type) => (
                                            <div
                                                key={provider_type.type}
                                                className="sign_up-option"
                                                onClick={() => auth2FA(provider_type.type, true)}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl(`/assets/img/icon-2fa-${provider_type.type}.svg`)}
                                                        alt={provider_type.title}
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">{provider_type.title}</div>
                                                    <div className="sign_up-option-description">
                                                        {provider_type.subtitle}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Fragment>
    );
}
