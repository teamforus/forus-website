import React, { Fragment, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { useOrganizationService } from '../../../services/OrganizationService';

export default function TransactionSettings() {
    const activeOrganization = useActiveOrganization();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();

    const organizationService = useOrganizationService();

    const statementExample = [
        '#12345678910 - 2024-12-01 - 321654871234 ',
        '- ABCDEFGHIJKLMNOPQRST - Example branch name ',
        '- Fund name - This is a note from employee',
    ].join('');

    const [showExampleTooltip, setShowExampleTooltip] = useState<boolean>(false);

    const form = useFormBuilder(activeOrganization.bank_statement_details, (values) => {
        organizationService
            .updateBankFields(activeOrganization.id, values)
            .then(() => pushSuccess('Opgeslagen!'))
            .catch(() => pushDanger('Mislukt!'));
    });

    return (
        <Fragment>
            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Transacties instellingen</div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-xs-12 col-md-12">
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label">Select data</label>
                                    <div className="form-offset flex flex-vertical">
                                        <CheckboxControl
                                            id="bank_transaction_id"
                                            title="Transactie ID"
                                            checked={!!form.values?.bank_transaction_id}
                                            onChange={(e) => form.update({ bank_transaction_id: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_transaction_date"
                                            title="Transactie Datum"
                                            checked={!!form.values?.bank_transaction_date}
                                            onChange={(e) => form.update({ bank_transaction_date: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_number"
                                            title="Vestigingsnummer"
                                            checked={!!form.values?.bank_branch_number}
                                            onChange={(e) => form.update({ bank_branch_number: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_id"
                                            title="Vestiging ID"
                                            checked={!!form.values?.bank_branch_id}
                                            onChange={(e) => form.update({ bank_branch_id: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_branch_name"
                                            title="Vestigingsnaam"
                                            checked={!!form.values?.bank_branch_name}
                                            onChange={(e) => form.update({ bank_branch_name: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_fund_name"
                                            title="Fondsnaam"
                                            checked={!!form.values?.bank_fund_name}
                                            onChange={(e) => form.update({ bank_fund_name: e.target.checked })}
                                        />
                                        <CheckboxControl
                                            id="bank_note"
                                            title="Notitie"
                                            checked={!!form.values?.bank_note}
                                            onChange={(e) => form.update({ bank_note: e.target.checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-xs-12 col-md-12">
                                <div className="form-group form-group-inline form-group-inline-xl">
                                    <label className="form-label">Voorbeeld omschrijving bankafschrift</label>

                                    <div className="form-offset">
                                        <div className="form-group-info form-group-info-dashed">
                                            <div className="form-group-info-control">
                                                <input
                                                    type="text"
                                                    disabled={true}
                                                    className="form-control"
                                                    value={statementExample}
                                                />

                                                <div className="form-group-info-button">
                                                    <div
                                                        className="button button-default button-icon pull-left"
                                                        onClick={() => setShowExampleTooltip(!showExampleTooltip)}>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-hint">
                                            De omschrijving op het bankafschrift kan maximaal 140 karakters bevatten.
                                        </div>

                                        <div className="form-hint form-hint-margin-less">
                                            Fondsnaam, Vestgingsnaam en Notitie worden afgekort indien het limiet van
                                            140 karakters is overschreden
                                        </div>

                                        {showExampleTooltip && (
                                            <div className="block block-info block-info-list">
                                                <div className="block-info-list-title">
                                                    <em className="mdi mdi-information block-info-icon" />
                                                    Data used from example:
                                                </div>

                                                <ul className="block-info-list-items">
                                                    <li className="block-info-list-item">
                                                        Transaction ID:
                                                        <span className="block-info-list-item-value">
                                                            #12345678910 • 10 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Transaction Date:
                                                        <span className="block-info-list-item-value">
                                                            2024-12-01 • 12 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Branch number:
                                                        <span className="block-info-list-item-value">
                                                            321654871234 • 12 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Branch unique ID:
                                                        <span className="block-info-list-item-value">
                                                            ABCDEFGHIJKLMNOPQRST • 3-20 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Branch name:
                                                        <span className="block-info-list-item-value">
                                                            Example branch name • 3-100 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Fund name:
                                                        <span className="block-info-list-item-value">
                                                            Fund name • 3-100 karakters
                                                        </span>
                                                    </li>
                                                    <li className="block-info-list-item">
                                                        Employee note:
                                                        <span className="block-info-list-item-value">
                                                            This is a note from employee • 255 karakters
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <StateNavLink
                                name={'transactions'}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-default">
                                Annuleer
                            </StateNavLink>

                            <button type="submit" className="button button-primary">
                                Bevestig
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
