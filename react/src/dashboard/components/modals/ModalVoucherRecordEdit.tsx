import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormError from '../elements/forms/errors/FormError';
import Voucher from '../../props/models/Voucher';
import Organization from '../../props/models/Organization';
import { useRecordTypeService } from '../../services/RecordTypeService';
import RecordType from '../../props/models/RecordType';
import useVoucherRecordService from '../../services/VoucherRecordService';
import usePushDanger from '../../hooks/usePushDanger';
import usePushSuccess from '../../hooks/usePushSuccess';
import VoucherRecord from '../../props/models/VoucherRecord';
import { dateFormat, dateParse } from '../../helpers/dates';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';

export default function ModalVoucherRecordEdit({
    modal,
    record,
    voucher,
    onClose,
    className,
    organization,
}: {
    modal: ModalState;
    record: VoucherRecord;
    voucher: Voucher;
    onClose: (voucherRecord: VoucherRecord) => void;
    className?: string;
    organization: Organization;
}) {
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const recordTypeService = useRecordTypeService();
    const voucherRecordService = useVoucherRecordService();

    const [existingRecordTypes, setExistingRecordTypes] = useState<Array<string>>([]);
    const [recordTypes, setRecordTypes] = useState<Array<Partial<RecordType>>>([]);

    const form = useFormBuilder(
        record
            ? {
                  note: record.note,
                  value: record.value,
                  record_type_key: record?.record_type?.key || null,
              }
            : {
                  note: '',
                  value: '',
                  record_type_key: recordTypes[0]?.key || null,
              },
        (values) => {
            const { record_type_key, value, note } = values;
            const data = { record_type_key, value, note };

            const promise =
                record == null
                    ? voucherRecordService.store(organization.id, voucher.id, data)
                    : voucherRecordService.update(organization.id, voucher.id, record.id, data);

            promise
                .then((res) => {
                    onClose(res.data.data);
                    pushSuccess('Gelukt!', 'Eigenschap is toegevoegd!');
                    modal.close();
                })
                .catch((res) => {
                    form.setErrors(res.data?.errors);
                    pushDanger('Foutmelding!', res.data.message);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    const { update: formUpdate } = form;

    const fetchRecordTypes = useCallback(() => {
        recordTypeService.list({ vouchers: 1 }).then((res) => {
            setProgress(100);

            const recordTypesData = record
                ? res.data.filter((record_type) => record_type.key == record.record_type.key)
                : res.data.filter((record_type) => !existingRecordTypes.includes(record_type.key));

            setRecordTypes(
                recordTypesData.length > 0
                    ? recordTypesData
                    : [{ key: null, name: 'Er zijn niet meer eigenschappen beschikbaar.' }],
            );
        });
    }, [existingRecordTypes, record, recordTypeService, setProgress]);

    const fetchExistingRecordTypes = useCallback(() => {
        setProgress(0);

        voucherRecordService
            .list(organization.id, voucher.id, { per_page: 100 })
            .then((res) => setExistingRecordTypes(res.data.data.map((record) => record.record_type_key)))
            .catch((res) => pushDanger('Mislukt!', res.data.message))
            .finally(() => setProgress(100));
    }, [organization.id, setProgress, voucher.id, voucherRecordService, pushDanger]);

    useEffect(() => {
        fetchExistingRecordTypes();
    }, [fetchExistingRecordTypes]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        formUpdate({ record_type_key: recordTypes[0]?.key });
    }, [formUpdate, recordTypes]);

    return (
        <div className={`modal modal-md modal-animated ${modal.loading ? 'modal-loading' : ''} ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Voeg een nieuwe eigenschap toe</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col-lg-10 col-offset-lg-1">
                                <div className="form-group">
                                    <div className="form-label form-label-required">Soort eigenschap</div>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            value={form.values.record_type_key}
                                            propKey={'key'}
                                            options={recordTypes}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            disabled={
                                                !!record || (recordTypes.length == 1 && recordTypes[0].key == null)
                                            }
                                            onChange={(record_type_key: string) => {
                                                form.update({ record_type_key: record_type_key });
                                            }}
                                        />
                                    </div>
                                    <FormError error={form.errors?.record_type_key} />
                                </div>

                                <div className="form-group">
                                    <div className="form-label form-label-required">Eigenschap</div>

                                    {form.values.record_type_key != 'birth_date' ? (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.values.value || ''}
                                            placeholder="Value"
                                            onChange={(e) => form.update({ value: e.target.value })}
                                        />
                                    ) : (
                                        <DatePickerControl
                                            value={dateParse(form.values.value)}
                                            placeholder={'yyyy-MM-dd'}
                                            onChange={(value: Date) => form.update({ value: dateFormat(value) })}
                                        />
                                    )}
                                    <FormError error={form.errors?.value} />
                                </div>

                                <div className="form-group">
                                    <div className="form-label">Notitie</div>
                                    <textarea
                                        placeholder="Note"
                                        className="form-control r-n"
                                        value={form.values.note || ''}
                                        onChange={(e) => form.update({ note: e.target.value })}
                                    />

                                    <FormError error={form.errors?.note} />
                                </div>

                                <div className="form-group">
                                    <div className="form-label" />
                                    <div className="form-offset">
                                        <div className="block block-info">
                                            <em className="mdi mdi-information block-info-icon" />
                                            Controleer de gegevens. Na het aanmaken van het tegoed kan het niet worden
                                            verwijderd.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
