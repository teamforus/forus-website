import React, { Fragment } from 'react';
import { OptionType } from '../../SelectControl';

export default function SelectControlOptionItem<T>({
    option,
    selectOption,
}: {
    option: OptionType<T>;
    selectOption: (option: OptionType<T>) => void;
}) {
    return (
        <div
            className={'select-control-option'}
            onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
            }}
            onKeyDown={(e) => (e.key === 'Enter' ? e.currentTarget.click() : null)}
            tabIndex={0}
            role="option">
            {option.labelFormat?.map((str, index) => (
                <Fragment key={str.id}>{index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}</Fragment>
            ))}
        </div>
    );
}
