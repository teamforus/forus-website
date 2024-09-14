import { useCallback } from 'react';
import { FDObserverRect } from '../../context/FrameDirectorContext';

export default function useGetRectOverlapArea() {
    return useCallback((rect1: FDObserverRect, rect2: FDObserverRect) => {
        return (
            Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x)) *
            Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y))
        );
    }, []);
}
