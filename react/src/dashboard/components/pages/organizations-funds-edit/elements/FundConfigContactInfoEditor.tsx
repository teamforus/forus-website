import React, { Fragment } from 'react';
import Fund from '../../../../props/models/Fund';
import FundConfigContactInfoForm from './FundConfigContactInfoForm';

export default function FundConfigContactInfoEditor({
    fund,
    inline = false,
    disabled = false,
}: {
    fund: Fund;
    inline: boolean;
    disabled: boolean;
}) {
    return (
        <Fragment>
            {inline && !disabled && (
                <form className="form">
                    <FundConfigContactInfoForm fund={fund} disabled={disabled} />

                    <div className="row">
                        <div className="form-actions col col-lg-8 col-md-12">
                            <button className="button button-primary" type="submit">
                                <div className="mdi mdi-content-save-outline icon-start" />
                                Opslaan
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {(!inline || disabled) && <FundConfigContactInfoForm fund={fund} disabled={disabled} />}
        </Fragment>
    );
}
