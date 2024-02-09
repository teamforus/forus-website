import ExtraPaymentRefund from './ExtraPaymentRefund';

export default interface ExtraPayment {
    is_paid?: boolean;
    is_fully_refunded?: boolean;
    is_refundable?: boolean;
    state?: string;
    state_locale?: string;
    is_pending?: boolean;
    amount_locale?: string;
    paid_at_locale?: string;
    method?: 'ideal';
    refunds?: Array<ExtraPaymentRefund>;
}
