import React, { createRef, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import Fund from '../../../../props/models/Fund';
import { useTranslation } from 'react-i18next';
import Organization from '../../../../props/models/Organization';
import RecordType from '../../../../props/models/RecordType';
import { hasPermission } from '../../../../helpers/utils';
import FundCriteriaEditorItem from './FundCriteriaEditorItem';
import FundCriterion from '../../../../props/models/FundCriterion';

export default function FundCriteriaEditor({
    fund,
    organization,
    criteria,
    setCriteria,
    isEditable,
    recordTypes,
    saveButton,
    onSaveCriteria,
    validatorOrganizations,
    saveCriteriaRef,
}: {
    fund: Fund;
    organization: Organization;
    criteria: Array<FundCriterion>;
    setCriteria: (criteria: Array<FundCriterion>) => void;
    isEditable: boolean;
    recordTypes: Array<Partial<RecordType>>;
    saveButton?: boolean;
    onSaveCriteria?: (criteria: Array<FundCriterion>) => void;
    validatorOrganizations: Array<Organization>;
    saveCriteriaRef?: MutableRefObject<() => Promise<unknown>>;
}) {
    const { t } = useTranslation();

    const $element = useRef<HTMLDivElement>(null);
    const [criterionBlocksRefs] = useState<Array<MutableRefObject<() => Promise<boolean>>>>(
        [...new Array(criteria.length)].map(() => createRef<() => Promise<boolean>>()),
    );
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [deletedItemsCount, setDeleteItemsCount] = useState<number>(0);

    const updateOnEditFlag = useCallback(() => {
        setIsEditing(criteria.filter((criterion) => criterion.is_editing).length > 0);
    }, [criteria]);

    const addCriteria = useCallback(() => {
        criteria.push({
            is_new: true,
            is_editing: true,
            show_attachment: false,
            external_validators: [],
            record_type_key: null,
            operator: null,
            value: null,
            optional: false,
        });
        setCriteria([...criteria]);
        updateOnEditFlag();
    }, [criteria, setCriteria, updateOnEditFlag]);

    const saveCriteria = useCallback(() => {
        return new Promise((resolve) => {
            Promise.all(criteria.map((criterion, index) => criterionBlocksRefs[index].current())).then((result) => {
                updateOnEditFlag();

                if (result.filter((result) => !result).length === 0) {
                    resolve(true);
                    onSaveCriteria(criteria);
                } else {
                    resolve(false);

                    setTimeout(() => {
                        const errors = $($element.current).find('.form-error');

                        if (errors.length) {
                            window.scrollTo(0, Math.max(0, errors.offset().top - 100));
                        }
                    }, 250);
                }
            });
        });
    }, [criteria, criterionBlocksRefs, onSaveCriteria, updateOnEditFlag]);

    const onDelete = useCallback(
        (criterion: FundCriterion) => {
            const index = criteria.indexOf(criterion);

            if (index != -1) {
                setDeleteItemsCount(deletedItemsCount + 1);
                criteria.splice(index, 1);
            } else {
                criteria.splice(
                    criteria.findIndex((item: FundCriterion) => item.is_new),
                    1,
                );
            }
            setCriteria([...criteria]);
        },
        [criteria, deletedItemsCount, setCriteria],
    );

    useEffect(() => {
        if (saveCriteriaRef) {
            saveCriteriaRef.current = saveCriteria;
        }
    }, [saveCriteria, saveCriteriaRef]);

    return (
        <>
            <div className="block block-criteria-editor">
                {criteria.map((criterion, index) => {
                    return (
                        <FundCriteriaEditorItem
                            key={index}
                            fund={fund}
                            recordTypes={[
                                {
                                    key: null,
                                    name: 'Select',
                                },
                                ...recordTypes,
                            ]}
                            isEditable={isEditable}
                            organization={organization}
                            criterion={criterion}
                            onEditCriteria={updateOnEditFlag}
                            onEditCancelCriteria={updateOnEditFlag}
                            setCriterion={(criterion) => {
                                criteria[index] = criterion;
                                setCriteria([...criteria]);
                            }}
                            onDeleteCriteria={onDelete}
                            validatorOrganizations={validatorOrganizations}
                            saveCriterionRef={criterionBlocksRefs[index]}
                        />
                    );
                })}

                <div className="criteria-editor-actions">
                    {isEditable && hasPermission(organization, 'manage_funds') && (
                        <div className="button button-primary" onClick={() => addCriteria()}>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {t('components.fund_criteria_editor.buttons.add_criteria')}
                        </div>
                    )}

                    {saveButton && (isEditing || deletedItemsCount > 0) && (
                        <div className="button button-primary pull-right" onClick={() => saveCriteria()}>
                            <em className="mdi mdi-content-save icon-start" />
                            {t('components.fund_criteria_editor.buttons.save')}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
