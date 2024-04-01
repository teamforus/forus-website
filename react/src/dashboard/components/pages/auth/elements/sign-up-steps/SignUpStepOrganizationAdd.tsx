import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UIControlText from '../../../../elements/forms/ui-controls/UIControlText';
import FormError from '../../../../elements/forms/errors/FormError';
import Tooltip from '../../../../elements/tooltip/Tooltip';
import PhotoSelector from '../../../../elements/photo-selector/PhotoSelector';
import UIControlCheckbox from '../../../../elements/forms/ui-controls/UIControlCheckbox';
import SelectControl from '../../../../elements/select-control/SelectControl';
import SelectControlOptions from '../../../../elements/select-control/templates/SelectControlOptions';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../../props/ApiResponses';
import BusinessType from '../../../../../props/models/BusinessType';
import Organization from '../../../../../props/models/Organization';
import { useOrganizationService } from '../../../../../services/OrganizationService';
import { useMediaService } from '../../../../../services/MediaService';
import ProgressStorage from '../../../../../helpers/ProgressStorage';
import { useBusinessTypeService } from '../../../../../services/BusinessTypeService';

export default function SignUpStepOrganizationAdd({
    panel_type,
    onOrganizationSelect,
    onCancelAddOrganization,
    onStepNext,
}: {
    panel_type: 'sponsor' | 'provider' | 'validator';
    onOrganizationSelect: (organization: Organization) => void;
    onCancelAddOrganization: () => void;
    onStepNext: () => void;
}) {
    const { t } = useTranslation();

    const mediaService = useMediaService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();

    const [orgMediaFile, setOrgMediaFile] = useState(null);
    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);
    const [progressStorage] = useState(new ProgressStorage(`${panel_type}-sign_up`));

    const formOrganization = useFormBuilder(
        {
            name: '',
            kvk: '',
            btw: '',
            email: '',
            email_public: false,
            phone: '',
            phone_public: false,
            website: 'https://',
            website_public: false,
            iban: '',
            iban_confirmation: '',
            business_type_id: null,
            media_uid: null,
        },
        async (values) => {
            if (values && values.iban != values.iban_confirmation) {
                formOrganization.setIsLocked(false);
                formOrganization.setErrors({ iban_confirmation: [t('validation.iban_confirmation')] });
                return;
            }

            const data = JSON.parse(JSON.stringify(values));

            if (typeof data.iban === 'string') {
                data.iban = data.iban.replace(/\s/g, '');
            }

            const submit = () => {
                return organizationService.store(data).then(
                    (res) => {
                        onOrganizationSelect(res.data.data);
                    },
                    (err: ResponseError) => {
                        formOrganization.setErrors(err.data.errors);
                        formOrganization.setIsLocked(false);
                    },
                );
            };

            if (orgMediaFile) {
                await mediaService.store('organization_logo', orgMediaFile).then((res) => {
                    formOrganization.update({ media_uid: res.data.data.uid });
                    Object.assign(data, { media_uid: res.data.data.uid });
                    setOrgMediaFile(null);
                });
            }

            return submit();
        },
    );

    const formOrganizationUpdate = formOrganization.update;

    const selectPhoto = useCallback((file: File | Blob) => {
        setOrgMediaFile(file);
    }, []);

    const cancelAddOrganization = useCallback(() => {
        onCancelAddOrganization();
    }, [onCancelAddOrganization]);

    const fetchBusinessTypes = useCallback(() => {
        businessTypeService.list({ per_page: 9999 }).then((res) => {
            setBusinessTypes(res.data.data);
        });
    }, [businessTypeService]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        if (progressStorage.has('organizationForm')) {
            formOrganizationUpdate(JSON.parse(progressStorage.get('organizationForm')));
        }
    }, [formOrganizationUpdate, progressStorage]);

    return (
        <Fragment>
            <div className="sign_up-pane">
                <form
                    className="form"
                    onSubmit={(e) => {
                        e?.preventDefault();
                        formOrganization.submit();
                        onStepNext();
                    }}>
                    <div className="sign_up-pane-header">
                        {t(`sign_up_${panel_type}.header.title_step_${panel_type == 'sponsor' ? 4 : 5}`)}
                    </div>
                    <div className="sign_up-pane-body">
                        <div className="sign_up-pane-text">
                            {t(`sign_up_${panel_type}.header.subtitle_step_${panel_type == 'sponsor' ? 4 : 5}`)}
                        </div>
                    </div>
                    <div className="sign_up-pane-body sign_up-pane-body-padless">
                        <div className="sign_up-pane-section">
                            <div className="sign_up-pane-col sign_up-pane-col-2">
                                <div className="form-group">
                                    <label className="form-label">{t('organization_edit.labels.name')}</label>
                                    <UIControlText
                                        value={formOrganization.values.name}
                                        onChange={(e) => formOrganization.update({ name: e.target.value })}
                                        placeholder={'Bedrijfsnaam'}
                                    />
                                    <FormError error={formOrganization.errors.name} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('organization_edit.labels.bank')}
                                        <Tooltip
                                            text={
                                                'Vul hier het rekeningnummer in waar u de betalingen op wilt ontvangen'
                                            }
                                        />
                                    </label>
                                    <UIControlText
                                        value={formOrganization.values.iban}
                                        onChange={(e) => formOrganization.update({ iban: e.target.value })}
                                        placeholder={'Voorbeeld: NL123456789B01'}
                                    />
                                    <FormError error={formOrganization.errors.iban} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        HERHAAL IBAN–NUMMER
                                        <Tooltip
                                            text={
                                                'Vul hier het rekeningnummer in waar u de betalingen op wilt ontvangen'
                                            }
                                        />
                                    </label>
                                    <UIControlText
                                        value={formOrganization.values.iban_confirmation}
                                        onChange={(e) => formOrganization.update({ iban_confirmation: e.target.value })}
                                        placeholder={'Voorbeeld: NL123456789B01'}
                                    />
                                    <FormError error={formOrganization.errors.iban_confirmation} />
                                </div>
                            </div>
                            <div className="sign_up-pane-col sign_up-pane-col-1">
                                <PhotoSelector
                                    type={'organization_logo'}
                                    template="photo-selector-sign_up"
                                    selectPhoto={selectPhoto}
                                    description={t('organization_edit.labels.photo_description')}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sign_up-pane-body sign_up-pane-body-padless">
                        <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                            <div className="sign_up-pane-col">
                                <div className="form-group">
                                    <label className="form-label">{t('organization_edit.labels.mail')}</label>
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <UIControlText
                                                value={formOrganization.values.email}
                                                onChange={(e) => formOrganization.update({ email: e.target.value })}
                                                placeholder={'E-mailadres'}
                                            />
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'email_public_input'}
                                                name="email_public"
                                                className="make-public"
                                                label={t('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.email_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        email_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <FormError error={formOrganization.errors.email} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('organization_edit.labels.phone')}</label>
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <UIControlText
                                                value={formOrganization.values.phone}
                                                onChange={(e) => formOrganization.update({ phone: e.target.value })}
                                                placeholder={'Telefoonnummer'}
                                            />
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'phone_public_input'}
                                                name="phone_public"
                                                className="make-public"
                                                label={t('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.phone_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        phone_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <FormError error={formOrganization.errors.phone} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('organization_edit.labels.website')}</label>
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <UIControlText
                                                value={formOrganization.values.website}
                                                onChange={(e) => formOrganization.update({ website: e.target.value })}
                                                placeholder={'Website'}
                                            />
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'website_public_input'}
                                                name="website_public"
                                                className="make-public"
                                                label={t('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.website_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        website_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <FormError error={formOrganization.errors.website} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sign_up-pane-body sign_up-pane-body-padless">
                        <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                            <div className="sign_up-pane-col">
                                <div className="form-group row">
                                    <div className="col col-md-8 col-xs-12">
                                        <label className="form-label">
                                            {t('organization_edit.labels.business_type')}
                                        </label>
                                        <div className="form-offset">
                                            {businessTypes && (
                                                <SelectControl
                                                    value={formOrganization.values.business_type_id}
                                                    propKey={'id'}
                                                    onChange={(business_type_id?: number) =>
                                                        formOrganization.update({ business_type_id })
                                                    }
                                                    options={businessTypes}
                                                    placeholder={'Selecteer organisatie type...'}
                                                    optionsComponent={SelectControlOptions}
                                                />
                                            )}
                                        </div>
                                        <FormError error={formOrganization.errors.business_type_id} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col col-md-8 col-xs-12">
                                        <label className="form-label">{t('organization_edit.labels.kvk')}</label>
                                        <UIControlText
                                            value={formOrganization.values.kvk}
                                            onChange={(e) => formOrganization.update({ kvk: e.target.value })}
                                            placeholder={'KvK-nummer'}
                                        />
                                        <FormError error={formOrganization.errors.kvk} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col col-md-8 col-xs-12">
                                        <label className="form-label">{t('organization_edit.labels.tax')}</label>
                                        <UIControlText
                                            value={formOrganization.values.btw}
                                            onChange={(e) => formOrganization.update({ btw: e.target.value })}
                                            placeholder={'BTW-nummer'}
                                        />
                                        <div className="form-hint text-right">
                                            {t('organization_edit.labels.optional')}
                                        </div>
                                        <FormError error={formOrganization.errors.btw} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sign_up-pane-footer">
                        <div className="row">
                            <div className="col col-lg-6 text-left">
                                <button
                                    type={'button'}
                                    className="button button-text button-text-padless"
                                    onClick={cancelAddOrganization}>
                                    <em className="mdi mdi-chevron-left icon-left" />
                                    {t(`sign_up_${panel_type}.buttons.back`)}
                                </button>
                            </div>
                            <div className="col col-lg-6 text-right">
                                <button type={'submit'} className="button button-text button-text-padless">
                                    {t(`sign_up_${panel_type}.buttons.next`)}
                                    <em className="mdi mdi-chevron-right icon-right" />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
