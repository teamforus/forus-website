import React, { Fragment } from 'react';
import Fund from '../../../../props/models/Fund';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import FormError from '../../../elements/forms/errors/FormError';
import Tooltip from '../../../elements/tooltip/Tooltip';
import { useFundService } from '../../../../services/FundService';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import { ResponseError } from '../../../../props/ApiResponses';

export default function FundConfigContactInfoForm({ fund, disabled = false }: { fund: Fund; disabled: boolean }) {
    const activeOrganization = useActiveOrganization();
    const pushSuccess = usePushSuccess();

    const fundService = useFundService();

    const form = useFormBuilder<{
        email_required?: boolean;
        contact_info_enabled?: boolean;
        contact_info_required?: boolean;
        contact_info_message_custom?: boolean;
        contact_info_message_text?: string;
        contact_info_message_default?: string;
    }>(
        {
            email_required: true,
            contact_info_enabled: true,
            contact_info_required: true,
            contact_info_message_custom: false,
            contact_info_message_default: '',
            contact_info_message_text: '',
        },
        async (values) => {
            fundService
                .update(activeOrganization.id, fund.id, values)
                .then(() => {
                    pushSuccess('Gelukt!', 'Het fonds is aangepast!');
                })
                .catch((err: ResponseError) => {
                    console.error(err);
                });
        },
    );

    return (
        <Fragment>
            <div className="form-group form-group-last tooltipped">
                <CheckboxControl
                    id={'email_required'}
                    disabled={disabled}
                    checked={!!form.values.email_required}
                    onChange={(e) => form.update({ email_required: e.target.checked })}
                    title={'Alleen aanvragers die een e-mailadres opgeven mogen het aanvraagformulier doorlopen.'}
                />
                <FormError error={form.errors.email_required} />
                <Tooltip
                    text={
                        'Het uizetten van deze optie zorgt ervoor dat aanvragers met alleen DigiD een account kunnen ' +
                        'aanmaken zonder gebruik te maken van een e-mailadres. Aanvragers kunnen dan geen notificaties ' +
                        'ontvangen en er kunnen ook geen aanvulverzoekingen verstuurd worden.'
                    }
                />
            </div>

            {!form.values.email_required && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_enabled'}
                        disabled={disabled}
                        checked={!!form.values.contact_info_enabled}
                        onChange={(e) => form.update({ contact_info_enabled: e.target.checked })}
                        title={'Vraag aanvragers om contactgegevens'}
                    />
                    <FormError error={form.errors.contact_info_enabled} />
                    <Tooltip
                        text={
                            'Het aanzetten van deze optie zorgt ervoor dat er contactgegevens opgevraagd kunnen worden voor aanvragers zonder e-mailadres.'
                        }
                    />
                </div>
            )}

            {!form.values.email_required && form.values.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_required'}
                        disabled={disabled}
                        checked={!!form.values.contact_info_required}
                        onChange={(e) => form.update({ contact_info_required: e.target.checked })}
                        title={'Maak het opgeven van contactgegevens verplicht'}
                    />
                    <FormError error={form.errors.contact_info_required} />
                    <Tooltip
                        text={'Het aanzetten van deze optie zal het opgeven van contactgegevens verplicht maken.'}
                    />
                </div>
            )}

            {!form.values.email_required && form.values.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    <CheckboxControl
                        id={'contact_info_message_custom'}
                        disabled={disabled}
                        checked={!!form.values.contact_info_message_custom}
                        onChange={(e) => form.update({ contact_info_message_custom: e.target.checked })}
                        title={'Maak het opgeven van contactgegevens verplicht'}
                    />
                    <FormError error={form.errors.contact_info_message_custom} />
                </div>
            )}

            {!form.values.email_required && form.values.contact_info_enabled && (
                <div className="form-group form-group-last tooltipped">
                    {!form.values.contact_info_message_custom && (
                        <textarea
                            className="form-control r-n"
                            disabled={true}
                            value={form.values.contact_info_message_default}
                        />
                    )}

                    {form.values.contact_info_message_custom && (
                        <textarea
                            className="form-control r-n"
                            disabled={true}
                            value={form.values.contact_info_message_text}
                            placeholder={'Geef het bericht op dat je wilt instellen...'}
                        />
                    )}
                    <FormError error={form.errors.contact_info_message_text} />
                </div>
            )}
        </Fragment>
    );
}
