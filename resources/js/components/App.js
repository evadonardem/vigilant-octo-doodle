import React, { createContext, useEffect, useState } from 'react';
import cookie from 'react-cookies';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import Root from './Root';
import Login from './Login';
import Layout from './Pages/Layout';
import PageNotFound from './Pages/Logs';
import Dashboard from './Pages/Dashboard';
import Logs from './Pages/Logs';
import DailyTimeRecord from './Pages/Logs/DailyTimeRecord';
import AttendanceLogs from './Pages/Logs/AttendanceLogs';
import Deliveries from './Pages/Logs/Deliveries';
import ManualLogs from './Pages/Logs/ManualLogs';
import PurchaseOrders from './Pages/PurchaseOrders';
import PurchaseOrderDetails from './Pages/PurchaseOrders/PurchaseOrderDetails';
import PurchaseOrderStoreRequest from './Pages/PurchaseOrders/PurchaseOrderStoreRequest';

export const Auth = createContext(null);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [signedInUser, setSignedInUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [brand, setBrand] = useState(null);
    const [links, setLinks] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const authorize = () => {
        const token = cookie.load('token');
        axios.post(`${apiBaseUrl}/me?token=${token}`, {})
            .then((response) => {
                const { data } = response;
                const { name: signedInUser } = data;
                setIsLoggedIn(true);
                setUser(data);
                setSignedInUser(signedInUser);
                axios.get(`${apiBaseUrl}/user/roles?token=${token}`)
                    .then((response) => {
                        const { data: roles } = response.data;
                        setUserRoles(roles);
                    });
                axios.get(`${apiBaseUrl}/user/permissions?token=${token}`)
                    .then((response) => {
                        const { data: permissions } = response.data;
                        setUserPermissions(permissions);
                    });
                axios.get(`${apiBaseUrl}/navigation-menu?token=${token}`)
                    .then((response) => {
                        const { data } = response.data;
                        const { brand, links } = data;
                        setBrand(brand);
                        setLinks(links);
                    });
            })
            .catch(() => {
                setIsLoggedIn(false);
                setSignedInUser(null);
            });
    };

    const hasRole = (name) => !!_.find(userRoles, (role) => role.name === name);

    const handleLogout = (e) => {
        const token = cookie.load('token');
        axios.post(apiBaseUrl + '/logout?token=' + token, { })
            .then(() => {
                location.reload();
            }).catch(() => {
                location.reload();
            });
    }

    const handleSubmit = ({ biometricId, password } = e) => {
        axios.post(apiBaseUrl + '/login', { biometric_id: biometricId, password })
            .then((response) => {
                const { data } = response;
                const { token } = data;
                cookie.save('token', token);
                authorize();
            })
            .catch(() => {
                setIsLoggedIn(false);
                setSignedInUser(null);
                setErrorMessage('Invalid Biometric ID or password.');
            });
    };

    useEffect(() => authorize(), []);

    return (
        <>
            <BrowserRouter basename="/gogfmc-stg/public/">
                {isLoggedIn && user && (userRoles || userPermissions) &&
                    <Auth.Provider value={{
                        user,
                        hasRole,
                    }}>
                        <Routes>
                            <Route
                                path="/"
                                element={<Layout brand={brand} handleLogout={handleLogout} links={links} signedInUser={signedInUser}/>}>
                                {links && links.map((link) => {
                                    let routeToComponent = null;

                                    switch (link.to) {
                                        case 'dashboard':
                                            routeToComponent = <Dashboard />;
                                            break;
                                        case 'logs':
                                            routeToComponent = <Logs />;
                                            break;
                                        // case '/compensation-and-benefits':
                                        //     routeToComponent = <CompensationAndBenefits />;
                                        //     break;
                                        case '/purchase-orders':
                                             routeToComponent = <PurchaseOrders />;
                                             break;
                                        // case '/sales-invoices':
                                        //     routeToComponent = <SalesInvoices />;
                                        //     break;
                                        // case '/reports':
                                        //     routeToComponent = <Reports />;
                                        //     break;
                                        // case '/trends':
                                        //     routeToComponent = <Trends />;
                                        //     break;
                                        // case '/stock-cards':
                                        //     routeToComponent = <StockCards />;
                                        //     break;
                                        // case '/users':
                                        //     routeToComponent = <Users />;
                                        //     break;
                                        // case '/settings':
                                        //     routeToComponent = <Settings />;
                                        //     break;
                                        default:
                                            routeToComponent = <Dashboard />
                                    }

                                    return <Route
                                        key={`route-${link.to}`}
                                        path={link.to}
                                        element={routeToComponent}></Route>;
                                })}
                                <Route key={'route-default'} index element={<Dashboard />}></Route>


                                <Route path={'/daily-time-record'} element={<DailyTimeRecord />}></Route>
                                <Route path={'/attendance-logs'} element={<AttendanceLogs />}></Route>
                                <Route path={'/deliveries'} element={<Deliveries />}></Route>
                                <Route path={'/manual-logs'} element={<ManualLogs />}></Route>

                                <Route path={'/purchase-order-details/:purchaseOrderId'} element={<PurchaseOrderDetails />}></Route>
                                <Route path={'/purchase-order/:purchaseOrderId/store-request/:storeId?'} element={<PurchaseOrderStoreRequest />}></Route>
                            </Route>
                        </Routes>
                    </Auth.Provider>}
            </BrowserRouter>

            {!isLoggedIn &&
                <Login onSubmit={handleSubmit} errorMessage={errorMessage} />}
        </>
    );
}

if (document.getElementById('app')) {
    const rootElement = document.getElementById('app');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
