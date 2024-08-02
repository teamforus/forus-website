import fund from './en/pages/fund';

import fund_request from './en/pages/fund-request';
import funds from './en/pages/funds';
import home from './en/pages/home';
import meapp_index from './en/pages/me-index';
import product from './en/pages/product';
import records_validations from './en/pages/record-validations';
import records_create from './en/pages/records-create';
import records_validate from './en/pages/records-validate';
import records from './en/pages/records';
import voucher from './en/pages/voucher';
import vouchers from './en/pages/vouchers';
import reservations from './en/pages/reservations';
import reimbursements from './en/pages/reimbursements';
import notification_preferences from './en/pages/notification-preferences';
import error_page from './en/pages/error-page';

import buttons from './en/components/buttons';
import topnavbar from './en/layout/navbar';

import popup_auth from './en/modals/modal-auth';
import popup_offices from './en/modals/modal-offices';
import open_in_me from './en/modals/modal-open-in-me';
import modal from './en/modals/modal';

import app_footer from './en/directives/app-footer';
import block_products from './en/directives/block-products';
import block_providers from './en/directives/block-providers';
import empty_block from './en/directives/empty-block';
import fund_criterion from './en/directives/fund-criterion';
import maps from './en/directives/google-map';
import profile_menu from './en/directives/profile-menu';
import top_navbar_search from './en/directives/top-navbar-search';
import reservation from './nl/directives/reservation-card';

export default {
    test: '{{name}} {{foo}}',
    page_title: 'Webshop',
    page_state_titles: {
        home: '{{implementation}} webshop',
        funds: 'Fondsen',
        platform: 'Forus Platform',
        me: 'Me',
        'me-app': 'Me-app',
        portfolio: 'Portfolio',
        kindpakket: 'Portofolio - Kindpakket',
        products: 'Aanbiedingen',
        'products-show': 'Aanbieding',
        'products-apply': 'Aanbieding kopen',
        vouchers: 'Mijn tegoeden',
        voucher: 'Uw tegoed',
        records: 'Persoonsgegevens',
        reservations: 'Reserveringen',
        'record-validate': 'Valideer persoonsgegeven',
        'record-validations': 'Validaties',
        'record-create': 'Persoonsgegevens toevoegen',
        'funds-apply': 'Meld u aan voor de fondsen',
        'restore-email': 'Inloggen via e-mail',
    },
    implementation_name: {
        general: 'General',
        zuidhorn: 'Zuidhorn',
        westerkwartier: 'Potjeswijzer',
        forus: 'Forus platform & ',
        kerstpakket: 'Kerstpakket',
        berkelland: 'Berkelland',
        oostgelre: 'Oostgelre',
        winterswijk: 'Winterswijk',
        groningen: 'Groningen',
        noordoostpolder: 'Meedoenpakket webshop',
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },

    // COMPONENTS
    buttons: buttons,

    // LAYOUT
    topnavbar: topnavbar,

    // PAGES
    fund: fund,
    fund_request: fund_request,
    funds: funds,
    home: home,
    meapp_index: meapp_index,
    product: product,
    records_validations: records_validations,
    records_create: records_create,
    records_validate: records_validate,
    records: records,
    voucher: voucher,
    vouchers: vouchers,
    reservations: reservations,
    reimbursements: reimbursements,
    notification_preferences: notification_preferences,
    error_page: error_page,

    // MODALS
    popup_auth: popup_auth,
    popup_offices: popup_offices,
    open_in_me: open_in_me,
    modal: modal,

    // DIRECTIVES
    app_footer: app_footer,
    block_products: block_products,
    block_providers: block_providers,
    empty_block: empty_block,
    fund_criterion: fund_criterion,
    maps: maps,
    profile_menu: profile_menu,
    top_navbar_search: top_navbar_search,
    reservation: reservation,
};
