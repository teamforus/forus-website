import React, { useCallback, useEffect, useRef, useState } from 'react';

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
    const [activeItem, setActiveItem] = useState(1);

    const switchSlide = useCallback((activeItem) => {
        if ($element.current) {
            const $items = $element.current.getElementsByClassName(
                'block-slider-list-item',
            ) as HTMLCollectionOf<HTMLElement>;

            for (let i = 0; i < $items.length; i++) {
                $items[i].style.removeProperty('transform');
            }
            $items[activeItem - 1].style.transform = `translateX(-${(activeItem - 1) * 100}%) scaleX(1)`;
        }
    }, []);

    useEffect(() => {
        if ($element.current) {
            const $items = $element.current.querySelectorAll('.block-slider-list-item');
            const $arrows = $element.current.querySelectorAll('.block-slider-arrow');

            $arrows[0]?.addEventListener('click', () => {
                if (activeItem === 1) {
                    setActiveItem($items.length);
                } else {
                    switchSlide(activeItem - 1);
                    setActiveItem(activeItem - 1);
                }
            });

            $arrows[1]?.addEventListener('click', () => {
                if (activeItem === $items.length) {
                    setActiveItem(1);
                } else {
                    setActiveItem(activeItem + 1);
                }
            });
        }
    }, [activeItem, switchSlide]);

    useEffect(() => {
        switchSlide(activeItem);
    }, [activeItem, switchSlide]);

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
                    <div className="block-slider-arrow block-slider-arrow-left" />
                    <div className="block-slider-arrow block-slider-arrow-right" />
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
