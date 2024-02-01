export default interface Note {
    id: number;
    description?: string;
    created_at_locale?: string;
    message?: string;
    icon?: string;
    group?: 'sponsor' | 'provider';
    employee?: {
        email?: string;
        identity_address?: string;
    };
}
