import React, { useCallback, useState } from 'react';

interface NumericControlProps {
    id?: string;
    minValue?: number;
    maxValue?: number;
    value?: number;
    apply?: boolean;
    applyText?: string;
    onChange: (value: number) => void;
    onSubmit: (value: number) => void;
}

export default function NumericControl({
    id,
    minValue,
    maxValue,
    value,
    apply,
    applyText,
    onChange,
    onSubmit,
}: NumericControlProps) {
    const [viewValue, setViewValue] = useState(value);

    const increase = useCallback(() => {
        if (!apply) {
            return setViewValue(value + 1);
        }

        onChange(value + 1);
    }, [apply, onChange, value]);

    const decrease = useCallback(() => {
        if (!apply) {
            return setViewValue(value - 1);
        }

        onChange(value - 1);
    }, [apply, onChange, value]);

    const submit = useCallback(() => {
        if (!apply) {
            setViewValue(value - 1);
        }

        onChange(value - 1);
        onSubmit(value);
    }, [apply, onChange, onSubmit, value]);

    return (
        <div className="form-numeric" id={id}>
            <div className={`form-numeric-btn ${value <= minValue ? 'disabled' : ''}`}>
                <em className="mdi mdi-minus icon-start" onClick={() => decrease()} />
            </div>
            <div className="form-numeric-value">{value}</div>
            <div className={`form-numeric-btn ${value >= maxValue ? 'disabled' : ''}`}>
                <em className="mdi mdi-plus icon-end" onClick={() => increase()} />
            </div>
            {apply && viewValue != value && (
                <div className="form-numeric-actions">
                    <div className="button button-default button-sm" onClick={() => submit()}>
                        {applyText}
                    </div>
                </div>
            )}
        </div>
    );
}
