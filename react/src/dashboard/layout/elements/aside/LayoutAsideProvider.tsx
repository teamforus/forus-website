import React from 'react';
import LayoutAsideNavItem from './LayoutAsideNavItem';
import { hasPermission } from '../../../helpers/utils';
import Organization from '../../../props/models/Organization';

export default function LayoutAsideProvider({ activeOrganization }: { activeOrganization: Organization }) {
    return (
        <div className="sidebar-nav">
            <div className="sidebar-section-title">Organisatie</div>
            <LayoutAsideNavItem
                name={'Overzicht'}
                icon={'provider-overview'}
                route={'provider-overview'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_employees')}
                id={'provider-overview'}
            />
            <LayoutAsideNavItem
                name={'Vestigingen'}
                icon={'offices'}
                route={'offices'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_offices')}
                id={'offices'}
            />
            <LayoutAsideNavItem
                name={'Transacties'}
                icon={'transactions'}
                route={'transactions'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'view_finances')}
                id={'transactions'}
            />
            <LayoutAsideNavItem
                name={'Fondsen'}
                icon={'funds'}
                route={'provider-funds'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_provider_funds')}
                id={'funds'}
            />
            <LayoutAsideNavItem
                name={'Aanbod'}
                icon={'products'}
                route={'products'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_products')}
                id={'products'}
            />
            <LayoutAsideNavItem
                name={'Reserveringen'}
                icon={'reservations'}
                route={'reservations'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'scan_vouchers')}
                id={'reservations'}
            />
            <LayoutAsideNavItem
                name={'Medewerkers'}
                icon={'list'}
                route={'employees'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={hasPermission(activeOrganization, 'manage_employees')}
                id={'employees'}
            />
            <LayoutAsideNavItem
                name={'Bijbetaal methodes'}
                icon={'payment-methods'}
                route={'payment-methods'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={
                    activeOrganization?.can_view_provider_extra_payments &&
                    hasPermission(activeOrganization, 'manage_payment_methods')
                }
                id={'payment-methods'}
            />
            <LayoutAsideNavItem
                name={'Beveiliging'}
                icon={'organization-security'}
                route={'organization-security'}
                routeParams={{ organizationId: activeOrganization?.id }}
                show={
                    activeOrganization.allow_2fa_restrictions &&
                    hasPermission(activeOrganization, 'manage_organization')
                }
                id={'requesters'}
            />
        </div>
    );
}
