import React, { Fragment, useRef, useState } from 'react';
import ClickOutside from '../../click-outside/ClickOutside';
import { uniqueId } from 'lodash';
import { SelectControlOptionsProp } from '../SelectControl';
import Organization from '../../../../props/models/Organization';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../../modules/state_router/Router';
import useThumbnailUrl from '../../../../hooks/useThumbnailUrl';

export default function SelectControlOptionsOrganization<T>({
    query,
    setQuery,
    optionsFiltered,
    placeholderValue,
    placeholder,
    selectOption,
    showOptions,
    visibleCount,
    className,
    onInputClick,
    modelValue,
    searchOption,
    setShowOptions,
    searchInputChanged,
    onOptionsScroll,
}: SelectControlOptionsProp<T>) {
    const [controlId] = useState('select_control_' + uniqueId());
    const thumbnailUrl = useThumbnailUrl();
    const input = useRef(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    return (
        <div
            className={'select-control select-control-organizations ' + (className ? className : '')}
            data-dusk="headerOrganizationSwitcher"
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showOptions}
            aria-labelledby={controlId}
            aria-controls={`${controlId}_options`}
            onKeyDown={(e) => {
                if (e.key == 'Enter') {
                    placeholderRef?.current?.click();
                }

                if (e.key == 'Escape') {
                    setShowOptions(false);
                }
            }}
            onBlur={(e) => {
                if (showOptions && !e.currentTarget.contains(e.relatedTarget)) {
                    selectorRef?.current?.focus();
                }
            }}>
            <div className={['select-control-input', showOptions ? 'options' : ''].filter((item) => item).join(' ')}>
                {/* Placeholder */}
                <label
                    role="button"
                    ref={placeholderRef}
                    className="select-control-search form-control"
                    onClick={searchOption}
                    style={{ display: showOptions ? 'none' : 'block' }}>
                    <span className="select-control-logo">
                        {modelValue && (
                            <img
                                alt="Logo"
                                src={
                                    (modelValue?.raw as Organization)?.logo?.sizes?.thumbnail ||
                                    thumbnailUrl('organization')
                                }
                            />
                        )}
                    </span>
                    <span className="select-control-search-placeholder">{placeholderValue || placeholder}</span>
                    <span
                        className={
                            'select-control-icon ' +
                            (showOptions ? 'select-control-icon-up' : 'select-control-icon-down')
                        }
                    />
                </label>

                <div className="select-control-search form-control">
                    <div className="select-control-search-icon">
                        <div className="mdi mdi-magnify" />
                    </div>

                    <div className="select-control-search-input">
                        {showOptions && (
                            <input
                                id={controlId}
                                type="search"
                                placeholder={placeholderValue || placeholder}
                                ref={input}
                                value={query}
                                onClick={onInputClick}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        )}
                    </div>

                    <div
                        className={'select-control-search-clear ' + (query ? '' : 'disabled')}
                        onClick={() => {
                            setQuery('');
                            searchInputChanged();
                        }}>
                        <em className="mdi mdi-close" />
                    </div>
                </div>

                {showOptions && (
                    <ClickOutside
                        onClick={null}
                        onClickOutside={(e) => {
                            e.stopPropagation();
                            setShowOptions(false);
                        }}
                        className="select-control-options-group"
                        id={`${controlId}_options`}
                        role="listbox">
                        <div className="select-control-options" onScroll={onOptionsScroll}>
                            {optionsFiltered.slice(0, visibleCount)?.map((option) => (
                                <div
                                    data-dusk={`headerOrganizationItem${(option.raw as Organization)?.id}`}
                                    className={`select-control-option ${option.id == modelValue.id ? 'selected' : ''}`}
                                    tabIndex={0}
                                    key={option.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectOption(option);
                                    }}>
                                    <div className="select-control-logo">
                                        <img
                                            alt="Logo"
                                            src={
                                                (option.raw as Organization)?.logo?.sizes?.thumbnail ||
                                                thumbnailUrl('organization')
                                            }
                                        />
                                    </div>
                                    <div className="select-control-option-value">
                                        {option.labelFormat?.map((str, index) => (
                                            <Fragment key={str.id}>
                                                {index != 1 ? <span>{str.value}</span> : <strong>{str.value}</strong>}
                                            </Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="select-control-options-actions">
                            <NavLink
                                to={getStateRouteUrl('organizations-edit', {
                                    organizationId: (modelValue?.raw as Organization)?.id,
                                })}
                                onClick={() => setShowOptions(false)}
                                className="select-control-switcher-setting">
                                <div className="select-control-switcher-setting-icon">
                                    <em className="mdi mdi-cog" />
                                </div>
                                <div className="select-control-switcher-setting-name">Organisatie instellingen</div>
                            </NavLink>

                            <NavLink
                                to={getStateRouteUrl('organizations-create')}
                                onClick={() => setShowOptions(false)}
                                className="select-control-switcher-setting">
                                <div className="select-control-switcher-setting-icon">
                                    <em className="mdi mdi-plus-circle" />
                                </div>
                                <div className="select-control-switcher-setting-name">Organisatie toevoegen</div>
                            </NavLink>
                        </div>
                    </ClickOutside>
                )}
            </div>
        </div>
    );
}
