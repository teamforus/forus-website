import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { useFundService } from '../../../services/FundService';
import FundSelector from '../../elements/fund-selector/FundSelector';
import Fund from '../../../props/models/Fund';
import CSVUpload from './elements/CSVUpload';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RecordType from '../../../props/models/RecordType';
import PrevalidatedTable from './elements/PrevalidatedTable';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useTranslate from '../../../hooks/useTranslate';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';

export default function CsvValidations() {
    const translate = useTranslate();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const recordTypeService = useRecordTypeService();

    const [fund, setFund] = useState<Fund>(null);
    const [funds, setFunds] = useState<Array<Fund>>(null);
    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const [filters, setFilters] = useState({});

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .listPublic({ state: 'active_paused_and_closed' })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => hasPermission(fund.organization, 'validate_records')));
            })
            .finally(() => setProgress(100));
    }, [fundService, setProgress]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    if (!funds) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">{translate('csv_validation.header.title')}</div>
            <FundSelector fund={fund} funds={funds} onSelectFund={setFund} />

            {fund && fund?.state != 'closed' && (
                <CSVUpload
                    fund={fund}
                    recordTypes={recordTypes}
                    onUpdated={() => setFilters((filters) => ({ ...filters }))}
                />
            )}

            {fund && <PrevalidatedTable fund={fund} recordTypes={recordTypes} externalFilters={filters} />}

            {funds?.length == 0 && (
                <EmptyCard
                    description={'U bent geen validator voor een fonds dat actief is om aanvragers aan toe te voegen.'}
                />
            )}
        </Fragment>
    );
}
