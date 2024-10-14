import React, { useCallback, useEffect, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import FundCriteriaEditor from '../../../elements/fund-criteria-editor/FundCriteriaEditor';
import { ResponseError } from '../../../../props/ApiResponses';
import useSetProgress from '../../../../hooks/useSetProgress';
import { useFundService } from '../../../../services/FundService';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';
import RecordType from '../../../../props/models/RecordType';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import FundCriterion from '../../../../props/models/FundCriterion';
import OrganizationsFundsShowFundRequestConfigCard from './OrganizationsFundsShowFundRequestConfigCard';

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

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [criteriaIsCollapsed, setCriteriaIsCollapsed] = useState(true);

    const saveCriteria = useCallback(
        (criteria: Array<FundCriterion>) => {
            setProgress(0);

            fundService
                .updateCriteria(fund.organization_id, fund.id, criteria)
                .then((res) => {
                    fund.criteria = Object.assign(fund.criteria, res.data.data.criteria);
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger(err.data.message || 'Error!'))
                .finally(() => setProgress(100));
        },
        [fund, fundService, pushDanger, pushSuccess, setProgress],
    );

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

    return recordTypes ? (
        <div className="card-section card-section-primary">
            <div className="block block-collapsable">
                <div className="block-item">
                    <div className="block-header" onClick={() => setCriteriaIsCollapsed(!criteriaIsCollapsed)}>
                        <em className={`block-icon-collapse mdi mdi-menu-${criteriaIsCollapsed ? 'right' : 'down'}`} />

                        <div className="block-title">Voorwaarden bewerken</div>

                        <div className="block-actions">
                            {!criteriaIsCollapsed ? (
                                <div
                                    className="button button-default button-sm"
                                    onClick={() => setCriteriaIsCollapsed(true)}>
                                    <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                                    Inklappen
                                </div>
                            ) : (
                                <div
                                    className="button button-primary button-sm"
                                    onClick={() => setCriteriaIsCollapsed(false)}>
                                    <em className="mdi mdi-arrow-expand-vertical icon-start" />
                                    Uitklappen
                                </div>
                            )}
                        </div>
                    </div>

                    {!criteriaIsCollapsed && (
                        <div className="block-body block-body-pb0">
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
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <OrganizationsFundsShowFundRequestConfigCard fund={fund} setFund={setFund} />
        </div>
    ) : (
        <LoadingCard />
    );
}
