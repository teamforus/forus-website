export default {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    sign_up: {
        block_title: '{{ fund_name }} aanvragen',
        pane: {
            header_title: 'Overzicht',
            text: 'We hebben nog wat gegevens nodig. Doorloop de volgende stappen:',
            criterion_more: "'{{ name }}' moet meer dan {{ value }} zijn.",
            criterion_more_or_equal: "'{{ name }}' more or equal to {{ value }} zijn.",
            criterion_less: "'{{ name }}' moet minder dan {{ value }} zijn.",
            criterion_less_or_equal: "'{{ name }}' less or equal to {{ value }} zijn.",
            criterion_same: "'{{ name }}' moet {{ value }} zijn.",
            criterion_any: "'{{ name }}' elke waarde.",
            fund_already_applied: 'You can not submit a new application until this one is not finished.',
            footer: {
                prev: 'Vorige stap',
                next: 'Volgende stap',
            },
        },
        header: {
            main: 'Aanvraag',
            title_step_1: 'Welkom',
            title_step_2: 'Aanmelden',
            title_fund_already_applied: 'Application in progress',
        },
        subtitles: {
            step_1: 'Via dit online formulier kunt u zich aanmelden voor beschikbare fondsen. ',
            step_2: 'Er wordt gekeken of u al aan voorwaarden voldoet, en u kan tussentijds afbreken en op een ander moment verder gaan.',
            fund_already_applied:
                'You already applied and have an active application process. Please find below the status of your request.',
        },
        labels: {
            has_app: 'Ik wil inloggen met de me app >',
            no_app: '< Ik wil inloggen met mijn e-mailadres',
        },
        app: {
            title: 'Gebruik de Me-app',
            description_top: ['Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.'].join('\n'),
            description_bottom: [
                'De Me App wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en tegoeden te beheren.',
            ].join('\n'),
        },
    },
};
