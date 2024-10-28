import { Card, Col, Row } from 'react-bootstrap';
import Option from '../Generic/Option';
import React from 'react';
import { useSelector } from 'react-redux';

const Reports = () => {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');

    // reports permissions
    const allowedToGenerateDeliverySalesMonitoringReport = isSuperAdmin || hasPermission("Generate delivery sales monitoring report");
    const allowedToGenerateDeliveryReceiptMonitoringReport = isSuperAdmin || hasPermission("Generate delivery receipt monitoring report");
    const allowedToGenerateSalesInvoiceMonitoringReport = isSuperAdmin || hasPermission("Generate sales invoice monitoring report");
    const allowedToGenerateStockCardsMonitoringReport = isSuperAdmin || hasPermission("Generate stock cards monitoring report");
    const allowedToGeneratePromodisersSummaryReport = isSuperAdmin || hasPermission("Generate promodisers summary report");
    const allowedToGenerateItemSalesMonitoringReport = isSuperAdmin || hasPermission("Generate item sales monitoring report");
    const allowedToGenerateDeliveryTripsSummaryReport = isSuperAdmin || hasPermission("Generate delivery trips summary report");

    const options = [];

    allowedToGenerateDeliverySalesMonitoringReport && options.push({
        icon: 'file',
        title: 'Delivery Sales',
        description: 'Delivery sales monitoring report.',
        to: '/reports-delivery-sales-monitoring',
    });

    allowedToGenerateDeliveryReceiptMonitoringReport && options.push({
        icon: 'file',
        title: 'Delivery Receipt',
        description: 'Delivery receipt monitoring report.',
        to: '/reports-delivery-receipt-monitoring',
    });

    allowedToGenerateSalesInvoiceMonitoringReport && options.push({
        icon: 'file',
        title: 'Sales Invoice',
        description: 'Sales invoice monitoring report.',
        to: '/reports-sales-invoice-monitoring',
    });

    allowedToGenerateStockCardsMonitoringReport && options.push({
        icon: 'file',
        title: 'Stock Cards',
        description: 'Stock cards monitoring report.',
        to: '/reports-stock-cards-monitoring',
    });

    allowedToGeneratePromodisersSummaryReport && options.push({
        icon: 'id-card',
        title: 'Promodisers',
        description: 'Promodisers summary report.',
        to: '/reports-promodisers-summary',
    });

    allowedToGenerateItemSalesMonitoringReport && options.push({
        icon: 'file',
        title: 'Item Sales',
        description: 'Item sales monitoring report.',
        to: '/reports-item-sales',
    });

    allowedToGenerateDeliveryTripsSummaryReport && options.push({
        icon: 'truck',
        title: 'Delivery Trips',
        description: 'Delivery trips summary report.',
        to: '/reports-delivery-trips-summary',
    });

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
