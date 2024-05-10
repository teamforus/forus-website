import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';

export default interface Fund {
    id: number;
    name?: string;
    logo?: Media;
    organization_id?: number;
    organization?: Organization;
    products_count_all?: number;
    products_count_approved?: number;
    products_count_available?: number;
    state?: 'pending' | 'active' | 'closed';
    state_locale?: string;
    start_date?: string;
    start_date_locale?: string;
    end_date?: string;
    end_date_locale?: string;
    fund_amount?: string;
    fund_amount_locale?: string;
    type?: 'budget' | 'subsidies' | 'external';
    allow_direct_payments?: boolean;
    archived?: boolean;
    expired?: boolean;
    implementation?: Implementation;
    allow_voucher_records?: boolean;
    allow_voucher_top_ups?: boolean;
    allow_physical_cards?: boolean;
    limit_per_voucher?: number;
}
