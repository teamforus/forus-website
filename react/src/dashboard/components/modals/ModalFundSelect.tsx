import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import FormError from '../elements/forms/errors/FormError';
import SelectControlOptionsFund from '../elements/select-control/templates/SelectControlOptionsFund';
import classNames from 'classnames';

export default function ModalFundSelect({
    modal,
    funds,
    fundId = null,
    onSelect,
    className,
}: {
    modal: ModalState;
    funds: Array<Partial<Fund>>;
    fundId?: number;
    onSelect: (fund: Partial<Fund>) => void;
    className?: string;
}) {
    const form = useFormBuilder(
        {
            fund_id: fundId ? fundId : funds[0]?.id,
        },
        (values) => {
            onSelect(funds.find((fund) => fund.id === values.fund_id));
            modal.close();
        },
    );

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-voucher-create',
                modal.loading && 'modal-loading',
                className,
            )}
            data-dusk="modalFundSelect">
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">Selecteer fondsen</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="form-group form-group-inline form-group-inline-lg">
                            <div className="form-label form-label-required">Fondsen</div>
                            <div className="form-offset">
                                <SelectControl
                                    value={form.values.fund_id}
                                    propKey={'id'}
                                    allowSearch={false}
                                    options={funds}
                                    optionsComponent={SelectControlOptionsFund}
                                    onChange={(fund_id: number) => form.update({ fund_id })}
                                />
                            </div>
                            <FormError error={form.errors?.fund_id} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        Annuleren
                    </button>
                    <button type="submit" className="button button-primary" data-dusk="modalFundSelectSubmit">
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
