module.exports = {
    // VOUCHER = voucher.pug
    header: {
        title: 'Your voucher',
    },
    buttons: {
        send: 'SEND VOUCHER BY MAIL',
        details: 'Show details',
    },
    labels: {
        transactions: 'Transactions',
        subtract: 'Substract',
        fund: 'Funds',
        expire: 'Use before:',
        requirements: 'Contact the provider for the details of the offer',
        vouchers: "Visit the provider if you can't find the offer on the webshop.",
        info: "<span style='font-style: italic;'>Searching for a provider that is not registered? You can ask them to apply for the fund.</span>",
        offices: 'You can spend the budget at the locations of these providers',
        voucher: 'Print your voucher or send it by mail. Present the voucher to the provider to do a payment.',
        office: 'Locations hwere you can spend the budget.',
        shopdetail: 'INFORMATION ABOUT THE PROVIDER',
        productdetail: 'INFORMATION ABOUT THE OFFER',
        offers: 'Visit the provider for the total offer.',
    },
    voucher_card: {
        header: {
            title: 'Hoe does it work?',
        },
        labels: {
            description:
                'You can show the {{fund_name}} voucher to the provider. The provider can scan your code to offer you the product or service.',
            desc: 'You can show the {{fund_name}} voucher to the provider. The provider can scan your code to offer you the product or service.',
            contact_sponsor: "Contact us if you have any questions about '{{fund_name}}'",
            contact_provider: 'Contact us if you have any questions about the offer',
        },
        footer: {
            actions: {
                mail: 'EMAIL',
                print: 'PRINT',
                share: 'SHARE',
                open_in_me: 'Me',
            },
            tooltips: {
                mail: 'Send the voucher by mail',
                print: 'Print the voucher',
                share: 'Share the voucher with the provider',
                open_in_me: 'Me',
            },
        },
        qrcode: {
            description: 'This is your {{fund_name}} voucher with a QR-code',
            productdescription: 'This is your product voucher',
        },
        expire: 'Use this voucher before:',
        delete: 'Cancel reservation',
        expired: 'Expired',
    },
    share_voucher: {
        popup_form: {
            title: 'Attention! Please inform the provider before sharing your voucher.',
            description:
                'You can share your product voucher with the provider to buy at a distance. Enter additional information that the provider requires for participation in the field below if the offer concerns an activity or service:  This can be a reason but also your name or telephone number.',
        },
        reason_placeholder: 'Message to the provider',
        buttons: {
            submit: 'SUBMIT',
            confirm: 'CLOSE',
        },
        popup_sent: {
            title: 'Your voucher has beent sent to the provider.',
            description:
                'The provider has received your voucher and the message. Please contact or visit the provider for further information.',
        },
        labels: {
            send_copy: 'Send a copy of the message to yourself',
            share_note: 'Message to the provider',
        },
    },
    delete_voucher: {
        popup_form: {
            title: 'Do you wish to cancel the reservation?',
            description:
                "You can cancel the reservation. Close this window if you don't want to cancel the reservation.",
        },
        buttons: {
            submit: 'CONFIRM',
            close: 'CLOSE',
        },
    },
};
