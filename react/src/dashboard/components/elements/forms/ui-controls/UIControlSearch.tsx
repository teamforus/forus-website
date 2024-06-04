import React, { useCallback, useRef } from 'react';

export default function UIControlSearch({
    id = '',
    name = '',
    value = '',
    className = '',
    placeholder = '',
    disabled = false,
    ariaLabel = '',
    dusk = '',
    tabIndex = 0,
    onChange = null,
    onClick = null,
    ngKeyDown = null,
    onChangeValue = null,
    inputRef = null,
}: {
    id?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    dusk?: string;
    tabIndex?: number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    ngKeyDown?: () => void;
    onChangeValue?: (value: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
}) {
    const innerInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        if (onChangeValue) {
            onChangeValue('');
        } else {
            (inputRef || innerInputRef).current.value = '';
        }
    }, [inputRef, onChangeValue]);

    return (
        <div className={`ui-control ui-control-search-input ${className}`}>
            <input
                ref={inputRef || innerInputRef}
                className="form-control"
                type="text"
                id={id}
                name={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange ? onChange(e) : null;
                    onChangeValue ? onChangeValue(e?.target?.value) : null;
                }}
                tabIndex={tabIndex}
                onClick={onClick}
                onKeyDown={ngKeyDown}
                data-dusk={dusk}
                aria-label={ariaLabel}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
            />

            {(inputRef || innerInputRef).current?.value !== '' && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        reset();
                    }}
                    onKeyDown={(e) => (e.key == 'Enter' ? reset() : null)}
                    className="ui-control-clear"
                    aria-label="cancel"
                    role={'button'}
                    tabIndex={0}>
                    <div className="mdi mdi-close-circle" />
                </div>
            )}
        </div>
    );
}
