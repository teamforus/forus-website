import { useCallback } from 'react';
import FundProvider from '../../../../props/models/FundProvider';
import useConfirmFundProviderUpdateState from './useConfirmFundProviderUpdateState';
import useConfirmAcceptBudgetFundProvider from './useConfirmAcceptBudgetFundProvider';

export default function useConfirmFundProviderUpdate() {
    const confirmFundProviderUpdateState = useConfirmFundProviderUpdateState();
    const confirmAcceptBudgetFundProvider = useConfirmAcceptBudgetFundProvider();

    return useCallback(
        (fundProvider: FundProvider, state: string) => {
            if (state === 'rejected' || fundProvider.fund.type === 'subsidies') {
                return confirmFundProviderUpdateState(state);
            }

            return confirmAcceptBudgetFundProvider(fundProvider);
        },
        [confirmAcceptBudgetFundProvider, confirmFundProviderUpdateState],
    );
}
