import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cookie from 'react-cookies';
import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';

import CommonDeleteModal from './CommonDeleteModal';
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';

const END_POINT = `${apiBaseUrl}/sales-invoices`;
const SALES_INVOICE_ITEMS_TABLE = 'table-sales-invoice-items';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-folder',
        label: 'Sales Invoices',
        link: '#/sales-invoices'
    },
    {
        icon: '',
        label: '{salesInvoiceId}',
    },
];

export default class SalesInvoicesShow extends Component {
    constructor(props) {
        super(props);

        this.handleCloseDeleteSalesInvoiceItemModal = this.handleCloseDeleteSalesInvoiceItemModal.bind(this);
        this.handleSubmitDeleteSalesInvoiceItem = this.handleSubmitDeleteSalesInvoiceItem.bind(this);

        this.state = {
            token: '',
            salesInvoice: null,
            selectedCategory: null,        
            deleteSalesInvoiceItem: {
                showConfirmation: false,
                salesInvoiceItemId: null,
            }
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { salesInvoiceId } = params;

        self.setState({
            ...self.state,
            token,
            salesInvoiceId,
        });
        
        axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
            .then((response) => {
                const { data: salesInvoice } = response.data;
                self.setState({
                    ...self.state,
                    salesInvoice,
                    selectedCategory: {
                        value: salesInvoice.category.id,
                        label: salesInvoice.category.name,
                    },
                });

                $(`.${SALES_INVOICE_ITEMS_TABLE}`).DataTable({
                    ajax: {
                        type: 'get',
                        url: `${END_POINT}/${salesInvoiceId}/items?token=${token}`,
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
                    searching: false,
                    columns: [
                        { 'data': 'store.name' },
                        { 'data': 'item.name' },
                        { 'data': 'quantity' },
                        { 'data': 'price' },
                        { 'data': 'total_amount' },
                        {
                            'data': null,
                            'render': function (data, type, row) {                    
                                const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-sales-invoice-item-id="' + row.id + '"><i class="fa fa-trash"></i></a>';
                                return `<div class="btn-group" role="group">                        
                                    ${deleteBtn}
                                </div>`;
                            }
                        }
                    ],
                    columnDefs: [
                        {
                            targets: [2],
                            createdCell: (td, cellData, rowData, row, col) => 
                                ReactDOM.render(<NumberFormat
                                    value={cellData}
                                    displayType="text"                                
                                    thousandSeparator/>, td),
                            className: "text-right",
                        },
                        {
                            targets: [3, 4],
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
        
                $(document).on('click', '.data-table-wrapper .delete', function(e) {
                    const salesInvoiceItemId = e.currentTarget.getAttribute('data-sales-invoice-item-id');
                    self.setState({
                        ...self.state,
                        deleteSalesInvoiceItem: {
                            ...self.state.deleteSalesInvoiceItem,
                            showConfirmation: true,
                            salesInvoiceItemId
                        }
                    });
                });

            })
            .catch(() => {
                
            });
    }

    handleCloseDeleteSalesInvoiceItemModal() {
        const self = this;
        self.setState({
            ...self.state,
            deleteSalesInvoiceItem: {
                ...self.state.deleteSalesInvoiceItem,
                showConfirmation: false,
                salesInvoiceItemId: null,
            },
        });
    }

    handleSubmitDeleteSalesInvoiceItem(e) {
        e.preventDefault();

        const self = this;
        const {
            token,
            salesInvoiceId,
            deleteSalesInvoiceItem,
        } = self.state;
        const {
            salesInvoiceItemId,
        } = deleteSalesInvoiceItem;
        const table = $('.data-table-wrapper').find(`table.${SALES_INVOICE_ITEMS_TABLE}`).DataTable();

        axios.delete(`${END_POINT}/${salesInvoiceId}/items/${salesInvoiceItemId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    deleteSalesInvoiceItem: {
                        ...self.state.deleteSalesInvoiceItem,
                        showConfirmation: false,
                        salesInvoiceItemId: null,
                    },      
                });
                
                axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
                    .then((response) => {
                        const { data: salesInvoice } = response.data;
                        self.setState({
                            ...self.state,
                            salesInvoice,
                            selectedCategory: {
                                value: salesInvoice.category.id,
                                label: salesInvoice.category.name,
                            },
                        });
                    })
                    .catch(() => {

                    });
            })
            .catch((error) => {
                
            });
    }

    render() {
        const {
            salesInvoice,
            selectedCategory,
            deleteSalesInvoiceItem,
        } = this.state;
        const {
            showConfirmation,
        } = deleteSalesInvoiceItem;


        return (
            <div className="container-fluid my-4">
                { salesInvoice &&
                    <>
                        <Breadcrumb>
                            {
                                BREADCRUMB_ITEMS.map(({icon, label, link} = item) =>
                                    <Breadcrumb.Item href={link ?? ''} active={!Boolean(link)}>
                                        <span>
                                            <i className={`fa ${icon}`}></i>&nbsp;
                                            {label.replace('{salesInvoiceId}', salesInvoice.id)}
                                        </span>
                                    </Breadcrumb.Item>
                                )
                            }
                        </Breadcrumb>
                        <Card>
                            <Card.Header>
                                <p>
                                    <Badge variant='primary'>SI: {salesInvoice.id}</Badge>
                                </p>
                                <h4>Sales Invoice &raquo; Details</h4>
                            </Card.Header>
                            <Card.Body>
                                <Card>
                                    <Card.Header>
                                        <i className="fa fa-info-circle"></i> General Info
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <Form.Group>
                                                    <Form.Label>Date Countered:</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="date_countered"
                                                        defaultValue={salesInvoice.date_countered}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label>From:</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="from"
                                                        defaultValue={salesInvoice.from}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label>To:</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="to"
                                                        defaultValue={salesInvoice.to}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <Form.Group>
                                                    <Form.Label>Booklet No.:</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="booklet_no"
                                                        defaultValue={salesInvoice.booklet_no}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-3">
                                                <Form.Group>
                                                    <Form.Label>Invoice No.:</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="invoice_no"
                                                        defaultValue={salesInvoice.invoice_no}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <CommonDropdownSelectSingleStoreCategory
                                                    label="Sold To:"
                                                    name="category_id"
                                                    handleChange={this.handleStoreCategoryChange}
                                                    selectedValue={selectedCategory}
                                                    readOnly/>
                                            </div>
                                        </div>                                        
                                    </Card.Body>
                                </Card>
                                <Card className="mt-4">
                                    <Card.Header>
                                        <i className="fa fa-list"></i> Items
                                    </Card.Header>
                                    <Card.Body>
                                        <Link to={`/sales-invoice-store-items/${salesInvoice.id}`}>
                                            <Button>
                                                <i className='fa fa-plus-circle'></i> Store Items
                                            </Button>
                                        </Link>
                                        <table className={`table table-striped ${SALES_INVOICE_ITEMS_TABLE}`} style={{width: 100+'%'}}>
                                            <thead>
                                                <tr>
                                                    <th scope="col">Store</th>
                                                    <th scope="col">Item</th>                            
                                                    <th scope="col">Quantity</th>
                                                    <th scope="col">Price</th>
                                                    <th scope="col">Total Amount</th>                                                
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                        <hr/>
                                        <table className="table table-striped" style={{width: 50+'%'}}>
                                            <tbody>
                                                <tr>
                                                    <th>Total Sales</th>
                                                    <td>:</td>
                                                    <td align="right">
                                                        <NumberFormat
                                                            value={salesInvoice.total_sales}
                                                            displayType="text"
                                                            prefix="Php"
                                                            decimalScale="2"
                                                            fixedDecimalScale
                                                            thousandSeparator/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Less VAT</th>
                                                    <td>:</td>
                                                    <td align="right">
                                                        <NumberFormat
                                                            value={salesInvoice.vat_amount}
                                                            displayType="text"
                                                            prefix="Php"
                                                            decimalScale="2"
                                                            fixedDecimalScale
                                                            thousandSeparator/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Amount Net Less VAT</th>
                                                    <td>:</td>
                                                    <td align="right">
                                                        <NumberFormat
                                                            value={salesInvoice.total_sales_less_vat}
                                                            displayType="text"
                                                            prefix="Php"
                                                            decimalScale="2"
                                                            fixedDecimalScale
                                                            thousandSeparator/>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Total Amount Due</th>
                                                    <td>:</td>
                                                    <td align="right">                                                                
                                                        <NumberFormat
                                                            value={salesInvoice.total_amount_due}
                                                            displayType="text"
                                                            prefix="Php"
                                                            decimalScale="2"
                                                            fixedDecimalScale
                                                            thousandSeparator/>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                        <CommonDeleteModal
                            isShow={showConfirmation}
                            headerTitle="Delete Sales Invoice Item"
                            bodyText={`Are you sure to delete sale invoice item?`}
                            handleClose={this.handleCloseDeleteSalesInvoiceItemModal}
                            handleSubmit={this.handleSubmitDeleteSalesInvoiceItem}/>
                    </>
                }
            </div>
        );
    }
}
