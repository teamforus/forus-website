import React, { useEffect } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import classNames from 'classnames';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BlockException({ front = 'webshop' }: { front?: 'dashboard' | 'webshop' }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { resetBoundary } = useErrorBoundary();

    useEffect(() => {
        return () => resetBoundary();
    }, [resetBoundary, location.pathname]);

    return (
        <div className="block block-exception">
            <div className="exception-icon">
                <em className="mdi mdi-alert" />
            </div>
            <div className="exception-content">
                <h3 className="exception-content-title">Oeps, er is iets fout gegaan</h3>
                <p className="exception-content-description">
                    {
                        'Onze excuses, er is een onverwachte fout opgetreden aan onze kant. Probeer het alsjeblieft opnieuw.'
                    }
                </p>
            </div>

            <div className="exception-actions">
                <div
                    className={classNames(
                        'button',
                        front == 'webshop' && 'button-sm',
                        front == 'webshop' ? 'button-light' : 'button-default',
                    )}
                    onClick={() => document.location.reload()}>
                    <em className="mdi mdi-reload icon-start" />
                    Opnieuw proberen
                </div>

                {!['/', '/sign-in'].includes(location?.pathname) && (
                    <div
                        className={classNames('button', front == 'webshop' && 'button-sm', 'button-primary')}
                        onClick={() => navigate('/')}>
                        Naar home
                        <em className="mdi mdi-arrow-right icon-right icon-end" />
                    </div>
                )}
            </div>
        </div>
    );
}
