import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormError from '../elements/forms/errors/FormError';
import Voucher from '../../props/models/Voucher';
import Organization from '../../props/models/Organization';
import useRecordTypeService from '../../services/RecordTypeService';
import RecordType from '../../props/models/RecordType';
import useVoucherRecordService from '../../services/VoucherRecordService';
import usePushDanger from '../../hooks/usePushDanger';
import usePushSuccess from '../../hooks/usePushSuccess';
import VoucherRecord from '../../props/models/VoucherRecord';
import { dateFormat, dateParse } from '../../helpers/dates';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';

export default function ModalVoucherRecordEdit({
    modal,
    className,
    voucher,
    organization,
    record,
    existingRecordTypes,
    onClose,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    organization: Organization;
    record: VoucherRecord;
    existingRecordTypes: Array<string>;
    onClose: (voucherRecord: VoucherRecord) => void;
}) {
    const setProgress = useSetProgress();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const recordTypeService = useRecordTypeService();
    const voucherRecordService = useVoucherRecordService();

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
        async (values) => {
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
                    form.errors = res.data?.errors || {};
                    pushDanger('Foutmelding!', res.data.message);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    const { update: formUpdate } = form;

    const fetchRecordTypes = useCallback(() => {
        recordTypeService.list({ vouchers: 1 }).then((res) => {
            setProgress(100);

            setRecordTypes([
                ...(record
                    ? res.data.filter((record_type) => record_type.key == record.record_type.key)
                    : res.data.filter((record_type) => !existingRecordTypes.includes(record_type.key))),
                {
                    key: null,
                    name: 'Er zijn niet meer eigenschappen beschikbaar.',
                },
            ]);
        });
    }, [existingRecordTypes, record, recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        formUpdate({ record_type_key: recordTypes[0]?.key });
    }, [formUpdate, recordTypes]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Voeg een nieuwe eigenschap toe</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
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
                                    disabled={!!record || (recordTypes.length == 1 && recordTypes[0].key == null)}
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
                                    value={form.values.value}
                                    onChange={(e) => form.update({ value: e.target.value })}
                                />
                            ) : (
                                <DatePickerControl
                                    value={dateParse(form.values.value)}
                                    placeholder={'yyyy-MM-dd'}
                                    onChange={(value: Date) => {
                                        form.update({ value: dateFormat(value) });
                                    }}
                                />
                            )}
                            <FormError error={form.errors?.value} />
                        </div>

                        <div className="form-group">
                            <div className="form-label">Notitie</div>
                            <textarea
                                placeholder="Note"
                                className="form-control r-n"
                                value={form.values.note}
                                onChange={(e) => form.update({ note: e.target.value })}
                            />

                            <FormError error={form.errors?.note} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type="submit" className="button button-primary">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
