import ExtraPayment from './ExtraPayment';
import Product from './Product';
import Transaction from './Transaction';

export default interface Reservation {
    id: number;
    code: string;
    amount_extra?: number;
    amount_extra_locale?: number;
    voucher_id?: number;
    extra_payment?: ExtraPayment;
    state?: string;
    state_locale?: string;
    expired?: boolean;
    product?: Product;
    price?: string;
    price_locale?: string;
    amount?: string;
    amount_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    birth_date_locale?: string;
    identity_email?: string;
    identity_physical_card?: string;
    archivable?: boolean;
    archived?: boolean;
    voucher_transaction: Transaction;
    accepted_at?: string;
    accepted_at_locale?: string;
    rejected_at?: string;
    rejected_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
    user_note?: string;
    acceptable?: boolean;
    rejectable?: boolean;
    custom_fields?: Array<{
        label: string;
        value: string;
    }>;
    fund: {
        id: number;
        name: string;
        organization: {
            id: number;
            name: string;
        };
    };
}
