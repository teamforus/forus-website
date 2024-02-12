import React, { useMemo } from 'react';
import Tooltip from '../../tooltip/Tooltip';
import { uniqueId } from 'lodash';

interface ToggleProps {
    id?: string;
    title?: string;
    tooltip?: string;
    checked: boolean;
    value?: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, checked?: boolean) => void;
    className?: string;
    customElement?: React.ReactElement;
}

export default function ToggleControl({
    id,
    title,
    checked = false,
    value = '',
    disabled = false,
    tooltip,
    onChange,
    className,
    customElement,
}: ToggleProps) {
    const formId = useMemo(() => (id ? id : `toggle_control_${uniqueId()}`), [id]);

    return (
        <label htmlFor={formId} title={title} className={`form-toggle ${className} ${disabled ? 'disabled' : ''}`}>
            <input
                type="checkbox"
                value={value}
                id={formId}
                checked={checked}
                onChange={(e) => onChange(e, e.target.checked)}
            />
            <div className="form-toggle-inner flex-end">
                <div className="toggle-input">
                    <div className="toggle-input-dot"></div>
                </div>

                <div className="toggle-label">
                    {customElement && customElement}
                    {!customElement && title}
                    {tooltip && <Tooltip text={tooltip} />}
                </div>
            </div>
        </label>
    );
}
