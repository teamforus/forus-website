import React, { Fragment, useCallback, useEffect } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { uniq, uniqueId } from 'lodash';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import { useTranslation } from 'react-i18next';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import Faq from '../../../../props/models/Faq';
import FaqEditorItem from './FaqEditorItem';
import { useFaqService } from '../../../../services/FaqService';
import Organization from '../../../../props/models/Organization';

type FaqLocal = Faq & { collapsed?: boolean; uid?: string };

export default function FaqEditor({
    faq = [],
    organization,
    setFaq,
    errors = null,
    setErrors = null,
    createFaqRef = null,
}: {
    faq: Array<FaqLocal>;
    organization: Organization;
    setFaq: (faq: Array<FaqLocal>) => void;
    errors: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    createFaqRef?: React.MutableRefObject<() => Promise<boolean>>;
}) {
    const { t } = useTranslation();

    const faqService = useFaqService();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const addQuestion = useCallback(() => {
        setFaq([
            ...faq,
            {
                uid: uniqueId(),
                title: '',
                description: '',
                collapsed: true,
            },
        ]);
    }, [faq, setFaq]);

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                const items = faq.map((preCheck) => preCheck.uid);
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                setFaq(arrayMove(faq, oldIndex, newIndex));
            }
        },
        [faq, setFaq],
    );

    const expandById = useCallback(
        (index) => {
            const list = Array.isArray(index) ? index : [index];

            for (let i = 0; i < list.length; i++) {
                faq[list[i]].collapsed = true;
                setFaq(faq);
            }
        },
        [faq, setFaq],
    );

    const validate = useCallback(async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            faqService
                .faqValidate(organization.id, faq)
                .then(() => resolve(true))
                .catch((res) => {
                    const { data, status } = res;
                    const { errors, message } = data;

                    if (errors && typeof errors == 'object') {
                        setErrors(errors);

                        expandById(
                            uniq(
                                Object.keys(errors).map((error) => {
                                    return error.split('.')[1] || null;
                                }),
                            ).filter((rowIndex) => !isNaN(parseInt(rowIndex))),
                        );
                    }

                    reject(status == 422 ? t('components.faq_editor.fix_validation_errors') : message);
                });
        });
    }, [expandById, faq, faqService, organization.id, setErrors, t]);

    useEffect(() => {
        if (createFaqRef) {
            createFaqRef.current = validate;
        }
    }, [createFaqRef, validate]);

    return (
        <Fragment>
            <div className="block block-faq-editor">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={faq.map((preCheck) => preCheck.uid)} strategy={verticalListSortingStrategy}>
                        <div className="question-wrapper">
                            {faq?.map((question, questionKey) => (
                                <FaqEditorItem
                                    key={questionKey}
                                    id={question.uid}
                                    question={question}
                                    faq={faq}
                                    onChange={setFaq}
                                    errors={errors}
                                    index={questionKey}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="faq-editor-actions">
                    <div className="button button-primary" onClick={() => addQuestion()}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        {t('components.faq_editor.buttons.add_question')}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
