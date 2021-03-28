import React, { Component } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const PURCHASE_ORDERS_TABLE = 'table-purchase-orders';

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
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'PurchaseOrders';
        const exportTitle = 'Purchase Orders';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(`.${PURCHASE_ORDERS_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?token=${token}`,
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
            buttons: exportButtons,
            ordering: false,
            processing: true,
            serverSide: true,
            columns: [
                { 'data': 'code' },
                { 'data': 'location' },
                { 'data': 'from' },
                { 'data': 'to' },
                { 'data': 'days' },
                { 'data': 'status.name' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-purchase-order-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-purchase-order-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `${openBtn} ${deleteBtn}`;
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
    }

    handleSubmitNewPurchaseOrder(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_TABLE}`).DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${END_POINT}?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                form[0].reset();
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
        const table = $('.data-table-wrapper').find(`table.${PURCHASE_ORDERS_TABLE}`).DataTable();

        axios.delete(`${END_POINT}/${purchasePeriodId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeletePurchaseOrderModal: false,
                    purchasePeriodId: null,
                    isDeletePurchaseOrderError: false,
                    deletePurchaseOrderErrorHeaderTitle: '',
                    deletePurchaseOrderErrorBodyText: '',
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
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-address-card-o"></i> Purchase Orders</h1>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-9">
                        <Card>
                            <Card.Body>
                                <table className={`table table-striped ${PURCHASE_ORDERS_TABLE}`} style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Code</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">From</th>
                                        <th scope="col">To</th>
                                        <th scope="col">Days</th>
                                        <th scope="col">Status</th>
                                        <th></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-3">
                        <Card>
                            <Card.Header>New Purchase Order</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewPurchaseOrder}>
                                    <Form.Group>
                                        <Form.Label>Location:</Form.Label>
                                        <Form.Control type="text" name="location"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
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
