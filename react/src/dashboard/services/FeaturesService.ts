import { useState } from 'react';

export class FeatureService {
    public list = [
        {
            key: 'bi_tools',
            name: 'BI-tool API',
            description: 'API-koppeling met Business Intelligence (BI) tools voor data-export.',
            overview_description:
                'Maak gebruik van de API-koppeling met Business Intelligence (BI) tools om gegevens te exporteren.',
            labels: ['Integratie', 'Managementinformatie', 'API'],
        },
        {
            key: 'email_connection',
            name: 'E-mailkoppeling',
            description:
                'Mogelijkheid om systeemgerelateerde e-mails te versturen vanuit een gepersonaliseerd adres van uw organisatie.',
            overview_description:
                'Verstuur systeemgerelateerde e-mails vanuit een gepersonaliseerd adres van uw organisatie.',
            labels: ['Integratie', 'Communicatie', 'Beveiliging'],
        },
        {
            key: 'backoffice_api',
            name: 'Backoffice API',
            description: 'Koppeling met de gemeente-API voor naadloze gegevensintegratie.',
            overview_description: 'Integreer gegevens met de gemeente-API.',
            labels: ['Integratie', 'Managementinformatie', 'Aanvragen', 'API'],
        },
        {
            key: 'iconnect_api',
            name: 'Haal Centraal API',
            description: 'Toegang tot BRP-gegevens en weergave in het Forus platform.',
            overview_description: 'Verkrijg toegang tot BRP-gegevens en bekijk ze in het Forus-platform.',
            labels: ['Integratie', 'Persoonsgegevens', 'Aanvragen', 'API'],
        },
        {
            key: 'digid',
            name: 'DigiD',
            description: 'Een koppeling met DigiD voor digitale identificatie binnen Forus.',
            overview_description:
                'Faciliteer het proces voor deelnemers: laat deelnemers inloggen en fondsen aanvragen met DigiD.',
            labels: ['Integratie', 'Beveiliging', 'Aanvragen', 'Identificatie'],
        },
        {
            key: 'bng',
            name: 'BNG',
            description:
                'Geautomatiseerde financiële transacties tussen Forus en de rekening van uw organisatie bij de Bank Nederlandse Gemeenten (BNG).',
            overview_description:
                'Maak gebruik van geautomatiseerde financiële transacties tussen Forus en uw ' +
                'organisatierekening bij de Bank Nederlandse Gemeenten (BNG).',
            labels: ['Integratie', 'Financieel'],
        },
        {
            key: 'reimbursements',
            name: 'Declaraties',
            description: 'Mogelijkheid voor deelnemers om bonnen en facturen in te dienen ter vergoeding van kosten.',
            overview_description:
                'Faciliteer deelnemers bij het indienen van bonnen en facturen ter vergoeding van kosten.',
            labels: ['Toegankelijkheid', 'Financieel'],
        },
        {
            key: 'auth_2_fa',
            name: 'Tweefactorauthenticatie (2FA)',
            description: 'Extra beveiligingslaag voor accountbescherming.',
            overview_description: 'Voeg een extra beveiligingslaag toe voor de bescherming van uw account.',
            labels: ['Beveiliging', 'Identificatie'],
        },
        {
            key: 'physical_cards',
            name: 'Fysieke pas',
            description: 'Aanvragen en uitgifte van een fysieke pas met persoonlijke QR.',
            overview_description: 'Geef minder digitaal vaardige deelnemers een alternatief voor digitale toegang.',
            labels: ['Toegankelijkheid'],
        },
        {
            key: 'voucher_records',
            name: 'Persoonsgegevens op een tegoed',
            description: 'Het toevoegen en tonen van persoonsgegevens op een tegoed.',
            overview_description: 'Voeg persoonsgegevens toe en toon ze op een tegoed.',
            labels: ['Identificatie', 'Persoonsgegevens', 'Beveiliging'],
        },
        {
            key: 'extra_payments',
            name: 'Bijbetalen met iDEAL',
            description: 'De mogelijkheid om met iDEAL bij te betalen bij kosten hoger dan het resterende tegoed.',
            overview_description:
                'Geef deelnemers de optie om met iDEAL bij te betalen bij kosten hoger dan het resterende tegoed.',
            labels: ['Integratie', 'Financieel'],
        },
        {
            key: 'fund_requests',
            name: 'Open aanvragen',
            description: 'Geïntegreerde intake & aanvraagprocedures voor (gemeentelijke) regelingen.',
            overview_description:
                'Begin met geïntegreerde intake- en aanvraagprocedures voor (gemeentelijke) regelingen.',
            labels: ['Aanvragen', 'Integratie'],
        },
    ];

    public previewList = [
        [
            {
                key: 'digid',
                name: 'DigiD',
                description: 'Laat deelnemers inloggen en fondsen aanvragen met DigiD',
            },
            {
                key: 'auth_2_fa',
                name: 'Tweefactorauthenticatie',
                description: 'Een extra beveiligingslaag voor de bescherming van uw account',
            },
        ],
        [
            {
                key: 'bng',
                name: 'BNG',
                description: 'Geautomatiseerde financiële transacties ',
            },
            {
                key: 'bi_tools',
                name: 'BI-tool API',
                description: 'Exporteer gegevens met BI-tool API',
            },
        ],
    ];

    public getAdditionalFeatures = (feature) => {
        const additionalFeatures =
            {
                bng: ['digid', 'auth_2_fa'],
                digid: ['bng', 'auth_2_fa'],
                bi_tools: ['bng', 'auth_2_fa'],
                auth_2_fa: ['bng', 'digid'],
                iconnect_api: ['bi_tools', 'auth_2_fa'],
                backoffice_api: ['bi_tools', 'auth_2_fa'],
                fund_requests: ['digid', 'bi_tools'],
                reimbursements: ['bng', 'auth_2_fa'],
                extra_payments: ['reimbursements', 'bng'],
                physical_cards: ['bi_tools', 'auth_2_fa'],
                voucher_records: ['auth_2_fa', 'digid'],
                email_connection: ['bi_tools', 'auth_2_fa'],
            }[feature] || [];

        return this.list.filter((feature) => additionalFeatures.includes(feature.key));
    };
}
export function useFeatureService(): FeatureService {
    return useState(new FeatureService())[0];
}
