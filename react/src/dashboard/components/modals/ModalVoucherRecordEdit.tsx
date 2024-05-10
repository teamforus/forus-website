import React from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import SelectControl from '../elements/select-control/SelectControl';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import FormError from '../elements/forms/errors/FormError';
import Voucher from '../../props/models/Voucher';
import Organization from '../../props/models/Organization';
import Record from '../../props/models/Record';

export default function ModalVoucherRecordEdit({
    modal,
    className,
    voucher,
    organization,
    record,
    onClose,
}: {
    modal: ModalState;
    className?: string;
    voucher: Voucher;
    organization: Organization;
    record: Record;
    onClose: () => void;
}) {
    const setProgress = useSetProgress();

    const form = useFormBuilder({}, async (values) => {
        setProgress(0);

        onClose();
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
                            <div className="form-offset"></div>
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
