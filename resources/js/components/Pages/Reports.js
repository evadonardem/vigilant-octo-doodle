import { Card, Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';
import React from 'react';

const Reports = () => {
    const options = [
        {
            icon: 'file',
            title: 'Delivery Sales',
            description: 'Delivery sales monitoring report.',
            to: '/reports-delivery-sales-monitoring',
        },
        {
            icon: 'file',
            title: 'Delivery Receipt',
            description: 'Delivery receipt monitoring report.',
            to: '/reports-delivery-receipt-monitoring',
        },
        {
            icon: 'file',
            title: 'Sales Invoice',
            description: 'Sales invoice monitoring report.',
            to: '/reports-sales-invoice-monitoring',
        },
        {
            icon: 'file',
            title: 'Stock Cards',
            description: 'Stock cards monitoring report.',
            to: '/reports-stock-cards-monitoring',
        },
        {
            icon: 'id-card',
            title: 'Promodisers',
            description: 'Promodisers summary report.',
            to: '/reports-promodisers-summary',
        },
        {
            icon: 'file',
            title: 'Item Sales',
            description: 'Item sales monitoring report.',
            to: '/reports-item-sales',
        },
        {
            icon: 'truck',
            title: 'Delivery Trips',
            description: 'Delivery trips summary report.',
            to: '/reports-delivery-trips-summary',
        },
    ];

    return (
        <Card className="my-4">
            <Card.Header as="h5">
                <i className="fa fa-book"></i> Reports
            </Card.Header>
            <Card.Body>
            <Row>
            {options
                .map((option, key) => <Col key={`reports-option-${key}`} md="4">
                    <Option
                        icon={option.icon}
                        title={option.title}
                        description={option.description}
                        to={option.to} />
                </Col>)}
        </Row>
            </Card.Body>
        </Card>
    );
}

export default Reports;
