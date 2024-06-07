import React from 'react';

type ButtonType = {
    text?: string;
    type?: string;
    icon?: string;
    iconEnd?: boolean;
    onClick: (e: React.MouseEvent | React.FormEvent) => void;
    className?: string;
    disableOnClick?: boolean;
};

export default ButtonType;
