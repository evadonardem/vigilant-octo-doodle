import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import React, { Component } from 'react';
import Select from 'react-select';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/reports/delivery-sales-monitoring`;
const DT_DELIVERY_SALES_MONITORING = `table-delivery-sales-monitoring`;
const DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPTS = `table-delivery-sales-monitoring-delivery-receipts`;
const DT_DELIVERY_SALES_MONITORING_DELIVERY_RECEIPT_STORES = `table-delivery-sales-monitoring-delivery-receipt-stores`;

export default class ReportsDeliverySalesMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSelectCsvReportSortBy = this.handleSelectCsvReportSortBy.bind(this);
        this.handleGenerateCsvReport = this.handleGenerateCsvReport.bind(this);

        this.state = {
            searchFilters: null,
            booklets: [],
            csvFilters: null,
            csvSortBy: [
                { value: "", label: "Default" },
                { value: "store", label: "Store" },
                { value: "category", label: "Category" },
                { value: "location", label: "Location" },
            ],
            selectedCsvSortBy: { value: "", label: "Default" },
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
                {
                    data: 'amount',
                    render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                },
            ],
            columnDefs: [
                {
                    targets: [2],
                    className: 'dt-right',
                },
            ],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function (i) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '') * 1
                        : typeof i === 'number' ? i : 0;
                };

                const totalSalesAmount = api
                    .column(2)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const numberFormat = $.fn.dataTable.render.number(',', '.', 2, 'Php').display;
                $(api.column(2).footer()).html(numberFormat(totalSalesAmount));
            },
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
            var row = refDataTable.row(tr);

            if (row.child.isShown()) {
                $(this).find('i').removeClass('fa-chevron-circle-up');
                $(this).find('i').addClass('fa-chevron-circle-down');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $(this).find('i').removeClass('fa-chevron-circle-down');
                $(this).find('i').addClass('fa-chevron-circle-up');
                row.child(format(row.data())).show();
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
                            {
                                data: null,
                                render: function (data, type, row) {
                                    return row.purchase_order
                                        ? `${row.purchase_order.code} (From: ${row.purchase_order.from} To: ${row.purchase_order.to})`
                                        : null;
                                }
                            },
                            {
                                data: 'amount',
                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                            },
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
                            const row = refDataTable.row(tr);
                            if (row.child.isShown()) {
                                $(this).find('i').removeClass('fa-chevron-circle-up');
                                $(this).find('i').addClass('fa-chevron-circle-down');
                                row.child.hide();
                                tr.removeClass('shown');
                            } else {
                                $(this).find('i').removeClass('fa-chevron-circle-down');
                                $(this).find('i').addClass('fa-chevron-circle-up');
                                row.child(formatDeliveryReceiptDetails(row.data())).show();
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
                                            {
                                                data: 'effective_price',
                                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                                            },
                                            {
                                                data: 'amount',
                                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                                            },
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
        const csvFilters = data;

        axios.get(`${END_POINT}?${data}&token=${token}`)
            .then((response) => {
                const { data: booklets, meta } = response.data;
                const { search_filters: searchFilters } = meta;
                self.setState({
                    ...self.state,
                    searchFilters,
                    booklets,
                    csvFilters,
                });
                table.clear();
                table.rows.add(booklets).draw();
            });
    }

    handleSelectCsvReportSortBy(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedCsvSortBy: e,
        });
    }

    handleGenerateCsvReport(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const { csvFilters, selectedCsvSortBy: sortBy } = self.state;
        axios.get(`${END_POINT}?${csvFilters}&generate=csv&sort_by=${sortBy.value}&token=${token}`, {
            responseType: 'arraybuffer',
        })
            .then(response => {
                const filename = response.headers['content-disposition'].split('filename=')[1].split('.')[0];
                const extension = response.headers['content-disposition'].split('.')[1].split(';')[0];
                const blob = new Blob(
                    [response.data],
                    { type: 'text/csv' }
                );
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${filename}.${extension}`;
                link.click();
            });
    }

    render() {
        const {
            booklets,
            searchFilters,
            csvSortBy,
            selectedCsvSortBy,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Delivery Sales Monitoring</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-3">
                        <Form onSubmit={this.handleSearchSubmit}>
                            <Card>
                                <Card.Header>
                                    <i className="fa fa-filter"></i> Search Filters
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="date" name="from" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="date" name="to" />
                                    </Form.Group>
                                    <CommonDropdownSelectSingleStore name="store_id" />
                                </Card.Body>
                                <Card.Footer>
                                    <Button type="submit" className="pull-right">Generate Report</Button>
                                </Card.Footer>
                            </Card>
                        </Form>
                        {booklets.length > 0 &&
                            <Card className="my-4">
                                <Card.Header>
                                    <i className="fa fa-icon fa-download"></i> Export Generated Report
                                </Card.Header>
                                <Card.Body>
                                    <Form.Label>Sort by: </Form.Label>
                                    <Select options={csvSortBy} value={selectedCsvSortBy} onChange={this.handleSelectCsvReportSortBy} /><br />
                                </Card.Body>
                                <Card.Footer>
                                    <Button onClick={this.handleGenerateCsvReport} className="pull-right">Download CSV</Button>
                                </Card.Footer>
                            </Card>}
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
                                <div style={!searchFilters ? { display: 'none' } : null}>
                                    <table className={`table table-striped ${DT_DELIVERY_SALES_MONITORING}`} style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col"></th>
                                                <th scope="col">Booklet No.</th>
                                                <th scope="col">Sales Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                        <tfoot>
                                            <tr>
                                                <th scope="col"></th>
                                                <th scope="col" style={{ textAlign: 'right' }}>Total:</th>
                                                <th scope="col" style={{ textAlign: 'right' }}></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {!searchFilters &&
                                    <p className="text-center">
                                        <i className="fa fa-5x fa-info-circle" /><br />
                                        Start by filtering records to search.
                                    </p>}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
