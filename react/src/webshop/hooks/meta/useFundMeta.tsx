import { useMemo } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../../dashboard/services/ConfigService';
import useFundMetaBuilder from './useFundMetaBuilder';
import Fund from '../../props/models/Fund';

export default function useFundMeta(fund: Fund, vouchers: Array<Voucher>, configs: AppConfigProp) {
    const fundMetaBuilder = useFundMetaBuilder();

    return useMemo(() => {
        return fundMetaBuilder(fund, vouchers, configs);
    }, [fundMetaBuilder, configs, fund, vouchers]);
}
