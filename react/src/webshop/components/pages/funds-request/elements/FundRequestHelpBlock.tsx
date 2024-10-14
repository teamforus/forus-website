import React, { useCallback } from 'react';
import Fund from '../../../../props/models/Fund';
import HelpIcon from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/help-icon.svg';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import ModalFundHelp from '../../../modals/ModalFundHelp';

export default function FundRequestHelpBlock({ fund }: { fund?: Fund }) {
    const openModal = useOpenModal();

    const openHelpModal = useCallback(() => {
        return openModal((modal) => <ModalFundHelp modal={modal} fund={fund} />);
    }, [fund, openModal]);

    if (!fund.help_enabled) {
        return null;
    }

    return (
        <div className="block block-pane">
            <div className="pane-section">
                <div className="pane-icon">
                    <HelpIcon />
                </div>
                <div className="pane-title">{fund.help_block_text}</div>
                <div className="pane-actions">
                    <button className="button button-sm button-primary" onClick={openHelpModal}>
                        {fund.help_button_text}
                    </button>
                </div>
            </div>
        </div>
    );
}
