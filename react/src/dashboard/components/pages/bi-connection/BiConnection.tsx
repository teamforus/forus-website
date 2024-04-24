import React, { Fragment, useCallback, useEffect, useState } from 'react';
import BiConnectionIcon from '../../../../../assets/forus-platform/resources/platform-general/assets/img/svg/bi-connection-icon.svg';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { useTranslation } from 'react-i18next';
import Auth2FARestriction from '../../elements/auth2fa-restriction/Auth2FARestriction';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import FormError from '../../elements/forms/errors/FormError';
import { NavLink } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { useIdentity2FAService } from '../../../services/Identity2FAService';
import { useBiConnectionService } from '../../../services/BiConnectionService';
import { chunk } from 'lodash';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { useClipboardService } from '../../../services/ClipboardService';
import BiConnectionDataType from '../../../props/models/BiConnectionDataType';
import { StringParam, useQueryParams } from 'use-query-params';

export default function BiConnection() {
    const { t } = useTranslation();

    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const identity2FAService = useIdentity2FAService();
    const biConnectionService = useBiConnectionService();
    const clipboardService = useClipboardService();

    const [{ view_type }, setQueryParams] = useQueryParams({
        view_type: StringParam,
    });

    const [headerKey] = useState<string>('X-API-KEY');
    const [dataTypes, setDataTypes] = useState(null);
    const [connection, setConnection] = useState(null);
    const [auth2FAState, setAuth2FAState] = useState(null);
    const [ip, setIp] = useState<string>('');
    const [viewTypes] = useState<Array<string>>(['settings', 'security']);
    const [ipError, setIpError] = useState<string>('');
    const [ips, setIps] = useState<Array<{ value: string }>>(null);
    const [activeViewType, setActiveViewType] = useState<string>(view_type || 'settings');
    const [showInfoBlock, setShowInfoBlock] = useState<boolean>(false);
    const [showInfoBlockUrl, setShowInfoBlockUrl] = useState<boolean>(false);
    const [showInfoBlockToken, setShowInfoBlockToken] = useState<boolean>(false);
    const [showInfoBlockHeader, setShowInfoBlockHeader] = useState<boolean>(false);
    const [showInfoBlockExpiry, setShowInfoBlockExpiry] = useState<boolean>(false);
    const [availableDataTypes, setAvailableDataTypes] = useState<Array<Array<BiConnectionDataType>>>(null);

    const [authTypes] = useState([
        { key: false, name: t('bi_connection.labels.option_disabled') },
        { key: true, name: t('bi_connection.labels.option_enabled') },
    ]);

    const [expirationPeriods] = useState([
        { value: 1, name: t('bi_connection.expiration_periods.24_hour') },
        { value: 7, name: t('bi_connection.expiration_periods.1_week') },
        { value: 30, name: t('bi_connection.expiration_periods.1_month') },
    ]);

    const form = useFormBuilder<{
        enabled?: boolean;
        expiration_period?: number;
    }>(
        {
            enabled: false,
            expiration_period: 1,
        },
        (values) => {
            const formData = {
                ips: ips.map((ip) => ip.value),
                data_types: Object.keys(dataTypes).filter((key) => dataTypes[key]),
                ...values,
            };

            const promise = connection.id
                ? biConnectionService.update(activeOrganization.id, formData)
                : biConnectionService.store(activeOrganization.id, formData);

            promise
                .then(
                    (res) => {
                        setConnection(res.data.data);
                        form.setErrors(null);
                        pushSuccess('Opgeslagen!');
                    },
                    (res) => {
                        form.setErrors(res.data.errors);
                        const errorKeys = Object.keys(form.errors);

                        const hasIpsErrors = errorKeys.filter((key) => key.startsWith('ips')).length > 0;
                        const hasDataTypesErrors = errorKeys.filter((key) => key.startsWith('data_types')).length > 0;
                        const hasExpirationPeriodErrors =
                            errorKeys.filter((key) => key.startsWith('expiration_period')).length > 0;

                        if (hasDataTypesErrors) {
                            setActiveViewType('settings');
                            setQueryParams({ view_type: 'settings' });
                        } else if (hasIpsErrors || hasExpirationPeriodErrors) {
                            setActiveViewType('security');
                            setQueryParams({ view_type: 'security' });
                        }

                        pushDanger(res.data?.message || 'Onbekende foutmelding!');
                    },
                )
                .finally(() => {
                    setIpError(null);
                    form.setIsLocked(false);
                });
        },
    );

    const { update: updateForm } = form;

    const copyToClipboard = useCallback(
        (str: string) => {
            clipboardService.copy(str).then(() => pushSuccess('Gekopieerd naar het klembord.'));
        },
        [clipboardService, pushSuccess],
    );

    const askConfirmation = useCallback(
        (onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.recreate_bi_connection.title')}
                    description={t('modals.danger_zone.recreate_bi_connection.description')}
                    buttonCancel={{
                        text: t('modals.danger_zone.recreate_bi_connection.buttons.cancel'),
                        onClick: modal.close,
                    }}
                    buttonSubmit={{
                        text: t('modals.danger_zone.recreate_bi_connection.buttons.confirm'),
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal, t],
    );

    const resetToken = useCallback(() => {
        askConfirmation(() => {
            biConnectionService.resetToken(activeOrganization.id).then(
                (res) => {
                    setConnection(res.data.data);
                    pushSuccess('Opgeslagen!');
                },
                (res) => {
                    pushDanger(res.data?.message || 'Foutmelding!');
                },
            );
        });
    }, [activeOrganization.id, askConfirmation, biConnectionService, pushDanger, pushSuccess]);

    const addIp = useCallback(() => {
        if (!ip) {
            return setIpError('Het IP veld is verplicht.');
        }

        ips.push({ value: ip });
        setIps([...ips]);
        setIp('');
        setIpError(null);
    }, [ip, ips]);

    const removeIp = useCallback(
        (index: number) => {
            ips.splice(index, 1);
            setIps([...ips]);
        },
        [ips],
    );

    const fetchAuth2FAState = useCallback(() => {
        identity2FAService.status().then((res) => {
            setAuth2FAState(res.data.data);
        });
    }, [identity2FAService]);

    const fetchBiConnection = useCallback(() => {
        biConnectionService.active(activeOrganization.id).then((res) => {
            const connectionData = res.data.data;

            setConnection(connectionData);
            setIps((connectionData.ips || []).reduce((items, ip) => [...items, { value: ip }], []));
            setDataTypes((connectionData.data_types || []).reduce((types, type) => ({ ...types, [type]: true }), {}));

            updateForm({
                enabled: connectionData.enabled,
                expiration_period: connectionData.expiration_period,
            });
        });
    }, [activeOrganization.id, biConnectionService, updateForm]);

    const fetchAvailableDataTypes = useCallback(() => {
        biConnectionService.availableDataTypes(activeOrganization.id).then((res) => {
            setAvailableDataTypes(chunk(res.data.data, 2));
        });
    }, [activeOrganization.id, biConnectionService]);

    useEffect(() => {
        fetchAuth2FAState();
    }, [fetchAuth2FAState]);

    useEffect(() => {
        fetchBiConnection();
    }, [fetchBiConnection]);

    useEffect(() => {
        fetchAvailableDataTypes();
    }, [fetchAvailableDataTypes]);

    return (
        <>
            {auth2FAState && auth2FAState.restrictions.bi_connections.restricted && (
                <Auth2FARestriction
                    type={'bi_connections'}
                    items={auth2FAState?.restrictions?.bi_connections?.funds}
                    itemName={'name'}
                    itemThumbnail={'logo.sizes.thumbnail'}
                    defaultThumbnail={'fund-thumbnail'}
                />
            )}

            {auth2FAState && !auth2FAState.restrictions.bi_connections.restricted && (
                <Fragment>
                    <div className="card">
                        <div className="card-section">
                            <div className="block block-bi-info">
                                <div className="bi-info-icon">
                                    <BiConnectionIcon />
                                </div>

                                <div className="bi-info-content">
                                    <div className="block block-markdown">
                                        <h4>
                                            Verbind uw BI-tools om toegang te krijgen tot uitgebreide statistische
                                            gegevens
                                        </h4>
                                        <p>
                                            Configureer onderstaande URL in de BI-tool. Hiermee krijgt u toegang tot de
                                            gegevens uit het platform. Stuur een verzoek en de gevraagde gegevens worden
                                            verstuurd.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <form className="form">
                            <div className="card-header">
                                <div className="flex-row">
                                    <div className="flex-col flex-grow">
                                        <div className="card-title">
                                            <span>{t('bi_connection.title')}</span>
                                        </div>
                                    </div>

                                    <div className="flex-col">
                                        <div className="block block-label-tabs nowrap">
                                            <div className="label-tab-set">
                                                {viewTypes.map((viewType, index) => (
                                                    <div
                                                        key={index}
                                                        className={`label-tab label-tab-sm ${
                                                            viewType === activeViewType ? 'active' : ''
                                                        }`}
                                                        onClick={() => {
                                                            setActiveViewType(viewType);
                                                            setQueryParams({ view_type: viewType });
                                                        }}>
                                                        {t(`bi_connection.tabs.${viewType}`)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {activeViewType === 'settings' && (
                                <div className="card-section card-section-primary">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">{t('bi_connection.labels.enabled')}</div>

                                        <div className="form-offset">
                                            <div className="form-group-info">
                                                <div className="form-group-info-control">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'key'}
                                                        value={form.values.enabled}
                                                        options={authTypes}
                                                        allowSearch={false}
                                                        onChange={(enabled: boolean) => form.update({ enabled })}
                                                        optionsComponent={SelectControlOptions}
                                                    />
                                                </div>

                                                <div className="form-group-info-button">
                                                    <div
                                                        className={`button button-default button-icon pull-left ${
                                                            showInfoBlock ? 'active' : ''
                                                        }`}
                                                        onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>

                                            {showInfoBlock && (
                                                <div className="block block-info-box block-info-box-primary">
                                                    <div className="info-box-icon mdi mdi-information" />

                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            <h4>Kies de juiste instelling</h4>
                                                            <p>
                                                                Vul bij de header bovenstaande naam en sleutelcode in
                                                                Voor het instellen van de token zijn er twee opties:
                                                            </p>
                                                            <ul></ul>
                                                            <ul>
                                                                <li>
                                                                    URL-parameter: Kies deze optie als uw BI-tool token
                                                                    ondersteunt. Voeg de token toe als een parameter in
                                                                    de URL
                                                                </li>
                                                                <li>
                                                                    Header: Kies deze optie als uw BI-tool header
                                                                    ondersteunt. Voeg de token toe in de header
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {form && form.values.enabled && (
                                        <Fragment>
                                            <div className="form-group form-group-inline">
                                                <div className="form-label">{t('bi_connection.labels.url')}</div>

                                                <div className="form-offset">
                                                    <div className="form-group-info">
                                                        <div className="form-group-info-control">
                                                            <input
                                                                type={'text'}
                                                                className="form-control form-control-dashed"
                                                                disabled={!connection.access_token}
                                                                defaultValue={activeOrganization.bi_connection_url}
                                                                readOnly={true}
                                                            />
                                                        </div>

                                                        <div className="form-group-info-button form-group-info-button-dashed">
                                                            <button
                                                                className="button button-default button-dashed button-icon pull-left"
                                                                disabled={!connection.access_token}
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        activeOrganization.bi_connection_url,
                                                                    )
                                                                }>
                                                                <em className="mdi mdi-content-copy" />
                                                            </button>

                                                            <button
                                                                className={`button button-default button-icon pull-left ${
                                                                    showInfoBlockUrl ? 'active' : ''
                                                                }`}
                                                                onClick={() => setShowInfoBlockUrl(!showInfoBlockUrl)}>
                                                                <em className="mdi mdi-information" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showInfoBlockUrl && (
                                                        <div className="block block-info-box block-info-box-primary">
                                                            <em className="info-box-icon mdi mdi-information" />

                                                            <div className="info-box-content">
                                                                <div className="block block-markdown">
                                                                    <p>
                                                                        Dit is de URL voor het exporteren van gegevens.
                                                                        Kopieer deze naar de BI-tool.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="form-group form-group-inline">
                                                <div className="form-label">{t('bi_connection.labels.data_types')}</div>
                                                <div className="form-offset">
                                                    <div className="checkbox-container-compact">
                                                        {availableDataTypes?.map((types, index: number) => (
                                                            <div className="row" key={index}>
                                                                {types.map((type, index: number) => (
                                                                    <div className="col col-xs-12 col-lg-6" key={index}>
                                                                        <CheckboxControl
                                                                            id={`data_type_name_${type.key}`}
                                                                            className="checkbox-compact"
                                                                            title={type.name}
                                                                            checked={!!dataTypes[type.key]}
                                                                            onChange={(e) => {
                                                                                dataTypes[type.key] = e.target.checked;
                                                                                setDataTypes({ ...dataTypes });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                        <FormError error={form.errors?.data_types} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group form-group-inline">
                                                <div className="form-label">
                                                    {t('bi_connection.labels.header_name')}
                                                </div>

                                                <div className="form-offset">
                                                    <div className="form-group-info">
                                                        <div className="form-group-info-control">
                                                            <input
                                                                type={'text'}
                                                                className="form-control form-control-dashed"
                                                                defaultValue={headerKey}
                                                                readOnly={true}
                                                            />
                                                        </div>

                                                        <div className="form-group-info-button form-group-info-button-dashed">
                                                            <button
                                                                className="button button-default button-dashed button-icon pull-left"
                                                                onClick={() => copyToClipboard(headerKey)}>
                                                                <div className="mdi mdi-content-copy" />
                                                            </button>

                                                            <button
                                                                className={`button button-default button-icon pull-left ${
                                                                    showInfoBlockHeader ? 'active' : ''
                                                                }`}
                                                                onClick={() =>
                                                                    setShowInfoBlockHeader(!showInfoBlockHeader)
                                                                }>
                                                                <em className="mdi mdi-information" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showInfoBlockHeader && (
                                                        <div className="block block-info-box block-info-box-primary">
                                                            <em className="info-box-icon mdi mdi-information" />

                                                            <div className="info-box-content">
                                                                <div className="block block-markdown">
                                                                    <p>
                                                                        {`Dit is de naam van de key die wordt gebruikt
                                                                        voor de verificatie van verzoeken. Kopieer en
                                                                        plak deze waarde in de "key" waarde van de
                                                                        header "X-API-KEY" in de BI-tool.`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="form-group form-group-inline">
                                                <div className="form-label">{t('bi_connection.labels.header_key')}</div>

                                                <div className="form-offset">
                                                    <div className="form-group-info">
                                                        <div className="form-group-info-control">
                                                            <input
                                                                type={'text'}
                                                                className="form-control form-control-dashed"
                                                                disabled={!connection.access_token}
                                                                value={connection.access_token}
                                                                placeholder={t(
                                                                    'bi_connection.labels.token_placeholder',
                                                                )}
                                                                readOnly={true}
                                                            />
                                                        </div>

                                                        <div className="form-group-info-button form-group-info-button-dashed">
                                                            <button
                                                                className="button button-default button-dashed button-icon pull-left"
                                                                disabled={!connection.access_token}
                                                                onClick={() =>
                                                                    copyToClipboard(connection.access_token)
                                                                }>
                                                                <em className="mdi mdi-content-copy" />
                                                            </button>

                                                            <button
                                                                className={`button button-default button-icon pull-left ${
                                                                    showInfoBlockToken ? 'active' : ''
                                                                }`}
                                                                onClick={() =>
                                                                    setShowInfoBlockToken(!showInfoBlockToken)
                                                                }>
                                                                <em className="mdi mdi-information" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showInfoBlockToken && (
                                                        <div className="block block-info-box block-info-box-primary">
                                                            <em className="info-box-icon mdi mdi-information" />

                                                            <div className="info-box-content">
                                                                <div className="block block-markdown">
                                                                    <p>
                                                                        {`Dit is de waarde van de X-API-KEY key header, die wordt gebruikt als token
                                                                        voor verificatie van verzoeken. Het is mogelijk om het handmatig te
                                                                        regenereren en de vervalperiode in te stellen op het tabblad "Beveilging".
                                                                        Kopieer deze waarde en plak het in het veld "value" van de header "X-API-KEY" in de BI-tool.
                                                                        `}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {connection.id && (
                                                <div className="form-group form-group-inline">
                                                    <div className="form-label" />
                                                    <div className="form-offset flex">
                                                        <button
                                                            type="button"
                                                            className="button button-default button-sm"
                                                            onClick={() => resetToken()}>
                                                            <em className="mdi mdi-refresh icon-start" />
                                                            {t('bi_connection.buttons.generate_new_key')}
                                                        </button>

                                                        {!connection.expired && (
                                                            <div className="expiration-value">
                                                                {`Verloopt ${connection.expire_after_locale}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {connection.expired && (
                                                <div className="form-group form-group-inline">
                                                    <div className="form-label">&nbsp;</div>

                                                    <div className="form-offset">
                                                        <div className="block block-info-box block-warning-box block-info-box-dashed">
                                                            <em className="info-box-icon mdi mdi-alert-outline" />

                                                            <div className="info-box-content">
                                                                <div className="block block-markdown">
                                                                    <p>Token verlopen. Genereer een nieuwe.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-group form-group-inline">
                                                <div className="form-label">&nbsp;</div>

                                                <div className="form-offset">
                                                    <div className="block block-info-box block-info-box-default block-info-box-dashed">
                                                        <em className="info-box-icon mdi mdi-information" />

                                                        <div className="info-box-content">
                                                            <div className="block block-markdown">
                                                                <h4>Gegevens exporteren naar de BI-tool</h4>
                                                                <ul>
                                                                    <li>Open de BI-tool en ga naar instellingen.</li>
                                                                    <li>
                                                                        Voeg een nieuwe gegevensbron of verbinding toe
                                                                        en selecteer de optie om verbinding te maken met
                                                                        een externe URL.
                                                                    </li>
                                                                    <li>Voer de bovenstaande URL in.</li>
                                                                    <li>
                                                                        Vul bij de header bovenstaande naam en
                                                                        sleutelcode in.
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fragment>
                                    )}
                                </div>
                            )}

                            {activeViewType === 'security' && (
                                <div className="card-section card-section-primary">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">{t('bi_connection.labels.expiration_period')}</div>

                                        <div className="form-offset">
                                            <div className="form-group-info">
                                                <div className="form-group-info-control">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'value'}
                                                        value={form.values.expiration_period}
                                                        options={expirationPeriods}
                                                        allowSearch={false}
                                                        onChange={(expiration_period: number) =>
                                                            form.update({ expiration_period })
                                                        }
                                                        optionsComponent={SelectControlOptions}
                                                    />
                                                </div>

                                                <div className="form-group-info-button">
                                                    <div
                                                        className={`button button-default button-icon pull-left ${
                                                            showInfoBlockExpiry ? 'active' : ''
                                                        }`}
                                                        onClick={() => setShowInfoBlockExpiry(!showInfoBlockExpiry)}>
                                                        <em className="mdi mdi-information"></em>
                                                    </div>
                                                </div>
                                            </div>

                                            <FormError error={form.errors?.expiration_period} />

                                            {showInfoBlockExpiry && (
                                                <div className="block block-info-box block-info-box-primary">
                                                    <em className="info-box-icon mdi mdi-information" />

                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            <p>
                                                                {`Kies een vervalperiode voor het authenticatietoken.
                                                                Nadat het token is verlopen, moet het opnieuw worden
                                                                gegenereerd door te klikken op "Vernieuwen".`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group form-group-inline">
                                        <div className="form-label">IP-adressen op de witte lijst</div>

                                        <div className="form-offset">
                                            {ips?.map((ipItem, index: number) => (
                                                <div className="form-group" key={index}>
                                                    <div className="form-group-info">
                                                        <div className="form-group-info-control">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={ipItem.value}
                                                                placeholder={
                                                                    t('bi_connection.labels.ip') + ' ' + (index + 1)
                                                                }
                                                                onChange={(e) => {
                                                                    setIp(e.target.value);
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="form-group-info-button">
                                                            <div
                                                                className="button button-default button-icon pull-left"
                                                                onClick={() => removeIp(index)}>
                                                                <em className="mdi mdi-trash-can-outline" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {form.errors && <FormError error={form.errors['ips.' + index]} />}

                                                    {index == ips?.length - 1 && (
                                                        <div className="flex-row">
                                                            <div className="flex-col">
                                                                <div className="form-group-divider" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="form-group">
                                                <div className="flex-row">
                                                    <div className="flex-col flex-grow">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={ip}
                                                            placeholder={
                                                                t('bi_connection.labels.ip') + ' ' + (ips?.length + 1)
                                                            }
                                                            onChange={(e) => {
                                                                setIp(e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-col">
                                                        <div
                                                            className="button button-primary nowrap"
                                                            onClick={() => addIp()}>
                                                            IP-adres toevoegen
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-error">{ipError}</div>
                                                <FormError error={form.errors?.ips} />
                                            </div>

                                            <div className="form-group">
                                                <div className="block block-info-box block-info-box-default block-info-box-dashed">
                                                    <em className="info-box-icon mdi mdi-information" />

                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            <p>
                                                                Het whitelisten van IP-adressen is een
                                                                veiligheidsmaatregel om de lijst van gebruikers te
                                                                beperken die gegevens van het account kunnen downloaden.
                                                                Bij het gebruik van een zelf gehoste BI-tool of
                                                                handmatige gegevensexport, vraag dan de IT-afdeling om
                                                                het IP-adres. Bij het gebruik van een BI-tool als
                                                                SaaS-product is het whitelisten van IP-adressen niet van
                                                                toepassing.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card-section">
                                <div className="button-group flex-center">
                                    <NavLink
                                        id="cancel"
                                        className={'button button-default'}
                                        to={getStateRouteUrl('organizations')}>
                                        {t('bi_connection.buttons.cancel')}
                                    </NavLink>

                                    <button
                                        type="submit"
                                        onClick={() => form.submit()}
                                        className="button button-primary">
                                        {t('bi_connection.buttons.submit')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Fragment>
            )}
        </>
    );
}
