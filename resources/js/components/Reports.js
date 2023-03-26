import React, { Component } from 'react';


export default class Reports extends Component {
    render() {
        const options = [
            {
                icon: 'file',
                title: 'Delivery Sales Monitoring',
                description: '',
                to: 'reports-delivery-sales-monitoring',
            },
            {
                icon: 'file',
                title: 'Delivery Receipt Monitoring',
                description: '',
                to: 'reports-delivery-receipt-monitoring',
            },
            {
                icon: 'file',
                title: 'Sales Invoice Monitoring',
                description: '',
                to: 'reports-sales-invoice-monitoring',
            },
            {
                icon: 'file',
                title: 'Stock Cards Monitoring',
                description: '',
                to: 'reports-stock-cards-monitoring',
            },
            {
                icon: 'id-card',
                title: 'Promodisers Summary',
                description: '',
                to: 'reports-promodisers-summary',
            },
            {
                icon: 'file',
                title: 'Item Sales Monitoring',
                description: '',
                to: 'reports-item-sales',
            },
            {
                icon: 'delivery',
                title: 'Delivery Trips Summary',
                description: '',
                to: 'reports-delivery-trips-summary',
            },
        ];
        return (
            <div className="container-fluid my-4">

            </div>
        );
    }
}
