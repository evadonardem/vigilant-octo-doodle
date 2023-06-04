import { Breadcrumb, Card, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import Option from "../../Generic/Option";
import React from 'react';

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
    const { roles } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    let allowedAccess = hasRole("Super Admin");

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
            title: 'Daily Time Record',
            description: 'Consolidated daily time record.',
            to: '/daily-time-record',
            isVisible: true,
        },
        {
            icon: 'truck',
            title: 'Delivery Logs',
            description: 'Manually entered delivery logs.',
            to: '/deliveries',
            isVisible: allowedAccess,
        },
        {
            icon: 'calendar-plus-o',
            title: 'Manual Logs',
            description: 'Register override time log or delivery log.',
            to: '/manual-logs',
            isVisible: allowedAccess,
        },
    ];

    return (
        <>
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-clipboard"></i> Logs
                </Card.Header>
                <Card.Body>
                    <Breadcrumb>
                        {
                            BREADCRUMB_ITEMS.map(({ icon, label, link }, key) =>
                                <Breadcrumb.Item key={key} href={link ?? ''} active={!link}>
                                    <span>
                                        <i className={`fa ${icon}`}></i>
                                        {label}
                                    </span>
                                </Breadcrumb.Item>
                            )
                        }
                    </Breadcrumb>
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
