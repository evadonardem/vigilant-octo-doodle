import * as ReactDOM from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { authorize } from '../state/authenticate';
import { store } from '../state/store';
import AttendanceLogs from './Pages/Logs/AttendanceLogs';
import CompensationAndBenefits from './Pages/CompensationAndBenefits';
import DailyTimeRecord from './Pages/Logs/DailyTimeRecord';
import Dashboard from './Pages/Dashboard/Dashboard';
import Deliveries from './Pages/Logs/Deliveries';
import ItemsRegistry from './Pages/Settings/ItemsRegistry';
import Layout from './Pages/Layout';
import Login from './Pages/Login';
import Logs from './Pages/Logs/Logs';
import ManualLogs from './Pages/Logs/ManualLogs';
import OvertimeRates from './Pages/Settings/OvertimeRates';
import PayPeriodDetails from './Pages/CompensationAndBenefits/PayPeriodDetails';
import PayPeriods from './Pages/CompensationAndBenefits/PayPeriods';
import PurchaseOrderDetails from './Pages/PurchaseOrders/PurchaseOrderDetails';
import PurchaseOrderStoreRequest from './Pages/PurchaseOrders/PurchaseOrderStoreRequest';
import PurchaseOrders from './Pages/PurchaseOrders';
import RateHistory from './Pages/Settings/Users/RateHistory';
import React, { useEffect } from 'react';
import Reports from './Pages/Reports';
import ReportsDeliveryReceiptMonitoring from './Pages/Reports/ReportsDeliveryReceiptMonitoring';
import ReportsDeliverySalesMonitoring from './Pages/Reports/ReportsDeliverySalesMonitoring';
import ReportsDeliveryTripsSummary from './Pages/Reports/ReportsDeliveryTripsSummary';
import ReportsItemSalesMonitoring from './Pages/Reports/ReportsItemSalesMonitoring';
import ReportsPromodisersSummary from './Pages/Reports/ReportsPromodisersSummary';
import ReportsSalesInvoiceMonitoring from './Pages/Reports/ReportsSalesInvoiceMonitoring';
import ReportsStockCardsMonitoring from './Pages/Reports/ReportsStockCardsMonitoring';
import RolesAndPermissions from './Pages/Settings/Users/RolesAndPermissions';
import SalesInvoiceStoreItemsShow from './Pages/SalesInvoices/SalesInvoiceStoreItemsShow';
import SalesInvoices from './Pages/SalesInvoices/SalesInvoices';
import SalesInvoicesCreate from './Pages/SalesInvoices/SalesInvoicesCreate';
import SalesInvoicesShow from './Pages/SalesInvoices/SalesInvoicesShow';
import Settings from './Pages/Settings';
import StockCards from './Pages/StockCards/StockCards';
import StockCardsCreate from './Pages/StockCards/StockCardsCreate';
import StockCardsShow from './Pages/StockCards/StockCardsShow';
import ThirteenthMonthPayPeriodDetails from './Pages/CompensationAndBenefits/ThirteenthMonthPayPeriodDetails';
import ThirteenthMonthPayPeriods from './Pages/CompensationAndBenefits/ThirteenthMonthPayPeriods';
import Trends from './Pages/Trends';
import TrendsItem from './Pages/Trends/TrendsItem';
import TrendsStore from './Pages/Trends/TrendsStore';
import Users from './Pages/Settings/Users';
import ChangePassword from './Pages/Profile/ChangePassword';
import Stores from './Pages/Settings/Stores';
import StoreDetails from './Pages/Settings/Stores/Details';
import StoreItemsPricingLedger from './Pages/Settings/Stores/Details/ItemsPricing';
import PaymentsDashboard from './Pages/Payments/PaymentsDashboard';
import PaymentsDeliveryReceiptsPage from './Pages/Payments/PaymentsDeliveryReceiptsPage';

export default function App() {
    const dispatch = useDispatch();
    const {
        brand,
        isLoggedIn,
        links,
        signedInUser,
        user,
    } = useSelector((state) => state.authenticate);

    useEffect(() => {
        dispatch(authorize());
    }, []);

    const { roles, permissions } = user ?? {};
    const hasRole = (name) => roles ? !!_.find(roles, (role) => role.name === name) : false;
    const hasPermission = (name) => permissions ? !!_.find(permissions, (permission) => permission.name === name) : false;
    const isSuperAdmin = hasRole("Super Admin");
    const canViewManualDeliveryLogs = isSuperAdmin || hasPermission("View manual delivery logs");
    const canViewPayPeriod = isSuperAdmin || hasPermission("View pay period");
    const canUpdateSalesInvoice = isSuperAdmin || hasPermission("Update sales invoice");
    const canViewSalesInvoice = isSuperAdmin || hasPermission("View sales invoice");
    const canCreateStockCard = isSuperAdmin || hasPermission("Create stock card");
    const canViewStockCard = isSuperAdmin || hasPermission("View stock card");
    const canGenerateStoreTrend = isSuperAdmin || hasPermission("Generate store trend");
    const canGenerateItemTrend = isSuperAdmin || hasPermission("Generate item trend");

    // reports permissions
    const allowedToGenerateDeliverySalesMonitoringReport = isSuperAdmin || hasPermission("Generate delivery sales monitoring report");
    const allowedToGenerateDeliveryReceiptMonitoringReport = isSuperAdmin || hasPermission("Generate delivery receipt monitoring report");
    const allowedToGenerateSalesInvoiceMonitoringReport = isSuperAdmin || hasPermission("Generate sales invoice monitoring report");
    const allowedToGenerateStockCardsMonitoringReport = isSuperAdmin || hasPermission("Generate stock cards monitoring report");
    const allowedToGeneratePromodisersSummaryReport = isSuperAdmin || hasPermission("Generate promodisers summary report");
    const allowedToGenerateItemSalesMonitoringReport = isSuperAdmin || hasPermission("Generate item sales monitoring report");
    const allowedToGenerateDeliveryTripsSummaryReport = isSuperAdmin || hasPermission("Generate delivery trips summary report");

    // store item pricing permissions
    const allowedToCreateOrUpdateStoreItemPricing = isSuperAdmin || hasPermission("Create or update store item pricing");

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
                                    case '/sales-invoices':
                                        routeToComponent = <SalesInvoices />;
                                        break;
                                    case '/payments':
                                        routeToComponent = <PaymentsDashboard />;
                                        break;
                                    case '/stock-cards':
                                        routeToComponent = <StockCards />;
                                        break;
                                    case '/reports':
                                        routeToComponent = <Reports />;
                                        break;
                                    case '/trends':
                                        routeToComponent = <Trends />;
                                        break;
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
                                    {canViewManualDeliveryLogs && <Route path={'/deliveries'} element={<Deliveries />}></Route>}
                                    <Route path={'/manual-logs'} element={<ManualLogs />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/compensation-and-benefits') &&
                                <>
                                    {canViewPayPeriod && <>
                                        <Route
                                            path={'/compensation-and-benefits/pay-periods'}
                                            element={<PayPeriods />}></Route>
                                        <Route
                                            path={'/compensation-and-benefits/pay-periods/:payPeriodId/details'}
                                            element={<PayPeriodDetails />}></Route>
                                    </>}
                                    <Route
                                        path={'/compensation-and-benefits/thirteenth-month-pay-periods'}
                                        element={<ThirteenthMonthPayPeriods />}></Route>
                                    <Route
                                        path={'/compensation-and-benefits/thirteenth-month-pay-periods/:thirteenthMonthPayPeriodId/details'}
                                        element={<ThirteenthMonthPayPeriodDetails />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/purchase-orders') &&
                                <>
                                    <Route path={'/purchase-orders/:purchaseOrderId/details'} element={<PurchaseOrderDetails />}></Route>
                                    <Route path={'/purchase-orders/:purchaseOrderId/store-request/:storeId?'} element={<PurchaseOrderStoreRequest />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/sales-invoices') &&
                                <>
                                    {canViewSalesInvoice && <>
                                        <Route path={'/sales-invoices/create'} element={<SalesInvoicesCreate />}></Route>
                                        <Route path={'/sales-invoices/:salesInvoiceId/details'} element={<SalesInvoicesShow />}></Route>
                                        {canUpdateSalesInvoice && <Route path={'/sales-invoices/:salesInvoiceId/store-items'} element={<SalesInvoiceStoreItemsShow />}></Route>}
                                    </>}
                                </>}

                            {links && links.map((link) => link.to).includes('/payments') &&
                                <>
                                    <Route path={'/payments/delivery-receipts'} element={<PaymentsDeliveryReceiptsPage />}></Route>
                                </>}

                            {links && links.map((link) => link.to).includes('/stock-cards') &&
                                <>
                                    {canCreateStockCard && <Route path={'/stock-cards/create'} element={<StockCardsCreate />}></Route>}
                                    {canViewStockCard && <Route path={'/stock-cards/:stockCardId/details'} element={<StockCardsShow />}></Route>}
                                </>}

                            {links && links.map((link) => link.to).includes('/reports') &&
                                <>
                                    {allowedToGenerateDeliverySalesMonitoringReport &&
                                        <Route path={'/reports-delivery-sales-monitoring'} element={<ReportsDeliverySalesMonitoring />}></Route>}
                                    {allowedToGenerateDeliveryReceiptMonitoringReport &&
                                        <Route path={'/reports-delivery-receipt-monitoring'} element={<ReportsDeliveryReceiptMonitoring />}></Route>}
                                    {allowedToGenerateSalesInvoiceMonitoringReport &&
                                        <Route path={'/reports-sales-invoice-monitoring'} element={<ReportsSalesInvoiceMonitoring />}></Route>}
                                    {allowedToGenerateStockCardsMonitoringReport &&
                                        <Route path={'/reports-stock-cards-monitoring'} element={<ReportsStockCardsMonitoring />}></Route>}
                                    {allowedToGeneratePromodisersSummaryReport &&
                                        <Route path={'/reports-promodisers-summary'} element={<ReportsPromodisersSummary />}></Route>}
                                    {allowedToGenerateItemSalesMonitoringReport &&
                                        <Route path={'/reports-item-sales'} element={<ReportsItemSalesMonitoring />}></Route>}
                                    {allowedToGenerateDeliveryTripsSummaryReport &&
                                        <Route path={'/reports-delivery-trips-summary'} element={<ReportsDeliveryTripsSummary />}></Route>}
                                </>}

                            {links && links.map((link) => link.to).includes('/trends') &&
                                <>
                                    {canGenerateStoreTrend && <Route path={'/trends-store'} element={<TrendsStore />}></Route>}
                                    {canGenerateItemTrend && <Route path={'/trends-item'} element={<TrendsItem />}></Route>}
                                </>}

                            {links && links.map((link) => link.to).includes('/settings') &&
                                <>
                                    <Route path="/settings/users" element={<Users />}></Route>
                                    <Route path="/settings-users-rate-history/:userId" element={<RateHistory />}></Route>
                                    <Route path="/settings/users/:userId/roles-and-permissions" element={<RolesAndPermissions />}></Route>
                                    <Route path="/settings/overtime-rates" element={<OvertimeRates />}></Route>
                                    <Route path="/settings/items-registry" element={<ItemsRegistry />}></Route>
                                    <Route path="/settings/stores" element={<Stores />}></Route>
                                    <Route path="/settings/stores/:storeId/details" element={<StoreDetails />}></Route>
                                    {allowedToCreateOrUpdateStoreItemPricing &&
                                        <Route path="/settings/stores/:storeId/items-pricing" element={<StoreItemsPricingLedger />}></Route>}
                                </>}

                            <Route path="/change-password" element={<ChangePassword />}></Route>

                            { /* fallback route for non-existing routes */}
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
