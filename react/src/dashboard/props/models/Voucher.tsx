import Fund from './Fund';
import Media from './Media';
import Product from './Product';

export default interface Voucher {
    id: number;
    fund_id: number;
    fund: Fund;
    allowed_organizations: Array<{
        id: number;
        name: string;
        logo: Media;
    }>;
    showTooltip?: boolean;
    identity_email?: string;
    activation_code?: string;
    identity_bsn?: string;
    relation_bsn?: string;
    client_uid?: string;
    physical_card?: {
        id: number;
        code: string;
    };
    source_locale?: string;
    amount?: string;
    amount_total?: string;
    amount_top_up?: string;
    amount_available?: string;
    note?: string;
    created_at_locale?: string;
    expire_at_locale?: string;
    in_use?: boolean;
    first_use_date_locale?: string;
    has_payouts?: boolean;
    expired: boolean;
    state: string;
    state_locale: string;
    showMenu: boolean;
    is_granted?: boolean;
    address: string;
    product?: Product;
    is_external: boolean;
    limit_multiplier?: number;
}
