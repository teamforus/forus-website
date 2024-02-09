import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import SignIn from '../components/pages/auth/SignIn';
import SignUp from '../components/pages/auth/SignUp';
import SignOut from '../components/pages/auth/SignOut';
import FundRequests from '../components/pages/fund_requests/FundRequests';
import Home from '../components/pages/home/Home';
import ExternalFunds from '../components/pages/external_funds/ExternalFunds';
import Employees from '../components/pages/employees/Employees';
import CsvValidations from '../components/pages/csv_validations/CsvValidations';
import Organizations from '../components/pages/organizations/Organizations';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import Redirect from '../components/pages/redirect/Redirect';
import { LayoutType } from '../modules/state_router/RouterProps';
import OfficesEdit from '../components/pages/offices-edit/OfficesEdit';
import OfficesCreate from '../components/pages/offices-edit/OfficesCreate';
import OrganizationEdit from '../components/pages/organizations-edit/OrganizationEdit';
import OrganizationCreate from '../components/pages/organizations-edit/OrganizationCreate';
import Auth2FA from '../components/pages/auth/Auth2FA';
import ProviderOverview from '../components/pages/provider-overview/ProviderOverview';
import Offices from '../components/pages/offices/Offices';
import Products from '../components/pages/products/Products';
import ProductsCreate from '../components/pages/products-edit/ProductsCreate';
import ProductsEdit from '../components/pages/products-edit/ProductsEdit';
import ProductsView from '../components/pages/products-view/ProductsView';
import Transactions from '../components/pages/transactions/Transactions';
import TransactionsView from '../components/pages/transactions-view/TransactionsView';
import Reservations from '../components/pages/reservations/Reservations';
import ReservationsSettings from '../components/pages/reservations-settings/ReservationsSettings';
import ReservationsView from '../components/pages/reservations-view/ReservationsView';
import ProviderFunds from '../components/pages/provider-funds/ProviderFunds';
import NotFound from '../components/pages_system/NotFound';
import FundRequestsView from '../components/pages/fund_requests-view/FundRequestsView';
import OrganizationsSecurity from '../components/pages/organizations-security/OrganizationsSecurity';
import OrganizationsView from '../components/pages/organizations-view/OrganizationsView';
import OrganizationsNotifications from '../components/pages/organizations-notifications/OrganizationsNotifications';
import PreferencesEmails from '../components/pages/identity-preferences/PreferencesEmails';
import PreferencesNotifications from '../components/pages/identity-preferences/PreferencesNotifications';
import Security2FA from '../components/pages/identity-security/Security2FA';
import SecuritySessions from '../components/pages/identity-security/SecuritySessions';
import OrganizationsNoPermissions from '../components/pages/organizations-no-permissions/OrganizationsNoPermissions';
import PaymentMethods from '../components/pages/payment-methods/PaymentMethods';
import MolliePrivacy from '../components/pages/mollie-privacy/MolliePrivacy';

const router = new RouterBuilder();

router.state('sign-in', <SignIn />, {
    path: `/sign-in`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('sign-up', <SignUp />, {
    path: `/sign-up`,
    layout: LayoutType.landingClearNew,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('auth-2fa', <Auth2FA />, {
    path: `/auth-2fa`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('identity-restore', <IdentityRestore confirmation={false} />, {
    path: `/identity-restore`,
    protected: false,
});

router.state('identity-confirmation', <IdentityRestore confirmation={true} />, {
    path: `/confirmation/email/:token`,
    protected: false,
});

router.state('organizations', <Organizations />, {
    path: `/organizations`,
    protected: false,
});

router.state('organizations-view', <OrganizationsView />, {
    path: `/organizations/:organizationId`,
    protected: false,
});

router.state('organizations-create', <OrganizationCreate />, {
    path: `/organizations/create`,
    protected: false,
    fallbackState: 'organizations',
});

router.state('organizations-edit', <OrganizationEdit />, {
    path: `/organizations/:organizationId/edit`,
    fallbackState: 'organizations',
});

router.state('offices', <Offices />, {
    path: `/organizations/:organizationId/offices`,
});

router.state('offices-create', <OfficesCreate />, {
    path: `/organizations/:organizationId/offices/create`,
    protected: false,
    fallbackState: 'organizations',
});

router.state('offices-edit', <OfficesEdit />, {
    path: `/organizations/:organizationId/offices/:id/edit`,
    fallbackState: 'organizations',
});

router.state('organization-security', <OrganizationsSecurity />, {
    path: `/organizations/:organizationId/security`,
});

router.state('organization-no-permissions', <OrganizationsNoPermissions />, {
    path: `/organizations/:organizationId/no-permissions`,
});

router.state('provider-overview', <ProviderOverview />, {
    path: `/organizations/:organizationId/overview`,
});

router.state('provider-funds', <ProviderFunds />, {
    path: `/organizations/:organizationId/provider/funds`,
});

router.state('transactions', <Transactions />, {
    path: `/organizations/:organizationId/transactions`,
});

router.state('transaction', <TransactionsView />, {
    path: `/organizations/:organizationId/transactions/:address`,
});

router.state('reservations', <Reservations />, {
    path: `/organizations/:organizationId/reservations`,
});

router.state('reservations-show', <ReservationsView />, {
    path: `/organizations/:organizationId/reservations/:id`,
});

router.state('reservations-settings', <ReservationsSettings />, {
    path: `/organizations/:organizationId/reservations/settings`,
});

router.state('payment-methods', <PaymentMethods />, {
    path: `/organizations/:organizationId/payment-methods`,
});

router.state('mollie-privacy', <MolliePrivacy />, {
    path: `/organizations/:organizationId/mollie-privacy`,
});

router.state('products', <Products />, {
    path: `/organizations/:organizationId/products`,
});

router.state('products-show', <ProductsView />, {
    path: `/organizations/:organizationId/products/:id`,
    fallbackState: 'products',
});

router.state('products-create', <ProductsCreate />, {
    path: `/organizations/:organizationId/products/create`,
    fallbackState: 'products',
});

router.state('products-edit', <ProductsEdit />, {
    path: `/organizations/:organizationId/products/:id/edit`,
    fallbackState: 'products',
});

router.state('fund-requests', <FundRequests />, {
    path: `/organizations/:organizationId/requests`,
});

router.state('fund-request', <FundRequestsView />, {
    path: `/organizations/:organizationId/requests/:id`,
    fallbackState: 'fund-requests',
});

router.state('external-funds', <ExternalFunds />, {
    path: `/organizations/:organizationId/external-funds`,
});

router.state('employees', <Employees />, {
    path: `/organizations/:organizationId/employees`,
});

router.state('organization-notifications', <OrganizationsNotifications />, {
    path: `/organizations/:organizationId/notifications`,
});

router.state('csv-validation', <CsvValidations />, {
    path: `/csv-validation/funds/:fundId?`,
});

router.state('preferences-emails', <PreferencesEmails />, {
    path: `/preferences/emails`,
});

router.state('preferences-notifications', <PreferencesNotifications />, {
    path: `/preferences/notifications`,
});

router.state('security-2fa', <Security2FA />, {
    path: `/security/2fa`,
});

router.state('security-sessions', <SecuritySessions />, {
    path: `/security/sessions`,
});

router.state('redirect', <Redirect />, {
    path: `/redirect`,
    layout: LayoutType.clear,
});

router.state('home', <Home />, {
    path: `/`,
    protected: false,
});

router.state('not-found', <NotFound />, {
    path: `/not-found`,
    protected: false,
});

router.state('*', <NotFound />, {
    path: `*`,
    protected: false,
});

export default router;
