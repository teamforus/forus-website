export default interface DemoTransaction {
    id: number;
    token: string;
    state: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}
