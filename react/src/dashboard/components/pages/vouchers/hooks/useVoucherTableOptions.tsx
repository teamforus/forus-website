import { useCallback, useEffect, useState } from 'react';
import Organization from '../../../../props/models/Organization';
import Fund from '../../../../props/models/Fund';
import Implementation from '../../../../props/models/Implementation';
import { useFundService } from '../../../../services/FundService';
import useImplementationService from '../../../../services/ImplementationService';
import useSetProgress from '../../../../hooks/useSetProgress';

export default function useVoucherTableOptions(organization: Organization) {
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const implementationService = useImplementationService();

    const [funds, setFunds] = useState<Array<Partial<Fund>>>(null);
    const [implementations, setImplementations] = useState<Array<Partial<Implementation>>>(null);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(organization.id, { per_page: 100, configured: 1 })
            .then((res) => setFunds([{ id: null, name: 'Alle fondsen' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [organization.id, fundService, setProgress]);

    const fetchImplementations = useCallback(() => {
        setProgress(0);

        implementationService
            .list(organization.id, { per_page: 100 })
            .then((res) => setImplementations([{ id: null, name: 'Alle implementaties...' }, ...res.data.data]))
            .finally(() => setProgress(100));
    }, [organization.id, implementationService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    return { funds, implementations };
}
