import { useCallback } from 'react';
import { FDObserverRect } from '../../context/FrameDirectorContext';

export default function useIsWithin() {
    return useCallback((rect1: FDObserverRect, rect2: FDObserverRect) => {
        return (
            rect2.x >= rect1.x &&
            rect2.y >= rect1.y &&
            rect2.x + rect2.width <= rect1.x + rect1.width &&
            rect2.y + rect2.height <= rect1.y + rect1.height
        );
    }, []);
}
