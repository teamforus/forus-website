import React, { Fragment } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import ReimbursementCategories from '../../elements/reimbursement-categories/ReimbursementCategories';

export default function ReimbursementsView() {
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="reimbursements"
                    params={{ organizationId: activeOrganization.id }}>
                    Declaraties
                </StateNavLink>

                <div className="breadcrumb-item active">Declaratie categorieën</div>
            </div>

            <ReimbursementCategories />
        </Fragment>
    );
}
