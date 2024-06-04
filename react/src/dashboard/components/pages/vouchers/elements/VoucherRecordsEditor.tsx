import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Record from '../../../../props/models/Record';
import { ResponseErrorData } from '../../../../props/ApiResponses';
import DatePickerControl from '../../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import FormError from '../../../elements/forms/errors/FormError';
import { useRecordTypeService } from '../../../../services/RecordTypeService';
import SelectControl from '../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../elements/select-control/templates/SelectControlOptions';

export default function VoucherRecordsEditor({
    records,
    setRecords,
    errors,
}: {
    records: Array<Record>;
    setRecords: (records: Array<Record>) => void;
    errors: ResponseErrorData;
}) {
    const { t } = useTranslation();

    const recordTypeService = useRecordTypeService();

    const [record, setRecord] = useState(null);
    const [recordOptionsAll, setRecordOptionsAll] = useState(null);
    const [recordOptions, setRecordOptions] = useState(null);
    const [showRecordSelector, setShowRecordSelector] = useState<boolean>(false);
    const [showVoucherAddBlock, setShowVoucherAddBlock] = useState<number | boolean>(true);

    const addRecord = useCallback(
        (record_key) => {
            if (records.find((record) => record.key == record_key)) {
                return;
            }

            records.push({
                key: record_key,
                name: recordOptions.find((record: Record) => record.key == record_key).name,
            });

            setRecordOptions(recordOptions.filter((record: Record) => record.key != record_key));
            setShowVoucherAddBlock(recordOptions.length);
            setRecord(recordOptions[0].key);
        },
        [recordOptions, records],
    );

    const removeRecord = useCallback(
        (record_key) => {
            setRecords(records.filter((record) => record.key != record_key));

            recordOptions.push(recordOptionsAll.find((record) => record.key == record_key));
            setRecordOptions([...recordOptions]);
            setShowVoucherAddBlock(records.length);
        },
        [recordOptions, recordOptionsAll, records, setRecords],
    );

    const fetchRecordTypes = useCallback(() => {
        recordTypeService.list({ vouchers: 1 }).then((res) => {
            setRecordOptions(res.data);
            setRecordOptionsAll(res.data);
            setRecord(res.data?.[0].key);
        });
    }, [recordTypeService]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    return (
        <div className="block block-voucher-records-editor form">
            {records.length > 0 && (
                <div className="block-voucher-record-list">
                    {records.map((record, index) => (
                        <div key={index} className="form-group form-group-inline form-group-inline-lg">
                            <div className="form-label">{record.name}</div>
                            <div className="form-offset">
                                <div className="voucher-record-item">
                                    <div className="voucher-record-item-input flex-flex-vertical">
                                        {record.key != 'birth_date' ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={record.value}
                                                placeholder={record.name}
                                                onChange={(e) => {
                                                    const recordsData = [...records];
                                                    recordsData[index].value = e.target.value;
                                                    setRecords(recordsData);
                                                }}
                                            />
                                        ) : (
                                            <DatePickerControl
                                                value={dateParse(record.value)}
                                                placeholder={t('dd-MM-yyyy')}
                                                onChange={(value: Date) => {
                                                    const recordsData = [...records];
                                                    recordsData[index].value = dateFormat(value);
                                                    setRecords(recordsData);
                                                }}
                                            />
                                        )}

                                        <FormError error={errors?.[record.key]} />
                                    </div>

                                    <div className="voucher-record-item-actions">
                                        <div
                                            className="button button-icon button-default"
                                            onClick={() => removeRecord(record.key)}>
                                            <em className="mdi mdi-close" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showVoucherAddBlock && (
                <div className="block-voucher-record-add">
                    <div className="form-group form-group-inline form-group-inline-lg">
                        <div className="form-label">Selecteer eigenschap</div>
                        {!showRecordSelector ? (
                            <div className="button button-primary" onClick={() => setShowRecordSelector(true)}>
                                <em className="mdi mdi-plus icon-start" />
                                Eigenschap toevoegen
                            </div>
                        ) : (
                            <SelectControl
                                className="form-control"
                                propKey={'key'}
                                allowSearch={false}
                                options={recordOptions}
                                value={record}
                                onChange={(recordKey: string) => {
                                    console.log('record: ', record);
                                    console.log('recordKey: ', recordKey);
                                    setRecord(recordKey);
                                }}
                                optionsComponent={SelectControlOptions}
                            />
                        )}
                    </div>

                    {showRecordSelector && (
                        <div className="form-group form-group-inline form-group-inline-lg">
                            <div className="form-label" />
                            <div className="block-voucher-record-add-actions">
                                <button
                                    type="button"
                                    className="button button-default"
                                    onClick={() => setShowRecordSelector(false)}>
                                    Annuleren
                                </button>
                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={() => addRecord(record)}>
                                    Toevoegen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
