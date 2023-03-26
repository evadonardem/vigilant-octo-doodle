import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ButtonGroup } from 'react-bootstrap';
import { Breadcrumb, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import cookie from 'react-cookies';

import CommonDeleteModal from './CommonDeleteModal';

const END_POINT = `${apiBaseUrl}/sales-invoices`;
const SALES_INVOICES_TABLE = 'table-sales-invoices';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-folder',
        label: 'Sales Invoices',
    },
];

export default class SalesInvoices extends Component {
    constructor(props) {
        super(props);
        this.handleCloseDeleteSalesInvoiceModal = this.handleCloseDeleteSalesInvoiceModal.bind(this);
        this.handleSubmitDeleteSalesInvoiceModal = this.handleSubmitDeleteSalesInvoiceModal.bind(this);

        this.state = {
            token: '',
            showDeleteSalesInvoiceModal: false,
            salesInvoiceId: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        self.setState({
            ...self.state,
            token,
        });

        $(`.${SALES_INVOICES_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?filters[status]=1&token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;

                    return data;
                },
            },
            buttons: [],
            ordering: false,
            processing: true,
            serverSide: true,
            columns: [
                { 'data': 'date_countered' },
                { 'data': 'from' },
                { 'data': 'to' },
                { 'data': 'booklet_no' },
                { 'data': 'invoice_no' },
                { 'data': 'category.name' },
                { 'data': 'total_sales' },
                { 'data': 'vat_amount' },
                { 'data': 'total_sales_less_vat' },
                { 'data': 'total_amount_due' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-sales-invoice-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-sales-invoice-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `<div class="btn-group" role="group">
                            ${openBtn}
                            ${deleteBtn}
                        </div>`;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: [6, 7, 8, 9],
                    createdCell: (td, cellData, rowData, row, col) =>
                        ReactDOM.render(<NumberFormat
                            value={cellData}
                            displayType="text"
                            prefix="Php"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator/>, td),
                    className: "text-right",
                },
            ],
        });

        $(document).on('click', '.data-table-wrapper .open', function(e) {
            e.preventDefault();
            const salesInvoiceId = e.currentTarget.getAttribute('data-sales-invoice-id');
            location.href = `${appBaseUrl}/#/sales-invoice-details/${salesInvoiceId}`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const salesInvoiceId = e.currentTarget.getAttribute('data-sales-invoice-id');
            self.setState({
                showDeleteSalesInvoiceModal: true,
                salesInvoiceId,
            });
        });
    }

    handleCloseDeleteSalesInvoiceModal() {
        const self = this;
        self.setState({
            ...self.state,
            showDeleteSalesInvoiceModal: false,
            salesInvoiceId: null,
        });
    }

    handleSubmitDeleteSalesInvoiceModal(e) {
        e.preventDefault();

        const self = this;
        const { token, salesInvoiceId } = self.state;
        const table = $('.data-table-wrapper').find(`table.${SALES_INVOICES_TABLE}`).DataTable();

        axios.delete(`${END_POINT}/${salesInvoiceId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    showDeleteSalesInvoiceModal: false,
                    salesInvoiceId: null,
                });
            })
            .catch((error) => {

            });
    }

    render() {
        const {
            showDeleteSalesInvoiceModal,
            salesInvoiceId,
        } = this.state;


        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    {
                        BREADCRUMB_ITEMS.map(({icon, label} = item) =>
                            <Breadcrumb.Item active>
                                <span>
                                    <i className={`fa ${icon}`}></i>&nbsp;
                                    {label}
                                </span>
                            </Breadcrumb.Item>
                        )
                    }
                </Breadcrumb>
                <Card className="mt-4">
                    <Card.Body>
                        <table className={`table table-striped ${SALES_INVOICES_TABLE}`} style={{width: 100+'%'}}>
                            <thead>
                                <tr>
                                    <th scope="col">Date Countered</th>
                                    <th scope="col">From</th>
                                    <th scope="col">To</th>
                                    <th scope="col">Booklet No.</th>
                                    <th scope="col">Invoice No.</th>
                                    <th scope="col">Sold To</th>
                                    <th scope="col">Total Sales</th>
                                    <th scope="col">Less VAT</th>
                                    <th scope="col">Amount Net Less VAT</th>
                                    <th scope="col">Total Amount Due</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </Card.Body>
                    <Card.Footer>
                        <div className="row">
                            <div className="col-md-12">
                                <ButtonGroup>
                                    <Link to={'sales-invoices-create'}>
                                        <Button>
                                            <i className="fa fa-file"></i> Create Sales Invoice
                                        </Button>
                                    </Link>
                                </ButtonGroup>
                            </div>
                        </div>
                    </Card.Footer>
                </Card>
                <CommonDeleteModal
                    isShow={showDeleteSalesInvoiceModal}
                    headerTitle="Delete Sales Invoice"
                    bodyText={`Are you sure to delete Sales Invoice Id: ${salesInvoiceId}?`}
                    handleClose={this.handleCloseDeleteSalesInvoiceModal}
                    handleSubmit={this.handleSubmitDeleteSalesInvoiceModal}/>
            </div>
        );
    }
}
