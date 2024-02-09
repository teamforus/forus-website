import React, { useCallback, useRef, useState } from 'react';
import Office from '../../../../props/models/Office';
import Organization from '../../../../props/models/Organization';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import FormError from '../../../elements/forms/errors/FormError';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import { useTranslation } from 'react-i18next';
import ScheduleControl from '../../offices-edit/elements/ScheduleControl';
import UIControlText from '../../../elements/forms/ui-controls/UIControlText';
import OfficeSchedule from '../../../../props/models/OfficeSchedule';
import { useMediaService } from '../../../../services/MediaService';
import useOfficeService from '../../../../services/OfficeService';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import useEnvData from '../../../../hooks/useEnvData';

export default function SignUpOfficeEdit({
    office,
    organization,
    cancel,
    created,
    updated,
}: {
    office?: Office;
    organization: Organization;
    cancel: () => void;
    created?: (office: Office) => void;
    updated?: (office: Office) => void;
}) {
    const { t } = useTranslation();
    const [officeMediaFile, setOfficeMediaFile] = useState(null);
    const [autocomplete, setAutocomplete] = React.useState(null);
    const addressInputRef = useRef<HTMLInputElement>();

    const envData = useEnvData();
    const mediaService = useMediaService();
    const officeService = useOfficeService();

    const storeMedia = useCallback(
        async (mediaFile: File | Blob) => {
            return (await mediaService.store('office_photo', mediaFile))?.data?.data?.uid;
        },
        [mediaService],
    );

    const form = useFormBuilder(
        {
            id: office?.id || null,
            schedule: office?.schedule || [],
            address: office?.address || '',
            phone: office?.phone || '',
        },
        async (values) => {
            const media_uid = officeMediaFile ? await storeMedia(officeMediaFile) : null;
            const data = media_uid ? { ...values, media_uid } : values;

            const promise: Promise<ApiResponseSingle<Office>> = form.values.id
                ? officeService.update(organization.id, form.values.id, data)
                : officeService.store(organization.id, data);

            promise
                .then((res) => (form.values.id ? updated(res.data.data) : created(res.data.data)))
                .catch((err: ResponseError) => form.setErrors(err.data.errors))
                .finally(() => form.setIsLocked(false));
        },
    );

    const { update: formUpdate } = form;

    const onScheduleChange = useCallback(
        (schedule: Array<OfficeSchedule>) => {
            formUpdate({ schedule });
        },
        [formUpdate],
    );

    const onLoad = useCallback((autocomplete) => {
        setAutocomplete(autocomplete);
    }, []);

    const onPlaceChanged = useCallback(() => {
        formUpdate({ address: autocomplete.getPlace().formatted_address });
    }, [autocomplete, formUpdate]);

    return (
        <LoadScript googleMapsApiKey={envData.config.google_maps_api_key} libraries={['places']}>
            <div className="sign_up-office-edit">
                <form className="form" onSubmit={form.submit}>
                    <div className="sign_up-pane-section">
                        <div className="sign_up-pane-col sign_up-pane-col-2">
                            <div className="form-group">
                                <label className="form-label">Adres</label>
                                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                    <UIControlText
                                        value={form.values.address}
                                        id="office_address"
                                        placeholder="Adres"
                                        inputRef={addressInputRef}
                                        onChangeValue={(address) => form.update({ address })}
                                    />
                                </Autocomplete>
                                <FormError error={form.errors.address} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Telefoonnummer</label>
                                <UIControlText
                                    value={form.values.phone}
                                    id="office_phone"
                                    placeholder="Telefoonnummer"
                                    onChangeValue={(phone) => form.update({ phone })}
                                />
                                <FormError error={form.errors.phone} />
                            </div>
                        </div>
                        <div className="sign_up-pane-col sign_up-pane-col-1">
                            <PhotoSelector
                                template={'photo-selector-sign_up'}
                                type={'organization_logo'}
                                description={t('organization_edit.labels.photo_description')}
                                selectPhoto={setOfficeMediaFile}
                            />
                        </div>
                    </div>
                    <div className="sign_up-pane-section">
                        <div className="sign_up-pane-col">
                            <ScheduleControl
                                errors={form.errors}
                                schedule={form.values.schedule}
                                onChange={onScheduleChange}
                            />
                        </div>
                    </div>
                    <div className="sign_up-pane-section office-edit-actions">
                        <div className="sign_up-pane-col">
                            <div className="flex-row">
                                <div className="flex-col">
                                    <div className="flex-col">
                                        <button
                                            className="button button-primary button-fill button-sm"
                                            type="button"
                                            onClick={() => cancel()}>
                                            {t('organization_edit.buttons.cancel')}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-col">
                                    <div className="flex-col">
                                        <button
                                            className="button button-primary-variant button-fill button-sm"
                                            type="submit">
                                            {t('organization_edit.buttons.save_location')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </LoadScript>
    );
}
