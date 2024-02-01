import React from 'react';
import ExtraPaymentRefund from '../../../../props/models/ExtraPaymentRefund';

export default function ReservationExtraPaymentRefunds({ refunds }: { refunds: Array<ExtraPaymentRefund> }) {
    return <pre>{JSON.stringify(refunds, null, 4)}</pre>;
}
