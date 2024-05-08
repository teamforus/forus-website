import React from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function TermsAndConditions() {
    const page = useCmsPage('terms_and_conditions');

    return (
        <BlockShowcase
            wrapper={false}
            breadcrumbs={
                <div className={'wrapper'}>
                    <div className="block block-breadcrumbs">
                        <StateNavLink name="home" className="breadcrumb-item">
                            Home
                        </StateNavLink>
                        <div className="breadcrumb-item active" aria-current="location">
                            Algemene voorwaarden
                        </div>
                    </div>
                </div>
            }>
            {page && (
                <section className="section section-details">
                    <div className="wrapper">{page && <CmsBlocks page={page} />}</div>
                </section>
            )}
        </BlockShowcase>
    );
}
