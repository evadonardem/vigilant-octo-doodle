import { Button, Card, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import { createRoot } from 'react-dom/client';
import CommonDeleteModal from '../../CommonDeleteModal';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import Loader from '../../Generic/Loader';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import { useSelector } from 'react-redux';
import Directory from '../../Generic/Directory';

const END_POINT = `${apiBaseUrl}/sales-invoices`;
const SALES_INVOICE_ITEMS_TABLE = 'table-sales-invoice-items';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Sales Invoices',
        link: '#/sales-invoices'
    },
    {
        icon: '',
        label: '{salesInvoiceId}',
    },
];

const SalesInvoicesShow = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canUpdateSalesInvoice = isSuperAdmin || hasPermission("Update sales invoice");

    const token = cookie.load('token');
    const params = useParams();
    const { salesInvoiceId } = params;
    const [salesInvoice, setSalesInvoice] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleteSalesInvoiceItem, setDeleteSalesInvoiceItem] = useState({
        showConfirmation: false,
        salesInvoiceItemId: null,
    });
    const [salesInvoiceItemsDataTable, setSalesInvoiceItemsDataTable] = useState(null);

    const handleCloseDeleteSalesInvoiceItemModal = () => {
        setDeleteSalesInvoiceItem({
            showConfirmation: false,
            salesInvoiceItemId: null,
        });
    };

    const handleSubmitDeleteSalesInvoiceItem = (e) => {
        e.preventDefault();
        const { salesInvoiceItemId } = deleteSalesInvoiceItem;
        const table = $('.data-table-wrapper').find(`table.${SALES_INVOICE_ITEMS_TABLE}`).DataTable();

        axios.delete(`${END_POINT}/${salesInvoiceId}/items/${salesInvoiceItemId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                setDeleteSalesInvoiceItem({
                    showConfirmation: false,
                    salesInvoiceItemId: null,
                });

                axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
                    .then((response) => {
                        const { data: salesInvoice } = response.data;
                        setSalesInvoice(salesInvoice);
                        setSelectedCategory({
                            value: salesInvoice.category.id,
                            label: salesInvoice.category.name,
                        });
                    })
                    .catch(() => { });
            })
            .catch(() => { });
    };

    const initSalesInvoiceItemsDataTable = (currentSalesInvoice, currentSalesInvoiceItemsDataTable) => {
        if (salesInvoice && !currentSalesInvoiceItemsDataTable) {
            const dataTable = $(`.${SALES_INVOICE_ITEMS_TABLE}`).DataTable({
                ajax: {
                    type: 'get',
                    url: `${END_POINT}/${salesInvoiceId}/items?token=${token}`,
                    dataFilter: (data) => {
                        let json = JSON.parse(data);
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
                        createdCell: (td, cellData, _rowData, _row, _col) => {
                            const root = createRoot(td);
                            root.render(<NumericFormat
                                value={cellData}
                                displayType="text"
                                thousandSeparator />);
                        },
                        className: "text-right",
                    },
                    {
                        targets: [3, 4],
                        createdCell: (td, cellData, _rowData, _row, _col) => {
                            const root = createRoot(td);
                            root.render(<NumericFormat
                                value={cellData}
                                displayType="text"
                                prefix="Php"
                                decimalScale="2"
                                fixedDecimalScale
                                thousandSeparator />);
                        },
                        className: "text-right",
                    },
                ],
                drawCallback: function () {
                    if (!canUpdateSalesInvoice) {
                        $(document).find('.data-table-wrapper .delete').remove();
                    }
                },
            });

            $(document).on('click', '.data-table-wrapper .delete', function (e) {
                e.preventDefault();
                const salesInvoiceItemId = e.currentTarget.getAttribute('data-sales-invoice-item-id');
                setDeleteSalesInvoiceItem({
                    showConfirmation: true,
                    salesInvoiceItemId
                });
            });

            setSalesInvoiceItemsDataTable(dataTable);
        }
    };

    const init = () => {
        axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
            .then((response) => {
                const { data: salesInvoice } = response.data;
                setSalesInvoice(salesInvoice);
                setSelectedCategory({
                    value: salesInvoice.category.id,
                    label: salesInvoice.category.name,
                });
            })
            .catch(() => { });
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        initSalesInvoiceItemsDataTable(salesInvoice, salesInvoiceItemsDataTable);
    }, [salesInvoice, salesInvoiceItemsDataTable]);

    const { showConfirmation } = deleteSalesInvoiceItem;

    const items = salesInvoice ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{salesInvoiceId}', `Sales Invoice No. ${salesInvoice.id}`);
        return item;
    }) : [];

    return (
        <>
            {!salesInvoice && <Loader />}

            {items && salesInvoice && <>
                <Directory items={items}/>
                <Card className="my-4">
                    <Card.Header as="h5">
                        <i className="fa fa-file"></i> Sales Invoice No. {salesInvoice.id}
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
                                                readOnly />
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
                                                readOnly />
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
                                                readOnly />
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
                                                readOnly />
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
                                                readOnly />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <CommonDropdownSelectSingleStoreCategory
                                            label="Sold To:"
                                            name="category_id"
                                            selectedValue={selectedCategory}
                                            readOnly />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        <Card className="mt-4">
                            <Card.Header>
                                <i className="fa fa-list"></i> Items
                            </Card.Header>
                            <Card.Body>
                                {canUpdateSalesInvoice && <Link to={`/sales-invoices/${salesInvoice.id}/store-items`}>
                                    <Button>
                                        <i className='fa fa-plus-circle'></i> Store Items
                                    </Button>
                                </Link>}
                                <table className={`table table-striped ${SALES_INVOICE_ITEMS_TABLE}`} style={{ width: 100 + '%' }}>
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
                                <hr />
                                <table className="table table-striped" style={{ width: 50 + '%' }}>
                                    <tbody>
                                        <tr>
                                            <th>Total Sales</th>
                                            <td>:</td>
                                            <td align="right">
                                                <NumericFormat
                                                    value={salesInvoice.total_sales}
                                                    displayType="text"
                                                    prefix="Php"
                                                    decimalScale="2"
                                                    fixedDecimalScale
                                                    thousandSeparator />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Less VAT</th>
                                            <td>:</td>
                                            <td align="right">
                                                <NumericFormat
                                                    value={salesInvoice.vat_amount}
                                                    displayType="text"
                                                    prefix="Php"
                                                    decimalScale="2"
                                                    fixedDecimalScale
                                                    thousandSeparator />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Amount Net Less VAT</th>
                                            <td>:</td>
                                            <td align="right">
                                                <NumericFormat
                                                    value={salesInvoice.total_sales_less_vat}
                                                    displayType="text"
                                                    prefix="Php"
                                                    decimalScale="2"
                                                    fixedDecimalScale
                                                    thousandSeparator />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Total Amount Due</th>
                                            <td>:</td>
                                            <td align="right">
                                                <NumericFormat
                                                    value={salesInvoice.total_amount_due}
                                                    displayType="text"
                                                    prefix="Php"
                                                    decimalScale="2"
                                                    fixedDecimalScale
                                                    thousandSeparator />
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
                    handleClose={handleCloseDeleteSalesInvoiceItemModal}
                    handleSubmit={handleSubmitDeleteSalesInvoiceItem} />
            </>}
        </>
    );
};

export default SalesInvoicesShow;
