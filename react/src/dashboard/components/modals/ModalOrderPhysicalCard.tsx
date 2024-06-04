import React, { useCallback, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import Voucher from '../../props/models/Voucher';
import { useTranslation } from 'react-i18next';
import FormError from '../elements/forms/errors/FormError';
import { usePhysicalCardsRequestService } from '../../services/PhysicalCardsRequestService';

export default function ModalOrderPhysicalCard({
    modal,
    className,
    voucher,
    onRequested,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    onRequested: () => void;
}) {
    const { t } = useTranslation();

    const setProgress = useSetProgress();

    const physicalCardsRequestService = usePhysicalCardsRequestService();

    const [state, setState] = useState<string>('form');
    const [addressPreview, setAddressPreview] = useState<string[]>([]);

    const form = useFormBuilder(
        {
            address: '',
            house: '',
            house_addition: '',
            postcode: '',
            city: '',
        },
        async (values) => {
            setProgress(0);
            physicalCardsRequestService
                .store(voucher.fund.organization_id, voucher.address, values)
                .then(() => {
                    setProgress(100);
                    form.setErrors(null);
                    setState('success');
                    onRequested();
                })
                .catch((res) => {
                    form.setIsLocked(false);
                    form.setErrors(res.data.errors);
                    setState('form');
                });
        },
    );

    const requestCard = useCallback(() => {
        physicalCardsRequestService
            .validate(voucher.fund.organization_id, voucher.address, form.values)
            .then(() => {
                const { address, house, house_addition, postcode, city } = form.values;

                form.setErrors(null);
                setState('confirmation');

                setAddressPreview([
                    [address, house, house_addition].filter((value) => value).join(' '),
                    [postcode, city].filter((value) => value).join(' '),
                ]);
            })
            .catch((res) => {
                form.setErrors(res.data.errors);
            });
    }, [form, physicalCardsRequestService, voucher.address, voucher.fund.organization_id]);

    return (
        <div
            className={classList([
                'modal',
                'modal-sm',
                'modal-animated',
                'modal-physical-card-order',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            {state == 'form' && (
                <form className="modal-window form" onSubmit={requestCard}>
                    <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                    <div className="modal-header">
                        {t('modals.modal_physical_card_order.modal_section.request_new_card.title', {
                            fund_name: voucher.fund.name,
                        })}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-heading text-center">
                                {t('modals.modal_physical_card_order.modal_section.request_new_card.description')}
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.address">
                                    {t('modals.modal_physical_card_order.modal_section.request_new_card.address')}
                                </label>

                                <input
                                    className="form-control"
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.address"
                                    defaultValue={form.values.address}
                                    placeholder={t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.address_placeholder',
                                    )}
                                    onChange={(e) => form.update({ address: e.target.value })}
                                />

                                <FormError error={form.errors?.address} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.house">
                                    {t('modals.modal_physical_card_order.modal_section.request_new_card.house')}
                                </label>

                                <input
                                    className="form-control"
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.house"
                                    defaultValue={form.values.house}
                                    placeholder={t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_placeholder',
                                    )}
                                    onChange={(e) => form.update({ house: e.target.value })}
                                />

                                <FormError error={form.errors?.house} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.house_addition">
                                    {t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_addition',
                                    )}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.house_addition}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.house_addition"
                                    placeholder={t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.house_addition_placeholder',
                                    )}
                                    onChange={(e) => form.update({ house_addition: e.target.value })}
                                />

                                <FormError error={form.errors?.house_addition} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.postcode">
                                    {t('modals.modal_physical_card_order.modal_section.request_new_card.postcode')}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.postcode}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.postcode"
                                    placeholder={t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.postcode_placeholder',
                                    )}
                                    onChange={(e) => form.update({ postcode: e.target.value })}
                                />

                                <FormError error={form.errors?.postcode} />
                            </div>

                            <div className="form-group">
                                <label
                                    className="form-label form-label-required"
                                    htmlFor="modals.modal_physical_card_order.modal_section.request_new_card.city">
                                    {t('modals.modal_physical_card_order.modal_section.request_new_card.city')}
                                </label>

                                <input
                                    className="form-control"
                                    defaultValue={form.values.city}
                                    id="modals.modal_physical_card_order.modal_section.request_new_card.city"
                                    placeholder={t(
                                        'modals.modal_physical_card_order.modal_section.request_new_card.city_placeholder',
                                    )}
                                    onChange={(e) => form.update({ city: e.target.value })}
                                />

                                <FormError error={form.errors?.city} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-default" type="button" onClick={modal.close}>
                                {t('modals.modal_physical_card_order.buttons.request_new_card.cancel')}
                            </button>

                            <button className="button button-primary" type="submit">
                                {t('modals.modal_physical_card_order.buttons.request_new_card.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {state == 'confirmation' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} aria-label="close" role="button" />

                    <div className="modal-header">
                        {t('modals.modal_physical_card_order.modal_section.confirm_card.header')}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                {t('modals.modal_physical_card_order.modal_section.confirm_card.title')}
                                <br />
                                <br />
                                {addressPreview.map((line, index) => (
                                    <div key={index} className="text-strong">
                                        {line}
                                    </div>
                                ))}
                                <br />
                                {t('modals.modal_physical_card_order.modal_section.confirm_card.description')}
                                <br /> <br />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-default" type="button" onClick={() => setState('form')}>
                                {t('modals.modal_physical_card_order.buttons.confirm_card.adjust')}
                            </button>
                            <button className="button button-primary" type="button" onClick={() => form.submit()}>
                                {t('modals.modal_physical_card_order.buttons.confirm_card.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {state == 'success' && (
                <div className="modal-window">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} aria-label="close" role="button" />

                    <div className="modal-header">
                        {t('modals.modal_physical_card_order.modal_section.request_card_success.title')}
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-text text-center">
                                <div className="modal-heading-icon">
                                    <div className="mdi mdi-check-circle-outline" />
                                </div>
                                <div className="modal-heading">
                                    {t('modals.modal_physical_card_order.modal_section.request_card_success.title')}
                                </div>
                                <div className="modal-text">
                                    {t('modals.modal_physical_card_order.modal_section.request_card_success.heading')}
                                    <br />
                                    <br />
                                    <div>{addressPreview[0]}</div>
                                    <div>{addressPreview[1]}</div>
                                    <br />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-center">
                            <button className="button button-primary" type="button" onClick={modal.close}>
                                {t('modals.modal_physical_card_order.buttons.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
