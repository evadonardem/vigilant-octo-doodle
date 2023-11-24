import { Card, Col, Row } from 'react-bootstrap';
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
        label: 'Payments',
    },
];

const PaymentsDashboard = () => {
    const options = [
        {
            icon: "truck",
            title: "Delivery Receipts Payments",
            description: 'Delivery receipts payments from purchase orders.',
            to: "/payments/delivery-receipts",
        },
    ];

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-money"></i> Payments
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

export default PaymentsDashboard;
