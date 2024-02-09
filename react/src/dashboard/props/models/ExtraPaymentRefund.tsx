export default interface ExtraPaymentRefund {
    id: number;
    state: 'queued' | 'refunded' | 'canceled' | 'processing' | 'pending' | 'failed';
    state_locale: string;
    amount: string;
    amount_locale: string;
    created_at: string;
    created_at_locale: string;
}
