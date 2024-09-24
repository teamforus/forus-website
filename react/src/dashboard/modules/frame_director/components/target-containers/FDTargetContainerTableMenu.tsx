import React from 'react';
import classNames from 'classnames';
import { FDTargetContainerProps } from '../targets/FDTargetClick';
import useFDOffsetTableMenu from '../../hooks/useFDOffsetTableMenu';

export default function FDTargetContainerTableMenu(props: FDTargetContainerProps) {
    const { item, content } = props;
    const { ref, itemWidth, itemHeight } = useFDOffsetTableMenu(item);

    return (
        <div
            style={{ opacity: !itemWidth && !itemHeight ? 0 : 1 }}
            onClick={(e) => e.stopPropagation()}
            className={classNames('tooltip', 'tooltip-select')}>
            <div className="tooltip-select-content" ref={ref}>
                {typeof content === 'function' ? content(props) : content}
            </div>
        </div>
    );
}
