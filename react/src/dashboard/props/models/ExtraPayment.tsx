import ExtraPaymentRefund from './ExtraPaymentRefund';

export default interface ExtraPayment {
    is_paid?: boolean;
    is_fully_refunded?: boolean;
    state?: string;
    refunds?: Array<ExtraPaymentRefund>;
}
