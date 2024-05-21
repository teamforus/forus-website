import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';

export default interface Fund {
    id: number;
    name?: string;
    key?: string;
    logo?: Media;
    description?: string;
    description_short?: string;
    organization_id: number;
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
    request_btn_text?: string;
    external_link_url?: string;
    external_link_text?: string;
    description_html?: string;
    description_position?: 'before' | 'after' | 'replace';
    implementation?: Implementation;
    faq: Array<{
        id: number;
        title: string;
        description: string;
        description_html: string;
    }>;
    faq_title?: string;
    allow_reimbursements?: boolean;
    allow_physical_cards?: boolean;
    allow_blocking_vouchers?: boolean;
}
