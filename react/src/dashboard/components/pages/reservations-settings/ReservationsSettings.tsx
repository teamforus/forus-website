import React, { Fragment, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useTranslation } from 'react-i18next';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { useOrganizationService } from '../../../services/OrganizationService';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useUpdateActiveOrganization from '../../../hooks/useUpdateActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import FormError from '../../elements/forms/errors/FormError';
import { hasPermission } from '../../../helpers/utils';
import ReservationFieldsEditor from '../reservations/elements/ReservationFieldsEditor';
import useSetProgress from '../../../hooks/useSetProgress';
import { uniqueId } from 'lodash';
import { ResponseError } from '../../../props/ApiResponses';

export default function ReservationsSettings() {
    const { t } = useTranslation();
    const activeOrganization = useActiveOrganization();
    const updateActiveOrganization = useUpdateActiveOrganization();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();

    const organizationService = useOrganizationService();

    const [fields, setFields] = useState(
        activeOrganization.reservation_fields.map((item) => ({ ...item, uid: uniqueId() })),
    );

    const [reservationFieldOptions] = useState([
        { value: 'no', label: 'Nee' },
        { value: 'optional', label: 'Optioneel' },
        { value: 'required', label: 'Verplicht' },
    ]);

    const [extraPaymentsOptions] = useState([
        { value: false, label: 'Nee' },
        { value: true, label: 'Ja' },
    ]);

    const form = useFormBuilder(
        {
            reservation_phone: activeOrganization.reservation_phone,
            reservation_address: activeOrganization.reservation_address,
            reservation_birth_date: activeOrganization.reservation_birth_date,
            reservation_allow_extra_payments: activeOrganization.reservation_allow_extra_payments,
        },
        (values) => {
            setProgress(0);

            organizationService
                .updateReservationFields(activeOrganization.id, { ...values, fields })
                .then((res) => {
                    pushSuccess('Opgeslagen!');
                    updateActiveOrganization(res.data.data);
                    setFields(res.data.data.reservation_fields.map((item) => ({ ...item, uid: uniqueId() })));

                    form.update({
                        reservation_phone: res.data.data.reservation_phone,
                        reservation_address: res.data.data.reservation_address,
                        reservation_birth_date: res.data.data.reservation_birth_date,
                        reservation_allow_extra_payments: res.data.data.reservation_allow_extra_payments,
                    });
                    form.setErrors({});
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushDanger('Mislukt!', err.data.message);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    if (!activeOrganization) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'reservations'}
                    params={{ organizationId: activeOrganization.id }}
                    className={'breadcrumb-item'}>
                    Reserveringen
                </StateNavLink>
                <div className="breadcrumb-item active">Reservering instellingen</div>
            </div>
            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header flex flex-horizontal">
                        <div className="flex flex-grow">
                            <div className="card-title">{t('reservation_settings.header.title')}</div>
                        </div>
                        <div className="flex">
                            <button className="button button-primary button-sm" type="submit">
                                {t('reservation_settings.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                    <div className="card-section card-section-primary card-section-settings">
                        <div className="row">
                            <div className="col-xs-12 col-lg-8">
                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="reservation_phone">
                                        {t('reservation_settings.labels.phone')}
                                    </label>
                                    <div className="form-offset">
                                        <SelectControl
                                            value={form.values.reservation_phone}
                                            propKey={'value'}
                                            propValue={'label'}
                                            onChange={(value: 'no' | 'optional' | 'required') =>
                                                form.update({ reservation_phone: value })
                                            }
                                            options={reservationFieldOptions}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={form.errors.reservation_phone} />
                                    </div>
                                </div>
                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="reservation_address">
                                        {t('reservation_settings.labels.address')}
                                    </label>
                                    <div className="form-offset">
                                        <SelectControl
                                            value={form.values.reservation_address}
                                            propKey={'value'}
                                            propValue={'label'}
                                            onChange={(value: 'no' | 'optional' | 'required') =>
                                                form.update({ reservation_address: value })
                                            }
                                            options={reservationFieldOptions}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={form.errors.reservation_address} />
                                    </div>
                                </div>

                                <div className="form-group form-group-inline">
                                    <label className="form-label" htmlFor="reservation_birth_date">
                                        {t('reservation_settings.labels.birth_date')}
                                    </label>
                                    <div className="form-offset">
                                        <SelectControl
                                            value={form.values.reservation_birth_date}
                                            propKey={'value'}
                                            propValue={'label'}
                                            onChange={(value: 'no' | 'optional' | 'required') =>
                                                form.update({ reservation_birth_date: value })
                                            }
                                            options={reservationFieldOptions}
                                            optionsComponent={SelectControlOptions}
                                        />
                                        <FormError error={form.errors.reservation_birth_date} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-section card-section-primary">
                        <div className="form-group form-group-inline">
                            <label className="form-label">{t('reservation_settings.labels.fields')}</label>
                            <div className="form-offset">
                                <ReservationFieldsEditor fields={fields} onChange={setFields} errors={form.errors} />
                            </div>
                        </div>
                    </div>

                    {activeOrganization.can_receive_extra_payments &&
                        hasPermission(activeOrganization, 'manage_payment_methods') && (
                            <div className="card-section card-section-primary card-section-settings">
                                <div className="row">
                                    <div className="col-xs-12 col-lg-8">
                                        <div className="form-group form-group-inline">
                                            <label className="form-label" htmlFor="reservation_birth_date">
                                                {t('reservation_settings.labels.extra_payments')}
                                            </label>
                                            <div className="form-offset">
                                                <SelectControl
                                                    value={form.values.reservation_allow_extra_payments}
                                                    propKey={'value'}
                                                    propValue={'label'}
                                                    onChange={(value: boolean) =>
                                                        form.update({ reservation_allow_extra_payments: value })
                                                    }
                                                    options={extraPaymentsOptions}
                                                    optionsComponent={SelectControlOptions}
                                                />
                                                <FormError error={form.errors.reservation_allow_extra_payments} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    <div className="card-section card-section-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={'reservations'}
                                params={{ organizationId: activeOrganization.id }}
                                className="button button-default">
                                {t('reservation_settings.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit">
                                {t('reservation_settings.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
