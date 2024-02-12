import Organization from './Organization';
import Fund from './Fund';

export default interface FundProviderInvitation {
    id: number;
    state: string;
    allow_budget: boolean;
    allow_products: boolean;
    expired: boolean;
    fund: Fund;
    from_fund: Fund;
    provider_organization: Organization;
    sponsor_organization: Organization;
    can_be_accepted: boolean;
    created_at: string;
    created_at_locale: string;
    expire_at: string;
    expire_at_locale: string;
}
