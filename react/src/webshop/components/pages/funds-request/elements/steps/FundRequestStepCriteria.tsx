import React, { Fragment, useCallback, useMemo } from 'react';
import Fund from '../../../../../props/models/Fund';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { LocalCriterion } from '../../FundRequest';
import Markdown from '../../../../elements/markdown/Markdown';
import SelectControl from '../../../../../../dashboard/components/elements/select-control/SelectControl';
import UIControlCheckbox from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import UIControlStep from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlStep';
import UIControlDate from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlDate';
import { dateFormat, dateParse } from '../../../../../../dashboard/helpers/dates';
import UIControlNumber from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlNumber';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import FileUploader from '../../../../elements/file-uploader/FileUploader';
import RecordType from '../../../../../../dashboard/props/models/RecordType';
import { ResponseError } from '../../../../../../dashboard/props/ApiResponses';
import { useFundRequestService } from '../../../../../services/FundRequestService';

export default function FundRequestStepCriteria({
    fund,
    step,
    steps,
    onPrevStep,
    onNextStep,
    progress,
    bsnWarning,
    setPendingCriteria,
    criterion,
    recordTypes,
    submitInProgress,
    setSubmitInProgress,
    formDataBuild,
    setCriterion,
}: {
    fund: Fund;
    step: number;
    steps: Array<string>;
    onPrevStep: () => void;
    onNextStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    setPendingCriteria: React.Dispatch<React.SetStateAction<Array<LocalCriterion>>>;
    criterion: LocalCriterion;
    recordTypes: Array<RecordType>;
    submitInProgress: boolean;
    setSubmitInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    formDataBuild: (criteria: Array<LocalCriterion>) => object;
    setCriterion: (update: Partial<LocalCriterion>) => void;
}) {
    const translate = useTranslate();

    const fundRequestService = useFundRequestService();

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});
    }, [recordTypes]);

    // Submit or Validate record criteria
    const validateCriteria = useCallback(
        async (criteria: Array<LocalCriterion>): Promise<false | { [key: string]: string | string[] }> => {
            if (submitInProgress) {
                return;
            }

            setSubmitInProgress(true);

            return fundRequestService
                .storeValidate(fund.id, formDataBuild(criteria))
                .then((): false => false)
                .catch((err: ResponseError) => ({
                    record: err.data.errors['records.0'],
                    value: err.data.errors['records.0.value'],
                    files: err.data.errors['records.0.files'],
                    fund_criterion_id: err.data.errors['records.0.fund_criterion_id'],
                }))
                .finally(() => setSubmitInProgress(false));
        },
        [formDataBuild, fund.id, fundRequestService, setSubmitInProgress, submitInProgress],
    );

    // Submit criteria record
    const validateStepCriteria = useCallback(
        (criterion: LocalCriterion) => {
            return validateCriteria([criterion]).then((errors) => {
                if (!errors) {
                    return onNextStep();
                }

                return setPendingCriteria((criteria) => {
                    const index = criteria.indexOf(criterion);

                    if (index !== -1) {
                        criteria[index].errors = errors;
                    }

                    return [...criteria];
                });
            }, console.error);
        },
        [onNextStep, setPendingCriteria, validateCriteria],
    );

    return (
        <Fragment>
            {progress}

            <div className="sign_up-pane">
                <h2 className="sign_up-pane-header">
                    {criterion.title
                        ? criterion.title
                        : `Bevestig uw ${recordTypesByKey?.[criterion?.record_type?.key]?.name}`}
                </h2>

                <div className="sign_up-pane-body">
                    <form
                        className="row"
                        onSubmit={(e) => {
                            e.preventDefault();
                            validateStepCriteria(criterion).then();
                        }}>
                        <div className="form-group col col-lg-12">
                            <div className="sign_up-pane-text block block-markdown">
                                <div className="sign_up-pane-text">
                                    {criterion.description && criterion.description !== '_' && (
                                        <Markdown ng-if="" content={criterion.description_html} />
                                    )}
                                </div>

                                {!criterion.description && criterion.description !== '_' && (
                                    <div className="sign_up-pane-text">{criterion.title_default}</div>
                                )}
                            </div>
                            <label className="form-label" htmlFor="{{criterion.record_type.key}}">
                                {recordTypesByKey?.[criterion?.record_type?.key]?.name}
                            </label>

                            {criterion.control_type == 'select_control' && (
                                <SelectControl
                                    id={`criterion_${criterion.id}`}
                                    propKey="value"
                                    value={criterion.input_value}
                                    options={recordTypesByKey?.[criterion?.record_type?.key]?.options}
                                    onChange={(input_value?: string) => {
                                        setCriterion({ input_value: input_value });
                                    }}
                                    placeholder={`Uw ${criterion?.record_type?.name}`}
                                />
                            )}

                            {criterion.control_type == 'ui_control_checkbox' && (
                                <UIControlCheckbox
                                    checked={!!criterion.is_checked}
                                    name={criterion.record_type.key}
                                    id={`criterion_${criterion.id}`}
                                    label={criterion.label}
                                    onChangeValue={(checked) => {
                                        setCriterion({
                                            is_checked: checked,
                                            input_value: checked ? criterion.value : null,
                                        });
                                    }}
                                />
                            )}

                            {criterion.control_type == 'ui_control_step' && (
                                <UIControlStep
                                    id={`criterion_${criterion.id}`}
                                    value={parseInt(criterion.input_value)}
                                    onChange={(value) => {
                                        setCriterion({ input_value: value.toFixed() });
                                    }}
                                    name={criterion.record_type.key}
                                    min={0}
                                    max={32}
                                />
                            )}

                            {criterion.control_type == 'ui_control_date' && (
                                <UIControlDate
                                    value={
                                        criterion?.input_value
                                            ? dateParse(criterion?.input_value, 'dd-MM-yyyy')
                                            : new Date()
                                    }
                                    format={'dd-MM-yyyy'}
                                    placeholder={`Uw ${criterion?.record_type?.name}`}
                                    onChange={(date) => {
                                        setCriterion({
                                            input_value: date ? dateFormat(date, 'dd-MM-yyyy') : '',
                                        });
                                    }}
                                    id={`criterion_${criterion.id}`}
                                />
                            )}

                            {criterion.control_type == 'ui_control_number' && (
                                <UIControlNumber
                                    type={'number'}
                                    value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                                    name={criterion.record_type.key}
                                    id={`criterion_${criterion.id}`}
                                    placeholder={`Uw ${criterion?.record_type?.name}`}
                                    onChangeValue={(value) => {
                                        setCriterion({ input_value: (value || 0).toString() });
                                    }}
                                />
                            )}

                            {criterion.control_type == 'ui_control_text' && (
                                <UIControlText
                                    type={'text'}
                                    value={criterion.input_value}
                                    name={criterion.record_type.key}
                                    id={`criterion_${criterion.id}`}
                                    placeholder={`Uw ${criterion?.record_type?.name}`}
                                    onChange={(e) => {
                                        setCriterion({ input_value: e.target.value });
                                    }}
                                />
                            )}

                            {criterion.control_type == 'ui_control_currency' && (
                                <UIControlNumber
                                    type={'currency'}
                                    value={criterion.input_value ? parseFloat(criterion.input_value) : null}
                                    min={0}
                                    name={criterion.record_type.key}
                                    id={`criterion_${criterion.id}`}
                                    placeholder={`Uw ${criterion?.record_type?.name}`}
                                    onChangeValue={(value) => {
                                        setCriterion({ input_value: (value || 0).toString() });
                                    }}
                                />
                            )}

                            <FormError error={criterion.errors?.value} />
                        </div>
                        <div className="form-group col col-lg-12">
                            {criterion.show_attachment && (
                                <FileUploader
                                    type="fund_request_record_proof"
                                    files={criterion.files}
                                    cropMedia={false}
                                    multiple={true}
                                    onFilesChange={({ files }) => {
                                        setCriterion({
                                            files,
                                            files_uid: files.map((file) => file.uid),
                                        });
                                    }}
                                />
                            )}
                            <FormError error={criterion.errors?.files} />
                            <FormError error={criterion.errors?.record} />
                        </div>
                    </form>
                </div>
                <div className="sign_up-pane-footer">
                    <div className="row">
                        <div className="col col-lg-6 col-xs-6 text-left">
                            <button
                                role="button"
                                className="button button-text button-text-padless"
                                onClick={onPrevStep}
                                tabIndex={0}>
                                <em className="mdi mdi-chevron-left icon-left" />
                                {translate('fund_request.sign_up.pane.footer.prev')}
                            </button>
                        </div>
                        <div className="col col-lg-6 col-xs-6 text-right">
                            {steps[step + 1] !== 'done' ? (
                                <button
                                    className="button button-text button-text-padless"
                                    disabled={criterion.isUploadingFiles}
                                    onClick={() => validateStepCriteria(criterion)}
                                    type="button"
                                    role="button">
                                    {translate('fund_request.sign_up.pane.footer.next')}
                                    <em className="mdi mdi-chevron-right icon-right" />
                                </button>
                            ) : (
                                <button
                                    className="button button-primary"
                                    disabled={criterion.isUploadingFiles}
                                    onClick={() => validateStepCriteria(criterion)}
                                    role="button">
                                    Verzenden
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {bsnWarning}
            </div>
        </Fragment>
    );
}
