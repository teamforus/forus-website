import FormError from '../../../elements/forms/errors/FormError';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import React, { useCallback } from 'react';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import { useTranslation } from 'react-i18next';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Faq from '../../../../props/models/Faq';

type FaqLocal = Faq & { collapsed?: boolean };

export default function FaqEditorItem({
    question,
    faq,
    onChange,
    errors,
    index,
    id,
}: {
    question: FaqLocal;
    faq: Array<FaqLocal>;
    onChange: React.Dispatch<React.SetStateAction<Array<FaqLocal>>>;
    errors: ResponseErrorData;
    index: number;
    id: string;
}) {
    const { t } = useTranslation();

    const openModal = useOpenModal();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const askConfirmation = useCallback(
        (onConfirm): void => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_implementation_block.title')}
                    description_text={t('modals.danger_zone.remove_implementation_block.description')}
                    buttonCancel={{
                        text: t('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                        onClick: () => {
                            modal.close();
                        },
                    }}
                    buttonSubmit={{
                        text: t('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                    }}
                />
            ));
        },
        [openModal, t],
    );

    const removeFaqItem = useCallback(
        (questionIndex: number) => {
            askConfirmation(() => {
                faq.splice(questionIndex, 1);
                onChange([...faq]);
            });
        },
        [askConfirmation, faq, onChange],
    );

    const updateFaq = useCallback(
        (preCheckIndex: number, values: object) => {
            faq[preCheckIndex] = { ...faq[preCheckIndex], ...values };
            onChange(faq);
        },
        [faq, onChange],
    );

    return (
        <div className="question-item" key={index} ref={setNodeRef} style={style}>
            <div className="question-header">
                <em className="mdi mdi-dots-vertical question-drag" {...attributes} {...listeners}></em>

                <div className={`question-icon ${!question.collapsed && (!question.title || !question.description)}`}>
                    <em className="mdi mdi-frequently-asked-questions" />
                </div>

                <div className="question-title">
                    {question.collapsed ? (
                        <span>{!question.id ? 'Nieuwe vraag' : 'Vraag aanpassen'}</span>
                    ) : (
                        <span>{question.title || 'Geen vraag'}</span>
                    )}
                </div>

                <div className="question-actions">
                    {question.collapsed && (
                        <div
                            className="button button-default button-sm"
                            onClick={() => {
                                faq[index].collapsed = false;
                                onChange([...faq]);
                            }}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start"></em>
                            {t('components.faq_editor.item.buttons.collapse')}
                        </div>
                    )}

                    {!question.collapsed && (
                        <div
                            className="button button-primary button-sm"
                            onClick={() => {
                                faq[index].collapsed = true;
                                onChange([...faq]);
                            }}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start"></em>
                            {t('components.faq_editor.item.buttons.expand')}
                        </div>
                    )}

                    <div className="button button-danger button-sm" onClick={() => removeFaqItem(index)}>
                        <em className="mdi mdi-trash-can-outline icon-start"></em>
                        {t('components.faq_editor.item.buttons.delete')}
                    </div>
                </div>
            </div>

            {question.collapsed && (
                <div className="question-body">
                    <div className="form">
                        <div className="form-group">
                            <label className="form-label form-label-required">Vraag</label>
                            <input
                                className="form-control"
                                type="text"
                                defaultValue={question.title || ''}
                                onChange={(e) =>
                                    updateFaq(index, {
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Title..."
                            />
                            <div className="form-hint">Max. 200 tekens</div>

                            {errors && <FormError error={errors[`faq.${index}.title`]} />}
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Antwoord</label>
                            <MarkdownEditor
                                value={question.description_html || question.description || ''}
                                onChange={(description) => updateFaq(index, { description: description })}
                                extendedOptions={true}
                                placeholder={t('organization_edit.labels.description')}
                            />
                            <div className="form-hint">Max. 5000 tekens</div>

                            {errors && <FormError error={errors[`faq.${index}.description`]} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
