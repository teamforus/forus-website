import Media from './Media';

export default interface Implementation {
    id: number;
    name: string;
    logo?: string;
    url_webshop?: string;
    has_provider_terms_page: boolean;
    informal_communication?: boolean;
    email_color?: string;
    email_signature?: string;
    email_logo?: Media;
    email_signature_html?: string;
    email_color_default?: string;
    email_signature_default?: string;
    email_logo_default?: Media;
}
