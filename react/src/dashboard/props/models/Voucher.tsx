import Fund from './Fund';
import Media from './Media';

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
    note?: string;
    created_at_locale?: string | null;
    expire_at_locale?: string | null;
    in_use?: boolean;
    first_use_date_locale?: string | null;
    expired?: boolean;
    state?: string;
    state_locale?: string;
    amount?: string;
}
