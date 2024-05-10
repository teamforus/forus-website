import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import Fund from '../../props/models/Fund';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormError from '../elements/forms/errors/FormError';

export default function ModalFundSelect({
    modal,
    className,
    funds,
    fund_id,
    onSelect,
}: {
    modal: ModalState;
    className?: string;
    funds: Array<Partial<Fund>>;
    fund_id: number;
    onSelect: (fund: Partial<Fund>) => void;
}) {
    const setProgress = useSetProgress();

    const form = useFormBuilder({ fund_id: fund_id ? fund_id : funds[0]?.id }, async (values) => {
        setProgress(0);

        onSelect(funds.find((fund) => fund.id === values.fund_id));
        modal.close();
    });

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
                                    optionsComponent={SelectControlOptions}
                                    onChange={(fund_id: number) => form.update({ fund_id })}
                                />
                            </div>
                            <FormError error={form.errors.assign_by_type} />
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
