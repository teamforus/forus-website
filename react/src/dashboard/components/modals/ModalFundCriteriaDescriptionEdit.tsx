import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';
import useFormBuilder from '../../hooks/useFormBuilder';
import FundCriterion from '../../props/models/FundCriterion';
import { ResponseError } from '../../props/ApiResponses';
import MarkdownEditor from '../elements/forms/markdown-editor/MarkdownEditor';

export default function ModalFundCriteriaDescriptionEdit({
    modal,
    criterion,
    title,
    description,
    description_html,
    validateCriteria,
    onSubmit,
}: {
    modal: ModalState;
    criterion: FundCriterion;
    title: string;
    description: string;
    description_html: string;
    validateCriteria: (criterion: FundCriterion) => Promise<Array<unknown>>;
    onSubmit?: (res: { title: string; description: string }) => void;
}) {
    const { t } = useTranslation();

    const form = useFormBuilder(
        {
            ...{ title: title, description: description, description_html: description_html },
        },
        (res) => {
            validateCriteria(
                Object.assign(JSON.parse(JSON.stringify(criterion)), {
                    title: form.values.title,
                    description: form.values.description,
                }),
            )
                .then(() => {
                    onSubmit(res);
                    modal.close();
                })
                .catch((res: ResponseError) => {
                    if (
                        Object.keys(res.data.errors).filter((key) => {
                            return key.endsWith('.title') || key.endsWith('.description');
                        }).length > 0
                    ) {
                        form.setErrors(res.data.errors);
                    } else {
                        modal.close();
                    }
                })
                .finally(() => {
                    form.setIsLocked(false);
                });
        },
    );

    return (
        <div className={`modal modal-animated ${modal.loading ? 'modal-loading' : null}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window ">
                <form className="form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                    <div className="modal-header">{t('modals.modal_fund_criteria_description.title')}</div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form-group">
                                <label className="form-label">
                                    {t('modals.modal_fund_criteria_description.labels.title')}
                                </label>

                                <input
                                    className="form-control"
                                    value={form.values.title}
                                    placeholder="Titel"
                                    onChange={(e) => form.update({ title: e.target.value })}
                                />

                                <FormError error={form.errors['criteria.0.title']} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {t('modals.modal_fund_criteria_description.labels.description')}
                                </label>

                                <MarkdownEditor
                                    value={form.values.description_html || form.values.description || ''}
                                    onChange={(description: string) => form.update({ description: description })}
                                />

                                <FormError error={form.errors['criteria.0.description']} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" type="button" onClick={modal.close}>
                            {t('modals.modal_fund_criteria_description.buttons.close')}
                        </button>
                        <button className="button button-primary" type="submit">
                            {t('modals.modal_fund_criteria_description.buttons.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
