export default interface EnvDataWebshopProp {
    client_key: string;
    client_type: string;
    name: string;
    type: 'webshop';
    webRoot?: string;
    useHashRouter?: boolean;
    config: {
        api_url: string;
        site_improve_analytics_id?: string;
        matomo_site_id?: string;
        sessions?: boolean;
        google_maps_api_key?: string;
        default_title?: string;

        me_app_link?: string;
        ios_ipad_link?: string;
        ios_iphone_link?: string;
        android_link?: string;

        provider_sign_up_filters: {
            [key: string]: string;
        };

        flags: {
            genericSearch?: boolean;
            genericSearchUseToggle?: boolean;
            showAccountSidebar?: boolean;
            showOnlyUsedCategories?: boolean;
            show2FAMenu?: boolean;
            useLightAppIcons?: boolean;

            // menu settings
            meAppMenu?: boolean;
            forusPlatformMenu?: boolean;
            portfolioMenu?: boolean;
            aboutSiteMenu?: boolean;
            fundsMenu?: boolean;
            fundsMenuIfLoggedOut?: boolean;
            productsMenu?: boolean;
            providersMenu?: boolean;
            providersSignUpMenu?: boolean;

            noPrintOption?: boolean;
            activateFirstFund?: boolean;
            accessibilityPage?: boolean;
            privacyPage?: boolean;

            // home
            showStartButton?: boolean;
            showStartButtonText?: string;

            showFooterSponsorLogo?: boolean;
            productDetailsOnlyAvailableFunds?: boolean;

            productsAlign?: 'left' | 'center' | 'right';
            logoExtension?: '.svg' | '.png';

            menuItems?: Array<{
                id?: string;
                name?: string;
                href?: string;
                target?: string;
            }>;

            startPage?: {
                combineColumns?: boolean;
                hideSignUpColumn?: boolean;
                hideSignUpDigidOption?: boolean;
                hideSignUpEmailOption?: boolean;
                hideSignUpQrCodeOption?: boolean;
                hideSignInColumn?: boolean;
                hideSignInDigidOption?: boolean;
                hideSignInEmailOption?: boolean;
                hideSignInQrCodeOption?: boolean;
            };
        };
    };
}
