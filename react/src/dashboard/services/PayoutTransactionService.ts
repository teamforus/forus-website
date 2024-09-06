import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import Transaction from '../props/models/Transaction';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import Papa from 'papaparse';
import PayoutTransaction from '../props/models/PayoutTransaction';

export class PayoutTransactionService<T = PayoutTransaction> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    public list(organizationId: number, data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/sponsor/payouts`, data);
    }

    public store(organizationId: number, data: object = {}): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts`, data);
    }

    public update(
        organizationId: number,
        address: string,
        data: {
            cancel?: boolean;
            skip_transfer_delay?: boolean;
            note?: string;
            amount?: string;
            amount_preset_id?: number;
            target_name?: string;
            target_iban?: string;
        } = {},
    ): Promise<ApiResponseSingle<Transaction>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/sponsor/payouts/${address}`, data);
    }

    public show(type: string, organizationId: number, address: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/${type}/payouts/${address}`);
    }

    public storeBatch(organizationId: number, data: object = {}): Promise<ApiResponse<Transaction>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts/batch`, data);
    }

    public storeBatchValidate(organizationId: number, data: object = {}): Promise<ResponseSimple<null>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/sponsor/payouts/batch/validate`, data);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        return [
            {
                key: 'id',
                value: 'id',
                label: 'payouts.labels.id',
                tooltip: { key: 'id', title: 'payouts.labels.id', description: 'payouts.tooltips.id' },
            },
            {
                key: 'fund',
                value: 'fund_name',
                label: 'payouts.labels.fund',
                tooltip: {
                    key: 'fund',
                    title: 'payouts.labels.fund',
                    description: 'payouts.tooltips.fund',
                },
            },
            {
                key: 'amount',
                value: 'amount',
                label: 'payouts.labels.amount',
                tooltip: { key: 'amount', title: 'payouts.labels.amount', description: 'payouts.tooltips.amount' },
            },
            {
                key: 'created_at',
                value: 'created_at',
                label: 'payouts.labels.created_at',
                tooltip: {
                    key: 'created_at',
                    title: 'payouts.labels.created_at',
                    description: 'payouts.tooltips.created_at',
                },
            },
            {
                key: 'transfer_at',
                value: 'transfer_at',
                label: 'payouts.labels.transfer_at',
                tooltip: {
                    key: 'transfer_at',
                    title: 'payouts.labels.transfer_at',
                    description: 'payouts.tooltips.transfer_at',
                },
            },
            {
                key: 'creation_method',
                value: 'creation_method',
                label: 'payouts.labels.creation_method',
                tooltip: {
                    key: 'creation_method',
                    title: 'payouts.labels.creation_method',
                    description: 'payouts.tooltips.creation_method',
                },
            },
            {
                key: 'relation',
                value: 'relation',
                label: 'payouts.labels.relation',
                tooltip: {
                    key: 'relation',
                    title: 'payouts.labels.relation',
                    description: 'payouts.tooltips.relation',
                },
            },
            {
                key: 'status',
                value: 'state',
                label: 'payouts.labels.status',
                tooltip: { key: 'status', title: 'payouts.labels.status', description: 'payouts.tooltips.status' },
            },
            {
                key: 'employee',
                value: 'employee_email',
                label: 'payouts.labels.employee',
                tooltip: {
                    key: 'employee',
                    title: 'payouts.labels.employee',
                    description: 'payouts.tooltips.employee',
                },
            },
            {
                key: 'target_iban',
                value: 'target_iban',
                label: 'payouts.labels.target_iban',
                tooltip: {
                    key: 'target_iban',
                    title: 'payouts.labels.target_iban',
                    description: 'payouts.tooltips.target_iban',
                },
            },
            {
                key: 'description',
                value: 'description',
                label: 'payouts.labels.description',
                tooltip: {
                    key: 'description',
                    title: 'payouts.labels.description',
                    description: 'payouts.tooltips.description',
                },
            },
        ];
    }

    public sampleCsv() {
        const headers = ['amount', 'target_iban', 'target_name', 'description', 'bsn', 'email'];
        const values = [1, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', '', ''];

        return Papa.unparse([headers, values]);
    }
}

export default function usePayoutTransactionService(): PayoutTransactionService {
    return useState(new PayoutTransactionService())[0];
}
