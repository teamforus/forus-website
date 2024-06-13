import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import FormError from '../elements/forms/errors/FormError';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../helpers/dates';
import VoucherRecordsEditor from '../pages/vouchers/elements/VoucherRecordsEditor';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useVoucherService from '../../services/VoucherService';
import useTranslate from '../../hooks/useTranslate';
import Organization from '../../props/models/Organization';
import { ResponseError } from '../../props/ApiResponses';
import usePushDanger from '../../hooks/usePushDanger';
import useSetProgress from '../../hooks/useSetProgress';
import Record from '../../props/models/Record';

export default function ModalVoucherCreate({
    fund,
    modal,
    className,
    onCreated,
    organization,
}: {
    fund: Partial<Fund>;
    modal: ModalState;
    className?: string;
    onCreated: () => void;
    organization: Organization;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const voucherService = useVoucherService();

    const [dateMinLimit] = useState(new Date());
    const [showRecordFields, setShowRecordFields] = useState<boolean>(false);
    const [showGeneralFields, setShowGeneralFields] = useState<boolean>(true);

    const assignTypes = useMemo(
        () => [
            { key: 'activation_code', label: 'Activatiecode', inputLabel: 'Uniek nummer', hasInput: false },
            { key: 'email', label: 'E-mailadres', inputLabel: 'E-mailadres', hasInput: true },
            ...(organization?.bsn_enabled ? [{ key: 'bsn', label: 'BSN', inputLabel: 'BSN', hasInput: true }] : []),
        ],
        [organization?.bsn_enabled],
    );

    const [assignType, setAssignType] = useState(assignTypes[0]);

    const form = useFormBuilder<{
        bsn?: string;
        note: string;
        email?: string;
        amount: string;
        records?: Array<Record>;
        fund_id: number;
        expire_at: string;
        client_uid?: string;
        limit_multiplier?: number;
    }>(
        {
            bsn: null,
            note: '',
            email: null,
            amount: null,
            records: [],
            fund_id: fund.id,
            expire_at: fund.end_date,
            client_uid: null,
            limit_multiplier: 1,
        },
        async (values) => {
            setProgress(0);

            const data = {
                ...values,
                ...{
                    email: { activate: 1, activation_code: 0 },
                    bsn: { activate: 1, activation_code: 0 },
                    activation_code: { activate: 0, activation_code: 1 },
                }[assignType.key],
                assign_by_type: assignType.key,
                records: form.values.records.reduce(
                    (records, record) => ({ ...records, [record.key]: record.value }),
                    {},
                ),
            };

            const makeRequest = () => {
                setProgress(0);

                voucherService
                    .store(organization.id, data)
                    .then(() => {
                        onCreated();
                        modal.close();
                    })
                    .catch((err: ResponseError) => {
                        form.setErrors(err.data.errors);
                        pushDanger('Mislukt!', err.data.message);
                    })
                    .finally(() => {
                        setProgress(100);
                        form.setIsLocked(false);
                    });
            };

            voucherService
                .storeValidate(organization.id, data)
                .then(() => {
                    if (!['email', 'bsn'].includes(assignType.key)) {
                        return makeRequest();
                    }

                    if (assignType.key === 'email') {
                        voucherService
                            .index(organization.id, {
                                type: 'fund_voucher',
                                email: form.values.email,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total === 0) {
                                    return makeRequest();
                                }

                                confirmEmailSkip([form.values.email], (list) => {
                                    if (list.filter((email) => email.model).length > 0) {
                                        makeRequest();
                                    }
                                });
                            });
                    }

                    if (assignType.key === 'bsn') {
                        voucherService
                            .index(organization.id, {
                                type: 'fund_voucher',
                                bsn: form.values.bsn,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total === 0) {
                                    return makeRequest();
                                }

                                confirmBsnSkip([form.values.bsn], (list) => {
                                    if (list.filter((bsn) => bsn.model).length > 0) {
                                        makeRequest();
                                    }
                                });
                            });
                    }
                })
                .catch((err: ResponseError) => {
                    pushDanger('Mislukt!', err.data.message);
                    form.setErrors(err.data.errors);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: formUpdate } = form;

    const confirmEmailSkip = useCallback(
        (
            existingEmails,
            onConfirm: (list: Array<{ value: string; blink?: boolean; model?: boolean }>) => void,
            onCancel = () => null,
        ) => {
            const items = existingEmails.map((email: string) => ({ value: email }));

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Dubbele e-mailadressen gedetecteerd.'}
                    hero_subtitle={[
                        `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een extra voucher wilt aanmaken?`,
                        'Deze e-mailadressen bezitten al een voucher van dit fonds.',
                    ]}
                    enableToggles={true}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            ));
        },
        [openModal],
    );

    const confirmBsnSkip = useCallback(
        (
            existingBsn,
            onConfirm: (list: Array<{ value: string; blink?: boolean; model?: boolean }>) => void,
            onCancel = () => null,
        ) => {
            const items = existingBsn.map((bsn: string) => ({ value: bsn }));

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Dubbele bsn(s) gedetecteerd.'}
                    hero_subtitle={[
                        `Weet u zeker dat u voor ${items.length} bsn(s) een extra voucher wilt aanmaken?`,
                        'Deze burgerservicenummers bezitten al een voucher van dit fonds.',
                    ]}
                    enableToggles={true}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                />
            ));
        },
        [openModal],
    );

    useEffect(() => {
        if (assignType.key !== 'bsn') {
            formUpdate({ bsn: null });
        }

        if (assignType.key !== 'email') {
            formUpdate({ email: null });
        }
    }, [assignType.key, formUpdate]);

    return (
        <div
            className={`modal modal-animated modal-voucher-create ${
                modal.loading ? 'modal-loading' : ''
            } ${className}`}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_voucher_create.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-fields-groups">
                            <div className="modal-fields-group">
                                <div
                                    className="modal-fields-group-title"
                                    onClick={() => setShowGeneralFields(!showGeneralFields)}>
                                    <em className={`mdi ${showGeneralFields ? 'mdi-menu-down' : 'mdi-menu-right'}`} />
                                    Algemeen
                                </div>

                                {showGeneralFields && (
                                    <div className="modal-fields-list">
                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label form-label-required">
                                                {translate('modals.modal_voucher_create.labels.assign_by_type')}
                                            </div>
                                            <div className="form-offset">
                                                <SelectControl
                                                    value={assignType}
                                                    propValue={'label'}
                                                    onChange={setAssignType}
                                                    options={assignTypes}
                                                    allowSearch={false}
                                                    optionsComponent={SelectControlOptions}
                                                />
                                            </div>
                                            <FormError error={form.errors?.assign_by_type} />
                                        </div>

                                        {assignType.hasInput && (
                                            <div className="form-group form-group-inline form-group-inline-lg">
                                                <div
                                                    className={`form-label form-label-required ${
                                                        ['email', 'bsn'].includes(assignType.key)
                                                            ? 'form-label-required'
                                                            : ''
                                                    }`}>
                                                    {assignType.inputLabel}
                                                </div>
                                                <input
                                                    className="form-control"
                                                    placeholder={assignType.inputLabel}
                                                    value={form.values[assignType.key] || ''}
                                                    onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                                />
                                                <FormError error={form.errors?.[assignType.key]} />
                                            </div>
                                        )}

                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label">
                                                {translate('modals.modal_voucher_create.labels.client_uid')}
                                            </div>
                                            <input
                                                className="form-control"
                                                placeholder={translate('modals.modal_voucher_create.labels.client_uid')}
                                                value={form.values.client_uid || ''}
                                                onChange={(e) => form.update({ client_uid: e.target.value })}
                                            />
                                            <FormError error={form.errors?.client_uid} />
                                        </div>

                                        {fund.type === 'budget' && (
                                            <div className="form-group form-group-inline form-group-inline-lg">
                                                <div className="form-label form-label-required">
                                                    {translate('modals.modal_voucher_create.labels.amount')}
                                                </div>
                                                <div className="form-offset">
                                                    <input
                                                        type={'number'}
                                                        className="form-control"
                                                        placeholder={translate(
                                                            'modals.modal_voucher_create.labels.amount',
                                                        )}
                                                        value={form.values.amount || ''}
                                                        step=".01"
                                                        min="0.01"
                                                        max={fund.limit_per_voucher}
                                                        onChange={(e) => form.update({ amount: e.target.value })}
                                                    />
                                                    {!form.errors?.amount && (
                                                        <div className="form-hint">
                                                            Limiet {fund.limit_per_voucher_locale}
                                                        </div>
                                                    )}
                                                    <FormError error={form.errors?.amount} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label">
                                                {translate('modals.modal_voucher_create.labels.expire_at')}
                                            </div>
                                            <div className="form-offset">
                                                <DatePickerControl
                                                    value={dateParse(form.values.expire_at)}
                                                    dateMin={dateMinLimit}
                                                    dateMax={dateParse(fund.end_date)}
                                                    placeholder={translate('dd-MM-yyyy')}
                                                    onChange={(expire_at: Date) => {
                                                        form.update({ expire_at: dateFormat(expire_at) });
                                                    }}
                                                />
                                                <FormError error={form.errors?.expire_at} />
                                            </div>
                                        </div>

                                        {fund.type === 'subsidies' && (
                                            <div className="form-group form-group-inline form-group-inline-lg">
                                                <div className="form-label form-label-required">
                                                    {translate('modals.modal_voucher_create.labels.limit_multiplier')}
                                                </div>
                                                <div className="form-offset">
                                                    <input
                                                        type={'number'}
                                                        className="form-control"
                                                        placeholder={translate(
                                                            'modals.modal_voucher_create.labels.limit_multiplier',
                                                        )}
                                                        value={form.values.limit_multiplier}
                                                        step=".01"
                                                        min="0.01"
                                                        onChange={(e) =>
                                                            form.update({ limit_multiplier: parseInt(e.target.value) })
                                                        }
                                                    />
                                                </div>
                                                <FormError error={form.errors?.limit_multiplier} />
                                            </div>
                                        )}

                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label">
                                                {translate('modals.modal_voucher_create.labels.note')}
                                            </div>
                                            <div className="form-offset">
                                                <textarea
                                                    className="form-control r-n"
                                                    placeholder={translate('modals.modal_voucher_create.labels.note')}
                                                    value={form.values.note || ''}
                                                    onChange={(e) => form.update({ note: e.target.value })}
                                                />
                                            </div>
                                            <FormError error={form.errors?.note} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {fund.allow_voucher_records && (
                                <div className="modal-fields-group">
                                    <div
                                        className="modal-fields-group-title"
                                        onClick={() => setShowRecordFields(!showRecordFields)}>
                                        <em
                                            className={`mdi ${showRecordFields ? 'mdi-menu-down' : 'mdi-menu-right'}`}
                                        />
                                        Persoonlijke eigenschappen
                                    </div>

                                    {showRecordFields && (
                                        <div className="modal-fields-list">
                                            <VoucherRecordsEditor
                                                records={form.values.records}
                                                setRecords={(records) => formUpdate({ records })}
                                                errors={form.errors}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="form-group form-group-inline form-group-inline-lg">
                            <div className="form-label" />
                            <div className="block block-info">
                                <em className="mdi mdi-information block-info-icon" />
                                {translate('modals.modal_voucher_create.info')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('modals.modal_voucher_create.buttons.cancel')}
                    </button>

                    <button type="submit" className="button button-primary">
                        {translate('modals.modal_voucher_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
