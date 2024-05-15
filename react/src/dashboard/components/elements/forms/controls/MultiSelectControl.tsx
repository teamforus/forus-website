import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import SelectControl from '../../select-control/SelectControl';
import SelectControlOptions from '../../select-control/templates/SelectControlOptions';

type SelectControlProps = {
    id?: string;
    label: string;
    optionSelectText?: string;
    options?: Array<{ id: number; name?: string; key?: string }>;
    defaultValue: Array<number>;
    onChange: CallableFunction;
};

export default function MultiSelectControl({
    id = 'multiselect_' + uniqueId(),
    label = null,
    options = [],
    defaultValue = null,
    optionSelectText,
    onChange = null,
}: SelectControlProps) {
    const [selectedOption, setSelectedOption] = useState<number>(0);
    const [optionsById, setOptionsById] = useState<object>(null);
    const [modelValue, setModelValue] = useState(defaultValue);
    const [optionsPrepared, setOptionsPrepared] = useState([]);

    const buildOptions = useCallback(() => {
        const optionsById = {};
        const selectorOptions = [
            {
                id: 0,
                name: optionSelectText || 'Selecteer categorie',
            },
        ];

        options.forEach((element: { id: number; name?: string }) => {
            optionsById[element.id] = element.name;

            if (modelValue?.indexOf(element.id) == -1) {
                selectorOptions.push({
                    id: element.id,
                    name: element.name,
                });
            }
        });

        setOptionsPrepared(selectorOptions);
        setOptionsById(optionsById);
    }, [modelValue, optionSelectText, options]);

    const removeItem = useCallback(
        (id: number) => {
            modelValue.splice(modelValue?.indexOf(id), 1);
            setModelValue([...modelValue]);
            buildOptions();
        },
        [buildOptions, modelValue],
    );

    const selectOption = useCallback(
        (option) => {
            if (option != 0) {
                modelValue.push(option);
                setModelValue([...modelValue]);
                setSelectedOption(0);
                onChange(modelValue);
                buildOptions();
            }
        },
        [buildOptions, modelValue, onChange],
    );

    useEffect(() => {
        if (defaultValue) {
            setModelValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        buildOptions();
    }, [buildOptions]);

    return (
        <div>
            <div className="form-group form-group-inline">
                <label className="form-label" htmlFor={id}>
                    {label}
                </label>

                <SelectControl
                    className={'form-control'}
                    propKey={'id'}
                    value={selectedOption}
                    optionsComponent={SelectControlOptions}
                    options={optionsPrepared}
                    onChange={(modelId: string) => {
                        selectOption(modelId);
                    }}
                />
            </div>

            <div className="form-group form-group-inline">
                <label className="form-label">&nbsp;</label>
                <div className="form-offset">
                    {modelValue?.map((modelId: number) => (
                        <Fragment key={modelId}>
                            {optionsById && optionsById[modelId] && (
                                <div className="tag tag-primary tag-square pull-left" key={modelId}>
                                    {optionsById[modelId]}
                                    <div
                                        className="tag-link mdi mdi-close icon-end"
                                        onClick={() => removeItem(modelId)}
                                    />
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
