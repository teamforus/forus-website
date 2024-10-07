import { useCallback } from 'react';
import { FDObserverRect } from '../../context/FrameDirectorContext';
import useGetRectOverlapArea from './useGetRectOverlapArea';

export default function useSortRectByOverlapArea() {
    const getOverlapArea = useGetRectOverlapArea();

    return useCallback(
        (canvas: FDObserverRect, rectangles: Array<FDObserverRect>) => {
            return rectangles.sort((a, b) => getOverlapArea(canvas, b) - getOverlapArea(canvas, a));
        },
        [getOverlapArea],
    );
}
