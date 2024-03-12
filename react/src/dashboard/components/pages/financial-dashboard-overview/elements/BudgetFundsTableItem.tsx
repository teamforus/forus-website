import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../../helpers/string';
import { FundFinancialLocal } from '../FinancialDashboardOverview';

export default function BudgetFundsTableItem({ fund }: { fund: FundFinancialLocal }) {
    const { t } = useTranslation();

    const [collapsed, setCollapsed] = useState(false);

    return (
        <tbody>
            <tr className={collapsed ? 'table-highlight' : 'table-separator'} onClick={() => setCollapsed(!collapsed)}>
                <td className="text-center">
                    <a className={`mdi mdi-menu-down td-menu-icon ${collapsed ? 'mdi-menu-down' : 'mdi-menu-right'}`} />
                </td>
                <td className="text-left">
                    <strong>{fund.name}</strong>
                </td>
                <td className="text-right">{fund.budget.vouchers_amount_locale}</td>
                <td className="text-right">{fund.budget.active_vouchers_amount_locale}</td>
                <td className="text-right">{fund.budget.inactive_vouchers_amount_locale}</td>
                <td className="text-right">{fund.budget.deactivated_vouchers_amount_locale}</td>
                <td className="text-right">{fund.budget.used_active_vouchers_locale}</td>
                <td className="text-right">
                    {currencyFormat(
                        parseFloat(fund.budget.vouchers_amount) - parseFloat(fund.budget.used_active_vouchers),
                    )}
                </td>
            </tr>

            {collapsed && (
                <Fragment>
                    <tr className="table-highlight-grey">
                        <td className="text-center">
                            <em className="mdi mdi-circle-small" />
                        </td>
                        <td className="text-left">
                            <strong>{t('financial_dashboard_overview.labels.total_percentage')}</strong>
                        </td>
                        <td className="text-right">{fund.budget.percentageTotal} %</td>
                        <td className="text-right">{fund.budget.percentageActive} %</td>
                        <td className="text-right">{fund.budget.percentageInactive} %</td>
                        <td className="text-right">{fund.budget.percentageDeactivated} %</td>
                        <td className="text-right">{fund.budget.percentageUsed} %</td>
                        <td className="text-right">{fund.budget.percentageLeft} %</td>
                    </tr>

                    <tr className="table-highlight-grey">
                        <td className="text-center">
                            <em className="mdi mdi-circle-small" />
                        </td>
                        <td className="text-left">
                            <strong>{t('financial_dashboard_overview.labels.total_count')}</strong>
                        </td>
                        <td className="text-right">{fund.budget.vouchers_count}</td>
                        <td className="text-right">{fund.budget.active_vouchers_count}</td>
                        <td className="text-right">{fund.budget.inactive_vouchers_count}</td>
                        <td className="text-right">{fund.budget.deactivated_vouchers_count}</td>
                        <td className="text-right">-</td>
                        <td className="text-right">-</td>
                    </tr>

                    <tr className="table-highlight-grey table-separator">
                        <td className="text-center">
                            <em className="mdi mdi-circle-small">
                                <br />
                            </em>
                            &nbsp;
                        </td>
                        <td className="text-left">
                            <strong>Tegoeden</strong>
                            <div>&nbsp;</div>
                        </td>
                        <td className="text-right" colSpan={2}>
                            {fund.formulas.map((formula, index) => (
                                <div key={index} className="col-lg-6 text-right">
                                    <div>Per tegoed</div>
                                    <div>{currencyFormat(parseFloat(formula.amount))}</div>
                                </div>
                            ))}
                        </td>
                        <td className="text-right">
                            <div>Gem. per tegoed</div>
                            <div>{fund.budget.averagePerVoucher}</div>
                        </td>
                        <td />
                        <td colSpan={2} />
                    </tr>

                    <tr className="table-highlight-grey">
                        <td className="text-center">
                            <em className="mdi mdi-circle-small" />
                        </td>
                        <td className="text-left">
                            <strong>{t('financial_dashboard_overview.labels.product_vouchers')}</strong>
                        </td>
                        <td className="text-right">{fund.product_vouchers.vouchers_amount_locale}</td>
                        <td className="text-right">{fund.product_vouchers.active_vouchers_amount_locale}</td>
                        <td className="text-right">{fund.product_vouchers.inactive_vouchers_amount_locale}</td>
                        <td className="text-right">{fund.product_vouchers.deactivated_vouchers_amount_locale}</td>
                        <td colSpan={2} />
                    </tr>
                </Fragment>
            )}
        </tbody>
    );
}
