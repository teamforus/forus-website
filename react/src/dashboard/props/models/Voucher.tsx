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
}
