import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import { FundFinancialLocal } from '../FinancialDashboardOverview';

export default function BudgetFundsTableItem({ fund }: { fund: FundFinancialLocal }) {
    const { t } = useTranslation();

    const [collapsed, setCollapsed] = useState(false);

    return (
        <tbody>
            <tr className={collapsed ? 'table-highlight' : 'table-separator'} onClick={() => setCollapsed(!collapsed)}>
                <td>
                    <div className="flex">
                        <a
                            className={`mdi mdi-menu-down td-menu-icon ${
                                collapsed ? 'mdi-menu-down' : 'mdi-menu-right'
                            }`}
                        />
                        <strong className="nowrap">{strLimit(fund.name, 50)}</strong>
                    </div>
                </td>
                <td>{fund.budget.vouchers_amount_locale}</td>
                <td>{fund.budget.active_vouchers_amount_locale}</td>
                <td>{fund.budget.inactive_vouchers_amount_locale}</td>
                <td>{fund.budget.deactivated_vouchers_amount_locale}</td>
                <td>{fund.budget.used_active_vouchers_locale}</td>
                <td>
                    {currencyFormat(
                        parseFloat(fund.budget.vouchers_amount) - parseFloat(fund.budget.used_active_vouchers),
                    )}
                </td>
            </tr>

            {collapsed && (
                <Fragment>
                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.total_percentage')}</strong>
                        </td>
                        <td>{fund.budget.percentage_total} %</td>
                        <td>{fund.budget.percentage_active} %</td>
                        <td>{fund.budget.percentage_inactive} %</td>
                        <td>{fund.budget.percentage_deactivated} %</td>
                        <td>{fund.budget.percentage_used} %</td>
                        <td>{fund.budget.percentage_left} %</td>
                    </tr>

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.total_count')}</strong>
                        </td>
                        <td>{fund.budget.vouchers_count}</td>
                        <td>{fund.budget.active_vouchers_count}</td>
                        <td>{fund.budget.inactive_vouchers_count}</td>
                        <td>{fund.budget.deactivated_vouchers_count}</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>Tegoeden</strong>
                        </td>
                        <td colSpan={2}>
                            {fund.formulas.map((formula, index) => (
                                <div key={index}>
                                    <div>Per tegoed</div>
                                    <div>
                                        <strong>{currencyFormat(parseFloat(formula.amount))}</strong>
                                    </div>
                                </div>
                            ))}
                        </td>
                        <td>
                            <div>Gem. per tegoed</div>
                            <div>
                                <strong>{fund.budget.average_per_voucher}</strong>
                            </div>
                        </td>
                        <td />
                        <td colSpan={2} />
                    </tr>

                    {(fund.budget.children_count > 0 || fund.product_vouchers.children_count > 0) && (
                        <tr className="table-highlight-grey">
                            <td>
                                <strong>Eigenschappen</strong>
                            </td>
                            {fund.budget.children_count > 0 ? (
                                <td colSpan={2}>
                                    <div>Aantal kinderen</div>
                                    <div>
                                        <strong>{fund.budget.children_count}</strong>
                                    </div>
                                </td>
                            ) : (
                                <td colSpan={2} />
                            )}

                            {fund.product_vouchers.children_count > 0 ? (
                                <td colSpan={2}>
                                    <div>Aantal kinderen (product)</div>
                                    <div>
                                        <strong>{fund.product_vouchers.children_count}</strong>
                                    </div>
                                </td>
                            ) : (
                                <td colSpan={2} />
                            )}

                            <td colSpan={2} />
                        </tr>
                    )}

                    <tr className="table-highlight-grey">
                        <td>
                            <strong>{t('financial_dashboard_overview.labels.product_vouchers')}</strong>
                        </td>
                        <td>{fund.product_vouchers.vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.active_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.inactive_vouchers_amount_locale}</td>
                        <td>{fund.product_vouchers.deactivated_vouchers_amount_locale}</td>
                        <td colSpan={2} />
                    </tr>
                </Fragment>
            )}
        </tbody>
    );
}
