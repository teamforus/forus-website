import React from 'react';

export default function BlockAuth2FAInfoBox({ className = '' }: { className?: string }) {
    return (
        <div className={`block block-info-box ${className}`}>
            <div className="info-box-icon mdi mdi-information-outline" />
            <div className="info-box-content">
                Kijk voor meer informatie over 2FA op ons:&nbsp;
                <a
                    className="info-box-link"
                    href="https://deelnemer.forus.io/kb/guide/nl/tweefactorauthenticatie-euzhlJKzx4/Steps/2571975"
                    target="_blank"
                    rel="noreferrer">
                    Helpcenter artikel
                    <div className="mdi mdi-chevron-right" />
                </a>
            </div>
        </div>
    );
}
