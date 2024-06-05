import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Fund from '../../../../props/models/Fund';

export default function FundRequestGoBackButton({
    fund,
    step,
    prevStep,
    tabIndex = 1,
}: {
    fund?: Fund;
    step: number;
    prevStep: () => void;
    tabIndex?: number;
}) {
    return (
        <div className="flex-col text-left">
            {step <= 0 ? (
                <StateNavLink
                    className="button button-text button-text-padless"
                    name="fund-activate"
                    params={{ id: fund?.id }}
                    role="link"
                    tabIndex={tabIndex}>
                    <em className="mdi mdi-chevron-left icon-left" />
                    Terug
                </StateNavLink>
            ) : (
                <div
                    className="button button-text button-text-padless"
                    onClick={prevStep}
                    role="button"
                    tabIndex={tabIndex}>
                    <div className="mdi mdi-chevron-left icon-left" />
                    Terug
                </div>
            )}
        </div>
    );
}
