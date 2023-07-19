import { Card, Col, Row } from 'react-bootstrap';
import React from 'react';
import Directory from '../../Generic/Directory';
import Option from '../../Generic/Option';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Warehouse',
    },
];

export default function WarehouseMain() {
    const options = [
        {
            icon: "building",
            title: "Consumable Items",
            description: 'Consumable items inventory from purchasing department.',
            to: "/warehouse/consumable-items",
        },
        {
            icon: "building",
            title: "Finished Goods",
            description: 'Finished goods inventory from production department.',
            to: "/warehouse/finished-goods",
        },
    ];

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-building"></i> Warehouse
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
