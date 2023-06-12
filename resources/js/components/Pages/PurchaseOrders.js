import { Accordion, Badge, Breadcrumb, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { deletePurchaseOrder, storePurchaseOrder } from '../../state/purchaseOrders';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from '../CommonDeleteModal';
import CommonDropdownSelectSingleLocation from '../CommonDropdownSelectSingleLocation';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../Generic/Directory';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const PURCHASE_ORDERS_PENDING_TABLE = 'table-purchase-orders-pending';
const PURCHASE_ORDERS_APPROVED_TABLE = 'table-purchase-orders-approved';
const PURCHASE_ORDERS_CLOSED_FOLDERS_TABLE = 'table-purchase-orders-closed-folders';
const PURCHASE_ORDERS_CLOSED_TABLE = 'table-purchase-orders-closed';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Purchase Orders',
    },
];

const PurchaseOrders = () => {
    const dispatch = useDispatch();
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const allowedToCreatePurchaseOrder = hasRole('Super Admin') || hasPermission("Create purchase order");
    const allowedToViewPurchaseOrder = hasRole('Super Admin') || hasPermission("View purchase order");
    const allowedToUpdatePurchaseOrder = hasRole('Super Admin') || hasPermission("Update purchase order");
    const allowedToDeletePurchaseOrder = hasRole('Super Admin') || hasPermission("Delete purchase order");

    const [purchaseOrdersTabSelected, setPurchaseOrdersTabSelected] = useState(cookie.load('purchase-orders-tab-selected') ?? 'pending');
    const [updateAvailableLocations, setUpdateAvailableLocations] = useState(uuidv4());
    const [purchaseOrdersClosed, setPurchaseOrdersClosed] = useState({
        folder: cookie.load('purchase-orders-closed-folder-selected') ?? '',
    });
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
            ],
            drawCallback: function () {
                if (!(allowedToViewPurchaseOrder || allowedToUpdatePurchaseOrder)) {
                    $(document).find('.data-table-wrapper .open').remove();
                }
                if (!allowedToDeletePurchaseOrder) {
                    $(document).find('.data-table-wrapper .delete').remove();
                }
            }
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
            ],
            drawCallback: function () {
                const { folder } = purchaseOrdersClosed;
                if (!folder) {
                    $(document).find('.data-table-wrapper .open-folder').first().trigger('click');
                }
            }
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
            setPurchaseOrdersClosed({
                folder: purchaseOrderFolder,
            });
            cookie.save('purchase-orders-closed-folder-selected', purchaseOrderFolder);
        });

        if (purchaseOrdersTabSelected === 'closed' && purchaseOrdersClosed) {
            purchaseOrdersClosedFoldersDT.on('draw', function () {
                $(`.data-table-wrapper .open-folder[data-purchase-order-folder="${purchaseOrdersClosed.folder}"]`).trigger('click');
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
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-folder"></i> Purchase Orders
                </Card.Header>
                <Card.Body>
                    <Accordion activeKey={purchaseOrdersTabSelected} onSelect={handleTabSelected}>
                        <Accordion.Item eventKey="pending">
                            <Accordion.Header><h5><Badge bg="warning">Pending</Badge></h5></Accordion.Header>
                            <Accordion.Body className="bg-warning">
                                <Card border="warning" className="mt-4">
                                    <Card.Body>
                                        <Row>
                                            <Col md={allowedToCreatePurchaseOrder ? 9 : 12}>
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
                                            </Col>
                                            {allowedToCreatePurchaseOrder &&
                                                <Col md={3}>
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
                                                </Col>}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="approved">
                            <Accordion.Header><h5><Badge bg="success">Approved</Badge></h5></Accordion.Header>
                            <Accordion.Body className="bg-success">
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
                            <Accordion.Header><h5><Badge bg="danger">Closed</Badge></h5></Accordion.Header>
                            <Accordion.Body className="bg-danger">
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
                </Card.Body>
            </Card>

            <CommonDeleteModal
                isShow={confirmDeletePurchaseOrder.showModal}
                headerTitle="Delete Purchase Order"
                bodyText={`Are you sure to delete this purchase order?`}
                handleClose={handleCloseDeletePurchaseOrderModal}
                handleSubmit={handleSubmitDeletePurchaseOrderModal} />
        </>
    );
}


export default PurchaseOrders;
