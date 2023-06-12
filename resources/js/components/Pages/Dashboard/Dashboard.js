import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Option from '../../Generic/Option';
import React from 'react';

const Dashboard = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const isSuperAdmin = hasRole("Super Admin");
    const canAccessDeliveryLogs = isSuperAdmin || hasPermission("View manual delivery logs");
    const canAccessManualLogs = isSuperAdmin || hasPermission("Create manual delivery logs");
    const canAccessPayPeriods = isSuperAdmin;
    const canAccessPurchaseOrders = isSuperAdmin || hasPermission("View purchase order");
    const canAccessSalesInvoices = isSuperAdmin || hasPermission("View sales invoice");
    const canAccessStockCards = isSuperAdmin;
    const canAccessReports = isSuperAdmin;
    const canAccessTrends = isSuperAdmin;
    const canAccessSettings = isSuperAdmin ||
        hasPermission("Create or register new user") ||
        hasPermission("Update existing user") ||
        hasPermission("View registered user");

    const options = [
        {
            icon: "calendar",
            title: "Attendance Logs",
            description: "Time logs from biometric device.",
            to: "/attendance-logs",
            isAccessible: true,
        },
        {
            icon: "clock-o",
            title: "DTR",
            description: "Consolidated daily time record.",
            to: "/attendance-logs",
            isAccessible: true,
        },
        {
            icon: "truck",
            title: "Delivery Logs",
            description: "Manually entered delivery logs.",
            to: "/deliveries",
            isAccessible: canAccessDeliveryLogs,
        },
        {
            icon: 'calendar-plus-o',
            title: 'Manual Logs',
            description: 'Register override time log or delivery log.',
            to: '/manual-logs',
            isAccessible: canAccessManualLogs,
        },
        {
            icon: "gift",
            title: "Pay Periods",
            description: "Manage pay periods.",
            to: "/compensation-and-benefits/pay-periods",
            isAccessible: canAccessPayPeriods,
        },
        {
            icon: "folder",
            title: "Purchase Orders",
            description: "Manage purchase orders.",
            to: "/purchase-orders",
            isAccessible: canAccessPurchaseOrders,
        },
        {
            icon: "folder",
            title: "Sales Invoices",
            description: "Manage sales invoices.",
            to: "/sales-invoices",
            isAccessible: canAccessSalesInvoices,
        },
        {
            icon: "clipboard",
            title: "Stock Cards",
            description: "Manage stock cards.",
            to: "/stock-cards",
            isAccessible: canAccessStockCards,
        },
        {
            icon: "file",
            title: "Reports",
            description: "Generate reports.",
            to: "/reports",
            isAccessible: canAccessReports,
        },
        {

            icon: "signal",
            title: "Trends",
            description: "Store and item trends.",
            to: "/trends",
            isAccessible: canAccessTrends,
        },
        {
            icon: "cogs",
            title: "Settings",
            description: "Application general settings.",
            to: "/settings",
            isAccessible: canAccessSettings,
        },
    ];

    return (
        <>
            <Card className="my-4">
                <Card.Header>
                    <i className="fa fa-dashboard"></i> Dashboard
                </Card.Header>
                <Card.Body>
                    <Row>
                        {options
                            .filter((option) => option.isAccessible)
                            .map((option, key) => <Col key={`dashboard-option-${key}`} md="4">
                                {option.isAccessible}
                                <Option
                                    icon={option.icon}
                                    title={option.title}
                                    description={option.description}
                                    to={option.to} />
                            </Col>)}
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}

export default Dashboard;
