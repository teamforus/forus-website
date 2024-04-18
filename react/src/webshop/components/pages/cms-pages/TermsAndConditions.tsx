import React from 'react';
import { TopNavbar } from '../../elements/top-navbar/TopNavbar';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useCmsPage from './hooks/useCmsPage';

export default function TermsAndConditions() {
    const page = useCmsPage('terms_and_conditions');

    if (!page) {
        return null;
    }

    return (
        <div className="block block-showcase">
            <TopNavbar />

            <section className="section section-details">
                <div className="wrapper">
                    <div className="block block-breadcrumbs">
                        <StateNavLink name="home" className="breadcrumb-item">
                            Home
                        </StateNavLink>
                        <div className="breadcrumb-item active" aria-current="location">
                            Algemene voorwaarden
                        </div>
                    </div>
                    {page && <CmsBlocks page={page} />}
                </div>
            </section>
        </div>
    );
}
