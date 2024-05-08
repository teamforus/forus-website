import React from 'react';

export default function ModalProductReserveProgress({
    step,
    steps,
    finalStep,
}: {
    step: number;
    steps: Array<number>;
    finalStep: number;
}) {
    return (
        <div className="reservation-progress">
            {steps.map((item, index) => (
                <div
                    key={index}
                    className={`reservation-step ${step == item ? 'reservation-step-active' : ''} ${
                        step > item ? 'reservation-step-done' : ''
                    }`}>
                    <div className="reservation-step-border" />
                    {step < finalStep && <div className="reservation-step-separator" />}
                </div>
            ))}
        </div>
    );
}
