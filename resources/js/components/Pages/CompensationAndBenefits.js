import { Card, Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';
import React, { Component } from 'react';
import Directory from '../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Compensation and Benefits',
    },
];

export default class CompensationAndBenefits extends Component {
    render() {
        const options = [
            {
                icon: 'address-card-o',
                title: 'Pay Periods',
                description: 'Semi-monthly pay periods.',
                to: '/compensation-and-benefits/pay-periods',
            },
            {
                icon: 'gift',
                title: '13th Month Pay',
                description: 'Annual 13th month pay periods.',
                to: '/compensation-and-benefits/thirteenth-month-pay-periods',
            },
        ];

        return (
            <>
                <Directory items={BREADCRUMB_ITEMS} />
                <Card className="my-4">
                    <Card.Header as="h5">
                        <i className="fa fa-gift"></i> Compensation and Benefits
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            {options.map(({ icon, title, description, to } = option) =>
                                <Col key={to} md={6}>
                                    <Option icon={icon} title={title} description={description} to={to} />
                                </Col>)}
                        </Row>
                    </Card.Body>
                </Card>
            </>
        );
    }
}
