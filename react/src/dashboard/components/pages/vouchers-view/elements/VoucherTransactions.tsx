import Transaction from '../../../../props/models/Transaction';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEnvData from '../../../../hooks/useEnvData';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useFilter from '../../../../hooks/useFilter';
import ThSortable from '../../../elements/tables/ThSortable';
import { currencyFormat, strLimit } from '../../../../helpers/string';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import FilterModel from '../../../../types/FilterModel';
import useTransactionService from '../../../../services/TransactionService';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

export default function VoucherTransactions({
    organization,
    filterValues,
    blockTitle,
}: {
    organization: Organization;
    filterValues: FilterModel;
    blockTitle: string;
}) {
    const { t } = useTranslation();
    const envData = useEnvData();

    const transactionService = useTransactionService();

    const [transactions, setTransactions] = useState<PaginationData<Transaction>>(null);
    const isSponsor = useMemo(() => envData.client_type == 'sponsor', [envData.client_type]);

    const filter = useFilter(filterValues);

    const fetchTransactions = useCallback(() => {
        transactionService.list(envData.client_type, organization.id, filter.activeValues).then((res) => {
            setTransactions(res.data);
        });
    }, [envData.client_type, filter.activeValues, organization.id, transactionService]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    if (!transactions) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {(blockTitle || 'Transactions') + ' (' + transactions.meta.total + ')'}
                        </div>
                    </div>
                </div>
            </div>

            {transactions.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <ThSortable filter={filter} label={t('transactions.labels.id')} value="id" />
                                        <ThSortable filter={filter} label={t('transactions.labels.uid')} value="id" />
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.price')}
                                            value="amount"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.date')}
                                            value="created_at"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.fund')}
                                            value="fund_name"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.target')}
                                            value="target"
                                        />
                                        {isSponsor && (
                                            <ThSortable
                                                filter={filter}
                                                label={t('transactions.labels.provider')}
                                                value="provider_name"
                                            />
                                        )}
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.product_name')}
                                            value="product_name"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('transactions.labels.status')}
                                            value="state"
                                        />
                                        <ThSortable
                                            className="th-narrow text-right"
                                            filter={filter}
                                            label={t('transactions.labels.action')}
                                        />
                                    </tr>

                                    {transactions.data.map((transaction, index: number) => (
                                        <tr key={index}>
                                            <td>{transaction.id}</td>
                                            <td title={transaction.uid || '-'}>
                                                {strLimit(transaction.uid || '-', 25)}
                                            </td>
                                            <td>
                                                <StateNavLink
                                                    name={'transaction'}
                                                    className="text-primary-light"
                                                    params={{
                                                        organizationId: organization.id,
                                                        address: transaction.address,
                                                    }}>
                                                    {currencyFormat(parseFloat(transaction.amount))}
                                                </StateNavLink>
                                            </td>
                                            <td>
                                                <strong className="text-primary">
                                                    {transaction.created_at_locale.split(' - ')[0]}
                                                </strong>
                                                <br />
                                                <strong className="text-strong text-md text-muted-dark">
                                                    {transaction.created_at_locale.split(' - ')[1]}
                                                </strong>
                                            </td>
                                            <td title={transaction.fund.name || ''}>
                                                {strLimit(transaction.fund.name, 25)}
                                            </td>
                                            <td>{transaction.target_locale}</td>
                                            {isSponsor && (
                                                <td
                                                    className={transaction.organization ? '' : 'text-muted'}
                                                    title={transaction.organization.name || ''}>
                                                    {strLimit(transaction.organization.name || '-', 25)}
                                                </td>
                                            )}
                                            <td title={transaction.product?.name || ''}>
                                                {strLimit(transaction.product?.name || '-', 25)}
                                            </td>
                                            <td>
                                                {transaction.state == 'success' ? (
                                                    <div className="label label-success">
                                                        {transaction.state_locale}
                                                    </div>
                                                ) : (
                                                    <div className="label label-default">
                                                        {transaction.state_locale}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="td-narrow text-right">
                                                <StateNavLink
                                                    name={'transaction'}
                                                    className="button button-sm button-primary button-icon pull-right"
                                                    params={{
                                                        organizationId: organization.id,
                                                        address: transaction.address,
                                                    }}>
                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                </StateNavLink>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {transactions.meta && transactions.meta.last_page > 1 && (
                <div className="card-section">
                    <Paginator meta={transactions.meta} filters={filter.activeValues} updateFilters={filter.update} />
                </div>
            )}

            {transactions.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen transacties gevonden</div>
                    </div>
                </div>
            )}
        </div>
    );
}
