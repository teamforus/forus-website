import React, { useCallback, useEffect, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import FundCriteriaEditor from '../../../elements/fund-criteria-editor/FundCriteriaEditor';
import { PaginationData, ResponseError } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import RecordType from '../../../../props/models/RecordType';
import Organization from '../../../../props/models/Organization';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import { useOrganizationService } from '../../../../services/OrganizationService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FundCriterion from '../../../../props/models/FundCriterion';

export default function OrganizationsFundsShowCriteriaCard({
    fund,
    setFund,
}: {
    fund: Fund;
    setFund: React.Dispatch<React.SetStateAction<Fund>>;
}) {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const recordTypeService = useRecordTypeService();
    const organizationService = useOrganizationService();

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);

    const [validatorOrganizations, setValidatorOrganizations] = useState<PaginationData<Organization>>(null);

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterion>) => {
            setProgress(0);

            fundService
                .updateCriteria(fund.organization_id, fund.id, {
                    ...criteria.map((criterion) => ({
                        ...criterion,
                        validators: criterion.external_validators.map((item) => item.organization_validator_id),
                    })),
                })
                .then((res) => {
                    fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger(err.data.message || 'Error!'))
                .finally(() => setProgress(100));
        },
        [fund, fundService, pushDanger, pushSuccess, setProgress],
    );

    const fetchValidatorOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .readListValidators(fund.organization_id, { per_page: 100 })
            .then((res) => setValidatorOrganizations(res.data))
            .finally(() => setProgress(100));
    }, [fund.organization_id, organizationService, setProgress]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list({ criteria: 1 })
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchValidatorOrganizations();
    }, [fetchValidatorOrganizations]);

    return recordTypes && validatorOrganizations ? (
        <div className="card-section card-section-primary">
            <div className="form">
                <FundCriteriaEditor
                    fund={fund}
                    organization={fund.organization}
                    criteria={fund.criteria}
                    isEditable={fund.criteria_editable}
                    recordTypes={recordTypes}
                    setCriteria={(criteria) => setFund({ ...fund, criteria })}
                    saveButton={true}
                    onSaveCriteria={saveCriteria}
                    validatorOrganizations={validatorOrganizations.data}
                />
            </div>
        </div>
    ) : (
        <LoadingCard />
    );
}
