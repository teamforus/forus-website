export default interface Identity {
    id: number;
    address?: string;
    bsn: boolean;
    bsn_time?: number;
    email?: string;
    count_vouchers: number;
    count_vouchers_active: number;
    count_vouchers_active_with_balance: number;
}
