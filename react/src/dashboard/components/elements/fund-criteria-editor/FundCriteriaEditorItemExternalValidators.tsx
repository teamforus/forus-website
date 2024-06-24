import React, { useCallback, useMemo, useState } from 'react';
import SelectControl from '../select-control/SelectControl';
import useTranslate from '../../../hooks/useTranslate';
import { FundCriterionOrganization } from './FundCriteriaEditor';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import useFormBuilder from '../../../hooks/useFormBuilder';
import FundCriterionExternalValidator from '../../../props/models/FundCriterionExternalValidator';

export default function FundCriteriaEditorItemExternalValidators({
    externalValidators,
    setExternalValidators,
    validatorOrganizations,
}: {
    externalValidators: Array<FundCriterionExternalValidator>;
    setExternalValidators?: (externalValidators: Array<FundCriterionExternalValidator>) => void;
    validatorOrganizations: Array<FundCriterionOrganization>;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();

    const [showForm, setShowForm] = useState(false);

    const validatorsAvailable = useMemo<Array<Partial<FundCriterionOrganization>>>(() => {
        const validators = validatorOrganizations
            .filter((validatorOrganization) => {
                return !(externalValidators || [])
                    .map((external) => external.organization_validator_id)
                    .includes(validatorOrganization.id);
            })
            .map((item) => ({ ...item, name: item.validator_organization.name }));

        return [{ id: null, name: 'Selecteer' }, ...validators];
    }, [externalValidators, validatorOrganizations]);

    const validatorModels = useMemo(() => {
        const list: Array<Partial<FundCriterionOrganization> & { accepted: boolean }> = (externalValidators || []).map(
            (validator) => ({
                accepted: validator.accepted,
                ...(validatorOrganizations.find(
                    (validatorModel) => validatorModel.id == validator.organization_validator_id,
                ) || {}),
            }),
        );

        const listSize = list.length;

        return [list.slice(0, Math.ceil(listSize / 2)), list.slice(Math.ceil(listSize / 2), list.length)];
    }, [externalValidators, validatorOrganizations]);

    const form = useFormBuilder({ id: null }, (values) => {
        const validator = validatorsAvailable.find((validator) => {
            return validator.id == values.id;
        });

        setExternalValidators(
            [
                ...externalValidators,
                {
                    accepted: false,
                    organization_id: validator.validator_organization_id,
                    organization_validator_id: validator.id,
                },
            ].sort((a, b) => {
                if (a.organization_validator_id != b.organization_validator_id) {
                    return a.organization_validator_id > b.organization_validator_id ? 1 : -1;
                } else {
                    return 0;
                }
            }),
        );
        setShowForm(false);
        form.reset();
    });

    const removeExternalValidator = useCallback(
        (validator_organization_id: number) => {
            const validator = externalValidators.find(
                (validator) => validator.organization_id == validator_organization_id,
            );

            const index = externalValidators.indexOf(validator);

            const deleteValidator = () => {
                externalValidators.splice(index, 1);
                setExternalValidators([...externalValidators]);
            };

            if (index != -1) {
                if (validator.accepted) {
                    openModal((modal) => (
                        <ModalDangerZone
                            modal={modal}
                            title={translate('modals.danger_zone.remove_external_validators.title')}
                            description={translate('modals.danger_zone.remove_external_validators.description')}
                            buttonCancel={{
                                onClick: modal.close,
                                text: translate('modals.danger_zone.remove_external_validators.buttons.cancel'),
                            }}
                            buttonSubmit={{
                                onClick: () => {
                                    modal.close();
                                    deleteValidator();
                                },
                                text: translate('modals.danger_zone.remove_external_validators.buttons.confirm'),
                            }}
                        />
                    ));
                } else {
                    deleteValidator();
                }
            }
        },
        [externalValidators, openModal, setExternalValidators, translate],
    );

    if (!(validatorsAvailable?.length > 1 || externalValidators?.length > 0)) {
        return null;
    }

    return (
        <div className="criterion-section">
            <div className="criterion-subtitle">Organisaties die mogen beoordelen</div>
            <div className="criterion-organizations-root">
                {validatorModels[0]?.length > 0 && (
                    <div className="flex-row">
                        {validatorModels.map((row, index) => (
                            <div className="flex-col" key={index}>
                                {row?.length > 0 && (
                                    <div className="criterion-organizations">
                                        {row.map((validator) => (
                                            <div className="criterion-organization" key={validator.id}>
                                                <div className="criterion-organization-icon">
                                                    <em
                                                        className={`mdi mdi-shield-check ${
                                                            !validator.accepted ? 'text-muted' : ''
                                                        }`}
                                                    />
                                                </div>

                                                <div className="criterion-organization-name">
                                                    {validator.validator_organization.name}
                                                </div>

                                                <div
                                                    className="criterion-organization-actions"
                                                    onClick={() =>
                                                        removeExternalValidator(validator.validator_organization_id)
                                                    }>
                                                    <div className="mdi mdi-close" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="row">
                    <div className="col col-xs-12 col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Selecteer organisatie</label>
                            <SelectControl
                                className="form-control"
                                propKey={'id'}
                                value={form.values.id}
                                allowSearch={false}
                                options={validatorsAvailable}
                                onChange={(id: number) => form.update({ id })}
                            />
                        </div>
                    </div>

                    <div className="col col-xs-12 col-sm-6">
                        <div className="form-group">
                            <label className="form-label">&nbsp;</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    disabled={!form.values?.id}
                                    className={`button button-primary`}
                                    onClick={() => form.submit()}>
                                    Toevoegen
                                </button>

                                <button
                                    type="button"
                                    className="button button-default"
                                    onClick={() => {
                                        form.reset();
                                        setShowForm(false);
                                    }}>
                                    Annuleren
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!showForm && validatorsAvailable.length > 1 && (
                <button type="button" className="button button-primary" onClick={() => setShowForm(true)}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('components.fund_criteria_editor_item.buttons.add_external_validator')}
                </button>
            )}
        </div>
    );
}
