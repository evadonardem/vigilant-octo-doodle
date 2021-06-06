import React, { Component } from 'react';
import { Breadcrumb, Button, ButtonGroup, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';

const END_POINT = `${apiBaseUrl}/reports/sales-invoices-monitoring`;
const DT_SALES_INVOICES_MONITORING = `table-sales-invoices-monitoring`;
const DT_SALES_INVOICES_MONITORING_INVOICES = `table-sales-invoices-monitoring-invoices`;

const SALES_INVOICES_END_POINT = `${apiBaseUrl}/sales-invoices`;

export default class ReportsSalesInvoiceMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleTotalSalesChange = this.handleTotalSalesChange.bind(this);
        this.handleAddSalesInvoice = this.handleAddSalesInvoice.bind(this);
        this.handleAddSalesInvoiceCancelled = this.handleAddSalesInvoiceCancelled.bind(this);
        this.handleAddSalesInvoiceSubmit = this.handleAddSalesInvoiceSubmit.bind(this);
        this.handleStoreCategoryChange = this.handleStoreCategoryChange.bind(this);

        this.state = {
            token: null,
            searchFilters: null,
            booklets: [],
            isAddSalesInvoice: false,
            selectedCategory: {},
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const { booklets } = self.state;

        self.setState({
            ...self.state,
            token,
        });

        $(`.${DT_SALES_INVOICES_MONITORING}`).DataTable({
            data: booklets,
            buttons: [],
            columns: [
                {
                    className: 'booklet-details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { data: 'id' },
                { data: 'total_sales' },
                { data: 'vat_amount' },
                { data: 'total_sales_less_vat' },
                { data: 'total_amount_due' }
            ],
            ordering: false,
            paging: false,
            searching: false,
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function ( i ) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '')*1
                        : typeof i === 'number' ? i : 0;
                };

                const totalSales = api
                    .column(2)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const vatAmount = api
                    .column(3)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalSalesLessVat = api
                    .column(4)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountDue = api
                    .column(5)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(2).footer()).html(totalSales.toFixed(2));
                $(api.column(3).footer()).html(vatAmount.toFixed(2));
                $(api.column(4).footer()).html(totalSalesLessVat.toFixed(2));
                $(api.column(5).footer()).html(totalAmountDue.toFixed(2));
            }
        });

        const format = (d) => {
            return `<div class="card">
                <div class="card-header">
                    Booklet No. ${d.id}<br/>
                    <span class="badge badge-secondary">Sales Invoices</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped ${DT_SALES_INVOICES_MONITORING_INVOICES}" style="width: 100%">
                        <thead>
                            <tr>
                                <th scope="col">Invoice No.</th>
                                <th scope="col">Sold To</th>
                                <th scope="col">From</th>
                                <th scope="col">To</th>
                                <th scope="col">Total Sales</th>
                                <th scope="col">Less VAT</th>
                                <th scope="col">Amount Net less VAT</th>
                                <th scope="col">Total Amount Due</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(`.${DT_SALES_INVOICES_MONITORING}`)).on('click', 'td.booklet-details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find(`table.${DT_SALES_INVOICES_MONITORING}`)
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
                    const { invoices } = data;
                    tr.next().find(`table.${DT_SALES_INVOICES_MONITORING_INVOICES}`).DataTable({
                        data: invoices,
                        buttons: [],
                        columns: [
                            { data: 'invoice_no' },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return `${row.category.name}`;
                                }
                            },
                            { data: 'from' },
                            { data: 'to' },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return parseFloat(row.total_sales).toFixed(2);
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return parseFloat(row.vat_amount).toFixed(2);
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return parseFloat(row.total_sales_less_vat).toFixed(2);
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return parseFloat(row.total_amount_due).toFixed(2);
                                }
                            },
                        ],
                        ordering: false,
                        paging: false,
                        searching: false,
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
            .find(`table.${DT_SALES_INVOICES_MONITORING}`)
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

    handleTotalSalesChange(e) {
        e.preventDefault();
        const self = this;
        const vatRate = $(e.currentTarget).closest('form').find('[name="vat_rate"]').val();
        const vatAmount = parseFloat(+$(e.currentTarget).val() * vatRate).toFixed(2);
        const totalSalesLessVat = parseFloat(+$(e.currentTarget).val() - vatAmount).toFixed(2);
        const totalAmountDue = parseFloat(totalSalesLessVat + vatAmount).toFixed(2);
        $(e.currentTarget).closest('form').find('[name="vat_amount"]').val(vatAmount);
        $(e.currentTarget).closest('form').find('[name="total_sales_less_vat"]').val(totalSalesLessVat);
        $(e.currentTarget).closest('form').find('[name="total_amount_due"]').val(totalAmountDue);
    }

    handleAddSalesInvoice(e) {
        const self = this;

        self.setState({
            ...self.state,
            isAddSalesInvoice: true,
        });
    }

    handleAddSalesInvoiceCancelled(e) {
        const self = this;

        self.setState({
            ...self.state,
            isAddSalesInvoice: false,
        });
    }

    handleAddSalesInvoiceSubmit(e) {
        e.preventDefault();
        const self = this;
        const { token } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();

        axios.post(`${SALES_INVOICES_END_POINT}?token=${token}`, data)
            .then((response) => {
                self.setState({
                    ...self.state,
                    searchFilters: null,
                    isAddSalesInvoice: false,
                });
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleStoreCategoryChange(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedCategory: e
        })
    }

    render() {
        const {
            searchFilters,
            isAddSalesInvoice,
            selectedCategory,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Sales Invoice Monitoring</Breadcrumb.Item>
                </Breadcrumb>
                {
                    isAddSalesInvoice &&
                    <Card>
                        <Card.Header>
                            <i className="fa fa-file"></i> Add Sales Invoice
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={this.handleAddSalesInvoiceSubmit}>
                                <div className="row">
                                    <div className="col-md-3">
                                        <Form.Group>
                                            <Form.Label>Date Countered:</Form.Label>
                                            <Form.Control type="date" name="date_countered"/>
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <Form.Group>
                                                            <Form.Label>Booklet No.:</Form.Label>
                                                            <Form.Control type="text" name="booklet_no"/>
                                                            <div className="invalid-feedback"></div>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <Form.Group>
                                                            <Form.Label>Invoice No.:</Form.Label>
                                                            <Form.Control type="text" name="invoice_no"/>
                                                            <div className="invalid-feedback"></div>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <CommonDropdownSelectSingleStoreCategory
                                                            label="Sold To:"
                                                            name="category_id"
                                                            handleChange={this.handleStoreCategoryChange}
                                                            selectedCategory={selectedCategory}/>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>From:</Form.Label>
                                                            <Form.Control type="date" name="from"/>
                                                            <div className="invalid-feedback"></div>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>To:</Form.Label>
                                                            <Form.Control type="date" name="to"/>
                                                            <div className="invalid-feedback"></div>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                                <Form.Group>
                                                    <Form.Label>Total Sales:</Form.Label>
                                                    <Form.Control type="number" step="any" name="total_sales" onChange={this.handleTotalSalesChange}/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <Form.Group>
                                                    <Form.Label>Less VAT:</Form.Label>
                                                    <Form.Control type="hidden" name="vat_rate" value="0.10715"/>
                                                    <Form.Control type="number" step="any" name="vat_amount" readOnly/>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label>Amount Net less VAT:</Form.Label>
                                                    <Form.Control type="number" step="any" name="total_sales_less_vat" readOnly/>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label>Total Amount of Due:</Form.Label>
                                                    <Form.Control type="number" step="any" name="total_amount_due" readOnly/>
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                                <hr className="my-4"/>
                                <ButtonGroup className="pull-right">
                                    <Button type="submit">Add</Button>
                                    <Button type="button" variant="secondary" onClick={this.handleAddSalesInvoiceCancelled}>Cancel</Button>
                                </ButtonGroup>
                            </Form>
                        </Card.Body>
                    </Card>
                }
                <div className="row my-4" style={!isAddSalesInvoice ? null : {display: 'none'}}>
                    <div className="col-md-3">
                        <Card>
                            <Card.Body>
                                <Button type="button" block onClick={this.handleAddSalesInvoice}>Add Sales Invoice</Button>
                            </Card.Body>
                        </Card>
                        <Card className="my-4">
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
                                    <CommonDropdownSelectSingleStoreCategory
                                        label="Sold To:"
                                        name="category_id"
                                        handleChange={this.handleStoreCategoryChange}
                                        selectedCategory={selectedCategory}/>
                                    <hr className="my-4"/>
                                    <Button type="submit" block>Generate Report</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-9">
                        <Card>
                            {
                                searchFilters &&
                                <Card.Header>
                                    <h4>Sales Invoice Monitoring</h4>
                                    {searchFilters.store ? `${searchFilters.store.name}` : `All Stores`} | From: {searchFilters.from} To: {searchFilters.to}
                                </Card.Header>
                            }
                            <Card.Body>
                                <div style={!searchFilters ? {display: 'none'} : null}>
                                    <table className={`table table-striped ${DT_SALES_INVOICES_MONITORING}`} style={{width: 100+'%'}}>
                                        <thead>
                                            <tr>
                                                <th scope="col"></th>
                                                <th scope="col">Booklet No.</th>
                                                <th scope="col">Total Sales</th>
                                                <th scope="col">Less VAT</th>
                                                <th scope="col">Amount Net less VAT</th>
                                                <th scope="col">Total Amount Due</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                        <tfoot>
                                            <tr>
                                                <th></th>
                                                <th>Total:</th>
                                                <th>0.00</th>
                                                <th>0.00</th>
                                                <th>0.00</th>
                                                <th>0.00</th>
                                            </tr>
                                        </tfoot>
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
