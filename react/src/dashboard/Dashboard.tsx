import React from 'react';
import { BrowserRouter, Route, Routes as SwitchRoutes } from 'react-router-dom';
import { Home } from '../dashboard/components/pages/home/Home';
import EnvDataProp from '../props/EnvData';
import { Layout } from './elements/Layout';

function Dashboard({ envData }: { envData: EnvDataProp }) {
    const base = document.querySelector('base').getAttribute('href');
    const routes = [{ path: `/`, component: <Home envData={envData} />, exact: false }];

    return (
        <BrowserRouter basename={base.endsWith('/') ? base.slice(0, base.length - 1) : base}>
            <Layout>
                <SwitchRoutes>
                    {routes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.component} />
                    ))}
                </SwitchRoutes>
            </Layout>
        </BrowserRouter>
    );
}

export default Dashboard;
