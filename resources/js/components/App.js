import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Layout from './Pages/Layout';
import Dashboard from './Pages/Dashboard';
import Logs from './Pages/Logs';
import DailyTimeRecord from './Pages/Logs/DailyTimeRecord';
import AttendanceLogs from './Pages/Logs/AttendanceLogs';
import Deliveries from './Pages/Logs/Deliveries';
import ManualLogs from './Pages/Logs/ManualLogs';
import PurchaseOrders from './Pages/PurchaseOrders';
import PurchaseOrderDetails from './Pages/PurchaseOrders/PurchaseOrderDetails';
import PurchaseOrderStoreRequest from './Pages/PurchaseOrders/PurchaseOrderStoreRequest';
import Users from './Pages/Settings/Users';
import RateHistory from './Pages/Settings/Users/RateHistory';
import Settings from './Pages/Settings';
import RolesAndPermissions from './Pages/Settings/Users/RolesAndPermissions';
import OvertimeRates from './Pages/Settings/OvertimeRates';
import ItemsRegistry from './Pages/Settings/ItemsRegistry';
import StoresRegistry from './Pages/Settings/StoresRegistry';
import { store } from '../state/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { authorize } from '../state/authenticate';
import CompensationAndBenefits from './Pages/CompensationAndBenefits';
import PayPeriods from './Pages/CompensationAndBenefits/PayPeriods';
import PayPeriodDetails from './Pages/CompensationAndBenefits/PayPeriodDetails';
import ThirteenthMonthPayPeriods from './Pages/CompensationAndBenefits/ThirteenthMonthPayPeriods';
import ThirteenthMonthPayPeriodDetails from './Pages/CompensationAndBenefits/ThirteenthMonthPayPeriodDetails';
import Trends from './Pages/Trends';
import TrendsStore from './Pages/Trends/TrendsStore';
import TrendsItem from './Pages/Trends/TrendsItem';

export default function App() {
    const dispatch = useDispatch();
    const {
        brand,
        isLoggedIn,
        links,
    signedInUser
    } = useSelector((state) => state.authenticate);

    useEffect(() => {
        dispatch(authorize());
    }, []);

    return (
        <>
            <HashRouter>
                {isLoggedIn &&
                    <Routes>
                        <Route
                            element={<Layout brand={brand} links={links} signedInUser={signedInUser} />}>
                            {links && links.map((link) => {
                                let routeToComponent = null;

                                switch (link.to) {
                                    case '/dashboard':
                                        routeToComponent = <Dashboard />;
                                        break;
                                    case '/logs':
                                        routeToComponent = <Logs />;
                                        break;
                                    case '/compensation-and-benefits':
                                        routeToComponent = <CompensationAndBenefits />;
                                        break;
                                    case '/purchase-orders':
                                        routeToComponent = <PurchaseOrders />;
                                        break;
                                    // case '/sales-invoices':
                                    //     routeToComponent = <SalesInvoices />;
                                    //     break;
                                    // case '/reports':
                                    //     routeToComponent = <Reports />;
                                    //     break;
                                    case '/trends':
                                        routeToComponent = <Trends />;
                                        break;
                                    // case '/stock-cards':
                                    //     routeToComponent = <StockCards />;
                                    //     break;
                                    // case '/users':
                                    //     routeToComponent = <Users />;
                                    //     break;
                                    case '/settings':
                                        routeToComponent = <Settings />;
                                        break;
                                    default:
                                        routeToComponent = <Dashboard />
                                }

                                return <Route
                                    key={`route-${link.to}`}
                                    path={link.to}
                                    element={routeToComponent}></Route>;
                            })}
                            <Route key={'route-default'} index element={<Dashboard />}></Route>

                            {links && links.map((link) => link.to).includes('/logs') &&
                                <>
                                    <Route path={'/daily-time-record'} element={<DailyTimeRecord />}></Route>
                                    <Route path={'/attendance-logs'} element={<AttendanceLogs />}></Route>
                                    <Route path={'/deliveries'} element={<Deliveries />}></Route>
                                    <Route path={'/manual-logs'} element={<ManualLogs />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/compensation-and-benefits') &&
                                <>
                                    <Route
                                        path={'/compensation-and-benefits/pay-periods'}
                                        element={<PayPeriods/>}></Route>
                                    <Route
                                        path={'/compensation-and-benefits/pay-periods/:payPeriodId/details'}
                                        element={<PayPeriodDetails/>}></Route>
                                    <Route
                                        path={'/compensation-and-benefits/thirteenth-month-pay-periods'}
                                        element={<ThirteenthMonthPayPeriods/>}></Route>
                                    <Route
                                        path={'/compensation-and-benefits/thirteenth-month-pay-periods/:thirteenthMonthPayPeriodId/details'}
                                        element={<ThirteenthMonthPayPeriodDetails/>}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/purchase-orders') &&
                                <>
                                    <Route path={'/purchase-orders/:purchaseOrderId/details'} element={<PurchaseOrderDetails />}></Route>
                                    <Route path={'/purchase-orders/:purchaseOrderId/store-request/:storeId?'} element={<PurchaseOrderStoreRequest />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/trends') &&
                                <>
                                    <Route path={'/trends-store'} element={<TrendsStore/>}></Route>
                                    <Route path={'/trends-item'} element={<TrendsItem/>}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/settings') &&
                                <>
                                    <Route path="/settings/users" element={<Users />}></Route>
                                    <Route path="/settings-users-rate-history/:userId" element={<RateHistory />}></Route>
                                    <Route path="/settings/users/:userId/roles-and-permissions" element={<RolesAndPermissions />}></Route>
                                    <Route path="/settings/overtime-rates" element={<OvertimeRates />}></Route>
                                    <Route path="/settings/items-registry" element={<ItemsRegistry />}></Route>
                                    <Route path="/settings/stores-registry" element={<StoresRegistry />}></Route>
                                </>}

                            { /* fallback route for non-existing routes */ }
                            <Route path="*" element={<Navigate to="/dashboard" />}></Route>
                        </Route>
                    </Routes>}
            </HashRouter>

            {!isLoggedIn && <Login />}
        </>
    );
}

if (document.getElementById('app')) {
    const rootElement = document.getElementById('app');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Provider store={store}><App /></Provider>);
}
