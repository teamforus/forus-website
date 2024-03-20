import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { classList } from '../../helpers/utils';
import ReimbursementCategories from '../elements/reimbursement-categories/ReimbursementCategories';
import ModalReimbursementCategoryEdit from './ModalReimbursementCategoryEdit';
import useOpenModal from '../../hooks/useOpenModal';

export default function ModalReimbursementCategoriesEdit({
    modal,
    className,
}: {
    modal: ModalState;
    className?: string;
}) {
    const openModal = useOpenModal();

    const addCategory = useCallback(() => {
        openModal((modal) => <ModalReimbursementCategoryEdit modal={modal} />);
    }, [openModal]);

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
                        <ReimbursementCategories compact={true} />
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
