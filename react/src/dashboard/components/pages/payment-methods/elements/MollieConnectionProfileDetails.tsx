import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MollieConnection from '../../../../props/models/MollieConnection';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import SelectMollieProfile from './SelectMollieProfile';
import FormError from '../../../elements/forms/errors/FormError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { ApiResponseSingle, ResponseError } from '../../../../props/ApiResponses';
import MollieConnectionProfile from '../../../../props/models/MollieConnectionProfile';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import useMollieConnectionService from '../../../../services/MollieConnectionService';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushDanger from '../../../../hooks/usePushDanger';

export default function MollieConnectionProfileDetails({
    mollieConnection,
    onChange,
}: {
    mollieConnection: MollieConnection;
    onChange: (value: MollieConnection) => void;
}) {
    const activeOrganization = useActiveOrganization();
    const { t } = useTranslation();
    const mollieConnectionService = useMollieConnectionService();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();

    const [currentProfile, setCurrentProfile] = useState<MollieConnectionProfile>(null);
    const [currentProfileId, setCurrentProfileId] = useState(null);

    const showError = useCallback(
        (res, fallbackMessage = 'Onbekende foutmelding!') => {
            res.status === 429
                ? pushDanger(res.data.meta.title, res.data.meta.message)
                : pushDanger('Mislukt!', res.data?.message || fallbackMessage);
        },
        [pushDanger],
    );

    const profileForm = useFormBuilder(
        {
            name: '',
            email: '',
            phone: '',
            website: 'https://',
        },
        (values) => {
            setProgress(0);
            let promise: Promise<ApiResponseSingle<MollieConnection>>;

            if (mollieConnection.profile_pending) {
                promise = mollieConnectionService.updateProfile(
                    activeOrganization.id,
                    mollieConnection.profile_pending.id,
                    values,
                );
            } else {
                promise = mollieConnectionService.storeProfile(activeOrganization.id, values);
            }

            promise
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    onChange(res.data.data);
                })
                .catch((err: ResponseError) => {
                    profileForm.setIsLocked(false);
                    showError(err);
                    profileForm.setErrors(
                        [429, 503].includes(err.status) ? { throttle: [err.data.message] } : err.data.errors,
                    );
                })
                .finally(() => setProgress(100));
        },
    );

    const { update: updateProfileForm } = profileForm;

    const updateCurrentProfile = useCallback(() => {
        setProgress(0);

        mollieConnectionService
            .update(activeOrganization.id, {
                mollie_connection_profile_id: currentProfileId,
            })
            .then((res) => onChange(res.data.data))
            .catch((err: ResponseError) => showError(err))
            .finally(() => {
                setProgress(100);
            });
    }, [setProgress, mollieConnectionService, activeOrganization.id, currentProfileId, onChange, showError]);

    useEffect(() => {
        if (mollieConnection) {
            const profile = mollieConnection.profiles.find((profile) => profile.current);
            setCurrentProfile(profile);
            setCurrentProfileId(profile?.id);

            if (!mollieConnection.profile_active && mollieConnection.profile_pending) {
                updateProfileForm(mollieConnection.profile_pending);
            }
        }
    }, [mollieConnection, mollieConnectionService, updateProfileForm]);

    return (
        <Fragment>
            {mollieConnection.profile_active ? (
                <div className="card">
                    <div className="card-header">
                        <div className="flex">
                            <div className="flex flex-grow">
                                <div className="card-title">
                                    {t('mollie_connection.titles.current_profile_information')}
                                </div>
                            </div>

                            {mollieConnection.profiles.length && (
                                <SelectMollieProfile
                                    profiles={mollieConnection.profiles}
                                    currentProfile={currentProfile}
                                    currentProfileId={currentProfileId}
                                    onSelect={(currentProfileId) => setCurrentProfileId(currentProfileId)}
                                    onChange={() => updateCurrentProfile()}
                                />
                            )}
                        </div>
                    </div>

                    <div className="card-section">
                        <div className="card-block card-block-keyvalue">
                            <KeyValueItem label={t('mollie_connection.labels.name')}>
                                {mollieConnection.profile_active.name}
                            </KeyValueItem>

                            <KeyValueItem label={t('mollie_connection.labels.phone')}>
                                {mollieConnection.profile_active.phone}
                            </KeyValueItem>

                            <KeyValueItem label={t('mollie_connection.labels.email')}>
                                {mollieConnection.profile_active.email}
                            </KeyValueItem>

                            <KeyValueItem label={t('mollie_connection.labels.website')}>
                                {mollieConnection.profile_active.website}
                            </KeyValueItem>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <form className="form" onSubmit={profileForm.submit}>
                        <div className="card-header">
                            <div className="flex">
                                <div className="flex flex-grow">
                                    <div className="card-title">
                                        {t('mollie_connection.header_update_profile.title')}
                                    </div>
                                </div>

                                {mollieConnection.profiles.length && (
                                    <SelectMollieProfile
                                        profiles={mollieConnection.profiles}
                                        currentProfile={currentProfile}
                                        currentProfileId={currentProfileId}
                                        onSelect={(currentProfileId) => setCurrentProfileId(currentProfileId)}
                                        onChange={() => updateCurrentProfile()}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="form-group">
                                <div className="row">
                                    <div className="col col-lg-9 col-lg-12">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label">&nbsp;</label>
                                            <div className="form-title">
                                                {t('mollie_connection.titles.profile_information')}
                                            </div>
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {t('mollie_connection.labels.profile_name')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => profileForm.update({ name: e.target.value })}
                                                value={profileForm.values.name || ''}
                                                type="text"
                                                placeholder={t('mollie_connection.labels.profile_name')}
                                            />
                                            <FormError error={profileForm.errors.name} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">{t('mollie_connection.labels.email')}</label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => profileForm.update({ email: e.target.value })}
                                                value={profileForm.values.email || ''}
                                                type="text"
                                                placeholder={t('mollie_connection.labels.email')}
                                            />
                                            <FormError error={profileForm.errors.email} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">{t('mollie_connection.labels.phone')}</label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => profileForm.update({ phone: e.target.value })}
                                                value={profileForm.values.phone || ''}
                                                type="text"
                                                placeholder={t('mollie_connection.labels.phone')}
                                            />
                                            <FormError error={profileForm.errors.phone} />
                                        </div>

                                        <div className="form-group form-group-inline">
                                            <label className="form-label">
                                                {t('mollie_connection.labels.website')}
                                            </label>
                                            <input
                                                className="form-control"
                                                onChange={(e) => profileForm.update({ website: e.target.value })}
                                                value={profileForm.values.website || ''}
                                                type="text"
                                                placeholder={t('mollie_connection.labels.website')}
                                            />
                                            <FormError error={profileForm.errors.website} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="block block-info-box block-info-box-default block-info-box-dashed">
                                <div className="info-box-icon mdi mdi-information"></div>
                                <div className="info-box-content">
                                    <div className="block block-markdown">
                                        <p>{t('mollie_connection.create_form.info_content')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section">
                            <div className="button-group flex-center">
                                <button className="button button-primary" type="submit">
                                    {t('mollie_connection.buttons.submit')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </Fragment>
    );
}
