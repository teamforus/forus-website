import components from './en/i18n-components';
import modals from './en/i18n-modals';
import pages from './en/i18n-pages';

export default {
    organizations: {
        title: 'Kies een organisatie om in te loggen',
    },

    components,

    // PAGES
    ...pages,

    // MODALS
    modals: {
        ...modals,
    },
};
