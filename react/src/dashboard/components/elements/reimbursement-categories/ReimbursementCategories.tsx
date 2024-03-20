import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginationData } from '../../../props/ApiResponses';
import ReimbursementCategory from '../../../props/models/ReimbursementCategory';
import Paginator from '../../../modules/paginator/components/Paginator';
import useFilter from '../../../hooks/useFilter';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import useOpenModal from '../../../hooks/useOpenModal';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import ModalDangerZone from '../../modals/ModalDangerZone';
import { useReimbursementCategoryService } from '../../../services/ReimbursementCategoryService';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import ModalReimbursementCategoryEdit from '../../modals/ModalReimbursementCategoryEdit';

export default function ReimbursementCategories({ compact = false }: { compact?: boolean }) {
    const { t } = useTranslation();
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();

    const paginatorService = usePaginatorService();
    const reimbursementCategoryService = useReimbursementCategoryService();

    const [reimbursementCategories, setReimbursementCategories] = useState<PaginationData<ReimbursementCategory>>(null);
    const [paginatorKey] = useState('reimbursement_categories');

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const translateDangerZone = useCallback(
        (key: string) => {
            return t(`modals.danger_zone.remove_reimbursement_category.${key}`);
        },
        [t],
    );

    const fetchReimbursementCategories = useCallback(() => {
        reimbursementCategoryService.list(activeOrganization.id, filter.activeValues).then((res) => {
            setReimbursementCategories(res.data);
        });
    }, [activeOrganization.id, filter.activeValues, reimbursementCategoryService]);

    const editReimbursementCategory = useCallback(
        (category: ReimbursementCategory = null) => {
            openModal((modal) => (
                <ModalReimbursementCategoryEdit
                    modal={modal}
                    category={category}
                    onSubmit={() => fetchReimbursementCategories()}
                />
            ));
        },
        [fetchReimbursementCategories, openModal],
    );

    const deleteReimbursementCategory = useCallback(
        (reimbursementCategory: ReimbursementCategory) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translateDangerZone('title')}
                    description={translateDangerZone('description')}
                    buttonCancel={{
                        text: translateDangerZone('buttons.cancel'),
                        onClick: () => modal.close(),
                    }}
                    buttonSubmit={{
                        text: translateDangerZone('buttons.confirm'),
                        onClick: () => {
                            reimbursementCategoryService
                                .destroy(activeOrganization.id, reimbursementCategory.id)
                                .then(() => {
                                    pushSuccess('Opgeslagen!');
                                    modal.close();
                                    fetchReimbursementCategories();
                                })
                                .catch((res) => pushDanger('Error!', res?.data?.message));
                        },
                    }}
                />
            ));
        },
        [
            activeOrganization.id,
            fetchReimbursementCategories,
            openModal,
            pushDanger,
            pushSuccess,
            reimbursementCategoryService,
            translateDangerZone,
        ],
    );

    useEffect(() => {
        fetchReimbursementCategories();
    }, [fetchReimbursementCategories]);

    return (
        <Fragment>
            <div className="card card-last">
                {!compact && (
                    <div className="card-header">
                        <div className="flex">
                            <div className="flex flex-grow">
                                <div className="card-title">
                                    {'Declaratie categorieën (' + reimbursementCategories?.meta.total + ')'}
                                </div>
                            </div>

                            <div className="flex">
                                <div className="block block-inline-filters">
                                    <a
                                        className="button button-primary button-sm"
                                        id="add_reimbursement_category"
                                        onClick={() => editReimbursementCategory()}>
                                        <em className="mdi mdi-plus-circle icon-start" />
                                        {t('Toevoegen')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {reimbursementCategories?.data.length && (
                    <div className="card-section card-section-primary">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Categorie naam</th>
                                            <th>Organisatie</th>
                                            <th>Totaal gebruikt</th>
                                            <th className="th-narrow text-right">Opties</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {reimbursementCategories?.data.map((reimbursementCategory) => (
                                            <tr key={reimbursementCategory.id}>
                                                <td>{reimbursementCategory.name}</td>
                                                <td>{reimbursementCategory.organization.name}</td>
                                                <td>{reimbursementCategory.reimbursements_count}</td>
                                                <td className="td-narrow text-right">
                                                    <div className="flex">
                                                        <a
                                                            className="button button-sm button-default"
                                                            onClick={() =>
                                                                editReimbursementCategory(reimbursementCategory)
                                                            }>
                                                            <em className="mdi mdi-pen icon-start" />
                                                            {t('Bewerken')}
                                                        </a>
                                                        <button
                                                            className="button button-danger button-icon"
                                                            onClick={() =>
                                                                deleteReimbursementCategory(reimbursementCategory)
                                                            }
                                                            disabled={reimbursementCategory.reimbursements_count > 0}>
                                                            <em className="icon-start mdi mdi-delete" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {reimbursementCategories?.meta.total && (
                    <div className={`card-section ${compact ? 'card-section-narrow' : ''}`}>
                        <div className="table-pagination">
                            <Paginator
                                meta={reimbursementCategories.meta}
                                filters={filter.values}
                                updateFilters={filter.update}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    </div>
                )}

                {reimbursementCategories?.meta.total == 0 && (
                    <EmptyCard description="Er zijn momenteel geen declaratie categorieën." />
                )}
            </div>
        </Fragment>
    );
}
