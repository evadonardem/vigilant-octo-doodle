import { Card, Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';
import React from 'react';
import Directory from '../Generic/Directory';
import { useSelector } from 'react-redux';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Trends',
    },
];

const Trends = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canGenerateStoreTrend = isSuperAdmin || hasPermission("Generate store trend");
    const canGenerateItemTrend = isSuperAdmin || hasPermission("Generate item trend");

    const options = [
        {
            icon: 'line-chart',
            title: 'Store Trends',
            description: 'Generate sales, deliveries, and returns trend by store, category, or location.',
            to: '/trends-store',
            isAccessible: canGenerateStoreTrend,
        },
        {
            icon: 'bar-chart',
            title: 'Item Trends',
            description: 'Generate item sales by store, category, or location.',
            to: '/trends-item',
            isAccessible: canGenerateItemTrend,
        },
    ];
    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-signal"></i> Trends
                </Card.Header>
                <Card.Body>
                    <Row>
                        {options
                            .filter((option) => option.isAccessible)
                            .map(({ icon, title, description, to }) =>
                                <Col key={to} md={6}>
                                    <Option icon={icon} title={title} description={description} to={to} />
                                </Col>)}
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}

export default Trends;
