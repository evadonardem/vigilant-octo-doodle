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
        label: 'Settings',
    },
];

export default function Settings() {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');

    // settings permissions
    const allowedToViewUsersRegistry = isSuperAdmin || hasPermission("View registered user");
    const allowedToViewOvertimeRates = isSuperAdmin;
    const allowedToViewItemsRegistry = isSuperAdmin;
    const allowedToViewStoresRegistry = isSuperAdmin || hasPermission("View registered store");

    const options = [];

    allowedToViewUsersRegistry && options.push({
        icon: "list",
        title: "Users",
        description: 'List of registered users.',
        to: "/settings/users",
    });

    allowedToViewOvertimeRates && options.push({
        icon: "clock-o",
        title: "Overtime Rates",
        description: 'Overtime rates matrix.',
        to: "/settings/overtime-rates",
    });

    allowedToViewItemsRegistry && options.push({
        icon: "list",
        title: "Items Registry",
        description: 'List of registered items.',
        to: "/settings/items-registry",
    });

    allowedToViewStoresRegistry && options.push({
        icon: "shopping-basket",
        title: "Stores",
        description: 'List of registered stores.',
        to: "/settings/stores",
    });

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-cogs"></i> Settings
                </Card.Header>
                <Card.Body>
                    <Row>
                        {options.map(({ icon, title, description, to } = options) => <Col key={to} md={6}>
                            <Option icon={icon} title={title} description={description} to={to} />
                        </Col>)}
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}
