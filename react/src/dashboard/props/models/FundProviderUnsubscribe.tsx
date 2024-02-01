import FundProvider from './FundProvider';
import Fund from './Fund';

export default interface FundProviderUnsubscribe {
    id: number;
    fund_provider_id: number;
    note: string;
    state: string;
    state_locale: string;
    is_expired: boolean;
    can_cancel: boolean;
    fund_provider: FundProvider;
    fund: Fund;
    unsubscribe_at: string;
    unsubscribe_at_locale: string;
    unsubscribe_days_left: number;
    created_at: string;
    created_at_locale: string;
}
