export default {
    // PRODUCT RESERVE POPUP = popup-product-reserve.pug
    header: {
        title: 'Maak een reservering',
    },
    description_formal: [
        'U gebruikt uw <strong>{{fund}}</strong> tegoed voor deze reservering.',
        'Plaatst u een reservering? Dan gaat u ermee akkoord dat wij uw persoonlijke gegevens delen met de aanbieder.',
    ].join('<br/>'),
    description_informal: [
        'Je gebruikt jouw <strong>{{fund}}</strong> tegoed voor deze reservering.',
        'Plaatst je een reservering? Dan gaat je ermee akkoord dat wij je persoonlijke gegevens delen met de aanbieder.',
    ].join('<br/>'),

    description_formal_time: 'De reservering kunt u na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren. ',
    description_informal_time: 'De reservering kun je na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren.',
};
