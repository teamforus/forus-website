import { useRef, useEffect, useState, createElement, useCallback, ReactElement, useContext } from 'react';
import { frameDirectorContext, FDItem, FDObserverRect } from '../context/FrameDirectorContext';
import { uniqueId } from 'lodash';

export default function FrameDirectorObserver({
    element,
    children,
    close,
    align = 'center',
    position = 'right',
    syncType = 'observer',
    fallbackPositions = false,
    classNames,
}: {
    element: (e?: FDItem) => ReactElement;
    close?: () => void;
    children: ReactElement | Array<ReactElement>;
    align?: 'start' | 'center' | 'end';
    position?: 'top' | 'bottom' | 'right' | 'left';
    syncType?: 'observer' | 'requestAnimationFrame';
    fallbackPositions?: boolean;
    classNames?: string;
}) {
    const { pushElement, updateElement, deleteElement } = useContext(frameDirectorContext);

    const [elId, setElId] = useState<string>(null);

    const [observedRect, setObservedRect] = useState<FDObserverRect>(null);

    const observedElRef = useRef<HTMLElement>(null);

    const getAllParents = useCallback((element: HTMLElement) => {
        return [
            ...Array.from(element.parentElement ? [element.parentElement] : []),
            ...Array.from(element.parentElement ? getAllParents(element.parentElement) : []),
        ];
    }, []);

    useEffect(() => {
        let isAnimating = true;
        const elements = getAllParents(observedElRef.current);

        const updateBoundingClientRect = () => {
            setObservedRect(observedElRef?.current?.getBoundingClientRect());

            if (syncType === 'requestAnimationFrame' && isAnimating) {
                window.requestAnimationFrame(() => updateBoundingClientRect());
            }
        };

        if (syncType === 'requestAnimationFrame') {
            window.requestAnimationFrame(() => updateBoundingClientRect());

            return () => (isAnimating = false);
        }

        const observers = elements.map((el: HTMLElement): ResizeObserver => {
            el.addEventListener('resize', updateBoundingClientRect);
            el.addEventListener('scroll', updateBoundingClientRect);

            const observer = new ResizeObserver(updateBoundingClientRect);
            observer.observe(el);
            return observer;
        });

        updateBoundingClientRect();

        return () => {
            elements.forEach((element: HTMLElement) => {
                element.removeEventListener('resize', updateBoundingClientRect);
                element.removeEventListener('scroll', updateBoundingClientRect);
            });

            observers.forEach((observer: ResizeObserver) => observer.disconnect());
        };
    }, [observedElRef, getAllParents, align, position, syncType]);

    useEffect(() => {
        if (!observedRect) {
            return;
        }

        if (elId) {
            updateElement(elId, { element: element, observedRect });
        } else {
            setElId(
                pushElement({
                    key: uniqueId('fd_element_'),
                    close,
                    observedRect,
                    element: element,
                    requestedPosition: { align, position },
                }),
            );
        }
    }, [align, close, element, elId, observedRect, fallbackPositions, position, pushElement, updateElement]);

    useEffect(() => {
        if (!observedRect || !elId) {
            return;
        }

        updateElement(elId, { observedRect });
    }, [align, close, element, elId, observedRect, fallbackPositions, position, pushElement, updateElement]);

    useEffect(() => {
        return elId ? () => deleteElement(elId) : undefined;
    }, [elId, deleteElement]);

    return createElement('div', { ref: observedElRef, className: classNames }, children);
}
