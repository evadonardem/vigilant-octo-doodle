import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Option from '../Generic/Option';

const Dashboard = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const isSuperAdmin = hasRole("Super Admin");
    const canAccessPurchaseOrders = isSuperAdmin ||
        hasPermission("Create purchase order") ||
        hasPermission("Update purchase order") ||
        hasPermission("View purchase order");
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
            title: "Daily Time Record",
            description: "Consolidated daily time record.",
            to: "/attendance-logs",
            isAccessible: true,
        },
        {
            icon: "folder",
            title: "Purchase Orders",
            description: "Manage purchase orders.",
            to: "/purchase-orders",
            isAccessible: canAccessPurchaseOrders,
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
                .map((option, key) => <Col key={`dashboard-option-${key}`} md="6">
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
