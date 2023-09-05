import { Card, Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';
import React from 'react';
import Directory from '../Generic/Directory';

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
    const options = [
        {
            icon: "users",
            title: "Users Registry",
            description: 'List of registered users.',
            to: "/settings/users",
        },
        {
            icon: "calendar",
            title: "Overtime Rates",
            description: 'Overtime rates matrix.',
            to: "/settings/overtime-rates",
        },
        {
            icon: "list",
            title: "Items Registry",
            description: 'List of registered items.',
            to: "/settings/items-registry",
        },
        {
            icon: "shopping-basket",
            title: "Stores Registry",
            description: 'List of registered stores.',
            to: "/settings/stores",
        },
    ];

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
