import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import useFormBuilder from '../../hooks/useFormBuilder';
import usePushSuccess from '../../hooks/usePushSuccess';
import { useBankConnectionService } from '../../services/BankConnectionService';
import BankConnection from '../../props/models/BankConnection';
import SelectControlOptions from '../elements/select-control/templates/SelectControlOptions';
import SelectControl from '../elements/select-control/SelectControl';
import FormError from '../elements/forms/errors/FormError';

export default function ModalSwitchBankConnectionAccount({
    modal,
    className,
    bankConnection,
    onClose,
}: {
    modal: ModalState;
    className?: string;
    bankConnection: BankConnection;
    onClose: () => void;
}) {
    const pushSuccess = usePushSuccess();

    const bankConnectionService = useBankConnectionService();

    const form = useFormBuilder({ bank_connection_account_id: bankConnection?.account_default?.id }, async () => {
        const { id, organization_id } = bankConnection;

        try {
            try {
                await bankConnectionService.update(organization_id, id, form.values);
                closeModal();
                pushSuccess('Succes!', 'Het actieve bankaccount is gewijzigd!');
            } catch (err) {
                form.setErrors(err?.data?.errors);
            }
        } finally {
            form.setIsLocked(false);
        }
    });

    const closeModal = useCallback(() => {
        modal.close();
        onClose();
    }, [onClose, modal]);

    return (
        <div
            className={classList([
                'modal',
                'modal-sm',
                'modal-animated',
                'modal-switch-bank-connection-account',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <form className="form" onSubmit={form.submit}>
                    <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                    <div className="modal-header">Selecteer bankrekeningnummer</div>
                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="bank_connection_account_id">
                                    IBAN
                                </label>

                                <SelectControl
                                    value={form.values.bank_connection_account_id}
                                    propValue={'monetary_account_iban'}
                                    propKey={'id'}
                                    onChange={(bank_connection_account_id: number) =>
                                        form.update({ bank_connection_account_id })
                                    }
                                    options={bankConnection.accounts}
                                    allowSearch={false}
                                    optionsComponent={SelectControlOptions}
                                />

                                <FormError error={form.errors?.bank_connection_account_id} />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer text-center">
                        <button type="submit" className="button button-primary">
                            Bevestigen
                        </button>

                        <button type="button" className="button button-default" onClick={closeModal}>
                            Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
