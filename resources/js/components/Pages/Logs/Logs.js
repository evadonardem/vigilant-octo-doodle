import { Card, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import Option from "../../Generic/Option";
import React from 'react';
import Directory from "../../Generic/Directory";

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Logs',
    },
];

const Logs = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canAccessDeliveryLogs = isSuperAdmin || hasPermission("View manual delivery logs");
    const canAccessManualLogs = isSuperAdmin || hasPermission("Create manual delivery logs");

    let options = [
        {
            icon: 'calendar',
            title: 'Attendance Logs',
            description: 'Time logs from biometric device.',
            to: '/attendance-logs',
            isVisible: true,
        },
        {
            icon: 'clock-o',
            title: 'DTR',
            description: 'Consolidated daily time record.',
            to: '/daily-time-record',
            isVisible: true,
        },
        {
            icon: 'truck',
            title: 'Delivery Logs',
            description: 'Manually entered delivery logs.',
            to: '/deliveries',
            isVisible: canAccessDeliveryLogs,
        },
        {
            icon: 'calendar-plus-o',
            title: 'Manual Logs',
            description: 'Register override time log or delivery log.',
            to: '/manual-logs',
            isVisible: canAccessManualLogs,
        },
    ];

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Card className="my-4">
                <Card.Header>
                    <h5><i className="fa fa-clipboard"></i> Logs</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {options
                            .filter(({ isVisible }) => isVisible)
                            .map(({ icon, title, description, to }) =>
                                <Col key={to} md={6}>
                                    <Option key={to} icon={icon} title={title} description={description} to={to} />
                                </Col>)}
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}

export default Logs;
