import Fund from './Fund';
import File from '../../../dashboard/props/models/File';
import Transaction from '../../../dashboard/props/models/Transaction';

export default interface Reimbursement {
    id: number;
    title?: string;
    description?: string;
    amount?: string;
    amount_locale?: string;
    iban?: string;
    iban_name?: string;
    voucher_id?: number;
    code?: string;
    state?: 'draft' | 'pending' | 'approved' | 'declined';
    state_locale?: string;
    lead_time_locale?: string;
    employee_id?: number;
    expired?: boolean;
    deactivated?: boolean;
    reason?: string;
    resolved?: boolean;
    fund?: Fund;
    files?: Array<File>;
    voucher_transaction?: Transaction;
    rejected_at?: string;
    rejected_at_locale?: string;
    resolved_at?: string;
    resolved_at_locale?: string;
    submitted_at?: string;
    submitted_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
}
