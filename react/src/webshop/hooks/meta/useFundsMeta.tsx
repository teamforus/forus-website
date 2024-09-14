import { useMemo } from 'react';
import Voucher from '../../../dashboard/props/models/Voucher';
import { AppConfigProp } from '../../../dashboard/services/ConfigService';
import useFundMetaBuilder from './useFundMetaBuilder';
import Fund from '../../props/models/Fund';

export default function useFundsMeta(funds: Array<Fund>, vouchers: Array<Voucher>, configs: AppConfigProp) {
    const fundMetaBuilder = useFundMetaBuilder();

    return useMemo(() => {
        return funds.map((fund) => fundMetaBuilder(fund, vouchers, configs));
    }, [fundMetaBuilder, configs, funds, vouchers]);
}
