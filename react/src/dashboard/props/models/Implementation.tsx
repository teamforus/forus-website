import Media from './Media';

export default interface Implementation {
    id: number;
    name: string;
    organization_id?: number;
    has_provider_terms_page: boolean;
    url_webshop?: string;
    logo: string;
    pre_check_enabled: boolean;
    pre_check_url?: string;
    pre_check_title: string;
    pre_check_description: string;
    pre_check_banner?: Media;
    pre_check_banner_state: string;
    pre_check_banner_label: string;
    pre_check_banner_description: string;
    pre_check_banner_title: string;
}
