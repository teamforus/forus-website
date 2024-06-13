export default interface BiConnection {
    id: number;
    access_token: string;
    enabled: boolean;
    expired: boolean;
    organization_id: number;
    ips?: Array<string>;
    data_types: Array<string>;
    expiration_period: number;
    created_at?: string;
    created_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
}
