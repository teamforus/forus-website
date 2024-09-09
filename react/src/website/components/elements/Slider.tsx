import React, { useRef, useState } from 'react';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function Slider({
    label,
    title,
    description,
    showActionButton,
    showBackgroundImage,
    hasSquareArrows,
    elements,
}: {
    label?: string;
    title: string;
    description?: string;
    showActionButton?: boolean;
    showBackgroundImage?: boolean;
    hasSquareArrows?: boolean;
    elements: {
        title: string;
        description: string;
        imgSrc?: string;
        imgAlt?: string;
        hasLink?: boolean;
        linkState?: string;
        linkText?: string;
        timeInterval?: string;
        timeIntervalLabel?: string;
    }[];
}) {
    const $element = useRef<HTMLDivElement>(null);
    const [activeItem, setActiveItem] = useState(0);

    return (
        <div className={`block block-slider ${hasSquareArrows ? 'block-slider-square' : ''}`} ref={$element}>
            <div className={`block-slider-main ${!showBackgroundImage ? 'hide-background' : ''}`}>
                {label && <div className="label label-gray">{label}</div>}
                <div className="block-slider-title">{title}</div>
                {description && <div className="block-slider-description">{description}</div>}
                <div className="block-slider-arrows">
                    <div
                        className={`block-slider-arrow`}
                        onClick={() => {
                            if (activeItem === 0) {
                                setActiveItem(elements.length - 1);
                            } else {
                                setActiveItem(activeItem - 1);
                            }
                        }}>
                        <em className="mdi mdi-arrow-left" />
                    </div>
                    <div
                        className={`block-slider-arrow`}
                        onClick={() => {
                            if (activeItem === elements.length - 1) {
                                setActiveItem(0);
                            } else {
                                setActiveItem(activeItem + 1);
                            }
                        }}>
                        <em className="mdi mdi-arrow-right" />
                    </div>
                </div>
                {showActionButton && (
                    <div className="block-slider-actions">
                        <StateNavLink name={'book-demo'} className="button button-primary">
                            Gratis demo aanvragen
                        </StateNavLink>
                    </div>
                )}
            </div>

            <div className="block-slider-list">
                {elements.map(
                    (element, index) =>
                        index === activeItem && (
                            <div
                                className={`block-slider-list-item ${index == activeItem ? 'active' : ''}`}
                                key={index}>
                                <div className="block-slider-numeration-wrapper">
                                    <div className="block-slider-numeration">{index + 1}</div>
                                    {hasSquareArrows && <div className="block-slider-numeration-roadmap" />}
                                </div>
                                <div className="block-slider-list-item-main">
                                    {element?.timeInterval && element?.timeIntervalLabel && (
                                        <div className="block-slider-timeline">
                                            <div className="block-slider-timeline-time">{element.timeInterval}</div>
                                            <div className="block-slider-timeline-label">
                                                {element.timeIntervalLabel}
                                            </div>
                                        </div>
                                    )}
                                    <div className="block-slider-list-item-info-wrapper">
                                        <div className="block-slider-list-item-info">
                                            <div className="block-slider-list-item-title">{element.title}</div>
                                            <div className="block-slider-list-item-description">
                                                {element.description}
                                            </div>
                                        </div>
                                        {element.imgSrc && (
                                            <div className="block-slider-list-item-image">
                                                <img src={element.imgSrc} alt={element.imgAlt} />
                                            </div>
                                        )}
                                    </div>

                                    {element.hasLink && (
                                        <StateNavLink
                                            name={element.linkState}
                                            className="block-slider-list-item-button">
                                            {element.linkText}
                                            <em className="mdi mdi-open-in-new" />
                                        </StateNavLink>
                                    )}
                                </div>
                            </div>
                        ),
                )}
            </div>
        </div>
    );
}
