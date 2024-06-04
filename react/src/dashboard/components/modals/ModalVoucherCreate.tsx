import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import { currencyFormat } from '../../helpers/string';
import DatePickerControl from '../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../helpers/dates';
import VoucherRecordsEditor from '../pages/vouchers/elements/VoucherRecordsEditor';
import useOpenModal from '../../hooks/useOpenModal';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useVoucherService from '../../services/VoucherService';
import useActiveOrganization from '../../hooks/useActiveOrganization';

export default function ModalVoucherCreate({
    modal,
    className,
    fund,
    onCreated,
}: {
    modal: ModalState;
    className?: string;
    fund: Partial<Fund>;
    onCreated: () => void;
}) {
    const { t } = useTranslation();

    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const voucherService = useVoucherService();

    const [dateMinLimit] = useState(new Date());
    const [showRecordFields, setShowRecordFields] = useState<boolean>(false);
    const [showGeneralFields, setShowGeneralFields] = useState<boolean>(true);
    const [assignTypes] = useState([
        {
            key: 'activation_code',
            label: 'Activatiecode',
            inputLabel: 'Uniek nummer',
            hasInput: false,
        },
        {
            key: 'email',
            label: 'E-mailadres',
            inputLabel: 'E-mailadres',
            hasInput: true,
        },
    ]);
    const [assignType, setAssignType] = useState(assignTypes[0]);
    const [lastReplaceConfirmed, setLastReplaceConfirmed] = useState<boolean>(false);

    const form = useFormBuilder(
        {
            fund_id: fund.id,
            client_uid: null,
            amount: null,
            expire_at: fund.end_date,
            limit_multiplier: 1,
            note: '',
            records: [],
            bsn: null,
            email: null,
        },
        async (values) => {
            const data = {
                ...values,
                ...{
                    email: { activate: 1, activation_code: 0 },
                    bsn: { activate: 1, activation_code: 0 },
                    activation_code: { activate: 0, activation_code: 1 },
                }[assignType.key],
                assign_by_type: assignType.key,
                records: form.values.records.reduce(
                    (records, record) => ({
                        ...records,
                        [record.key]: record.value,
                    }),
                    {},
                ),
            };

            const makeRequest = () => {
                voucherService
                    .store(activeOrganization.id, data)
                    .then(() => {
                        onCreated();
                        modal.close();
                    })
                    .catch((res) => {
                        form.setErrors(res.data.errors);

                        if (res.data.message && res.status !== 422) {
                            alert(res.data.message);
                        }
                    })
                    .finally(() => {
                        form.setIsLocked(false);
                    });
            };

            voucherService
                .storeValidate(activeOrganization.id, data)
                .then(() => {
                    if (assignType.key === 'email' && form.values.email !== lastReplaceConfirmed) {
                        return voucherService
                            .index(activeOrganization.id, {
                                type: 'fund_voucher',
                                email: form.values.email,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total > 0) {
                                    return confirmEmailSkip(
                                        [form.values.email],
                                        (emails: Array<{ model: unknown }>) => {
                                            if (emails.filter((email) => email.model).length > 0) {
                                                setLastReplaceConfirmed(form.values.email);
                                                makeRequest();
                                            }
                                        },
                                    );
                                }

                                makeRequest();
                            });
                    }

                    if (assignType.key === 'bsn' && form.values.bsn !== lastReplaceConfirmed) {
                        return voucherService
                            .index(activeOrganization.id, {
                                type: 'fund_voucher',
                                bsn: form.values.bsn,
                                fund_id: fund.id,
                                source: 'all',
                                expired: 0,
                            })
                            .then((res) => {
                                modal.close();

                                if (res.data.meta.total > 0) {
                                    return confirmBsnSkip([form.values.bsn], (bsns: Array<{ model: unknown }>) => {
                                        if (bsns.filter((bsn) => bsn.model).length > 0) {
                                            setLastReplaceConfirmed(form.values.bsn);
                                            makeRequest();
                                        }
                                    });
                                }

                                makeRequest();
                            });
                    }

                    makeRequest();
                })
                .catch((res) => {
                    form.setErrors(res.data.errors);
                })
                .finally(() => {
                    form.setIsLocked(false);
                });
        },
    );

    const { update: formUpdate } = form;

    const confirmEmailSkip = useCallback(
        (existingEmails, onConfirm = () => null, onCancel = () => null) => {
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
                    onConfirm={() => onConfirm}
                    onCancel={() => onCancel}
                />
            ));
        },
        [openModal],
    );

    const confirmBsnSkip = useCallback(
        (existingBsn, onConfirm = () => null, onCancel = () => null) => {
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
                    onConfirm={() => onConfirm}
                    onCancel={() => onCancel}
                />
            ));
        },
        [openModal],
    );

    useEffect(() => {
        if (assignType.key !== 'bsn') {
            formUpdate({ email: null });
        }

        if (assignType.key !== 'email') {
            formUpdate({ email: null });
        }
    }, [assignType.key, formUpdate]);

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
                <div className="modal-header">{t('modals.modal_voucher_create.title')}</div>

                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-fields-groups">
                            <div className="modal-fields-group">
                                <div
                                    className="modal-fields-group-title"
                                    onClick={() => setShowGeneralFields(!showGeneralFields)}>
                                    <em
                                        className={`mdi mdi-menu-down ${
                                            !showGeneralFields ? 'mdi-menu-right' : 'mdi-menu-down'
                                        }`}></em>
                                    Algemeen
                                </div>
                                {showGeneralFields && (
                                    <div className="modal-fields-list">
                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label form-label-required">
                                                {t('modals.modal_voucher_create.labels.assign_by_type')}
                                            </div>
                                            <div className="form-offset">
                                                <SelectControl
                                                    value={assignType.key}
                                                    propKey={'key'}
                                                    propValue={'label'}
                                                    onChange={(assignTypeKey: string) => {
                                                        const assignType = assignTypes.find(
                                                            (a) => a.key === assignTypeKey,
                                                        );
                                                        setAssignType(assignType);
                                                    }}
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
                                                    value={form.values[assignType.key]}
                                                    onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                                />
                                                <FormError error={form.errors?.[assignType.key]} />
                                            </div>
                                        )}
                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label">
                                                {t('modals.modal_voucher_create.labels.client_uid')}
                                            </div>
                                            <input
                                                className="form-control"
                                                placeholder={t('modals.modal_voucher_create.labels.client_uid')}
                                                value={form.values.client_uid || ''}
                                                onChange={(e) => form.update({ client_uid: e.target.value })}
                                            />
                                            <FormError error={form.errors?.client_uid} />
                                        </div>
                                        {fund.type === 'budget' && (
                                            <div className="form-group form-group-inline form-group-inline-lg">
                                                <div className="form-label form-label-required">
                                                    {t('modals.modal_voucher_create.labels.amount')}
                                                </div>
                                                <div className="form-offset">
                                                    <input
                                                        type={'number'}
                                                        className="form-control"
                                                        placeholder={t('modals.modal_voucher_create.labels.amount')}
                                                        value={form.values.amount || ''}
                                                        step=".01"
                                                        min="0.01"
                                                        max={fund.limit_per_voucher}
                                                        onChange={(e) => form.update({ amount: e.target.value })}
                                                    />
                                                    {!form.errors?.amount && (
                                                        <div className="form-hint">
                                                            Limiet {currencyFormat(fund.limit_per_voucher)}
                                                        </div>
                                                    )}
                                                    <FormError error={form.errors?.amount} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group form-group-inline form-group-inline-lg">
                                            <div className="form-label">
                                                {t('modals.modal_voucher_create.labels.expire_at')}
                                            </div>
                                            <div className="form-offset">
                                                <DatePickerControl
                                                    value={dateParse(form.values.expire_at)}
                                                    dateMin={dateMinLimit}
                                                    dateMax={dateParse(fund.end_date)}
                                                    placeholder={t('dd-MM-yyyy')}
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
                                                    {t('modals.modal_voucher_create.labels.limit_multiplier')}
                                                </div>
                                                <div className="form-offset">
                                                    <input
                                                        type={'number'}
                                                        className="form-control"
                                                        placeholder={t(
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
                                                {t('modals.modal_voucher_create.labels.note')}
                                            </div>
                                            <div className="form-offset">
                                                <textarea
                                                    className="form-control"
                                                    placeholder={t('modals.modal_voucher_create.labels.note')}
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
                                {t('modals.modal_voucher_create.info')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {t('modals.modal_voucher_create.buttons.cancel')}
                    </button>
                    <button type="submit" className="button button-primary">
                        {t('modals.modal_voucher_create.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
