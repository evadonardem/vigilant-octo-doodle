import React, { Component } from 'react';
import Option from '../Generic/Option';
import { Col, Row } from 'react-bootstrap';

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
            <Row>
                {options.map(({ icon, title, description, to } = option) =>
                    <Col key={to} md={6}>
                        <Option icon={icon} title={title} description={description} to={to} />
                    </Col>)}
            </Row>
        );
    }
}
