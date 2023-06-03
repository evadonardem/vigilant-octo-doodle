import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Option from '../Generic/Option';

const Dashboard = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const isSuperAdmin = hasRole("Super Admin");
    const canAccessPayPeriods = isSuperAdmin;
    const canAccessPurchaseOrders = isSuperAdmin ||
        hasPermission("Create purchase order") ||
        hasPermission("Update purchase order") ||
        hasPermission("View purchase order");
    const canAccessSalesInvoices = isSuperAdmin;
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
    );
}

export default Dashboard;
