import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null, runOnInit = true) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) {
            return;
        }

        const intervalId = setInterval(() => {
            savedCallback.current?.();
        }, delay);

        if (runOnInit) {
            savedCallback.current?.();
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [delay, runOnInit]);
}
