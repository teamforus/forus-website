import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import { useTranslation } from 'react-i18next';

export default function SignUpStepGeneralInfo({
    panel_type,
    onStepNext,
}: {
    panel_type: 'sponsor' | 'provider' | 'validator';
    onStepNext: () => void;
}) {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            <div className="sign_up-pane">
                <div className="sign_up-pane-header">{t(`sign_up_${panel_type}.header.title_step_1`)}</div>

                <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                    <div className="sign_up-pane-media">
                        {panel_type === 'sponsor' ? (
                            <img src={assetUrl('/assets/img/sponsor_sign_up_first_step.svg')} alt={''} />
                        ) : (
                            <img src={assetUrl('/assets/img/sign_up_first_step.png')} alt={''} />
                        )}
                    </div>

                    {panel_type === 'sponsor' && (
                        <div className="sign_up-pane-text">{t(`sign_up_${panel_type}.header.subtitle_step_1`)}</div>
                    )}
                </div>

                <div className="sign_up-pane-footer">
                    <div className="row">
                        <div className="col col-lg-6 text-left">
                            <div className="button button-text button-text-padless" />
                        </div>

                        <div className="col col-lg-6 text-right">
                            <button
                                type="button"
                                className="button button-text button-text-padless"
                                onClick={onStepNext}>
                                {t(`sign_up_${panel_type}.buttons.next`)}
                                <em className="mdi mdi-chevron-right icon-right" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
