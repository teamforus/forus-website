import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useFundService } from '../../../services/FundService';
import FundsTable from './elements/FundsTable';
import BudgetFundsTable from './elements/BudgetFundsTable';
import { currencyFormat } from '../../../helpers/string';
import useOpenModal from '../../../hooks/useOpenModal';
import ModalExportTypeLegacy from '../../modals/ModalExportTypeLegacy';
import { format } from 'date-fns';
import { ResponseError } from '../../../props/ApiResponses';
import { useFileService } from '../../../services/FileService';
import useEnvData from '../../../hooks/useEnvData';
import usePushDanger from '../../../hooks/usePushDanger';
import Fund from '../../../props/models/Fund';

export type FundFinancialLocal = Fund & {
    budget: {
        percentage_total?: string;
        percentage_active?: string;
        percentage_inactive?: string;
        percentage_deactivated?: string;
        percentage_used?: string;
        percentage_left?: string;
        average_per_voucher?: string;
    };
};

export default function FinancialDashboardOverview() {
    const { t } = useTranslation();

    const envData = useEnvData();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const fileService = useFileService();
    const fundService = useFundService();

    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [budgetFunds, setBudgetFunds] = useState<Array<FundFinancialLocal>>(null);
    const [fundsFinancialOverview, setFundsFinancialOverview] = useState(null);

    const divide = useCallback((value, from, _default = 0) => (parseFloat(from) ? value / from : _default), []);
    const getPercentage = useCallback((value, from) => (divide(value, from) * 100).toFixed(2), [divide]);

    const doExport = useCallback(
        (exportType: string, detailed: boolean) => {
            fundService
                .financialOverviewExport(activeOrganization.id, {
                    export_type: exportType,
                    detailed: detailed ? 1 : 0,
                })
                .then(
                    (res) => {
                        const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        const fileName = `${envData.client_type}_${activeOrganization.name}_${dateTime}.${exportType}`;
                        const fileType = res.headers['content-type'] + ';charset=utf-8;';

                        fileService.downloadFile(fileName, res.data, fileType);
                    },
                    (res: ResponseError) => {
                        pushDanger('Mislukt!', res.data.message);
                    },
                );
        },
        [fundService, activeOrganization?.id, activeOrganization?.name, envData.client_type, fileService, pushDanger],
    );

    const exportFunds = useCallback(
        (detailed) => {
            openModal((modal) => (
                <ModalExportTypeLegacy
                    modal={modal}
                    onSubmit={(exportType) => {
                        doExport(exportType, detailed);
                    }}
                />
            ));
        },
        [doExport, openModal],
    );

    const mapBudgetFunds = useCallback(
        (funds: Array<Fund>) => {
            const list = funds.map((fund) => {
                return {
                    ...fund,
                    budget: {
                        ...fund.budget,
                        percentage_total: '100.00',
                        percentage_active: getPercentage(
                            fund.budget.active_vouchers_amount,
                            fund.budget.vouchers_amount,
                        ),
                        percentage_inactive: getPercentage(
                            fund.budget.inactive_vouchers_amount,
                            fund.budget.vouchers_amount,
                        ),
                        percentage_deactivated: getPercentage(
                            fund.budget.deactivated_vouchers_amount,
                            fund.budget.vouchers_amount,
                        ),
                        percentage_used: getPercentage(fund.budget.used_active_vouchers, fund.budget.vouchers_amount),
                        percentage_left: getPercentage(
                            parseFloat(fund.budget.vouchers_amount) - parseFloat(fund.budget.used_active_vouchers),
                            fund.budget.vouchers_amount,
                        ),
                        average_per_voucher: currencyFormat(
                            divide(fund.budget.vouchers_amount, fund.budget.vouchers_count),
                        ),
                    },
                };
            });

            setBudgetFunds(list);
        },
        [divide, getPercentage],
    );

    const fetchFunds = useCallback(() => {
        fundService
            .list(activeOrganization.id, { stats: 'all', per_page: 100 })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => fund.state !== 'waiting'));
                mapBudgetFunds(res.data.data.filter((fund) => fund.state == 'active' && fund.type == 'budget'));
            })
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, fundService, mapBudgetFunds, pushDanger]);

    const fetchFinancialOverview = useCallback(() => {
        fundService
            .financialOverview(activeOrganization.id, { stats: 'all' })
            .then((res) => setFundsFinancialOverview(res.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchFinancialOverview();
    }, [fetchFinancialOverview]);

    if (!funds || !fundsFinancialOverview) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">{t('financial_dashboard_overview.header.title')}</div>

            <FundsTable funds={funds} fundsFinancialOverview={fundsFinancialOverview} exportFunds={exportFunds} />

            {budgetFunds.length > 0 && (
                <BudgetFundsTable
                    funds={budgetFunds}
                    fundsFinancialOverview={fundsFinancialOverview}
                    exportFunds={exportFunds}
                />
            )}
        </Fragment>
    );
}
