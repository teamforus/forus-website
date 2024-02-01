export default interface FundProviderChatMessage {
    id?: number;
    fund_provider_chat_id?: number;
    message?: string;
    identity_address?: string;
    created_at?: string;
    updated_at?: string;
    created_at_locale?: string;
    updated_at_locale?: string;
    counterpart?: string;
    sponsor_seen?: boolean;
    provider_seen?: boolean;
    is_today?: boolean;
    time?: string;
    date?: string;
}
