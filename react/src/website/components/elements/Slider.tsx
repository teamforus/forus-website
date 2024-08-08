import React, { useRef, useState } from 'react';

export default function Slider({
    label,
    title,
    description,
    showActionButton,
    showBackgroundImage,
    elements,
}: {
    label?: string;
    title: string;
    description?: string;
    showActionButton?: boolean;
    showBackgroundImage?: boolean;
    elements: { title: string; description: string; imgSrc?: string; imgAlt?: string }[];
}) {
    const $element = useRef<HTMLDivElement>(null);
    const [count] = useState(3);
    const [activeItem, setActiveItem] = useState(1);

    return (
        <div className="block block-slider" ref={$element}>
            <div className={`block-slider-main ${!showBackgroundImage ? 'hide-background' : ''}`}>
                <div className="label label-gray">{label}</div>
                <div className="block-slider-title">{title}</div>
                <div className="block-slider-separator" />
                {description && (
                    <div className="block-slider-description">
                        Wilt u een regeling uitgeven? We gaan graag met u in gesprek en werken toe naar een plan voor de
                        implementatie. Ook na de lancering staan wij voor u klaar.
                    </div>
                )}
                <div className="block-slider-arrows">
                    <div
                        className="block-slider-arrow block-slider-arrow-left"
                        onClick={() => {
                            if (activeItem === 1) {
                                setActiveItem(count);
                            } else {
                                setActiveItem(activeItem - 1);
                            }
                        }}
                    />
                    <div
                        className="block-slider-arrow block-slider-arrow-right"
                        onClick={() => {
                            if (activeItem === count) {
                                setActiveItem(1);
                            } else {
                                setActiveItem(activeItem + 1);
                            }
                        }}
                    />
                </div>
                {showActionButton && (
                    <div className="block-slider-actions">
                        <div className="button button-primary">Gratis demo aanvragen</div>
                    </div>
                )}
            </div>

            <div className="block-slider-list">
                {elements.map((element, index) => (
                    <div className={`block-slider-list-item ${index + 1 == activeItem ? 'active' : ''}`} key={index}>
                        <div className="block-slider-numeration">{index + 1}</div>
                        <div className="block-slider-list-item-main">
                            <div className="block-slider-list-item-title">{element.title}</div>
                            <div className="block-slider-list-item-description">{element.description}</div>
                        </div>
                        {element.imgSrc && (
                            <div className="block-slider-list-item-image">
                                <img src={element.imgSrc} alt={element.imgAlt} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
