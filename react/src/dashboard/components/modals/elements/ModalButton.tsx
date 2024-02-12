import { classList } from '../../../helpers/utils';
import React from 'react';

export type ModalButton = {
    text?: string;
    type?: string;
    icon?: string;
    iconEnd?: boolean;
    onClick: (e: React.MouseEvent | React.FormEvent) => void;
    className?: string;
};

export function ModalButton({
    submit,
    button,
    type,
    text,
    dusk = null,
    disabled = false,
}: {
    submit?: boolean;
    button: ModalButton;
    type: string;
    text: string;
    dusk?: string;
    disabled?: boolean;
}) {
    return (
        <button
            data-dusk={dusk}
            type={submit ? 'submit' : 'button'}
            disabled={disabled}
            className={classList([`button`, `button-${button.type || type}`, button.className || null])}
            onClick={button.onClick}>
            {button.icon && !button.iconEnd && <em className={`mdi mdi-${button.icon} icon-start`} />}
            {button.text || text}
            {button.icon && button.iconEnd && <em className={`mdi mdi-${button.icon} icon-end`} />}
        </button>
    );
}
