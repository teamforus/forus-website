import React, { useCallback, useRef } from 'react';

export default function UIControlText({
    id = '',
    name = '',
    value = '',
    type = 'text',
    className = '',
    placeholder = '',
    disabled = false,
    ariaLabel = '',
    onChange = null,
    onChangeValue = null,
    inputRef = null,
    tabIndex = null,
    autoFocus = false,
    dataDusk = null,
    rows = 5,
}: {
    id?: string;
    name?: string;
    value?: string;
    type?: 'text' | 'email' | 'textarea';
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (value: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
    tabIndex?: number;
    autoFocus?: boolean;
    dataDusk?: string;
    rows?: number;
}) {
    const innerInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        (inputRef || innerInputRef).current.value = '';
        onChangeValue ? onChangeValue('') : null;
    }, [inputRef, onChangeValue]);

    return (
        <div className={`ui-control ui-control-text  ${className}`} aria-label={ariaLabel}>
            {React.createElement(type === 'textarea' ? 'textarea' : 'input', {
                ref: inputRef || innerInputRef,
                className: 'form-control',
                type: ['number', 'currency'].includes(type) ? 'number' : type == 'email' ? 'email' : 'text',
                id: id,
                name: name,
                onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
                    onChange ? onChange(e) : null;
                    onChangeValue ? onChangeValue(e?.target?.value) : null;
                },
                placeholder: placeholder,
                disabled: disabled,
                value: value,
                tabIndex: tabIndex,
                autoFocus: autoFocus,
                rows: rows,
                'data-dusk': dataDusk,
            })}

            {type !== 'textarea' && (
                <div
                    onClick={reset}
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
