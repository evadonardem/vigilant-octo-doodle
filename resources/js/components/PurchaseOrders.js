import axios from 'axios';
import React, { Component } from 'react';
import { Breadcrumb, Button, ButtonGroup, Card, Form, Tab, Tabs } from 'react-bootstrap';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from './CommonDeleteModal';
import CommonDropdownSelectSingleLocation from './CommonDropdownSelectSingleLocation';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const PURCHASE_ORDERS_PENDING_TABLE = 'table-purchase-orders-pending';
const PURCHASE_ORDERS_APPROVED_TABLE = 'table-purchase-orders-approved';
const PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE = 'table-purchase-orders-closed-folders';
const PURCHASE_ORDERS_CLOSED_TABLE = 'table-purchase-orders-closed';

export default class PurchaseOrders extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewPurchaseOrder = this.handleSubmitNewPurchaseOrder.bind(this);
        this.handleCloseDeletePurchaseOrderModal = this.handleCloseDeletePurchaseOrderModal.bind(this);
        this.handleSubmitDeletePurchaseOrderModal = this.handleSubmitDeletePurchaseOrderModal.bind(this);

        this.state = {
            showDeletePurchaseOrderModal: false,
            purchasePeriodId: null,
            isDeletePurchaseOrderError: false,
            deletePurchaseOrderErrorHeaderTitle: '',
            deletePurchaseOrderErrorBodyText: '',
            updateAvailableLocations: uuidv4(),
            purchaseOrdersClosed: {
                folder: '',
            },
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        /**
         * Purchase Orders (Pending)
         */
        $(`.${PURCHASE_ORDERS_PENDING_TABLE}`).DataTable({
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
                { 'data': 'code' },
                { 'data': 'location' },
                { 'data': 'from' },
                { 'data': 'to' },
                { 'data': 'trips' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-purchase-order-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-purchase-order-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `<div class="btn-group" role="group">
                            ${openBtn}
                            ${deleteBtn}
                        </div>`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open', function(e) {
            e.preventDefault();
            const purchasePeriodId = e.currentTarget.getAttribute('data-purchase-order-id');
            location.href = `${appBaseUrl}/#/purchase-order-details/${purchasePeriodId}`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const purchasePeriodId = e.currentTarget.getAttribute('data-purchase-order-id');
            self.setState({
                showDeletePurchaseOrderModal: true,
                purchasePeriodId,
            });
        });

        /**
         * Purchase Orders (Approved)
         */
        $(`.${PURCHASE_ORDERS_APPROVED_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?filters[status]=2&token=${token}`,
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
                { 'data': 'code' },
                { 'data': 'location' },
                { 'data': 'from' },
                { 'data': 'to' },
                { 'data': 'trips' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-purchase-order-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        return `${openBtn}`;
                    }
                }
            ]
        });

        /**
         * Purchase Orders (Closed)
         */
        const purchaseOrdersClosedDataTable = $(`.${PURCHASE_ORDERS_CLOSED_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?filters[status]=3&filters[folder]=1970-01&token=${token}`,
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
                { 'data': 'code' },
                { 'data': 'location' },
                { 'data': 'from' },
                { 'data': 'to' },
                { 'data': 'trips' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-purchase-order-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        return `${openBtn}`;
                    }
                }
            ]
        });
        $(`.${PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}-folders?filters[status]=3&token=${token}`,
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
            searching: false,
            processing: true,
            serverSide: true,
            columns: [
                { 'data': 'folder' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open-folder btn btn-primary" data-purchase-order-folder="' + row.folder + '"><i class="fa fa-folder-open"></i></a>';
                        return `${openBtn}`;
                    },
                    class: 'text-center',
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open-folder', function(e) {
            e.preventDefault();
            const purchaseOrderFolder = e.currentTarget.getAttribute('data-purchase-order-folder');
            purchaseOrdersClosedDataTable.ajax.url(`${END_POINT}?filters[status]=3&filters[folder]=${purchaseOrderFolder}&token=${token}`).load();
            self.setState({
                ...self.state,
                purchaseOrdersClosed: {
                    folder: purchaseOrderFolder,
                },
            })
        });
    }

    handleSubmitNewPurchaseOrder(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_PENDING_TABLE}`).DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${END_POINT}?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                form[0].reset();
                self.setState({
                    ...self.state,
                    updateAvailableLocations: uuidv4(),
                })
            })
            .catch((error) => {
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', modal)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleCloseDeletePurchaseOrderModal() {
        const self = this;
        self.setState({
            showDeletePurchaseOrderModal: false,
            purchasePeriodId: null,
            isDeletePurchaseOrderError: false,
            deletePurchaseOrderErrorHeaderTitle: '',
            deletePurchaseOrderErrorBodyText: '',
        });
    }

    handleSubmitDeletePurchaseOrderModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { purchasePeriodId } = self.state;
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_PENDING_TABLE}`).DataTable();

        axios.delete(`${END_POINT}/${purchasePeriodId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeletePurchaseOrderModal: false,
                    purchasePeriodId: null,
                    isDeletePurchaseOrderError: false,
                    deletePurchaseOrderErrorHeaderTitle: '',
                    deletePurchaseOrderErrorBodyText: '',
                    updateAvailableLocations: uuidv4(),
                });
            })
            .catch((error) => {
                self.setState({
                    isDeletePurchaseOrderError: true,
                    deletePurchaseOrderErrorHeaderTitle: 'Oh snap! Purchase order cannot be deleted!',
                    deletePurchaseOrderErrorBodyText: error.response.data.message,
                });
            });
    }

    render() {
        const {
            showDeletePurchaseOrderModal,
            isDeletePurchaseOrderError,
            deletePurchaseOrderErrorHeaderTitle,
            deletePurchaseOrderErrorBodyText,
            updateAvailableLocations,
            purchaseOrdersClosed,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item active><span><i className="fa fa-folder"></i> Purchase Orders</span></Breadcrumb.Item>
                </Breadcrumb>

                <Tabs defaultActiveKey="pending">
                    <Tab eventKey="pending" title="Pending">
                        <Card border="warning" className="mt-4">
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-9">
                                        <table className={`table table-striped ${PURCHASE_ORDERS_PENDING_TABLE}`} style={{width: 100+'%'}}>
                                            <thead>
                                                <tr>
                                                <th scope="col">Code</th>
                                                <th scope="col">Location</th>
                                                <th scope="col">From</th>
                                                <th scope="col">To</th>
                                                <th scope="col">Trips</th>
                                                <th></th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-3">
                                        <Card>
                                            <Card.Header>New Purchase Order</Card.Header>
                                            <Card.Body>
                                                <Form onSubmit={this.handleSubmitNewPurchaseOrder}>
                                                    <CommonDropdownSelectSingleLocation
                                                        key={updateAvailableLocations}
                                                        label="Location:"
                                                        name="location"
                                                        handleChange={null}
                                                        handleInputChange={null}/>
                                                    <Form.Group>
                                                        <Form.Label>From:</Form.Label>
                                                        <Form.Control type="date" name="from"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>To:</Form.Label>
                                                        <Form.Control type="date" name="to"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <hr/>
                                                    <Button type="submit" block>Create</Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab>
                    <Tab eventKey="approved" title="Approved">
                        <Card border="success" className="mt-4">
                            <Card.Body>
                                <table className={`table table-striped ${PURCHASE_ORDERS_APPROVED_TABLE}`} style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Code</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">From</th>
                                        <th scope="col">To</th>
                                        <th scope="col">Trips</th>
                                        <th></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </Tab>
                    <Tab eventKey="closed" title="Closed">
                        <Card border="danger" className="mt-4">
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-4">
                                        <Card>
                                            <Card.Body>
                                                <table className={`table table-striped ${PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE}`} style={{width: 100+'%'}}>
                                                    <thead>
                                                        <tr>
                                                        <th scope="col">Folder</th>
                                                        <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <div className="col-md-8">
                                        <h4 className="my-4">
                                            <i className="fa fa-folder-open"></i>&nbsp;
                                            {purchaseOrdersClosed.folder.length > 0
                                                ? purchaseOrdersClosed.folder
                                                : 'Select available folder'}
                                        </h4>
                                        <div style={{display: purchaseOrdersClosed.folder.length > 0 ? 'block' : 'none'}}>
                                            <hr/>
                                            <table className={`table table-striped ${PURCHASE_ORDERS_CLOSED_TABLE}`} style={{width: 100+'%'}}>
                                                <thead>
                                                    <tr>
                                                    <th scope="col">Code</th>
                                                    <th scope="col">Location</th>
                                                    <th scope="col">From</th>
                                                    <th scope="col">To</th>
                                                    <th scope="col">Trips</th>
                                                    <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody></tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>


                <CommonDeleteModal
                    isShow={showDeletePurchaseOrderModal}
                    headerTitle="Delete Purchase Order"
                    bodyText={`Are you sure to delete this purchase order?`}
                    handleClose={this.handleCloseDeletePurchaseOrderModal}
                    handleSubmit={this.handleSubmitDeletePurchaseOrderModal}
                    isDeleteError={isDeletePurchaseOrderError}
                    deleteErrorHeaderTitle={deletePurchaseOrderErrorHeaderTitle}
                    deleteErrorBodyText={deletePurchaseOrderErrorBodyText}/>
            </div>
        );
    }
}
