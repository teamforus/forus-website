import React from 'react';
import Organization from '../../../../props/models/Organization';
import Reservation from '../../../../props/models/Reservation';
import ExtraPayment from '../../../../props/models/ExtraPayment';

export default function ReservationExtraPaymentDetails({
    organization,
    reservation,
    payment,
}: {
    organization: Organization;
    reservation: Reservation;
    payment: ExtraPayment;
    onUpdate?: (reservation: Reservation) => void;
}) {
    return <pre>{JSON.stringify({ organization, reservation, payment }, null, 4)}</pre>;
}
