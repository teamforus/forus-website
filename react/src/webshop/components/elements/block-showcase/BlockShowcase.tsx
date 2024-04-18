import React from 'react';
import { TopNavbar } from '../top-navbar/TopNavbar';
import BlockLoader from '../../../../dashboard/components/elements/block-loader/BlockLoader';

export default function BlockShowcase({
    children = null,
    breadcrumbs = null,
    wrapper = false,
    className = null,
}: {
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbs?: React.ReactElement | Array<React.ReactElement>;
    wrapper?: boolean;
    className?: string;
}) {
    return (
        <div className={`block block-showcase ${className || ''}`}>
            <TopNavbar />

            <main id="main-content">
                {breadcrumbs}
                {wrapper ? <div className={'wrapper'}>{children || <BlockLoader />}</div> : children || <BlockLoader />}
            </main>
        </div>
    );
}
