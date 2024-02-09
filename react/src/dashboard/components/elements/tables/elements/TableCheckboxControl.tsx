import React from 'react';

export default function TableCheckboxControl({
    checked,
    onClick,
}: {
    checked: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
    return (
        <label
            className={`checkbox checkbox-compact checkbox-th ${checked ? 'checked' : ''}`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}>
            <div className="checkbox-box">
                <div className="mdi mdi-check" />
            </div>
        </label>
    );
}
