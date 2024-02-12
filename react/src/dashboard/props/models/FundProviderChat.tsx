export default interface FundProviderChat {
    id?: number;
    fund_id?: number;
    product_id?: number;
    fund_provider_id?: number;
    identity_address?: string;
    created_at?: string;
    updated_at?: string;
    created_at_locale?: string;
    updated_at_locale?: string;
    provider_unseen_messages?: number;
    sponsor_unseen_messages?: number;
}
