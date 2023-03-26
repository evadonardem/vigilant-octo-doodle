import axios from 'axios';
import cookie from 'react-cookies';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
    Nav,
    Navbar,
    NavDropdown
} from 'react-bootstrap';
import CompensationAndBenefits from './CompensationAndBenefits';
import PayPeriodDetails from './PayPeriodDetails';
import PayPeriods from './PayPeriods';
import SalesInvoices from './SalesInvoices';
import SalesInvoicesCreate from './SalesInvoicesCreate';
import SalesInvoicesShow from './SalesInvoicesShow';
import Settings from './Settings';
import SettingsItems from './SettingsItems';
import SettingsOvertimeRates from './SettingsOvertimeRates';
import SettingsStores from './SettingsStores';
import SettingStoreDetails from './SettingsStoreDetails';
import SettingsUserRoles from './SettingsUserRoles';
import StockCards from './StockCards';
import ThirteenthMonthPayPeriods from './ThirteenthMonthPayPeriods';
import ThirteenthMonthPayPeriodDetails from './ThirteenthMonthPayPeriodDetails';
import UserRateHistory from './UserRateHistory';
import Users from './Users';
import Reports from './Reports';
import ReportsDeliverySalesMonitoring from './ReportsDeliverySalesMonitoring';
import ReportsDeliveryReceiptMonitoring from './ReportsDeliveryReceiptMonitoring';
import ReportsDeliveryTripsSummary from './ReportsDeliveryTripsSummary';
import ReportsItemSalesMonitoring from './ReportsItemSalesMonitoring';
import ReportsSalesInvoiceMonitoring from './ReportsSalesInvoiceMonitoring';
import ReportsStockCardsMonitoring from './ReportsStockCardsMonitoring';
import Trends from './Trends';
import TrendsItem from './TrendsItem';
import TrendsStore from './TrendsStore';
import StockCardsCreate from './StockCardsCreate';
import StockCardsShow from './StockCardsShow';
import SettingStorePromodiserJobHistory from './SettingsStorePromodiserJobHistory';
import ReportsPromodisersSummary from './ReportsPromodisersSummary';
import SalesInvoiceStoreItemsShow from './SalesInvoiceStoreItemsShow';
import SettingsStoreItemPricing from './SettingsStoreItemPricing';
import RolesAndPermissions from './Settings/RolesAndPermissions';
export default class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            brand: '',
            links: [],
        };

        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        axios.get(apiBaseUrl + '/navigation-menu?token=' + token)
            .then((response) => {
                const { data } = response.data;
                const { brand, links } = data;

                self.setState({ brand, links });
            }).catch((error) => {
                location.href = appBaseUrl + '/login';
            });
    }

    handleLogout(e) {
        const token = cookie.load('token');
        axios.post(apiBaseUrl + '/logout?token=' + token, { })
            .then((response) => {
                location.reload();
            }).catch((error) => {
                location.reload();
            });
    }

    render() {
        const { brand, links } = this.state;
        const { signedInUser } = this.props;
        let menuIndex = 0;
        let submenuIndex = 0;
        let routeIndex = 0;
        return (
            <Router>
                <div>
                    <Navbar bg="dark" expand="lg" variant="dark">
                        <Navbar.Brand href="#">{brand && brand}</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mr-auto">
                                {links && links.map((link) => {
                                    if (link.links) {
                                        const dropdownItems = link.links && link.links.map((dropdownLink) =>
                                            <NavDropdown.Item
                                                key={'menu-' + menuIndex + '-dropdown-item-' + submenuIndex++}
                                                href={dropdownLink.url}>
                                                {dropdownLink.label}
                                            </NavDropdown.Item>);
                                        return (
                                            <NavDropdown key={'menu-' + menuIndex + '-dropdown'} title={link.label} id="collapsible-nav-dropdown">
                                                {dropdownItems}
                                            </NavDropdown>
                                        );
                                    } else {
                                        return (<Link key={'menu-' + menuIndex++} className={'nav-link'} to={link.to} title={link.label}>
                                            <i className={link.icon}></i>
                                        </Link>);
                                    }
                                }
                                )}
                            </Nav>
                            <Nav>
                                <NavDropdown title={signedInUser}>
                                    <NavDropdown.Item
                                        href="#">
                                        <i className="fa fa-key"> Change password</i>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        href="#" onClick={this.handleLogout}>
                                        <i className="fa fa-sign-out"> Sign-out</i>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                    <Routes>
                        {links && links.map((link) => {
                            let routeToComponent = null;
                            switch (link.to) {
                                case '/compensation-and-benefits':
                                    routeToComponent = <CompensationAndBenefits />;
                                    break;
                                case '/sales-invoices':
                                    routeToComponent = <SalesInvoices />;
                                    break;
                                case '/reports':
                                    routeToComponent = <Reports />;
                                    break;
                                case '/trends':
                                    routeToComponent = <Trends />;
                                    break;
                                case '/stock-cards':
                                    routeToComponent = <StockCards />;
                                    break;
                                case '/users':
                                    routeToComponent = <Users />;
                                    break;
                                case '/settings':
                                    routeToComponent = <Settings />;
                                    break;
                            }

                            return <Route
                                key={'route-' + routeIndex++}
                                path={link.to}
                                element={() => routeToComponent}/>;
                        }
                        )}

                        <Route path={'/pay-periods'} component={PayPeriods}></Route>
                        <Route path={'/pay-period-details/:payPeriodId'} component={PayPeriodDetails}></Route>
                        <Route path={'/thirteenth-month-pay-periods'} component={ThirteenthMonthPayPeriods}></Route>
                        <Route path={'/thirteenth-month-pay-period-details/:thirteenthMonthPayPeriodId'} component={ThirteenthMonthPayPeriodDetails}></Route>


                        <Route path={'/sales-invoices-create'} component={SalesInvoicesCreate}></Route>
                        <Route path={'/sales-invoice-details/:salesInvoiceId'} component={SalesInvoicesShow}></Route>
                        <Route path={'/sales-invoice-store-items/:salesInvoiceId'} component={SalesInvoiceStoreItemsShow}></Route>

                        <Route path={'/reports-delivery-sales-monitoring'} component={ReportsDeliverySalesMonitoring}></Route>
                        <Route path={'/reports-delivery-receipt-monitoring'} component={ReportsDeliveryReceiptMonitoring}></Route>
                        <Route path={'/reports-sales-invoice-monitoring'} component={ReportsSalesInvoiceMonitoring}></Route>
                        <Route path={'/reports-stock-cards-monitoring'} component={ReportsStockCardsMonitoring}></Route>
                        <Route path={'/reports-promodisers-summary'} component={ReportsPromodisersSummary}></Route>
                        <Route path={'/reports-item-sales'} component={ReportsItemSalesMonitoring}></Route>
                        <Route path={'/reports-delivery-trips-summary'} component={ReportsDeliveryTripsSummary}></Route>

                        <Route path={'/trends-store'} component={TrendsStore}></Route>
                        <Route path={'/trends-item'} component={TrendsItem}></Route>

                        <Route path={'/stock-cards-create'} component={StockCardsCreate}></Route>
                        <Route path={'/stock-card-details/:stockCardId'} component={StockCardsShow}></Route>

                        <Route path={'/user-rate-history/:userId'} component={UserRateHistory}></Route>
                        <Route path={'/user-roles-and-permissions/:userId'} component={RolesAndPermissions}></Route>

                        <Route path={'/settings-user-roles'} component={SettingsUserRoles}></Route>
                        <Route path={'/settings-overtime-rates'} component={SettingsOvertimeRates}></Route>
                        <Route path={'/settings-items'} component={SettingsItems}></Route>
                        <Route path={'/settings-stores'} component={SettingsStores}></Route>
                        <Route path={'/settings-store-details/:storeId'} component={SettingStoreDetails}></Route>
                        <Route path={'/settings-store-item-pricing/:storeId'} component={SettingsStoreItemPricing}></Route>
                        <Route path={'/settings-store-promodiser-job-histories/:storeId/:promodiserId'} component={SettingStorePromodiserJobHistory}></Route>
                    </Routes>
                </div>
            </Router>
        );
    }
}

if (document.getElementById('menu')) {
    ReactDOM.render(<Menu />, document.getElementById('menu'));
}
