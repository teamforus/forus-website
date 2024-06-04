import React, { useState } from 'react';
import Voucher from '../../../../dashboard/props/models/Voucher';

export default function BlockVoucherRecords({
    toggle = false,
    compact = false,
    voucher,
}: {
    toggle?: boolean;
    compact?: boolean;
    voucher: Voucher;
}) {
    const [showRecords, setShowRecords] = useState(false);

    return (
        <div
            className={`block block-voucher-records ${toggle ? 'block-voucher-records-toggle' : ''} ${
                compact ? 'block-voucher-records-compact' : ''
            }`}>
            {toggle && (
                <div className="records-toggle clickable" onClick={() => setShowRecords(!showRecords)}>
                    {showRecords ? 'Verberg alle details' : 'Toon alle details'}
                    {showRecords ? <em className="mdi mdi-chevron-up" /> : <em className="mdi mdi-chevron-down" />}
                </div>
            )}

            {(!toggle || showRecords) && (
                <div className="records-pane">
                    {voucher.records?.map((record, index) => (
                        <div key={index} className="record-item">
                            <div className="record-key">{record.record_type_name}</div>
                            <div className="record-value">{record.value_locale}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
