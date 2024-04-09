import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import Implementation from '../../../props/models/Implementation';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import Media from '../../../props/models/Media';
import FormError from '../../elements/forms/errors/FormError';
import Fund from '../../../props/models/Fund';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import PreCheck from '../../../props/models/PreCheck';
import PreCheckStepEditor from './elements/PreCheckStepEditor';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import PhotoSelector from '../../elements/photo-selector/PhotoSelector';
import { useImplementationService } from '../../../services/ImplementationService';
import { useFundService } from '../../../services/FundService';
import usePreCheckService from '../../../services/PreCheckService';
import { useMediaService } from '../../../services/MediaService';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import PreCheckRecord from '../../../props/models/PreCheckRecord';
import { uniqueId } from 'lodash';

export default function PreCheck() {
    const { t } = useTranslation();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const activeOrganization = useActiveOrganization();

    const fundService = useFundService();
    const mediaService = useMediaService();
    const preCheckService = usePreCheckService();
    const implementationService = useImplementationService();

    const [mediaFile, setMediaFile] = useState<Media>(null);
    const [deleteMedia, setDeleteMedia] = useState<boolean>(false);
    const [thumbnailMedia, setThumbnailMedia] = useState<Media>(null);
    const [funds, setFunds] = useState<PaginationData<Fund>>(null);
    const [preChecks, setPreChecks] = useState<Array<PreCheck>>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);
    const [implementations, setImplementations] = useState<Array<Implementation>>(null);

    const bannerStates = useMemo(() => {
        return [
            {
                value: 'draft',
                name: 'Nee',
            },
            {
                value: 'public',
                name: 'Ja',
            },
        ];
    }, []);

    const enableOptions = useMemo(() => {
        return [
            {
                key: false,
                name: `Uitgeschakeld`,
            },
            {
                key: true,
                name: `Actief`,
            },
        ];
    }, []);

    const preCheckForm = useFormBuilder(
        {
            implementation_id: null,
            pre_check_enabled: false,
            pre_check_title: '',
            pre_check_description: '',
        },
        (values) => {
            preCheckService
                .sync(activeOrganization.id, implementation.id, {
                    ...values,
                    pre_checks: preChecks,
                })
                .then((res) => {
                    preCheckForm.setErrors(null);
                    pushSuccess('Opgeslagen!');

                    implementationService.read(activeOrganization.id, implementation.id).then((res) => {
                        setImplementation(res.data.data);
                    });
                    setPreChecks(transformPreChecks(res.data.data));
                })
                .catch((res) => {
                    preCheckForm.setErrors(res.data.errors);
                    pushDanger(res.data?.message || 'Onbekende foutmelding!');
                })
                .finally(() => preCheckForm.setIsLocked(false));
        },
    );

    const bannerForm = useFormBuilder(
        {
            pre_check_banner_state: bannerStates[0].value,
            pre_check_banner_label: '',
            pre_check_banner_title: '',
            pre_check_banner_description: '',
        },
        (values) => {
            storeMedia(mediaFile).then((media: Media) => {
                implementationService
                    .updatePreCheckBanner(activeOrganization.id, implementation.id, {
                        ...values,
                        ...(media ? { pre_check_media_uid: media.uid } : {}),
                    })
                    .then(() => {
                        bannerForm.setErrors(null);
                        pushSuccess('Opgeslagen!');
                    })
                    .catch((res: ResponseError) => {
                        bannerForm.setErrors(res.data.errors);
                        pushDanger(res.data?.message || 'Onbekende foutmelding!');
                    })
                    .finally(() => bannerForm.setIsLocked(false));
            });
        },
    );

    const selectPhoto = useCallback((file) => {
        setMediaFile(file);
        setDeleteMedia(false);
    }, []);

    const storeMedia = useCallback(
        (mediaFile) => {
            return new Promise((resolve, reject) => {
                if (deleteMedia) {
                    mediaService.delete(implementation.pre_check_banner.uid);
                }

                if (mediaFile) {
                    return mediaService
                        .store('pre_check_banner', mediaFile)
                        .then((res) => resolve(res.data.data))
                        .catch((res) => {
                            pushDanger('Error!', res.data?.message || 'Onbekende foutmelding!');
                            reject(res);
                        });
                }

                resolve(null);
            });
        },
        [deleteMedia, implementation?.pre_check_banner?.uid, mediaService, pushDanger],
    );

    const transformPreCheckRecordTypes = useCallback((recordTypes) => {
        return recordTypes.map((recordType: PreCheckRecord) => ({
            ...recordType,
            record_settings: recordType.funds.map((fund) => {
                return (
                    recordType.record_settings.find((setting) => setting.fund_id == fund.id) || {
                        implementation_name: fund.implementation.name,
                        implementation_url_webshop: fund.implementation.url_webshop,
                        fund_id: fund.id,
                        fund_name: fund.name,
                        fund_logo: fund.logo,
                        description: '',
                        impact_level: 100,
                        is_knock_out: false,
                    }
                );
            }),
        }));
    }, []);

    const transformPreChecks = useCallback(
        (preChecks: Array<PreCheck>) => {
            return preChecks.map((preCheck: PreCheck) => ({
                ...preCheck,
                uid: uniqueId(),
                record_types: transformPreCheckRecordTypes(preCheck.record_types),
            }));
        },
        [transformPreCheckRecordTypes],
    );

    const fetchPreChecks = useCallback(
        (implementation_id: number) => {
            preCheckService.list(activeOrganization.id, implementation_id).then((res) => {
                setPreChecks(transformPreChecks(res.data.data));
            });
        },
        [activeOrganization.id, preCheckService, transformPreChecks],
    );

    const updatePreCheckForm = useCallback((implementation: Implementation) => {
        preCheckForm.update({
            implementation_id: implementation.id,
            pre_check_enabled: implementation.pre_check_enabled,
            pre_check_title: implementation.pre_check_title,
            pre_check_description: implementation.pre_check_description,
        });
    }, []);

    const updateBannerForm = useCallback((implementation: Implementation) => {
        bannerForm.update({
            pre_check_banner_state: implementation.pre_check_banner_state,
            pre_check_banner_label: implementation.pre_check_banner_label,
            pre_check_banner_title: implementation.pre_check_banner_title,
            pre_check_banner_description: implementation.pre_check_banner_description,
        });
    }, []);

    const updateImplementation = useCallback(
        (implementation: Implementation) => {
            setImplementation(implementation);
            setThumbnailMedia(implementation?.pre_check_banner);
            setMediaFile(null);

            updatePreCheckForm(implementation);
            updateBannerForm(implementation);
            fetchPreChecks(implementation.id);
        },
        [fetchPreChecks, updateBannerForm, updatePreCheckForm],
    );

    const fetchImplementations = useCallback(() => {
        implementationService.list(activeOrganization.id, { per_page: 100 }).then((res) => {
            const implementationsData = res.data.data;
            setImplementations(implementationsData);

            if (implementationsData[0]) {
                updateImplementation(implementationsData[0]);
            }
        });
    }, [activeOrganization.id, implementationService, updateImplementation]);

    const fetchFunds = useCallback(() => {
        fundService.list(activeOrganization.id, { per_page: 100, configured: 1 }).then((res) => {
            setFunds(res.data);
        });
    }, [activeOrganization.id, fundService]);

    useEffect(() => {
        fetchImplementations();
    }, [fetchImplementations]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    if (!implementations || !funds) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            {!implementation && (
                <EmptyCard
                    title={"You don't have any implementations"}
                    description={
                        'In order to user prechecks you need to have at least one implementation and at least one fund.'
                    }
                />
            )}

            {implementation && (
                <div className="card">
                    <form className="form" onSubmit={preCheckForm.submit}>
                        <div className="card-header flex-row">
                            <div className="card-title">{t('funds_pre_check.header.title')}</div>

                            <div className="flex flex-grow flex-end">
                                {implementation.pre_check_enabled && (
                                    <a
                                        className="button button-text button-sm"
                                        href={implementation.pre_check_url}
                                        target="_blank"
                                        rel="noreferrer">
                                        Bekijk pagina
                                        <div className="mdi mdi-open-in-new icon-end"></div>
                                    </a>
                                )}

                                <button className="button button-primary button-sm" type="submit">
                                    {t('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-12 col-xs-12">
                                    {implementations.length > 1 && (
                                        <div className="form-group">
                                            <label className="form-label">
                                                {t('funds_pre_check.labels.implementation')}
                                            </label>
                                            <SelectControl
                                                className="form-control"
                                                propKey={'id'}
                                                allowSearch={false}
                                                options={implementations}
                                                value={implementation.id}
                                                onChange={(implementation_id: number) => {
                                                    preCheckForm.update({ implementation_id });
                                                    updateImplementation(
                                                        implementations.find(
                                                            (implementation) => implementation.id == implementation_id,
                                                        ),
                                                    );
                                                }}
                                                optionsComponent={SelectControlOptions}
                                            />
                                            <FormError error={preCheckForm.errors?.implementation_id} />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">{t('funds_pre_check.labels.status')}</label>
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            options={enableOptions}
                                            value={preCheckForm.values.pre_check_enabled}
                                            onChange={(pre_check_enabled: boolean) => {
                                                preCheckForm.update({ pre_check_enabled });
                                            }}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={preCheckForm.errors?.pre_check_enabled} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-12 col-xs-12">
                                    <div className="card-heading">{t('funds_pre_check.labels.description_title')}</div>

                                    <div className="form-group">
                                        <label className="form-label form-label-required">
                                            {t('funds_pre_check.labels.title')}
                                        </label>
                                        <input
                                            className="form-control r-n"
                                            placeholder="Title"
                                            value={preCheckForm.values.pre_check_title || ''}
                                            onChange={(e) =>
                                                preCheckForm.update({
                                                    pre_check_title: e?.target.value,
                                                })
                                            }
                                        />
                                        <FormError error={preCheckForm.errors?.pre_check_title} />
                                        <div className="form-hint">Max. 50 tekens</div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label form-label-required">
                                            {t('funds_pre_check.labels.description')}
                                        </label>
                                        <textarea
                                            className="form-control r-n"
                                            value={preCheckForm.values.pre_check_description || ''}
                                            onChange={(e) =>
                                                preCheckForm.update({ pre_check_description: e.target.value })
                                            }
                                            placeholder="Voeg omschrijving toe"
                                        />
                                        <FormError error={preCheckForm.errors?.pre_check_description} />
                                        <div className="form-hint">Max. 1000 tekens</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {funds.meta.total > 0 && (
                            <div className="card-section card-section-primary">
                                <div className="row">
                                    <div className="col col-lg-12 col-xs-12">
                                        <div className="card-heading">Stappen ({preChecks?.length || 0})</div>

                                        <PreCheckStepEditor
                                            preChecks={preChecks}
                                            setPreChecks={setPreChecks}
                                            errors={preCheckForm.errors}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-12 col-xs-12">
                                    {funds.meta.total == 0 && (
                                        <EmptyCard
                                            title={'Geen fondsen gevonden'}
                                            description={[
                                                'Op dit moment lijkt u geen actieve fondsen te hebben.',
                                                'Voordat u verder gaat, moet u eerst een fonds aanmaken',
                                            ].join('\n')}
                                            button={{
                                                text: 'Ga naar de fondsenpagina',
                                                type: 'primary',
                                                icon: 'plus',
                                                to: getStateRouteUrl('funds-create', {
                                                    organizationId: activeOrganization.id,
                                                }),
                                            }}
                                        />
                                    )}

                                    <div className="block block-info-box block-info-box-default block-info-box-dashed">
                                        <div className="info-box-icon mdi mdi-information flex-center flex-vertical" />
                                        <div className="info-box-content">
                                            <div className="block block-markdown">
                                                <p>
                                                    U heeft de mogelijkheid om extra stappen toe te voegen die zichtbaar
                                                    zullen zijn in de Pre-Check voor de aanvrager.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section">
                            <div className="text-right">
                                <button className="button button-default" type="button" id="cancel">
                                    {t('funds_edit.buttons.cancel')}
                                </button>

                                <button className="button button-primary" type="submit">
                                    {t('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {implementation && (
                <div className="card">
                    <form className="form" onSubmit={bannerForm.submit}>
                        <div className="card-header">
                            <div className="card-title">Homepagina banner</div>
                        </div>

                        <div className="card-section card-section-primary">
                            <div className="form-group">
                                <div className="form-offset">
                                    <PhotoSelector
                                        type={'pre_check_banner'}
                                        thumbnail={thumbnailMedia?.sizes.thumbnail}
                                        selectPhoto={selectPhoto}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label">Actieve banner</div>
                                <div className="form-offset">
                                    <SelectControl
                                        className={'form-control'}
                                        propKey={'value'}
                                        allowSearch={false}
                                        options={bannerStates}
                                        optionsComponent={SelectControlOptions}
                                        value={bannerForm.values.pre_check_banner_state}
                                        onChange={(pre_check_banner_state: string) =>
                                            bannerForm.update({ pre_check_banner_state })
                                        }
                                    />
                                    <FormError error={bannerForm.errors?.pre_check_banner_state} />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label">{t('funds_pre_check.labels.title')}</div>
                                <div className="form-offset">
                                    <input
                                        className={'form-control r-n'}
                                        placeholder={t('funds_pre_check.labels.title')}
                                        value={bannerForm.values.pre_check_banner_title || ''}
                                        onChange={(e) => bannerForm.update({ pre_check_banner_title: e.target.value })}
                                    />
                                    <FormError error={bannerForm.errors?.pre_check_banner_title} />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label">{t('funds_pre_check.labels.description')}</div>
                                <div className="form-offset">
                                    <textarea
                                        className={'form-control r-n'}
                                        placeholder={t('funds_pre_check.labels.description')}
                                        value={bannerForm.values.pre_check_banner_description || ''}
                                        onChange={(e) =>
                                            bannerForm.update({ pre_check_banner_description: e.target.value })
                                        }
                                    />
                                    <FormError error={bannerForm.errors?.pre_check_banner_description} />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label">{t('funds_pre_check.labels.label')}</div>
                                <div className="form-offset">
                                    <input
                                        className={'form-control r-n'}
                                        placeholder={t('funds_pre_check.labels.label')}
                                        value={bannerForm.values.pre_check_banner_label || ''}
                                        onChange={(e) => bannerForm.update({ pre_check_banner_label: e.target.value })}
                                    />
                                    <FormError error={bannerForm.errors?.pre_check_banner_label} />
                                </div>
                            </div>

                            <div className="block block-info-box block-info-box-default block-info-box-dashed">
                                <div className="info-box-icon mdi mdi-information flex-center flex-vertical text-primary-light" />
                                <div className="info-box-content">
                                    <div className="block block-markdown">
                                        <p>
                                            U heeft de mogelijkheid om een banner toe te voegen en aan te passen die op
                                            de startpagina van de webshop wordt weergegeven.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-section">
                            <div className="text-right">
                                <button className="button button-default" type="button" id="cancel">
                                    {t('funds_edit.buttons.cancel')}
                                </button>

                                <button className="button button-primary" type="submit">
                                    {t('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </Fragment>
    );
}
