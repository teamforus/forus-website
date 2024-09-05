import ApiResponse, { ApiResponseSingle, ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { format } from 'date-fns';
import Fund from '../props/models/Fund';
import Voucher from '../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../dashboard/services/ConfigService';
import FundsListItemModel from './types/FundsListItemModel';
import RecordType from '../../dashboard/props/models/RecordType';

export class FundService<T = Fund> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/funds';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }

    public apply(id: number): Promise<ApiResponseSingle<Voucher>> {
        return this.apiRequest.post(`${this.prefix}/${id}/apply`);
    }

    public check(id: number): Promise<
        ResponseSimple<{
            vouchers?: number;
            prevalidations?: number;
            prevalidation_vouchers?: Array<Voucher>;
            backoffice?: {
                backoffice_error?: number;
                backoffice_error_key?: string;
                backoffice_fallback?: boolean;
                backoffice_redirect?: string;
            };
        }>
    > {
        return this.apiRequest.post(`${this.prefix}/${id}/check`);
    }

    public request(id: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${id}/request`, data);
    }

    public read(id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${id}`, data);
    }

    public redeem(code: string): Promise<ResponseSimple<{ prevalidation: Array<T>; vouchers: Array<T> }>> {
        return this.apiRequest.post(`${this.prefix}/redeem`, { code });
    }

    public mapFund(fund: FundsListItemModel, vouchers: Array<Voucher>, configs: AppConfigProp): FundsListItemModel {
        fund.vouchers = vouchers.filter((voucher) => voucher.fund_id == fund.id && !voucher.expired);
        fund.isApplicable =
            fund.criteria.length > 0 && fund.criteria.filter((criterion) => !criterion.is_valid).length == 0;

        fund.alreadyReceived = fund.vouchers.length !== 0;

        fund.canApply =
            !fund.is_external && !fund.alreadyReceived && fund.isApplicable && !fund.has_pending_fund_requests;

        fund.showRequestButton =
            !fund.alreadyReceived &&
            !fund.has_pending_fund_requests &&
            !fund.isApplicable &&
            fund.allow_direct_requests &&
            configs.funds.fund_requests;

        fund.showPendingButton = !fund.alreadyReceived && fund.has_pending_fund_requests;
        fund.showActivateButton = !fund.alreadyReceived && fund.isApplicable;

        fund.linkPrimaryButton =
            [fund.showRequestButton, fund.showPendingButton, fund.showActivateButton, fund.alreadyReceived].filter(
                (flag) => flag,
            ).length === 0;

        return fund;
    }

    public getCurrencyKeys() {
        return ['net_worth', 'base_salary'];
    }

    public getCriterionControlType(record_type: RecordType, operator = null) {
        const checkboxKeys = ['children', 'kindpakket_eligible', 'kindpakket_2018_eligible'];
        const stepKeys = [
            'children_nth',
            'waa_kind_0_tm_4_2021_eligible_nth',
            'waa_kind_4_tm_18_2021_eligible_nth',
            'eem_kind_0_tm_4_eligible_nth',
            'eem_kind_4_tm_12_eligible_nth',
            'eem_kind_12_tm_14_eligible_nth',
            'eem_kind_14_tm_18_eligible_nth',
        ];

        const currencyKeys = this.getCurrencyKeys();
        const numberKeys = ['tax_id'];
        const dateKeys = ['birth_date'];

        const control_type_default = 'ui_control_text';
        const control_type_base = {
            bool: 'ui_control_checkbox',
            date: 'ui_control_date',
            string: 'ui_control_text',
            email: 'ui_control_text',
            bsn: 'ui_control_number',
            iban: 'ui_control_text',
            number: 'ui_control_number',
            select: 'select_control',
            select_number: 'select_control',
        }[record_type.type];

        const control_type_key =
            {
                // checkboxes
                ...checkboxKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_checkbox' }), {}),
                // stepper
                ...stepKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_step' }), {}),
                // currency
                ...currencyKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_currency' }), {}),
                // numbers
                ...numberKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_number' }), {}),
                // dates
                ...dateKeys.reduce((list, key) => ({ ...list, [key]: 'ui_control_date' }), {}),
            }[record_type.key] || null;

        // for pre-check
        if (operator === null) {
            return record_type.type == 'string' && record_type.operators.find((operator) => operator.key == '=')
                ? 'ui_control_checkbox'
                : control_type_key || control_type_base || control_type_default;
        }

        // for fund request
        return record_type.type == 'string' && operator == '='
            ? 'ui_control_checkbox'
            : control_type_key || control_type_base || control_type_default;
    }

    public getCriterionControlDefaultValue(record_type: RecordType, operator = null, init_date = true) {
        const control_type = this.getCriterionControlType(record_type, operator);

        return {
            ui_control_checkbox: null,
            ui_control_date: init_date ? format(new Date(), 'dd-MM-yyyy') : null,
            ui_control_step: record_type?.key == 'adults_nth' ? '1' : '0',
            ui_control_number: undefined,
            ui_control_currency: undefined,
            ui_control_text: '',
        }[control_type];
    }

    public getCriterionLabelValue(
        criteria_record: RecordType,
        value = null,
        translate: (key: string, params?: object) => string,
    ) {
        const trans_key = `fund_request.sign_up.record_checkbox.${criteria_record.key}`;
        const translated = translate(trans_key, { value });
        const trans_fallback_key = 'fund_request.sign_up.record_checkbox.default';

        return translated === trans_key ? translate(trans_fallback_key, { value: value }) : translated;
    }
}

export function useFundService(): FundService {
    return useState(new FundService())[0];
}
