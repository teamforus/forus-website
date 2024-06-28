module.exports = {
    header: {
        title: 'Vouchers',
    },
    labels: {
        state: 'Status',
        activation_code: 'Code',
        amount: 'Bedrag',
        fund: 'Fonds',
        granted: 'Toegekend',
        note: 'Notitie',
        search: 'Zoeken',
        qr_code: 'QR-Code',
        pending: 'Pending',
        active: 'Active',
        deactivated: 'Deactivated',
        date_type: 'Pas toe op',
        used_date: 'Used date',
        created_at: 'Aangemaakt op',
        expire_at: 'Geldig tot en met',
        in_use: 'In gebruik',
        has_payouts: 'Heeft uitbetalingen',
    },
    buttons: {
        add_new: 'Aanmaken',
    },
    events: {
        created_budget: 'Created',
        created_product: 'Created',
        activated: 'Activated',
        deactivated: 'Deactivated',
    },
    csv: {
        default_note: 'Uploaded at {{ upload_date }} by {{ uploader_email }}, assigned to {{ target_email }}',
        default_note_no_email: 'Uploaded at {{ upload_date }} by {{ uploader_email }}',
    },
};
