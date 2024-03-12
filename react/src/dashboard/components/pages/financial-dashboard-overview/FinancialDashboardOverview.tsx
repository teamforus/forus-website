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
        percentageTotal?: string;
        percentageActive?: string;
        percentageInactive?: string;
        percentageDeactivated?: string;
        percentageUsed?: string;
        percentageLeft?: string;
        averagePerVoucher?: string;
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

    const [funds, setFunds] = useState(null);
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

    useEffect(() => {
        fundService
            .financialOverview(activeOrganization.id, { stats: 'all' })
            .then((res) => setFundsFinancialOverview(res.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, fundService, pushDanger]);

    useEffect(() => {
        fundService
            .list(activeOrganization.id, { stats: 'all' })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => fund.state !== 'waiting'));

                const list = res.data.data
                    .filter((fund) => fund.state == 'active' && fund.type == 'budget')
                    .map((fund) => {
                        return {
                            ...fund,
                            budget: {
                                ...fund.budget,
                                percentageTotal: '100.00',
                                percentageActive: getPercentage(
                                    fund.budget.active_vouchers_amount,
                                    fund.budget.vouchers_amount,
                                ),
                                percentageInactive: getPercentage(
                                    fund.budget.inactive_vouchers_amount,
                                    fund.budget.vouchers_amount,
                                ),
                                percentageDeactivated: getPercentage(
                                    fund.budget.deactivated_vouchers_amount,
                                    fund.budget.vouchers_amount,
                                ),
                                percentageUsed: getPercentage(
                                    fund.budget.used_active_vouchers,
                                    fund.budget.vouchers_amount,
                                ),
                                percentageLeft: getPercentage(
                                    parseFloat(fund.budget.vouchers_amount) -
                                        parseFloat(fund.budget.used_active_vouchers),
                                    fund.budget.vouchers_amount,
                                ),
                                averagePerVoucher: currencyFormat(
                                    divide(fund.budget.vouchers_amount, fund.budget.vouchers_count),
                                ),
                            },
                        };
                    });

                setBudgetFunds(list);
            })
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [activeOrganization.id, divide, fundService, getPercentage, pushDanger]);

    if (!funds) {
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
