import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import NotFound from '../components/pages_system/NotFound';
import Home from '../components/pages/home/Home';
import SignOut from '../components/pages/auth/SignOut';
import WIP from '../components/pages_system/WIP';
import AboutUs from '../components/pages/about-us/AboutUs';
import AboutUsInnovation from '../components/pages/about-us/AboutUsInnovation';
import RolesMain from '../components/pages/roles/RolesMain';
import RolesRequester from '../components/pages/roles/RolesRequester';
import RolesProvider from '../components/pages/roles/RolesProvider';
import RolesSponsor from '../components/pages/roles/RolesSponsor';
import RolesValidator from '../components/pages/roles/RolesValidator';
import BasicFunctions from '../components/pages/basic-functions/BasicFunctions';
import MeApp from '../components/pages/basic-functions/MeApp';
import CMS from '../components/pages/basic-functions/CMS';
import Funds from '../components/pages/basic-functions/Funds';
import Website from '../components/pages/basic-functions/Website';
import Information from '../components/pages/basic-functions/Information';
import Privacy from '../components/pages/privacy/Privacy';
import Contacts from '../components/pages/contacts/Contacts';
import BookDemo from '../components/pages/book-demo/BookDemo';

const router = new RouterBuilder();

router.state('home', <Home />, {
    path: `/`,
    protected: false,
});

router.state('sign-in', <WIP />, {
    path: `/sign-in`,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('basic-functions', <BasicFunctions />, {
    path: `/basic-functions`,
    protected: false,
});

router.state('me-app', <MeApp />, {
    path: `/me-app`,
    protected: false,
});

router.state('cms', <CMS />, {
    path: `/cms`,
    protected: false,
});

router.state('funds', <Funds />, {
    path: `/funds`,
    protected: false,
});

router.state('website', <Website />, {
    path: `/website`,
    protected: false,
});

router.state('information', <Information />, {
    path: `/information`,
    protected: false,
});

router.state('roles', <WIP />, {
    path: `/roles`,
    protected: false,
});

router.state('platform', <WIP />, {
    path: `/platform`,
    protected: false,
});

router.state('about-us', <AboutUs />, {
    path: `/about-us`,
    protected: false,
});

router.state('about-us-innovation', <AboutUsInnovation />, {
    path: `/about-us-innovation`,
    protected: false,
});

router.state('roles-main', <RolesMain />, {
    path: `/roles-main`,
    protected: false,
});

router.state('roles-requester', <RolesRequester />, {
    path: `/roles-requester`,
    protected: false,
});

router.state('roles-provider', <RolesProvider />, {
    path: `/roles-provider`,
    protected: false,
});

router.state('roles-sponsor', <RolesSponsor />, {
    path: `/roles-sponsor`,
    protected: false,
});

router.state('roles-validator', <RolesValidator />, {
    path: `/roles-validator`,
    protected: false,
});

router.state('contacts', <Contacts />, {
    path: `/contacts`,
    protected: false,
});

router.state('privacy', <Privacy />, {
    path: `/privacy`,
    protected: false,
});

router.state('book-demo', <BookDemo />, {
    path: `/demo-aanvragen`,
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
