export default interface OrganizationFeatureStatuses {
    statuses: {
        bng: boolean;
        digid: boolean;
        auth_2_fa: boolean;
        bi_tools: boolean;
        backoffice_api: boolean;
        physical_cards: boolean;
        reimbursements: boolean;
        voucher_records: boolean;
        iconnect_api: boolean;
        email_connection: boolean;
    };
}
