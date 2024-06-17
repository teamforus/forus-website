import React, { useCallback, useEffect, useState } from 'react';
import { strLimit } from '../../../helpers/string';
import Paginator from '../../../modules/paginator/components/Paginator';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { PaginationData, ResponseError } from '../../../props/ApiResponses';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../../hooks/useTranslate';
import { useOrganizationService } from '../../../services/OrganizationService';
import Organization from '../../../props/models/Organization';
import ThSortable from '../../elements/tables/ThSortable';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useSetProgress from '../../../hooks/useSetProgress';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';

export default function ExternalValidators() {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const organizationService = useOrganizationService();

    const [paginatorKey] = useState('external-validators');
    const [approvedOrganizations, setApprovedOrganizations] = useState<Array<number>>(null);
    const [externalValidators, setExternalValidators] = useState<PaginationData<Organization>>(null);

    const [filterValue, filterValueActive, filterUpdate, filter] = useFilterNext<{
        q?: string;
        page?: number;
        order_by?: 'name' | 'email' | 'phone' | 'website';
        order_dir?: 'asc' | 'desc';
        per_page?: number;
    }>(
        {
            q: '',
            page: 1,
            order_by: 'name',
            order_dir: 'asc',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            queryParams: {
                q: StringParam,
                page: NumberParam,
                order_by: createEnumParam(['name', 'email', 'phone', 'website']),
                order_dir: createEnumParam(['asc', 'desc']),
                per_page: NumberParam,
            },
            queryParamsRemoveDefault: true,
        },
    );

    const fetchAvailableExternalValidators = useCallback(() => {
        setProgress(0);

        organizationService
            .listValidatorsAvailable(filterValueActive)
            .then((res) => setExternalValidators(res.data))
            .catch((err: ResponseError) => pushDanger(err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, organizationService, filterValueActive, pushDanger]);

    const fetchApprovedValidators = useCallback(() => {
        setProgress(0);

        organizationService
            .readListValidators(activeOrganization.id, { per_page: 100 })
            .then((res) => {
                setApprovedOrganizations(res.data.data.map((validator) => validator.validator_organization_id));
            })
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, organizationService, activeOrganization.id, pushDanger]);

    const addExternalValidator = useCallback(
        (organization: Organization) => {
            setProgress(0);

            organizationService
                .addExternalValidator(activeOrganization.id, organization.id)
                .then(() => {
                    fetchApprovedValidators();
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
                .finally(() => setProgress(100));
        },
        [setProgress, organizationService, activeOrganization.id, fetchApprovedValidators, pushSuccess, pushDanger],
    );

    const removeExternalValidator = useCallback(
        (organization: Organization) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_external_validators.title')}
                    description={translate('modals.danger_zone.remove_external_validators.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_external_validators.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            organizationService
                                .removeExternalValidator(activeOrganization.id, organization.id)
                                .then(() => {
                                    fetchApprovedValidators();
                                    pushSuccess('Opgeslagen!');
                                    modal.close();
                                })
                                .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message));
                        },
                        text: translate('modals.danger_zone.remove_external_validators.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            pushDanger,
            pushSuccess,
            organizationService,
            activeOrganization.id,
            fetchApprovedValidators,
        ],
    );

    useEffect(() => {
        fetchAvailableExternalValidators();
    }, [approvedOrganizations, fetchAvailableExternalValidators]);

    useEffect(() => {
        fetchApprovedValidators();
    }, [fetchApprovedValidators]);

    if (!externalValidators || !approvedOrganizations) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">Beoordelaars ({externalValidators?.meta.total})</div>
                    </div>

                    <div className="flex">
                        <div className="block block-inline-filters">
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={filterValue.q}
                                        placeholder="Zoeken"
                                        className="form-control"
                                        onChange={(e) => filterUpdate({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {externalValidators?.meta.total > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <ThSortable
                                            label={translate('external_validators.labels.organization_name')}
                                            value={'name'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.email')}
                                            value={'email'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.phone')}
                                            value={'phone'}
                                            filter={filter}
                                        />
                                        <ThSortable
                                            label={translate('external_validators.labels.website')}
                                            value={'website'}
                                            filter={filter}
                                        />
                                        <th className={'text-right'}>
                                            {translate('external_validators.labels.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {externalValidators?.data.map((organization) => (
                                        <tr key={organization.id}>
                                            <td>
                                                <div className="td-collapsable">
                                                    <div className="collapsable-media">
                                                        <img
                                                            className="td-media td-media-sm"
                                                            src={
                                                                organization.logo?.sizes?.thumbnail ||
                                                                assetUrl(
                                                                    '/assets/img/placeholders/organization-thumbnail.png',
                                                                )
                                                            }
                                                            alt={organization.name}
                                                        />
                                                    </div>

                                                    <div className="collapsable-content">
                                                        <div className="text-primary text-strong">
                                                            {strLimit(organization.name, 40)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td
                                                className={`${
                                                    organization.email ? 'text-medium text-primary-light' : 'text-muted'
                                                }`}>
                                                {organization.email || '-'}
                                            </td>
                                            <td className={`${organization.phone ? '' : 'text-muted'}`}>
                                                {organization.phone || '-'}
                                            </td>
                                            <td
                                                className={`${
                                                    organization.website
                                                        ? 'text-medium text-primary-light'
                                                        : 'text-muted'
                                                }`}>
                                                {organization.website || '-'}
                                            </td>

                                            <td className="text-right">
                                                {approvedOrganizations?.includes(organization.id) ? (
                                                    <button
                                                        type={'button'}
                                                        className="button button-default button-sm"
                                                        onClick={() => removeExternalValidator(organization)}>
                                                        <em className="mdi mdi-close icon-start" />
                                                        {translate('external_validators.buttons.delete')}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type={'button'}
                                                        className="button button-primary button-sm"
                                                        onClick={() => addExternalValidator(organization)}>
                                                        <em className="mdi mdi-check-circle icon-start" />
                                                        {translate('external_validators.buttons.add')}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {externalValidators?.meta.total == 0 && (
                <EmptyCard title={'Geen beoordelaars beschikbaar.'} type={'card-section'} />
            )}

            {externalValidators?.meta && (
                <div className="card-section">
                    <Paginator
                        meta={externalValidators.meta}
                        filters={filter.values}
                        perPageKey={paginatorKey}
                        updateFilters={filter.update}
                    />
                </div>
            )}
        </div>
    );
}
