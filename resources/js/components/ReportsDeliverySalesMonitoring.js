import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';

const END_POINT = `${apiBaseUrl}/reports/delivery-sales-monitoring`;
const DT_DELIVERY_SALES_MONITORING = `table-delivery-sales-monitoring`;
const DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS = `table-delivery-sales-monitoring-delivery-receipts`;
const DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPT_STORES = `table-delivery-sales-monitoring-delivery-receipt-stores`;

export default class ReportsDeliverySalesMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);

        this.state = {
            searchFilters: null,
            booklets: [],
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const { booklets } = self.state;

        $(`.${DT_DELIVERY_SALES_MONITORING}`).DataTable({
            data: booklets,
            buttons: [],
            columns: [
                {
                    className: 'booklet-details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { data: 'id' },
                { data: 'amount' }
            ],
            ordering: false,
            paging: false,
            searching: false,
        });

        const format = (d) => {
            return `<div class="card">
                <div class="card-header">
                    Booklet No. ${d.id}<br/>
                    <span class="badge badge-secondary">Delivery Receipts</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped ${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS}" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col"></th>
                            <th scope="col">Delivery Receipt No.</th>
                            <th scope="col">Purchase Order</th>
                            <th scope="col">Sales Amount</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>`;
        };

        const formatDeliveryReceiptDetails = (d) => {

            const stores = d.stores.map((store) => {
                return `<p class="mb-0">${store.code} ${store.name}</p>
                    <table class="table table-striped ${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPT_STORES}-${store.id}" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col">Code</th>
                            <th scope="col">Name</th>
                            <th scope="col">Quantity (Actual)</th>
                            <th scope="col">Price</th>
                            <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>`;
            });

            return `<div class="card">
                <div class="card-header">
                    Delivery Receipt No. ${d.id}<br/>
                    <span class="badge badge-secondary">Store Items</span>
                </div>
                <div class="card-body">
                    ${stores.join('')}
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(`.${DT_DELIVERY_SALES_MONITORING}`)).on('click', 'td.booklet-details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find(`table.${DT_DELIVERY_SALES_MONITORING}`)
                .DataTable();
            var tr = $(this).closest('tr');
            var row = refDataTable.row( tr );

            if ( row.child.isShown() ) {
                $(this).find('i').removeClass('fa-chevron-circle-up');
                $(this).find('i').addClass('fa-chevron-circle-down');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $(this).find('i').removeClass('fa-chevron-circle-down');
                $(this).find('i').addClass('fa-chevron-circle-up');
                row.child( format(row.data()) ).show();
                tr.addClass('shown');
                if (row.child.isShown()) {
                    const data = row.data();
                    const { deliveryReceipts } = data;
                    tr.next().find(`table.${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS}`).DataTable({
                        data: deliveryReceipts,
                        buttons: [],
                        columns: [
                            {
                                className: 'delivery-receipt-details-control text-center',
                                data: null,
                                defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                            },
                            { data: 'id' },
                            { data: 'purchase_order.code' },
                            { data: 'amount' },
                        ],
                        ordering: false,
                        paging: false,
                        searching: false,
                    });
                    tr.next()
                        .find(`table.${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS}`)
                        .off()
                        .on('click', 'td.delivery-receipt-details-control', function () {
                            const refDataTable = $('.data-table-wrapper')
                                .find(`table.${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS}`)
                                .DataTable();
                            const tr = $(this).closest('tr');
                            const row = refDataTable.row( tr );
                            if ( row.child.isShown() ) {
                                $(this).find('i').removeClass('fa-chevron-circle-up');
                                $(this).find('i').addClass('fa-chevron-circle-down');
                                row.child.hide();
                                tr.removeClass('shown');
                            } else {
                                $(this).find('i').removeClass('fa-chevron-circle-down');
                                $(this).find('i').addClass('fa-chevron-circle-up');
                                row.child( formatDeliveryReceiptDetails(row.data()) ).show();
                                tr.addClass('shown');

                                const data = row.data();
                                const { stores } = data;

                                stores.map((store) => {
                                    tr.next().find(`table.${DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPT_STORES}-${store.id}`).DataTable({
                                        data: store.items,
                                        buttons: [],
                                        columns: [
                                            { data: 'code' },
                                            { data: 'name' },
                                            { data: 'quantity_actual' },
                                            { data: 'effective_price' },
                                            { data: 'amount' },
                                        ],
                                        ordering: false,
                                        paging: false,
                                        searching: false,
                                    });
                                });
                            }
                        });
                }
            }
        });
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const table = $('.data-table-wrapper')
            .find(`table.${DT_DELIVERY_SALES_MONITORING}`)
            .DataTable();
        const data = $(e.currentTarget).serialize();

        axios.get(`${END_POINT}?${data}&token=${token}`)
            .then((response) => {
                const { data: booklets, meta } = response.data;
                const { search_filters: searchFilters } = meta;
                self.setState({
                    ...self.state,
                    searchFilters,
                    booklets
                });
                table.clear();
                table.rows.add(booklets).draw();
            });
    }

    render() {
        const {
            searchFilters,
            booklets,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Delivery Sales Monitoring</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-3">
                        <Card>
                            <Card.Header>
                                <i className="fa fa-filter"></i> Search Filters
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSearchSubmit}>
                                    <Form.Group>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="date" name="from"/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="date" name="to"/>
                                    </Form.Group>
                                    <CommonDropdownSelectSingleStore name="store_id"/>
                                    <hr className="my-4"/>
                                    <Button type="submit">Generate Report</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-9">
                        <Card>
                            {
                                searchFilters &&
                                <Card.Header>
                                    <h4>Delivery Sales Monitoring</h4>
                                    {searchFilters.store ? `(${searchFilters.store.code}) ${searchFilters.store.name}` : `All Stores`} | From: {searchFilters.from} To: {searchFilters.to}
                                </Card.Header>
                            }
                            <Card.Body>
                                <div style={!searchFilters ? {display: 'none'} : null}>
                                    <table className={`table table-striped ${DT_DELIVERY_SALES_MONITORING}`} style={{width: 100+'%'}}>
                                        <thead>
                                            <tr>
                                            <th scope="col"></th>
                                            <th scope="col">Booklet No.</th>
                                            <th scope="col">Sales Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                                { !searchFilters &&
                                    <Jumbotron className="mb-0">
                                        <p className="text-center">
                                            <i className="fa fa-5x fa-info-circle"/><br/>
                                            Start by filtering records to search.
                                        </p>
                                    </Jumbotron>
                                }
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
