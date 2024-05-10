import React from 'react';
import { TopNavbar } from '../elements/top-navbar/TopNavbar';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function WIP({
    title = 'Work in progress',
    description = 'This page is under construction.',
}: {
    title?: string;
    description?: string;
}) {
    return (
        <div className={`block block-showcase`}>
            <TopNavbar />

            <main id="main-content">
                <div className="showcase-wrapper">
                    <div className="block block-breadcrumbs">
                        <StateNavLink name={'home'} className="breadcrumb-item">
                            Home
                        </StateNavLink>
                        <div className="breadcrumb-item active" aria-current="location">
                            WIP
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">{title}</div>
                        </div>
                        <div className="card-body">
                            <div className="card-section">
                                <div className="card-heading">{description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
