import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';

const Trends = () => {
    const options = [
        {
            icon: 'line-chart',
            title: 'Store Trends',
            description: 'Generate sales, deliveries, and returns trend by store, category, or location.',
            to: '/trends-store',
        },
        {
            icon: 'bar-chart',
            title: 'Item Trends',
            description: 'Generate item sales by store, category, or location.',
            to: '/trends-item',
        },
    ];
    return (
        <>
            <Row>
                {options.map(({ icon, title, description, to } = option) =>
                    <Col key={to} md={6}>
                        <Option icon={icon} title={title} description={description} to={to} />
                    </Col>)}
            </Row>
        </>
    );
}

export default Trends;
