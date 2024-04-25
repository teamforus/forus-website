import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import Implementation from '../../../props/models/Implementation';
import Tooltip from '../../elements/tooltip/Tooltip';
import PhotoSelector from '../../elements/photo-selector/PhotoSelector';
import FormError from '../../elements/forms/errors/FormError';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import useFormBuilder from '../../../hooks/useFormBuilder';
import Media from '../../../props/models/Media';
import { useMediaService } from '../../../services/MediaService';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useNavigate, useParams } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function ImplementationsNotificationsBranding() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const mediaService = useMediaService();
    const implementationService = useImplementationService();

    const [media, setMedia] = useState<Media>(null);
    const [mediaFile, setMediaFile] = useState<Blob>(null);
    const [implementation, setImplementation] = useState<Implementation>(null);

    const uploadMedia = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!media && !mediaFile && implementation.email_logo) {
                return mediaService.delete(implementation.email_logo.uid).then(() => resolve(null));
            }

            if (!mediaFile) {
                return resolve(null);
            }

            setProgress(0);

            return mediaService
                .store('email_logo', mediaFile, 'thumbnail')
                .then((res) => {
                    setMedia(res.data.data);
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                })
                .catch(reject)
                .finally(() => setProgress(100));
        });
    }, [implementation?.email_logo, media, mediaFile, mediaService, setProgress]);

    const form = useFormBuilder(
        {
            email_color: '',
            email_logo_uid: '',
            email_signature: '',
            email_signature_html: '',
        },
        (values) => {
            uploadMedia().then((uid?: string) => {
                setProgress(0);

                const email_color = values.email_color ? values.email_color.toUpperCase().trim() : null;
                const email_signature = values.email_signature ? values.email_signature.trim() : null;

                const data = {
                    email_color: email_color && email_color != implementation.email_color_default ? email_color : null,
                    email_signature:
                        email_signature && email_signature != implementation.email_signature_default
                            ? email_signature
                            : null,
                    ...(uid ? { email_logo_uid: uid } : {}),
                };

                implementationService
                    .updateEmailBranding(activeOrganization.id, implementation.id, data)
                    .then(() => {
                        pushSuccess('Gelukt!', 'De aanpassingen zijn opgeslagen!');

                        navigate(
                            getStateRouteUrl('implementation-notifications', {
                                organizationId: activeOrganization.id,
                            }),
                        );
                    })
                    .catch((err: ResponseError) => {
                        form.setIsLocked(false);
                        form.setErrors(err.data.errors);
                        pushDanger('Mislukt!', 'Er zijn een aantal problemen opgetreden, probeer het opnieuw!');
                    })
                    .finally(() => setProgress(100));
            });
        },
    );

    const { update: updateForm } = form;

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((res: ResponseError) => pushDanger('Mislukt!', res.data.message));
    }, [implementationService, activeOrganization.id, id, pushDanger]);

    useEffect(() => fetchImplementation(), [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            const { email_color, email_signature, email_color_default } = implementation;
            setMedia(implementation.email_logo);

            updateForm({
                email_color: email_color ? email_color : email_color_default,
                email_signature: email_signature ? email_signature : '',
                email_signature_html: implementation.email_signature_html,
            });
        }
    }, [implementation, updateForm]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="card-heading">
                <div className="flex flex-horizontal">
                    <div className="flex flex-grow flex-vertical flex-center">
                        <div>
                            Handtekening en huisstijl
                            <Tooltip text={t('system_notifications.header.tooltip')} />
                        </div>
                    </div>
                    <div className="flex">
                        <div className="button-group">
                            <StateNavLink
                                name={'implementation-notifications'}
                                params={{
                                    organizationId: activeOrganization.id,
                                }}
                                className="button button-text">
                                <em className="mdi mdi-chevron-left icon-start" />
                                Terug
                            </StateNavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card card-collapsed">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="card-title">Huisstijl</div>
                    </div>
                    <div className="card-section">
                        <div className="row">
                            <div className="col col-lg-9 col-lg-12">
                                <div className="form">
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label">Logo</label>
                                        <div className="form-offset">
                                            <PhotoSelector
                                                type="email_logo"
                                                thumbnail={media?.sizes?.thumbnail}
                                                defaultThumbnail={implementation.email_logo_default.sizes.thumbnail}
                                                selectPhoto={(file) => setMediaFile(file)}
                                                resetPhoto={() => {
                                                    setMedia(null);
                                                    setMediaFile(null);
                                                }}
                                                template="photo-selector-notifications"
                                                description-translate="organization_edit.labels.photo_description"
                                            />

                                            <FormError error={form.errors.email_logo_uid} />
                                        </div>
                                    </div>

                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label">Kleur van de elementen</label>
                                        <div className="form-offset">
                                            <input
                                                className="form-control"
                                                type="color"
                                                value={form.values.email_color}
                                                onChange={(e) => form.update({ email_color: e.target.value })}
                                            />

                                            <FormError error={form.errors.email_color} />
                                            <Tooltip text="Kleur van knoppen en links in de e-mailberichten." />
                                        </div>
                                    </div>
                                    <div className="form-group form-group-inline form-group-inline-md">
                                        <label className="form-label">Handtekening</label>
                                        <div className="form-offset">
                                            <MarkdownEditor
                                                value={form.values.email_signature_html}
                                                allowLists={false}
                                                onChange={(value) => form.update({ email_signature: value })}
                                            />

                                            <div className="form-hint">
                                                {t('system_notifications.hints.maxlen', {
                                                    attribute: 'handtekening',
                                                    size: 4096,
                                                })}
                                            </div>

                                            <FormError error={form.errors.email_signature} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-section">
                        <div className="button-group flex-center">
                            <StateNavLink
                                className="button button-default"
                                name={'implementation-notifications'}
                                params={{
                                    organizationId: activeOrganization.id,
                                }}>
                                Annuleren
                            </StateNavLink>

                            <button className="button button-primary" type="submit">
                                Opslaan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
