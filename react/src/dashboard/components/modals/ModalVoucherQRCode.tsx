import React, { useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import FormError from '../elements/forms/errors/FormError';
import Voucher from '../../props/models/Voucher';
import useVoucherService from '../../services/VoucherService';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import usePushDanger from '../../hooks/usePushDanger';
import { useTranslation } from 'react-i18next';
import QrCode from '../elements/qr-code/QrCode';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import { ResponseError } from '../../props/ApiResponses';
import Organization from '../../props/models/Organization';
import { usePrintableService } from '../../services/PrintableService';

export default function ModalVoucherQRCode({
    modal,
    className,
    voucher,
    organization,
    onSent,
    onAssigned,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    organization: Organization;
    onSent: (values: object) => void;
    onAssigned: (values: object) => void;
}) {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const activeOrganization = useActiveOrganization();

    const voucherService = useVoucherService();
    const printableService = usePrintableService();

    const [qrCodeValue] = useState<string>(voucher.address);
    const [voucherActive] = useState<boolean>(voucher.state === 'active');
    const [assigning, setAssigning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [assignTypes, setAssignTypes] = useState([
        {
            key: 'email',
            label: 'E-mailadres',
        },
    ]);
    const [assignType, setAssignType] = useState(assignTypes[0]);

    const form = useFormBuilder(
        {
            bsn: '',
            email: '',
        },
        async (values) => {
            form.setIsLocked(true);

            (assigning ? assignToIdentity(values) : sendToEmail(values.email))
                .then((res) => {
                    onSent(res.data.data);
                    onAssigned(res.data.data);
                    setSuccess(true);
                })
                .catch((res: ResponseError) => {
                    form.setErrors(res.data.errors);
                    form.setIsLocked(false);
                    pushDanger('Error!', res.data.message);
                })
                .finally(() => {
                    form.setIsLocked(false);
                });
        },
    );

    const { update: updateForm } = form;

    const goAssigning = useCallback(() => {
        setAssigning(true);
        delete form.values.email;
        delete form.values.bsn;
        updateForm(form.values);
        form.setErrors(null);
    }, [form, updateForm]);

    const goSending = useCallback(() => {
        setAssigning(false);
        delete form.values.email;
        delete form.values.bsn;
        updateForm(form.values);
        form.setErrors(null);
    }, [form, updateForm]);

    const sendToEmail = useCallback(
        (email: string) => {
            return voucherService.sendToEmail(activeOrganization.id, voucher.id, email);
        },
        [activeOrganization.id, voucher.id, voucherService],
    );

    const printQrCode = useCallback(() => {
        printableService.open('voucherQrCode', {
            voucher: voucher,
            fund: voucher.fund,
            organization: organization,
        });
    }, [organization, printableService, voucher]);

    const assignToIdentity = useCallback(
        (query: object) => {
            if (assignType.key === 'email' || assignType.key === 'bsn') {
                return voucherService.assign(activeOrganization.id, voucher.id, query);
            } else if (assignType.key === 'activate') {
                return voucherService.activate(activeOrganization.id, voucher.id);
            } else if (assignType.key === 'activation_code') {
                return voucherService.makeActivationCode(activeOrganization.id, voucher.id);
            }
        },
        [activeOrganization.id, assignType.key, voucher.id, voucherService],
    );

    const onAssignTypeChange = useCallback(() => {
        const formValues = form.values;

        if (assignType.key !== 'bsn') {
            delete formValues.bsn;
        }

        if (assignType.key !== 'email') {
            delete formValues.email;
        }

        updateForm(formValues);
    }, [assignType.key, form.values, updateForm]);

    useEffect(() => {
        const types = assignTypes;
        if (organization.bsn_enabled) {
            types.push({
                key: 'bsn',
                label: 'BSN',
            });
        }

        if (!voucherActive && !voucher.activation_code) {
            types.unshift({ key: 'activation_code', label: 'Create an activation code' });
        }

        if (!voucherActive) {
            types.unshift({ key: 'activate', label: 'Activeren' });
        }

        setAssigning(!voucherActive);
        setAssignTypes(types);
        setAssignType(assignTypes[0]);
    }, [assignTypes, organization.bsn_enabled, voucher.activation_code, voucherActive]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-voucher_qr',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            {!assigning && !success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="voucher_qr-block">
                                <div className="voucher_qr-title">{t('modals.modal_voucher_qr_code.title')}</div>
                                <QrCode value={qrCodeValue} />
                                <div className="voucher_qr-actions">
                                    <div className="row">
                                        <div className="col col-lg-6">
                                            <button
                                                type="button"
                                                className="button button-default-dashed button-fill"
                                                onClick={() => printQrCode()}>
                                                <em className="mdi mdi-printer icon-start" />
                                                <div>{t('modals.modal_voucher_qr_code.buttons.print')}</div>
                                            </button>
                                        </div>
                                        <div className="col col-lg-6">
                                            <button
                                                type="button"
                                                className="button button-default-dashed button-fill"
                                                onClick={() => goAssigning()}>
                                                <em className="mdi mdi-email icon-start" />
                                                <div>{t('modals.modal_voucher_qr_code.buttons.assign')}</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form">
                                <div className="form-group">
                                    <div className="row">
                                        <div className="col col-lg-12">
                                            <div className="form-label form-label-required">
                                                {t('modals.modal_voucher_qr_code.labels.sent_to_email')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col col-lg-9">
                                            <input
                                                className="form-control"
                                                type={'text'}
                                                defaultValue={form.values.email}
                                                placeholder={t('modals.modal_voucher_qr_code.placeholders.email')}
                                                onChange={(e) => form.update({ email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col col-lg-3">
                                            <button type="submit" className="button button-primary button-fill">
                                                {t('modals.modal_voucher_qr_code.buttons.send')}
                                            </button>
                                        </div>
                                    </div>
                                    <FormError error={form.errors?.email} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            {t('modals.modal_voucher_qr_code.buttons.close')}
                        </button>
                    </div>
                </form>
            )}

            {assigning && !success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        <div className="voucher_qr-title">{t('modals.modal_voucher_qr_code.title_assign')}</div>
                    </div>

                    <div className="modal-body modal-body-visible">
                        <div className="modal-section">
                            <div className="form">
                                <div className="form-group">
                                    <div className="form-label">
                                        {t(
                                            'modals.modal_voucher_create.labels.assign_by_type' +
                                                (voucherActive ? '' : '_or_activate'),
                                        )}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        propKey={'key'}
                                        propValue={'label'}
                                        optionsComponent={SelectControlOptions}
                                        options={assignTypes}
                                        value={assignType.key}
                                        allowSearch={false}
                                        onChange={(assign_type_key: string) => {
                                            setAssignType(assignTypes.find((type) => type.key === assign_type_key));
                                            onAssignTypeChange();
                                        }}
                                    />
                                    <FormError error={form.errors?.assign_by_type} />
                                </div>

                                {(assignType.key === 'email' || assignType.key === 'bsn') && (
                                    <div className="form-group">
                                        <div className="form-label form-label-required">
                                            {t('modals.modal_voucher_qr_code.labels.assign_to_identity')}
                                        </div>
                                        <input
                                            className="form-control"
                                            type="text"
                                            value={form.values[assignType.key]}
                                            placeholder={t(
                                                'modals.modal_voucher_qr_code.placeholders.' + assignType.key,
                                            )}
                                            onChange={(e) => form.update({ [assignType.key]: e.target.value })}
                                        />
                                        <FormError error={form.errors?.[assignType.key]} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form">
                                <div className="block block-info">
                                    <em className="mdi mdi-information block-info-icon" />
                                    {t('modals.modal_voucher_qr_code.info_assign')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button
                            type="button"
                            className="button button-default"
                            onClick={() => (voucherActive ? goSending() : modal.close)}>
                            {t('modals.modal_voucher_qr_code.buttons.cancel')}
                        </button>

                        {assignType.key === 'activate' && (
                            <button type="submit" className="button button-primary">
                                {t('modals.modal_voucher_create.buttons.activate')}
                            </button>
                        )}

                        {assignType.key !== 'activate' && (
                            <button type="submit" className="button button-primary">
                                {t('modals.modal_voucher_create.buttons.submit')}
                            </button>
                        )}
                    </div>
                </form>
            )}

            {success && (
                <form className="modal-window form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-body">
                        <div className="modal-section">
                            {assigning && (assignType.key === 'email' || assignType.key === 'bsn') && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {t('modals.modal_voucher_qr_code.success.assigned_title')}
                                    </div>
                                    <div className="message-details">
                                        {t('modals.modal_voucher_qr_code.success.assigned_details')}
                                    </div>
                                </div>
                            )}

                            {assigning && assignType.key === 'activate' && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {t('modals.modal_voucher_qr_code.success.activated_title')}
                                    </div>
                                    <div className="message-details">
                                        {t('modals.modal_voucher_qr_code.success.activated_details')}
                                    </div>
                                </div>
                            )}

                            {assigning && assignType.key === 'activation_code' && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {t('modals.modal_voucher_qr_code.success.activation_code_title')}
                                    </div>
                                    <div className="message-details">
                                        {t('modals.modal_voucher_qr_code.success.activation_code_details')}
                                    </div>
                                </div>
                            )}

                            {!assigning && (
                                <div className="block block-message">
                                    <div className="message-title">
                                        {t('modals.modal_voucher_qr_code.success.sending_title')}
                                    </div>
                                    <div className="message-details">
                                        {t('modals.modal_voucher_qr_code.success.sending_details')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-primary" onClick={() => modal.close()}>
                            {t('modals.modal_voucher_qr_code.buttons.close')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
