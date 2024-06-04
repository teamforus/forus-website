import Organization from './Organization';
import Media from './Media';
import Implementation from './Implementation';
import Tag from './Tag';
import Faq from './Faq';
import FundFormula from '../../../webshop/props/models/FundFormula';
import FundCriterion from './FundCriterion';

interface FundVoucherStatistics {
    active_vouchers_amount?: string;
    active_vouchers_amount_locale?: string;
    vouchers_amount?: string;
    vouchers_amount_locale?: string;
    inactive_vouchers_amount?: string;
    inactive_vouchers_amount_locale?: string;
    deactivated_vouchers_amount?: string;
    deactivated_vouchers_amount_locale?: string;
    vouchers_count?: number;
    active_vouchers_count?: number;
    inactive_vouchers_count?: number;
    deactivated_vouchers_count?: number;
    children_count?: number;
}

export default interface Fund {
    id: number;
    key?: string;
    name?: string;
    logo?: Media;
    description?: string;
    description_short?: string;
    description_html: string;
    organization_id: number;
    organization?: Organization;
    products_count_all?: number;
    products_count_approved?: number;
    products_count_available?: number;
    state?: 'pending' | 'active' | 'closed' | 'paused' | 'waiting';
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
    description_position?: 'before' | 'after' | 'replace';
    implementation?: Implementation;
    allow_voucher_records?: boolean;
    allow_voucher_top_ups?: boolean;
    limit_per_voucher?: number;
    limit_sum_vouchers?: number;
    limit_voucher_top_up_amount?: string;
    limit_voucher_total_amount?: string;
    backoffice?: {
        backoffice_enabled?: boolean;
        backoffice_url?: string;
        backoffice_key?: string;
        backoffice_certificate?: string;
        backoffice_fallback?: boolean;
        backoffice_ineligible_policy?: string;
        backoffice_ineligible_redirect_url?: string;
    };
    type_locale: string;
    requester_count: number;
    criteria: Array<FundCriterion>;
    criteria_editable: boolean;
    provider_organizations_count: number;
    provider_employees_count: number;
    is_configured: boolean;
    sponsor_count: number;
    auth_2fa_policy?: 'global' | 'optional' | 'required' | 'restrict_features';
    auth_2fa_remember_ip?: boolean;
    auth_2fa_restrict_emails?: boolean;
    auth_2fa_restrict_auth_sessions?: boolean;
    auth_2fa_restrict_bi_connections?: boolean;
    auth_2fa_restrict_reimbursements?: boolean;
    organization_funds_2fa?: {
        auth_2fa_policy: 'global' | 'optional' | 'required' | 'restrict_features';
        auth_2fa_remember_ip?: boolean;
        auth_2fa_restrict_emails?: boolean;
        auth_2fa_restrict_auth_sessions?: boolean;
        auth_2fa_restrict_reimbursements?: boolean;
        auth_2fa_restrict_bi_connections?: boolean;
    };
    balance_provider: string;
    allow_fund_requests?: boolean;
    allow_prevalidations?: boolean;
    tags: Array<Tag>;
    faq?: Array<Faq>;
    csv_primary_key: string;
    csv_required_keys: Array<string>;
    formulas?: Array<FundFormula>;
    budget?: FundVoucherStatistics & {
        used_active_vouchers?: string;
        used_active_vouchers_locale?: string;
        total?: string;
        total_locale?: string;
        used?: string;
        used_locale?: string;
        left?: string;
        left_locale?: string;
        transaction_costs?: string;
        transaction_costs_locale?: string;
    };
    product_vouchers: FundVoucherStatistics;
    faq_title?: string;
    allow_reimbursements?: boolean;
    allow_physical_cards?: boolean;
    allow_blocking_vouchers?: boolean;
}
