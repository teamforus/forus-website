import React from 'react';
import useTranslate from '../../../hooks/useTranslate';

export default function TranslateHtml({
    i18n,
    i18nDefault = null,
    values,
    component = <span />,
    escapeValue = true,
    className = '',
}: {
    i18n: string;
    i18nDefault?: string;
    values?: object;
    component?: React.ReactElement;
    escapeValue?: boolean;
    className?: string;
}) {
    const translate = useTranslate();

    return React.createElement(component.type, {
        className: className,
        ...component.props,
        dangerouslySetInnerHTML: {
            __html: translate(i18n, { ...values, interpolation: { escapeValue } }, i18nDefault),
        },
    });
}
