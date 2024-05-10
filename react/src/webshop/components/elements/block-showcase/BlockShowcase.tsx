import React, { Fragment } from 'react';
import { TopNavbar } from '../top-navbar/TopNavbar';
import BlockLoader from '../block-loader/BlockLoader';
import BlockLoaderBreadcrumbs from '../block-loader/BlockLoaderBreadcrumbs';

export default function BlockShowcase({
    children = null,
    breadcrumbs = null,
    wrapper = false,
    className = null,
    loaderElement = null,
    breadcrumbLoaderElement = null,
}: {
    children?: React.ReactElement | Array<React.ReactElement>;
    breadcrumbs?: React.ReactElement | Array<React.ReactElement>;
    wrapper?: boolean;
    className?: string;
    loaderElement?: React.ReactElement;
    breadcrumbLoaderElement?: React.ReactElement;
}) {
    return (
        <div className={`block block-showcase ${className || ''}`}>
            <TopNavbar />

            <main id="main-content">
                {wrapper ? (
                    <div className={'wrapper'}>
                        {breadcrumbs || breadcrumbLoaderElement || <BlockLoaderBreadcrumbs />}
                        {children || loaderElement || <BlockLoader />}
                    </div>
                ) : (
                    <Fragment>
                        {breadcrumbs}
                        {children || loaderElement || <BlockLoader />}
                    </Fragment>
                )}
            </main>
        </div>
    );
}
