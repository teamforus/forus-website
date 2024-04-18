const fronts = {};
const api_url = 'http://localhost:8000/api/v1';

const baseImplementationKey = 'general';
const support_id = false;
const chat_id = false;
const sessions = true;
const google_maps_api_key = '';

const me_app_link = 'https://forus.io/DL';
const ios_ipad_link = 'https://testflight.apple.com/join/gWw1lXyB';
const ios_iphone_link = 'https://testflight.apple.com/join/gWw1lXyB';
const android_link = 'https://media.forus.io/static/me-0.0.5-staging-7-release.apk';
const help_link = 'https://helpcentrum.forus.io';

const use_hash_router = true;

fronts['webshop.general'] = {
    type: 'webshop',
    client_key: 'general',
    client_type: 'webshop',
    name: 'General webshop',
    useHashRouter: use_hash_router,
    config: {
        api_url: api_url,
        google_maps_api_key: google_maps_api_key,
        sessions: true,
        provider_sign_up_filters: {
            foo: 'bar',
        },
        flags: {
            fundsMenu: true,
            show2FAMenu: true,
            logoExtension: '.svg',
            showStartButton: true,
            genericSearch: true,
        },
    },
};

fronts['webshop.nijmegen'] = {
    type: 'webshop',
    client_key: 'nijmegen',
    client_type: 'webshop',
    name: 'Nijmegen webshop',
    useHashRouter: use_hash_router,
};

fronts['dashboard.sponsor'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'sponsor',
    // webRoot: 'dashboard.sponsor',
    name: 'Sponsor dashboard',
    useHashRouter: use_hash_router,
    config: {
        api_url: api_url,
        chat_id: chat_id,
        support_id: support_id,
        google_maps_api_key: google_maps_api_key,

        help_link: help_link,
        me_app_link: me_app_link,
        ios_ipad_link: ios_ipad_link,
        ios_iphone_link: ios_iphone_link,
        android_link: android_link,

        sessions: sessions,
    },
};

fronts['dashboard.provider'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'provider',
    name: 'Provider dashboard',
    // webRoot: 'dashboard.provider',
    useHashRouter: use_hash_router,
    config: {
        api_url: api_url,
        chat_id: chat_id,
        support_id: support_id,
        google_maps_api_key: google_maps_api_key,

        help_link: help_link,
        me_app_link: me_app_link,
        ios_ipad_link: ios_ipad_link,
        ios_iphone_link: ios_iphone_link,
        android_link: android_link,

        sessions: sessions,
    },
};

fronts['dashboard.validator'] = {
    type: 'dashboard',
    client_key: baseImplementationKey,
    client_type: 'validator',
    name: 'Validator dashboard',
    // webRoot: 'dashboard.validator',
    useHashRouter: use_hash_router,
    config: {
        api_url: api_url,
        chat_id: chat_id,
        support_id: support_id,
        google_maps_api_key: google_maps_api_key,

        help_link: help_link,
        me_app_link: me_app_link,
        ios_ipad_link: ios_ipad_link,
        ios_iphone_link: ios_iphone_link,
        android_link: android_link,

        sessions: sessions,
        single_record_validation: true,
    },
};

// eslint-disable-next-line no-undef
module.exports = {
    fronts: fronts,
    enableOnly: [/*'dashboard.sponsor', 'dashboard.provider', */ 'dashboard.validator'],
    httpsKey: null,
    httpsCert: null,
};
