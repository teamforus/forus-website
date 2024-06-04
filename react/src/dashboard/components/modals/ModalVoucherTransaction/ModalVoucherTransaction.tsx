import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import { classList, hasPermission } from '../../../helpers/utils';
import useFormBuilder from '../../../hooks/useFormBuilder';
import Voucher from '../../../props/models/Voucher';
import Organization from '../../../props/models/Organization';
import { useTranslation } from 'react-i18next';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useReimbursementsService } from '../../../services/ReimbursementService';
import Transaction from '../../../props/models/Transaction';
import useVoucherService from '../../../services/VoucherService';
import usePushDanger from '../../../hooks/usePushDanger';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import FormError from '../../elements/forms/errors/FormError';
import { currencyFormat } from '../../../helpers/string';
import ModalVoucherTransactionPreview from './ModalVoucherTransactionPreview';
import Reimbursement from '../../../props/models/Reimbursement';
import useSetProgress from '../../../hooks/useSetProgress';

export default function ModalVoucherTransaction({
    modal,
    className,
    voucher,
    organization,
    target,
    onCreated,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    organization: Organization;
    target?: string;
    onCreated: () => void;
}) {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const setProgress = useSetProgress();

    const fundService = useFundService();
    const voucherService = useVoucherService();
    const organizationService = useOrganizationService();
    const reimbursementService = useReimbursementsService();

    const [state, setState] = useState('form');
    const [fund, setFund] = useState<Fund>(null);
    const [providers, setProviders] = useState<Array<{ id: number; name: string }>>([]);
    const [reimbursement] = useState<Reimbursement>(null);
    const [ibanSources, setIbanSources] = useState([]);
    const [providersList, setProvidersList] = useState<Array<object>>([]);
    const [transaction, setTransaction] = useState<Transaction>(null);
    const [reimbursements, setReimbursements] = useState<Array<Reimbursement>>([]);
    const [targets] = useState([
        {
            key: 'provider',
            name: t(`modals.modal_voucher_transaction.labels.target_provider_option`),
        },
    ]);
    const [canUseReimbursements, setCanUseReimbursements] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

    const amountLimit = useMemo(() => {
        if (target === 'top_up') {
            return Math.min(
                parseFloat(fund?.limit_voucher_top_up_amount),
                parseFloat(fund?.limit_voucher_total_amount) - parseFloat(voucher.amount_total),
            );
        }

        return voucher.amount_available;
    }, [fund, target, voucher]);

    const form = useFormBuilder<{
        target?: string;
        target_iban?: string;
        target_name?: string;
        note?: string;
        note_shared?: boolean;
        amount?: string;
        voucher_id?: number;
        organization_id?: number;
        iban_source?: 'manual' | 'reimbursement';
        reimbursement_id?: number;
        target_reimbursement_id?: number;
    }>(
        {
            note: '',
            note_shared: false,
            amount: '',
            target: targets[0]?.key,
            voucher_id: voucher.id,
            organization_id: providers[0]?.id,
            iban_source: 'manual',
            reimbursement_id: null,
        },
        async (values) => {
            voucherService
                .makeSponsorTransaction(organization.id, values)
                .then((res) => {
                    setState('finish');
                    setTransaction(res.data.data);
                })
                .catch((res) => {
                    form.setErrors(res.data.errors);
                    setState('form');
                    pushDanger('Mislukt!', res.data.message);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    const fetchProviders = useCallback(
        (voucher: Voucher, organization: Organization) => {
            return new Promise<Array<{ id: number; name: string }>>((resolve) =>
                organizationService
                    .providerOrganizations(organization.id, {
                        state: 'accepted',
                        resource_type: 'select',
                        fund_id: voucher.fund_id,
                        allow_budget: 1,
                        per_page: 1000,
                    })
                    .then((res) => {
                        if (res.data.data.length == 1) {
                            resolve(res.data.data);
                        }

                        resolve([
                            {
                                id: null,
                                name: 'Selecteer aanbieder',
                            },
                            ...res.data.data,
                        ]);
                    }),
            );
        },
        [organizationService],
    );

    const closeModal = useCallback(() => {
        if (transaction && typeof onCreated == 'function') {
            onCreated();
        }

        modal.close();
    }, [modal, onCreated, transaction]);

    const fetchReimbursements = useCallback(async () => {
        const res = await reimbursementService.list(organization.id, {
            fund_id: voucher.fund_id,
            identity_address: voucher.identity_address,
            state: 'approved',
            per_page: 100,
        });

        return res.data.data.map((item) => ({ ...item, name: `NR: ${item.code} IBAN: ${item.iban}` }));
    }, [organization.id, reimbursementService, voucher.fund_id, voucher.identity_address]);

    const fetchVoucherFund = useCallback(() => {
        setProgress(0);

        fundService.read(voucher.fund.organization_id, voucher.fund_id).then((res) => {
            const fund = res.data.data;

            setFund(fund);

            setCanUseReimbursements(
                fund?.allow_reimbursements &&
                    fund?.allow_direct_payments &&
                    hasPermission(organization, 'manage_reimbursements'),
            );

            if (fund?.allow_direct_payments) {
                targets.push({ key: 'iban', name: t('modals.modal_voucher_transaction.labels.target_iban_option') });
            }

            if (target === 'top_up') {
                //buildForm();
                //onFormChange();
            } else {
                const promises = [];

                promises.push(
                    fetchProviders(voucher, organization).then((data) => {
                        setProviders(data);
                        setProvidersList(data.reduce((list, item) => ({ ...list, [item.id]: item }), []));
                    }),
                );

                promises.push(
                    canUseReimbursements
                        ? fetchReimbursements().then((data) => {
                              setReimbursements(data);
                          })
                        : null,
                );

                Promise.all(promises).then(() => {
                    setIbanSources([{ key: 'manual', name: t('') }]);

                    if (reimbursements?.length > 0) {
                        ibanSources.push({
                            key: 'reimbursement',
                            name: t('modals.modal_voucher_transaction.labels.reimbursement_source'),
                        });
                    }
                    setIbanSources(ibanSources);

                    //buildForm();
                    //onFormChange();
                });
            }
        });
    }, [
        canUseReimbursements,
        fetchProviders,
        fetchReimbursements,
        fundService,
        ibanSources,
        organization,
        reimbursements?.length,
        setProgress,
        t,
        target,
        targets,
        voucher,
    ]);

    useEffect(() => {
        const { target, organization_id, target_iban, target_name } = form.values;
        const { amount, iban_source } = form.values;

        if (target === 'provider') {
            return setSubmitButtonDisabled(!organization_id || !amount);
        }

        if (target === 'top_up') {
            return setSubmitButtonDisabled(!amount);
        }

        if (target === 'iban') {
            return setSubmitButtonDisabled(
                iban_source === 'manual' ? !target_iban || !target_name || !amount : !reimbursement?.id || !amount,
            );
        }

        return setSubmitButtonDisabled(true);
    }, [form, reimbursement?.id]);

    useEffect(() => {
        fetchVoucherFund();
    }, [fetchVoucherFund]);

    return (
        <div
            className={classList([
                'modal',
                'modal-animated',
                'modal-md',
                'modal-voucher-transaction',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            {state == 'form' && (
                <form className="modal-window form" onSubmit={() => setState('preview')}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    {form.values.target !== 'top_up' ? (
                        <div className="modal-header">{t('modals.modal_voucher_transaction.title')}</div>
                    ) : (
                        <div className="modal-header">{t('modals.modal_voucher_transaction.top_up_title')}</div>
                    )}

                    <div className="modal-body modal-body-visible">
                        <div className="modal-section modal-section-pad">
                            {targets.length > 1 && form.values.target !== 'top_up' && (
                                <div className="form-group form-group-inline form-group-inline-md">
                                    <div className="form-label form-label-required">
                                        {t('modals.modal_voucher_transaction.labels.target')}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        value={form.values.target}
                                        propKey={'key'}
                                        options={targets}
                                        allowSearch={false}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(target: string) => {
                                            form.update({ target });
                                        }}
                                    />
                                    <FormError error={form.errors?.target} />
                                </div>
                            )}

                            {form.values.target === 'provider' && (
                                <div className="form-group form-group-inline form-group-inline-md">
                                    <div className="form-label form-label-required">
                                        {t('modals.modal_voucher_transaction.labels.provider')}
                                    </div>
                                    <SelectControl
                                        className={'form-control'}
                                        value={form.values?.organization_id}
                                        propKey={'id'}
                                        propValue={'name'}
                                        options={providers}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(organization_id: number) => {
                                            form.update({ organization_id });
                                        }}
                                    />
                                    <FormError error={form.errors?.organization_id} />
                                </div>
                            )}

                            {ibanSources && canUseReimbursements && form.values.target === 'iban' && (
                                <div className="form-group form-group-inline form-group-inline-md">
                                    <div className="form-label form-label-required">
                                        {t('modals.modal_voucher_transaction.labels.iban_source')}
                                    </div>
                                    <SelectControl
                                        className="form-control"
                                        value={form.values.iban_source}
                                        propKey={'key'}
                                        options={ibanSources}
                                        allowSearch={false}
                                        optionsComponent={SelectControlOptions}
                                        onChange={(iban_source: 'manual' | 'reimbursement') => {
                                            form.update({ iban_source: iban_source });
                                        }}
                                    />
                                    <FormError error={form.errors?.iban_source} />
                                </div>
                            )}

                            {ibanSources &&
                                form.values.iban_source === 'reimbursement' &&
                                form.values.target === 'iban' && (
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <div className="form-label form-label-required">
                                            {t('modals.modal_voucher_transaction.labels.reimbursement')}
                                        </div>
                                        <SelectControl
                                            className="form-control"
                                            value={reimbursement}
                                            propKey={'key'}
                                            options={reimbursements}
                                            allowSearch={false}
                                            optionsComponent={SelectControlOptions}
                                            onChange={(reimbursement_key: string) => {
                                                console.log('key: ', reimbursement_key);
                                                //form.update({ iban_source: iban_source });
                                            }}
                                        />
                                        <FormError error={form.errors?.iban_source} />
                                    </div>
                                )}

                            {form.values.target === 'iban' &&
                                (form.values.iban_source === 'manual' || reimbursement) && (
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <div className="form-label form-label-required">
                                            {t('modals.modal_voucher_transaction.labels.target_iban')}
                                        </div>
                                        <div className="form-offset">
                                            {form.values.iban_source === 'manual' ? (
                                                <input
                                                    type={'text'}
                                                    className="form-control"
                                                    defaultValue={form.values.target_iban || ''}
                                                    placeholder="IBAN-nummer"
                                                    onChange={(e) => {
                                                        form.update({ target_iban: e.target.value });
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    type={'text'}
                                                    className="form-control"
                                                    value={reimbursement.iban || ''}
                                                    disabled={true}
                                                />
                                            )}

                                            <FormError error={form.errors?.target_iban} />
                                        </div>
                                    </div>
                                )}

                            {form.values.target === 'iban' &&
                                (form.values.iban_source === 'manual' || reimbursement) && (
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <div className="form-label form-label-required">
                                            {t('modals.modal_voucher_transaction.labels.target_name')}
                                        </div>
                                        <div className="form-offset">
                                            {form.values.iban_source === 'manual' ? (
                                                <input
                                                    type={'text'}
                                                    className="form-control"
                                                    defaultValue={form.values.target_name || ''}
                                                    placeholder="IBAN-naam"
                                                    onChange={(e) => {
                                                        form.update({ target_name: e.target.value });
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    type={'text'}
                                                    className="form-control"
                                                    value={reimbursement.iban_name || ''}
                                                    disabled={true}
                                                />
                                            )}

                                            <FormError error={form.errors?.target_name} />
                                        </div>
                                    </div>
                                )}

                            <div className="form-group form-group-inline form-group-inline-md">
                                <div className="form-label form-label-required">
                                    {t('modals.modal_voucher_transaction.labels.amount')}
                                </div>
                                <div className="form-offset">
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={form.values.amount}
                                        step=".01"
                                        min=".02"
                                        max={amountLimit}
                                        placeholder={t('modals.modal_voucher_transaction.labels.amount')}
                                        onChange={(e) => {
                                            form.update({ amount: e.target.value });
                                        }}
                                    />
                                    {!form.errors?.amount ? (
                                        <div className="form-hint">
                                            Limit {currencyFormat(parseFloat(amountLimit.toString()))}
                                        </div>
                                    ) : (
                                        <FormError error={form.errors?.amount} />
                                    )}
                                </div>
                                <FormError error={form.errors?.organization_id} />
                            </div>

                            <div className="form-group form-group-inline form-group-inline-md">
                                <div className="form-label form-label-required">
                                    {t('modals.modal_voucher_transaction.labels.note')}
                                </div>
                                <div className="form-offset">
                                    <textarea
                                        className="form-control r-n"
                                        value={form.values.note}
                                        placeholder={t('modals.modal_voucher_transaction.labels.note')}
                                        onChange={(e) => {
                                            form.update({ note: e.target.value });
                                        }}
                                    />
                                    {!form.errors?.note ? (
                                        <div className="form-hint">Max. 255 tekens</div>
                                    ) : (
                                        <FormError error={form.errors?.note} />
                                    )}
                                </div>
                                <FormError error={form.errors?.organization_id} />
                            </div>

                            <div className="form-group form-group-inline form-group-inline-md">
                                <div className="form-label" />
                                <div className="form-offset">
                                    <label className="checkbox">
                                        <input
                                            type="checkbox"
                                            checked={form.values.note_shared}
                                            onChange={(e) => {
                                                form.update({ note_shared: e.target.checked });
                                            }}
                                        />
                                        <div className="checkbox-label">
                                            <div className="checkbox-box">
                                                <div className="mdi mdi-check" />
                                            </div>
                                            {t('modals.modal_voucher_transaction.labels.note_shared')}
                                        </div>
                                    </label>
                                </div>
                                <FormError error={form.errors?.note_shared} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="button" className="button button-default" onClick={modal.close}>
                            Annuleer
                        </button>
                        <button type="submit" className="button button-primary" disabled={submitButtonDisabled}>
                            Bevestigen
                        </button>
                    </div>
                </form>
            )}

            {state == 'preview' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={closeModal} role="button" />
                    <div className="modal-icon modal-icon-primary">
                        <div className="mdi mdi-alert-outline" />
                    </div>

                    <div className="modal-body form">
                        <div className="modal-section">
                            <div className="modal-heading text-center">
                                {t('modals.modal_voucher_transaction.preview.title')}
                            </div>
                        </div>

                        <ModalVoucherTransactionPreview
                            formValues={form.values}
                            providersList={providersList}
                            organization={organization}
                            reimbursement={reimbursement}
                        />

                        <div className="modal-section">
                            <div className="modal-text text-center">
                                {t('modals.modal_voucher_transaction.preview.description')}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer modal-footer-light text-center">
                        <button type="button" className="button button-default" onClick={() => setState('form')}>
                            {t('modals.modal_voucher_transaction.buttons.cancel')}
                        </button>

                        <button type="button" className="button button-primary" onClick={() => form.submit()}>
                            {t('modals.modal_voucher_transaction.buttons.submit')}
                        </button>
                    </div>
                </div>
            )}

            {state == 'finish' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={closeModal} role="button" />
                    <div className="modal-icon modal-icon-primary">
                        <div className="mdi mdi-alert-outline" />
                    </div>

                    <div className="modal-body form">
                        {form.values.target !== 'top_up' ? (
                            <div className="modal-section">
                                <div className="modal-heading">
                                    {t('modals.modal_voucher_transaction.success.title')}
                                </div>
                                <div className="modal-text">
                                    {t('modals.modal_voucher_transaction.success.description')}
                                </div>
                            </div>
                        ) : (
                            <div className="modal-section">
                                <div className="modal-heading">
                                    {t('modals.modal_voucher_transaction.success.top_up_title')}
                                </div>
                                <div className="modal-text">
                                    {t('modals.modal_voucher_transaction.success.top_up_description')}
                                </div>
                            </div>
                        )}

                        <ModalVoucherTransactionPreview
                            formValues={form.values}
                            providersList={providersList}
                            organization={organization}
                            reimbursement={reimbursement}
                        />
                    </div>

                    <div className="modal-footer modal-footer-light text-centers">
                        <button type="button" className="button button-primary" onClick={() => closeModal()}>
                            {t('modals.modal_voucher_transaction.buttons.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
