import MollieConnectionProfile from './MollieConnectionProfile';

export default interface MollieConnection {
    id: number;
    city?: string;
    street?: string;
    postcode?: string;
    last_name?: string;
    first_name?: string;
    vat_number?: string;
    country_code?: string;
    business_type?: string;
    organization_id: number;
    onboarding_state: string;
    organization_name: string;
    registration_number?: string;
    onboarding_state_locale: string;
    created_at: string;
    created_at_locale: string;
    completed_at?: string;
    completed_at_locale?: string;
    profiles: Array<MollieConnectionProfile>;
    profile_active: MollieConnectionProfile;
    profile_pending: MollieConnectionProfile;
    organization: {
        id: number;
        name: string;
    };
}
