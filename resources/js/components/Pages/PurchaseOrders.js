import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Accordion, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from '../CommonDeleteModal';
import CommonDropdownSelectSingleLocation from '../CommonDropdownSelectSingleLocation';
import { useDispatch } from 'react-redux';
import { deletePurchaseOrder, storePurchaseOrder } from '../../state/purchaseOrders';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const PURCHASE_ORDERS_PENDING_TABLE = 'table-purchase-orders-pending';
const PURCHASE_ORDERS_APPROVED_TABLE = 'table-purchase-orders-approved';
const PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE = 'table-purchase-orders-closed-folders';
const PURCHASE_ORDERS_CLOSED_TABLE = 'table-purchase-orders-closed';

const PurchaseOrders = () => {
    const dispatch = useDispatch();
    const [purchaseOrdersTabSelected, setPurchaseOrdersTabSelected] = useState(cookie.load('purchase-orders-tab-selected') ?? 'pending');
    const [updateAvailableLocations, setUpdateAvailableLocations] = useState(uuidv4());
    const [purchaseOrdersClosed, setPurchaseOrdersClosed] = useState({ folder: '' });

    const [confirmDeletePurchaseOrder, setConfirmDeletePurchaseOrder] = useState({
        showModal: false,
        purchaseOrderId: null,
    });

    const init = () => {
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
        const purchaseOrdersClosedFoldersDT = $(`.${PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}-folders?filters[status]=3&token=${token}`,
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

        $(document).on('click', '.data-table-wrapper .open', function (e) {
            e.preventDefault();
            const purchaseOrderId = e.currentTarget.getAttribute('data-purchase-order-id');
            location.href = `${appBaseUrl}/#/purchase-orders/${purchaseOrderId}/details`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function (e) {
            e.preventDefault();
            const purchaseOrderId = e.currentTarget.getAttribute('data-purchase-order-id');
            setConfirmDeletePurchaseOrder({
                showModal: true,
                purchaseOrderId,
            });
        });

        $(document).on('click', '.data-table-wrapper .open-folder', function (e) {
            e.preventDefault();
            const purchaseOrderFolder = e.currentTarget.getAttribute('data-purchase-order-folder');
            purchaseOrdersClosedDataTable.ajax.url(`${END_POINT}?filters[status]=3&filters[folder]=${purchaseOrderFolder}&token=${token}`).load();
            self.setState({
                ...self.state,
                purchaseOrdersClosed: {
                    folder: purchaseOrderFolder,
                },
            });
            cookie.save('purchase-orders-closed-folder-selected', purchaseOrderFolder);
        });

        if (purchaseOrdersTabSelected === 'closed' && purchaseOrdersClosedFolderSelected) {
            purchaseOrdersClosedFoldersDT.on('draw', function () {
                $(`.data-table-wrapper .open-folder[data-purchase-order-folder="${purchaseOrdersClosedFolderSelected}"]`).trigger('click');
            });
        }
    };

    const handleSubmitNewPurchaseOrder = (e) => {
        e.preventDefault();
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_PENDING_TABLE}`).DataTable();
        const form = $(e.target);
        const data = $(form).serialize();

        dispatch(storePurchaseOrder({ postData: data }))
            .unwrap()
            .then(() => {
                form[0].reset();
                table.ajax.reload(null, false);
                setUpdateAvailableLocations(uuidv4());
            })
            .catch((action) => {
                const { errors } = action;
                for (const key in errors) {
                    $('[name=' + key + ']', form)
                        .addClass('is-invalid')
                        .next()
                        .text(errors[key][0]);
                }
            });
    };

    const handleCloseDeletePurchaseOrderModal = () => {
        setConfirmDeletePurchaseOrder({
            showModal: false,
            purchaseOrderId: null,
        });
    };

    const handleSubmitDeletePurchaseOrderModal = (e) => {
        e.preventDefault();
        const { purchaseOrderId } = confirmDeletePurchaseOrder;
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_PENDING_TABLE}`).DataTable();

        dispatch(deletePurchaseOrder({ purchaseOrderId }))
            .then(() => {
                table.ajax.reload(null, false);
                setConfirmDeletePurchaseOrder({
                    showModal: false,
                    purchaseOrderId: null,
                });
            });
    };

    const handleTabSelected = (key) => {
        setPurchaseOrdersTabSelected(key);
        cookie.save('purchase-orders-tab-selected', key);
    };

    const clearValidation = (e) => {
        $(e.currentTarget).removeClass('is-invalid').next().text('');
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="container-fluid my-4">
            <Breadcrumb>
                <Breadcrumb.Item active><span><i className="fa fa-folder"></i> Purchase Orders</span></Breadcrumb.Item>
            </Breadcrumb>

            <Accordion activeKey={purchaseOrdersTabSelected} onSelect={handleTabSelected}>
                <Accordion.Item eventKey="pending">
                    <Accordion.Header>Pending Purchase Orders</Accordion.Header>
                    <Accordion.Body>
                        <Card border="warning" className="mt-4">
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-9">
                                        <table className={`table table-striped ${PURCHASE_ORDERS_PENDING_TABLE}`} style={{ width: 100 + '%' }}>
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
                                                <Form noValidate onSubmit={handleSubmitNewPurchaseOrder}>
                                                    <CommonDropdownSelectSingleLocation
                                                        key={updateAvailableLocations}
                                                        label="Location:"
                                                        name="location"
                                                        handleChange={null}
                                                        handleInputChange={null} />
                                                    <Form.Group>
                                                        <Form.Label>From:</Form.Label>
                                                        <Form.Control type="date" name="from" onChange={clearValidation}></Form.Control>
                                                        <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>To:</Form.Label>
                                                        <Form.Control type="date" name="to" onChange={clearValidation}></Form.Control>
                                                        <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                                    </Form.Group>
                                                    <hr />
                                                    <Button type="submit">Create</Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="approved">
                    <Accordion.Header>Approved Purchase Orders</Accordion.Header>
                    <Accordion.Body>
                        <Card border="success" className="mt-4">
                            <Card.Body>
                                <table className={`table table-striped ${PURCHASE_ORDERS_APPROVED_TABLE}`} style={{ width: 100 + '%' }}>
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
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="closed">
                    <Accordion.Header>Closed Purchase Orders</Accordion.Header>
                    <Accordion.Body>
                        <Card border="danger" className="mt-4">
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-4">
                                        <Card>
                                            <Card.Body>
                                                <table className={`table table-striped ${PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE}`} style={{ width: 100 + '%' }}>
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
                                        <div style={{ display: purchaseOrdersClosed.folder.length > 0 ? 'block' : 'none' }}>
                                            <hr />
                                            <table className={`table table-striped ${PURCHASE_ORDERS_CLOSED_TABLE}`} style={{ width: 100 + '%' }}>
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <CommonDeleteModal
                isShow={confirmDeletePurchaseOrder.showModal}
                headerTitle="Delete Purchase Order"
                bodyText={`Are you sure to delete this purchase order?`}
                handleClose={handleCloseDeletePurchaseOrderModal}
                handleSubmit={handleSubmitDeletePurchaseOrderModal} />
        </div>
    );
}


export default PurchaseOrders;
