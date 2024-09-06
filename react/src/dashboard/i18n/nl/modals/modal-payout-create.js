export default {
    title: 'Uitbetaling aanmaken',
    labels: {
        fund: 'Fonds',
        allocate_by: 'Toewijzingsmethode',
        assign_by_type: 'Methode',
        amount: 'Bedrag',
        iban: 'Naar IBAN',
        iban_name: 'Tenaamstelling IBAN',
        description: 'Omschrijving',
    },
    tooltips: {
        assign_type: [
            'Selecteer het fonds waarvoor het tegoed wordt aangemaakt. ',
            'De regels die op dit fonds van toepassing zijn, ',
            'worden automatisch overgenomen voor het tegoed. ',
            'Hierdoor kan bijvoorbeeld worden bepaald bij welke aanbieders het tegoed kan worden besteed.',
        ].join(''),
    },
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
    },
};
