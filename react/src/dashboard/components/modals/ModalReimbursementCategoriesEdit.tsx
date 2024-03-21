import React, { useCallback, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import ReimbursementCategories from '../elements/reimbursement-categories/ReimbursementCategories';
import ModalReimbursementCategoryEdit from './ModalReimbursementCategoryEdit';
import useOpenModal from '../../hooks/useOpenModal';
import usePaginatorService from '../../modules/paginator/services/usePaginatorService';
import { useReimbursementCategoryService } from '../../services/ReimbursementCategoryService';
import { PaginationData } from '../../props/ApiResponses';
import ReimbursementCategory from '../../props/models/ReimbursementCategory';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import useFilter from '../../hooks/useFilter';

export default function ModalReimbursementCategoriesEdit({
    modal,
    className,
}: {
    modal: ModalState;
    className?: string;
}) {
    const openModal = useOpenModal();
    const activeOrganization = useActiveOrganization();

    const paginatorService = usePaginatorService();
    const reimbursementCategoryService = useReimbursementCategoryService();

    const [reimbursementCategories, setReimbursementCategories] = useState<PaginationData<ReimbursementCategory>>(null);
    const [paginatorKey] = useState('reimbursement_categories');

    const filter = useFilter({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchReimbursementCategories = useCallback(() => {
        reimbursementCategoryService.list(activeOrganization.id, filter.activeValues).then((res) => {
            setReimbursementCategories(res.data);
        });
    }, [activeOrganization.id, filter.activeValues, reimbursementCategoryService]);

    const addCategory = useCallback(() => {
        openModal((modal) => <ModalReimbursementCategoryEdit modal={modal} onSubmit={fetchReimbursementCategories} />);
    }, [fetchReimbursementCategories, openModal]);

    return (
        <div
            className={classList([
                'modal',
                'modal-md',
                'modal-animated',
                modal.loading ? 'modal-loading' : null,
                className,
            ])}>
            <div className="modal-backdrop" onClick={modal.close} />

            <div className="modal-window">
                <form className="form">
                    <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                    <div className="modal-header">Bewerk aanbieder</div>

                    <div className="modal-body modal-body-visible">
                        <ReimbursementCategories compact={true} categories={reimbursementCategories} />
                    </div>

                    <div className="modal-footer text-center">
                        <button className="button button-default" onClick={modal.close} type="button">
                            Sluiten
                        </button>
                        <button className="button button-primary" type="button" onClick={() => addCategory()}>
                            Categorie toevoegen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
