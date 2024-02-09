import { classList } from '../../../helpers/utils';
import React, { useState } from 'react';

export type ModalButton = {
    text?: string;
    type?: string;
    icon?: string;
    iconEnd?: boolean;
    onClick: (e: React.MouseEvent | React.FormEvent) => void;
    className?: string;
    disableOnClick?: boolean;
};

export function ModalButton({
    submit,
    button,
    type,
    text,
    disabled = false,
}: {
    submit?: boolean;
    button: ModalButton;
    type: string;
    text: string;
    disabled?: boolean;
}) {
    const [disabledByClick, setDisabledByClick] = useState(false);

    return (
        <button
            type={submit ? 'submit' : 'button'}
            disabled={disabled || disabledByClick}
            className={classList([`button`, `button-${button.type || type}`, button.className || null])}
            onClick={(e) => {
                if (button.disableOnClick === true) {
                    setDisabledByClick(true);
                }

                button.onClick(e);
            }}>
            {button.icon && !button.iconEnd && <em className={`mdi mdi-${button.icon} icon-start`} />}
            {button.text || text}
            {button.icon && button.iconEnd && <em className={`mdi mdi-${button.icon} icon-end`} />}
        </button>
    );
}
