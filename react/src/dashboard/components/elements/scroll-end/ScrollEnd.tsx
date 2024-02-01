import React from 'react';
import { useCallback } from 'react';

export default function ScrollEnd({
    onScrollEnd,
    scrollEndThreshold = 100,
    className = '',
    children,
    style = {},
}: {
    onScrollEnd: CallableFunction;
    scrollEndThreshold?: number;
    children: React.ReactElement | Array<React.ReactElement>;
    className?: string;
    style?: React.CSSProperties;
}) {
    const onOptionsScroll = useCallback(
        (e) => {
            const top = e.target.scrollTop + e.target.clientHeight;

            if (top >= e.target.scrollHeight - scrollEndThreshold) {
                onScrollEnd();
            }
        },
        [onScrollEnd, scrollEndThreshold],
    );

    return (
        <div className={className} style={style} onScroll={onOptionsScroll}>
            {children}
        </div>
    );
}
