import React, { Fragment, useCallback, useState } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import PreCheck from '../../../../props/models/PreCheck';
import { uniqueId } from 'lodash';
import { CSS } from '@dnd-kit/utilities';
import FormError from '../../../elements/forms/errors/FormError';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import ModalDangerZone from '../../../../components/modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import { useTranslation } from 'react-i18next';
import PreCheckRecordSettings from './PreCheckRecordSettings';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

export default function PreCheckStepEditor({
    preChecks = null,
    setPreChecks,
    errors = null,
}: {
    preChecks: Array<PreCheck>;
    setPreChecks: (preChecks: Array<PreCheck>) => void;
    errors: ResponseErrorData;
}) {
    const { t } = useTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const openModal = useOpenModal();

    const id = useState(uniqueId())[0];
    const [unCollapsedPreChecks, setUnCollapsedPreChecks] = useState<Array<number>>([]);
    const [unCollapsedRecords, setUnCollapsedRecords] = useState<
        Array<{ preCheckKey: number; preCheckRecordKey: number }>
    >([]);

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

    const collapse = useCallback(
        (preCheckKey: number) => {
            unCollapsedPreChecks.splice(unCollapsedPreChecks.indexOf(preCheckKey), 1);
            setUnCollapsedPreChecks([...unCollapsedPreChecks]);
        },
        [unCollapsedPreChecks],
    );

    const unCollapse = useCallback(
        (preCheckKey: number) => {
            setUnCollapsedPreChecks([...unCollapsedPreChecks, preCheckKey]);
        },
        [unCollapsedPreChecks],
    );

    const isCollapsedRecord = useCallback(
        (preCheckKey: number, recordKey: number) => {
            return !unCollapsedRecords.find(
                (unCollapsedRecord) =>
                    unCollapsedRecord.preCheckKey == preCheckKey && unCollapsedRecord.preCheckRecordKey == recordKey,
            );
        },
        [unCollapsedRecords],
    );

    const collapseRecord = useCallback(
        (preCheckKey: number, preCheckRecordKey: number) => {
            setUnCollapsedRecords(
                unCollapsedRecords.filter(
                    (record) => record.preCheckKey != preCheckKey || record.preCheckRecordKey != preCheckRecordKey,
                ),
            );
        },
        [unCollapsedRecords],
    );

    const unCollapseRecord = useCallback(
        (preCheckKey: number, preCheckRecordKey: number) => {
            setUnCollapsedRecords([
                ...unCollapsedRecords,
                { preCheckKey: preCheckKey, preCheckRecordKey: preCheckRecordKey },
            ]);
        },
        [unCollapsedRecords],
    );

    const removePreCheck = useCallback(
        (preCheckIndex: number) => {
            askConfirmation(() => {
                const deletedPreCheck = preChecks.splice(preCheckIndex, 1)[0];
                const defaultPreCheck = preChecks.find((preCheck) => preCheck.default);

                defaultPreCheck.record_types = [...defaultPreCheck.record_types, ...deletedPreCheck.record_types];
                setPreChecks([...preChecks]);
            });
        },
        [askConfirmation, preChecks, setPreChecks],
    );

    const addPreCheck = useCallback(() => {
        setPreChecks([
            ...preChecks,
            {
                uid: uniqueId(),
                label: '',
                title: '',
                uncollapsed: true,
                description: '',
                record_types: [],
            },
        ]);

        setUnCollapsedPreChecks([...unCollapsedPreChecks, preChecks.length]);
    }, [preChecks, unCollapsedPreChecks, setPreChecks]);

    const updatePreChecks = useCallback(
        (preCheckIndex: number, values: object) => {
            preChecks[preCheckIndex] = { ...preChecks[preCheckIndex], ...values };
            setPreChecks(preChecks);
        },
        [preChecks, setPreChecks],
    );

    const updatePreCheckRecords = useCallback(
        (preCheckIndex: number, preCheckRecordIndex: number, values: object = {}) => {
            const records = preChecks[preCheckIndex].record_types;
            records[preCheckRecordIndex] = { ...records[preCheckRecordIndex], ...values };
            preChecks[preCheckIndex] = { ...preChecks[preCheckIndex], record_types: records };
            setPreChecks(preChecks);
        },
        [preChecks, setPreChecks],
    );

    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (active.id !== over.id) {
                const items = preChecks.map((preCheck) => preCheck.uid);
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                setPreChecks(arrayMove(preChecks, oldIndex, newIndex));
            }
        },
        [preChecks, setPreChecks],
    );

    return (
        <Fragment>
            <div className="block block-pre-checks-blocks-editor">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={(preChecks || []).map((preCheck) => preCheck.uid)}
                        strategy={verticalListSortingStrategy}>
                        {preChecks?.map((preCheck, preCheckKey) => (
                            <div className="pre-check-item" key={preCheckKey} ref={setNodeRef} style={style}>
                                <div className="pre-check-item-header">
                                    <div className="pre-check-item-header-drag">
                                        <em className="mdi mdi-drag-vertical" {...attributes} {...listeners}></em>
                                    </div>

                                    <div className="pre-check-item-header-title">
                                        {preCheck.title && (
                                            <Fragment>
                                                <span>{preCheck.title}</span>
                                                <span className="text-muted">
                                                    {` (${preCheck.record_types.length} criteria)`}
                                                </span>
                                            </Fragment>
                                        )}
                                        {!preCheck.title && <span>{!preCheck.id ? 'New step' : 'Edit step'}</span>}

                                        {preCheck.default == true && (
                                            <span className="text-muted">
                                                &nbsp;
                                                <em className="mdi mdi-lock-outline" />
                                            </span>
                                        )}
                                    </div>

                                    <div className="pre-check-item-header-actions">
                                        {unCollapsedPreChecks.indexOf(preCheckKey) != -1 && (
                                            <div
                                                className="button button-default button-sm"
                                                onClick={() => collapse(preCheckKey)}>
                                                <em className="mdi mdi-arrow-collapse-vertical icon-start"></em>
                                                Inklappen
                                            </div>
                                        )}

                                        {unCollapsedPreChecks.indexOf(preCheckKey) == -1 && (
                                            <div
                                                className="button button-primary button-sm"
                                                onClick={() => unCollapse(preCheckKey)}>
                                                <em className="mdi mdi-arrow-expand-vertical icon-start"></em>
                                                Uitklappen
                                            </div>
                                        )}

                                        {!preCheck.default && (
                                            <div
                                                className="button button-danger button-sm"
                                                onClick={() => removePreCheck(preCheckKey)}>
                                                <em className="mdi mdi-trash-can-outline icon-start"></em>
                                                Stap verwijderen
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {unCollapsedPreChecks.indexOf(preCheckKey) != -1 && (
                                    <div className="pre-check-item-body">
                                        <div className="form">
                                            <div className="pre-check-item-body-content">
                                                <div className="row">
                                                    <div className="form-group col col-lg-6 col-xs-12">
                                                        <label className="form-label">Korte titel</label>
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            defaultValue={preCheck.title_short}
                                                            onChange={(e) =>
                                                                updatePreChecks(preCheckKey, {
                                                                    title_short: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Title..."
                                                        />
                                                        <div className="form-hint">Max. 30 tekens</div>

                                                        {errors && (
                                                            <FormError
                                                                error={errors[`pre_checks.${preCheckKey}.title_short`]}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="form-group col col-lg-6 col-xs-12">
                                                        <label className="form-label form-label-required">Titel</label>
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            defaultValue={preCheck.title}
                                                            onChange={(e) =>
                                                                updatePreChecks(preCheckKey, {
                                                                    title: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Title..."
                                                        />
                                                        <div className="form-hint">Max. 100 tekens</div>

                                                        {errors && (
                                                            <FormError
                                                                error={errors[`pre_checks.${preCheckKey}.title`]}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pre-check-item-body-records">
                                                <div className="block-records-title">
                                                    Criteria ({preCheck.record_types.length})
                                                </div>

                                                <div className="pre-check-item-body-records-items">
                                                    {preCheck.record_types.map((record, recordKey) => (
                                                        <div
                                                            className="pre-check-item pre-check-item-record"
                                                            key={recordKey}>
                                                            <div className="pre-check-item-header" key={recordKey}>
                                                                <div className="pre-check-item-header-drag">
                                                                    <em className="mdi mdi-drag-vertical" />
                                                                </div>

                                                                <div className="pre-check-item-header-title">
                                                                    <span>
                                                                        {record.title
                                                                            ? record.title + ':'
                                                                            : 'Geen titel:'}
                                                                    </span>
                                                                    &nbsp;
                                                                    <span className="text-muted">
                                                                        {`${record.record_type.name} (${record?.funds.length} fonds(en))`}
                                                                    </span>
                                                                </div>

                                                                <div className="pre-check-item-header-actions">
                                                                    {!isCollapsedRecord(preCheckKey, recordKey) && (
                                                                        <div
                                                                            className="button button-default button-sm"
                                                                            onClick={() =>
                                                                                collapseRecord(preCheckKey, recordKey)
                                                                            }>
                                                                            <em className="mdi mdi-arrow-collapse-vertical icon-start"></em>
                                                                            Inklappen
                                                                        </div>
                                                                    )}

                                                                    {isCollapsedRecord(preCheckKey, recordKey) && (
                                                                        <div
                                                                            className="button button-primary button-sm"
                                                                            onClick={() =>
                                                                                unCollapseRecord(preCheckKey, recordKey)
                                                                            }>
                                                                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                                                                            Uitklappen
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {!isCollapsedRecord(preCheckKey, recordKey) && (
                                                                <div className="pre-check-item-body">
                                                                    <div className="pre-check-item-body-content">
                                                                        <div className="row">
                                                                            <div className="form-group col col-lg-6 col-xs-12">
                                                                                <label className="form-label form-label-required">
                                                                                    Korte titel
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    defaultValue={record.title_short}
                                                                                    placeholder="Title..."
                                                                                    onChange={(e) =>
                                                                                        updatePreCheckRecords(
                                                                                            preCheckKey,
                                                                                            recordKey,
                                                                                            {
                                                                                                title_short:
                                                                                                    e.target.value,
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <div className="form-hint">
                                                                                    Max. 40 tekens
                                                                                </div>

                                                                                {errors && (
                                                                                    <FormError
                                                                                        error={
                                                                                            errors[
                                                                                                `pre_checks.${preCheckKey}.record_types.${recordKey}.title_short`
                                                                                            ]
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            <div className="form-group col col-lg-6 col-xs-12">
                                                                                <label className="form-label form-label-required">
                                                                                    Titel
                                                                                </label>
                                                                                <input
                                                                                    className="form-control"
                                                                                    type="text"
                                                                                    defaultValue={record.title}
                                                                                    placeholder="Title..."
                                                                                    onChange={(e) =>
                                                                                        updatePreCheckRecords(
                                                                                            preCheckKey,
                                                                                            recordKey,
                                                                                            {
                                                                                                title: e.target.value,
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <div className="form-hint">
                                                                                    Max. 100 tekens
                                                                                </div>

                                                                                {errors && (
                                                                                    <FormError
                                                                                        error={
                                                                                            errors[
                                                                                                `pre_checks.${preCheckKey}.record_types.${recordKey}.title`
                                                                                            ]
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="row">
                                                                            <div className="col col-lg-12">
                                                                                <div className="form-group">
                                                                                    <label className="form-label form-label-required">
                                                                                        Omschrijving
                                                                                    </label>
                                                                                    <textarea
                                                                                        className="form-control"
                                                                                        value={record.description || ''}
                                                                                        placeholder="Omschrijving..."
                                                                                        onChange={(e) => {
                                                                                            updatePreCheckRecords(
                                                                                                preCheckKey,
                                                                                                recordKey,
                                                                                                {
                                                                                                    description:
                                                                                                        e.target.value,
                                                                                                },
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                    <div className="form-hint">
                                                                                        Max. 1000 tekens
                                                                                    </div>

                                                                                    {errors && (
                                                                                        <FormError
                                                                                            error={
                                                                                                errors[
                                                                                                    `pre_checks.${preCheckKey}.record_types.${recordKey}.description`
                                                                                                ]
                                                                                            }
                                                                                        />
                                                                                    )}
                                                                                </div>

                                                                                <PreCheckRecordSettings
                                                                                    preChecks={preChecks}
                                                                                    preCheckKey={preCheckKey}
                                                                                    recordKey={recordKey}
                                                                                    onUpdate={updatePreCheckRecords}
                                                                                    errors={errors}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {!preCheck.record_types.length && (
                                                        <div className="pre-check-item-body-records-empty">
                                                            <div className="pre-check-item-body-records-empty-img">
                                                                <img
                                                                    src={'undefined./assets/img/icon-drag.svg'}
                                                                    alt={''}
                                                                />
                                                            </div>
                                                            <div className="pre-check-item-body-records-empty-title">
                                                                Criteria hier slepen en neerzetten
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>

                <div className="pre-check-actions">
                    <div className="button button-primary" onClick={() => addPreCheck()}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        Stap toevoegen
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
