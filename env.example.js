const fronts = {};

fronts['webshop.general'] = {
    type: 'webshop',
    client_key: 'general',
    client_type: 'webshop',
    name: "General webshop",
};

fronts['webshop.nijmegen'] = {
    type: 'webshop',
    client_key: 'nijmegen',
    client_type: 'webshop',
    name: "Nijmegen webshop",
};

fronts['dashboard.sponsor'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'sponsor',
    name: "Sponsor dashboard",
};

fronts['dashboard.provider'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'provider',
    name: "Provider dashboard",
};

fronts['dashboard.validator'] = {
    type: 'dashboard',
    client_key: 'general',
    client_type: 'validator',
    name: "Validator dashboard",
};

module.exports = {
    fronts: fronts,
    // enableOnly: ['webshop.general', 'webshop.nijmegen'],
};
