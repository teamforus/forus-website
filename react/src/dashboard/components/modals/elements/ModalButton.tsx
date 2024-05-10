import { classList } from '../../../helpers/utils';
import React, { useState } from 'react';
import ButtonType from '../../../../props/elements/ButtonType';

export type ModalButton = ButtonType;

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
    const [disabledByClick, setDisabledByClick] = useState(false);

    return (
        <button
            data-dusk={dusk}
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
