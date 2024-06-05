import React, { Fragment } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../hooks/useTranslate';

export default function SignUpStepGeneralInfo({
    panelType,
    onStepNext,
}: {
    panelType: 'sponsor' | 'validator';
    onStepNext: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="sign_up-pane">
            <div className="sign_up-pane-header">{translate(`sign_up_${panelType}.header.title_step_1`)}</div>

            <div className="sign_up-pane-body">
                <div className="sign_up-pane-media">
                    {panelType === 'sponsor' ? (
                        <img src={assetUrl('/assets/img/sponsor_sign_up_first_step.svg')} alt={''} />
                    ) : (
                        <img src={assetUrl('/assets/img/sign_up_first_step.png')} alt={''} />
                    )}
                </div>

                {panelType === 'sponsor' && (
                    <div className="sign_up-pane-text">{translate(`sign_up_${panelType}.header.subtitle_step_1`)}</div>
                )}
            </div>

            <div className="sign_up-pane-footer">
                <div className="row">
                    <div className="col col-lg-6 text-left">
                        <div className="button button-text button-text-padless" />
                    </div>

                    <div className="col col-lg-6 text-right">
                        <button type="button" className="button button-text button-text-padless" onClick={onStepNext}>
                            {translate(`sign_up_${panelType}.buttons.next`)}
                            <em className="mdi mdi-chevron-right icon-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
