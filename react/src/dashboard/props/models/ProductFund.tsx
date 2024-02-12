import Organization from './Organization';
import Media from './Media';

export default interface ProductFund {
    id: number;
    name: string;
    description: string;
    organization_id: number;
    state: string;
    logo: Media;
    start_date: string;
    end_date: string;
    start_date_locale: string;
    end_date_locale: string;
    organization: Organization;
    implementation: {
        url_webshop: string;
    };
    approved: boolean;
    provider_excluded: boolean;
}
