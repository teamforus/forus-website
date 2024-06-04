import Fund from '../../props/models/Fund';

type FundsListItemModel = Fund & {
    canApply?: boolean;
    isApplicable?: boolean;
    showActivateButton?: boolean;
    alreadyReceived?: boolean;
    showPendingButton?: boolean;
    showRequestButton?: boolean;
    linkPrimaryButton?: boolean;
};

export default FundsListItemModel;
