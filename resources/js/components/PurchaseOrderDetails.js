import React, { Component } from 'react';
import { Alert, Badge, Breadcrumb, Button, Card, Form, Modal } from 'react-bootstrap';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from './CommonDeleteModal';
import CommonDropdownSelectSingleItem from './CommonDropdownSelectSingleItem';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleUsers from './CommonDropdownSelectSingleUsers';
import CommonDropdownSelectSingleExpenseCode from './CommonDropdownSelectSingleExpenseCode';

import { PDFDownloadLink } from '@react-pdf/renderer';
import PurchaseOrderDetailsPdfDocument from './PurchaseOrderDetailsPdfDocument';

const PO_STORES_DT = 'table-purchase-order-stores';
const PO_STORE_ITEMS_DT = 'table-purchase-order-store-items';
const PO_ASSIGNED_STAFF_DT = 'table-purchase-order-assigned-staff';
const PO_EXPENSES_DT = 'table-purchase-order-expenses';
const END_POINT = `${apiBaseUrl}/purchase-orders`;

export default class PurchaseOrderDetails extends Component {
    constructor(props) {
        super(props);

        this.handleChangeSelectSingleItem = this.handleChangeSelectSingleItem.bind(this);
        this.handleChangeSelectSingleStore = this.handleChangeSelectSingleStore.bind(this);
        this.handleSubmitStoreItemRequest = this.handleSubmitStoreItemRequest.bind(this);

        this.handleChangeSelectSingleUser = this.handleChangeSelectSingleUser.bind(this);
        this.handleSubmitAssignStaff = this.handleSubmitAssignStaff.bind(this);

        this.handleSubmitExpense = this.handleSubmitExpense.bind(this);

        this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
        this.handleSubmitDeleteModal = this.handleSubmitDeleteModal.bind(this);

        this.handleClickUpdatePurchaseOrderStatus = this.handleClickUpdatePurchaseOrderStatus.bind(this);

        this.state = {
            purchaseOrder: null,
            purchaseOrderStores: null,
            purchaseOrderAssignedStaff: null,
            purchaseOrderExpenses: null,
            selectedStore: null,
            selectedItem: null,
            selectedUser: null,
            error: {},
            deleteModal: {
                show: false,
                headerTitle: '',
                bodyText: '',
                endPoint: '',
            },
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { purchaseOrderId } = params;

        $(`.${PO_STORES_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}/${purchaseOrderId}/stores?token=${token}`,
                error: function (xhr, error, code) {
                    if (code === 'Unauthorized') {
                        location.reload();
                    }
                }
            },
            buttons: [],
            columns: [
                {
                    className: 'details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { 'data': 'code' },
                { 'data': 'name' },
                { 'data': 'address_line' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (+data.purchase_order_status.id === 1) {
                            const deleteBtn = `<a
                                href="#"
                                data-purchase-order-id=${data.pivot.purchase_order_id}
                                data-store-id=${data.id}
                                data-store-code=${data.code}
                                data-store-name=${data.name}
                                class="delete-po-store btn btn-warning">
                                    <i class="fa fa-trash"></i>
                            </a>`;

                            return `${deleteBtn}`;
                        }

                        return null;
                    }
                },
            ],
            ordering: false,
            paging: false,
            searching: false,
        });

        $(document).on('click', '.data-table-wrapper .delete-po-store', function (e) {
            e.preventDefault();

            const purchaseOrderId = $(this).data('purchase-order-id');
            const storeId = $(this).data('store-id');
            const storeCode = $(this).data('store-code');
            const storeName = $(this).data('store-name');

            self.setState({
                ...self.state,
                deleteModal: {
                    ...self.state.deleteModal,
                    show: true,
                    headerTitle: 'Delete Store',
                    bodyText: `Delete store ${storeCode} - ${storeName}.`,
                    endPoint: `${END_POINT}/${purchaseOrderId}/stores/${storeId}?token=${token}`
                }
            })
        });

        const format = (d) => {
            return `<div class="card">
                <div class="card-header">
                    (${d.code})&nbsp;${d.name}<br/>
                    <span class="badge badge-secondary">Requested Items</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped ${PO_STORE_ITEMS_DT}" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col">Code</th>
                            <th scope="col">Name</th>
                            <th scope="col">Qty. (Original)</th>
                            <th scope="col">Qty. (Actual)</th>
                            <th scope="col">Qty. (Bad Orders)</th>
                            <th scope="col">Qty. (Returns)</th>
                            <th scope="col">Delivery Receipt No.</th>
                            <th scope="col">Booklet No.</th>
                            <th scope="col">Remarks</th>
                            <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(`.${PO_STORES_DT}`)).on('click', 'td.details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find(`table.${PO_STORES_DT}`)
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

                if ( row.child.isShown() ) {
                    tr.next().find(`table.${PO_STORE_ITEMS_DT}`).DataTable({
                        ajax: {
                            type: 'get',
                            url: `${END_POINT}/${row.data().pivot.purchase_order_id}/stores/${row.data().id}/items?token=${token}`,
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
                            { 'data': 'code' },
                            { 'data': 'name' },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 1) {
                                        const input = `<input
                                            type="number"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="quantity_original"
                                            value="${data.pivot.quantity_original}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.quantity_original;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="number"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="quantity_actual"
                                            value="${data.pivot.quantity_actual}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.quantity_actual;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="number"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="quantity_bad_orders"
                                            value="${data.pivot.quantity_bad_orders}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.quantity_bad_orders;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="number"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="quantity_returns"
                                            value="${data.pivot.quantity_returns}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.quantity_returns;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="text"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="delivery_receipt_no"
                                            value="${data.pivot.delivery_receipt_no}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.delivery_receipt_no;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="text"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="booklet_no"
                                            value="${data.pivot.booklet_no}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.booklet_no;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 2) {
                                        const input = `<input
                                            type="text"
                                            class="update-po-store-item form-control"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-type="remarks"
                                            value="${data.pivot.remarks}"/>`;

                                        return `${input}`;
                                    }

                                    return data.pivot.remarks;
                                }
                            },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    if (+data.purchase_order_status.id === 1) {
                                        const deleteBtn = `<a
                                            href="#"
                                            data-purchase-order-id=${data.pivot.purchase_order_id}
                                            data-store-id=${data.pivot.store_id}
                                            data-item-id=${data.id}
                                            data-item-code=${data.code}
                                            data-item-name=${data.name}
                                            class="delete-po-store-item btn btn-warning">
                                                <i class="fa fa-trash"></i>
                                        </a>`;

                                        return `${deleteBtn}`;
                                    }

                                    return null;
                                }
                            },
                        ]
                    });

                    $(document).on('change', '.data-table-wrapper .update-po-store-item', function(e) {
                        const purchaseOrderId = $(this).data('purchase-order-id');
                        const storeId = $(this).data('store-id');
                        const itemId = $(this).data('item-id');
                        const quantityType = $(this).data('type');
                        const quantity = $(this).val();
                        const postData = {};
                        postData[quantityType] = quantity;

                        axios.patch(`${END_POINT}/${purchaseOrderId}/stores/${storeId}/items/${itemId}?token=${token}`, postData)
                            .then(() => {
                                axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`)
                                    .then((response) => {
                                        const { data: purchaseOrderStores } = response.data;
                                        self.setState({
                                            ...self.state,
                                            purchaseOrderStores,
                                        });
                                    })
                                    .catch(() => {
                                        location.href = `${appBaseUrl}`;
                                    });
                            })
                            .catch(() => {
                                location.href = `${appBaseUrl}`;
                            });
                    });

                    $(document).on('click', '.data-table-wrapper .delete-po-store-item', function (e) {
                        e.preventDefault();

                        const purchaseOrderId = $(this).data('purchase-order-id');
                        const storeId = $(this).data('store-id');
                        const itemId = $(this).data('item-id');
                        const itemCode = $(this).data('item-code');
                        const itemName = $(this).data('item-name');

                        self.setState({
                            ...self.state,
                            deleteModal: {
                                ...self.state.deleteModal,
                                show: true,
                                headerTitle: 'Delete Store Item Request',
                                bodyText: `Delete store item request for ${itemCode} - ${itemName}.`,
                                endPoint: `${END_POINT}/${purchaseOrderId}/stores/${storeId}/items/${itemId}?token=${token}`
                            }
                        })
                    });
                }
            }
        });


        $(`.${PO_ASSIGNED_STAFF_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`,
                error: function (xhr, error, code) {
                    if (code === 'Unauthorized') {
                        location.reload();
                    }
                }
            },
            buttons: [],
            columns: [
                { 'data': 'biometric_id' },
                { 'data': 'name' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (data.can_delete) {
                            const deleteBtn = `<a
                                href="#"
                                data-purchase-order-id=${purchaseOrderId}
                                data-purchase-order-assigned-staff-id=${data.pivot.id}
                                data-biometric-id=${data.id}
                                data-staff-name=${data.name}
                                class="delete-po-assigned-staff btn btn-warning">
                                    <i class="fa fa-trash"></i>
                            </a>`;

                            return `${deleteBtn}`;
                        }

                        return null;
                    }
                },
            ],
            ordering: false,
            paging: false,
            searching: false,
        });

        $(document).on('click', '.data-table-wrapper .delete-po-assigned-staff', function (e) {
            e.preventDefault();

            const purchaseOrderId = $(this).data('purchase-order-id');
            const purchaseOrderAssignedStaffId = $(this).data('purchase-order-assigned-staff-id');
            const biometricId = $(this).data('biometric-id');
            const staffName = $(this).data('staff-name');

            self.setState({
                ...self.state,
                deleteModal: {
                    ...self.state.deleteModal,
                    show: true,
                    headerTitle: 'Delete Assigned Staff',
                    bodyText: `Delete assigned staff ${biometricId} - ${staffName}.`,
                    endPoint: `${END_POINT}/${purchaseOrderId}/assigned-staff/${purchaseOrderAssignedStaffId}?token=${token}`
                }
            })
        });

        $(`.${PO_EXPENSES_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}/${purchaseOrderId}/expenses?token=${token}`,
                error: function (xhr, error, code) {
                    if (code === 'Unauthorized') {
                        location.reload();
                    }
                }
            },
            buttons: [],
            columns: [
                { 'data': 'name' },
                { 'data': 'amount_original' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (data.can_update) {
                            const input = `<input
                                type="number"
                                class="update-po-allocated-expense form-control"
                                data-purchase-order-id=${purchaseOrderId}
                                data-purchase-order-expense-id=${data.id}
                                data-type="amount_actual"
                                value="${data.amount_actual}"/>`;

                            return `${input}`;
                        }

                        return data.amount_actual;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (data.can_delete) {
                            const deleteBtn = `<a
                                href="#"
                                data-purchase-order-id=${purchaseOrderId}
                                data-purchase-order-expense-id=${data.id}
                                data-expense-name=${data.name}
                                class="delete-po-expense btn btn-warning">
                                    <i class="fa fa-trash"></i>
                            </a>`;

                            return `${deleteBtn}`;
                        }

                        return null;
                    }
                },
            ],
            ordering: false,
            paging: false,
            searching: false,
        });

        $(document).on('click', '.data-table-wrapper .update-po-allocated-expense', function (e) {
            e.preventDefault();

            const token = cookie.load('token');
            const purchaseOrderId = $(this).data('purchase-order-id');
            const purchaseOrderExpenseId = $(this).data('purchase-order-expense-id');
            const type = $(this).data('type');
            const value = $(this).val();
            let data = {};
            data[type] = value;

            axios.patch(`${END_POINT}/${purchaseOrderId}/expenses/${purchaseOrderExpenseId}?token=${token}`, data)
                .then(() => {
                    /**
                     * Re-fetch purchase order expenses for PDF export.
                     */
                    axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`)
                        .then((response) => {
                            const { data: purchaseOrderExpenses } = response.data;
                            self.setState({
                                ...self.state,
                                purchaseOrderExpenses,
                            });
                        })
                        .catch(() => {
                            location.href = `${appBaseUrl}`;
                        });
                })
                .catch((error) => {
                    const {
                        data,
                        status,
                    } = error.response;

                    if (+status === 422) {
                        const { message: generalMessage } = data;
                        self.setState({
                            ...self.state,
                            error: { generalMessage },
                        });
                    }
                });
        });

        $(document).on('click', '.data-table-wrapper .delete-po-expense', function (e) {
            e.preventDefault();

            const purchaseOrderId = $(this).data('purchase-order-id');
            const purchaseOrderExpenseId = $(this).data('purchase-order-expense-id');
            const expenseName = $(this).data('expense-name');

            self.setState({
                ...self.state,
                deleteModal: {
                    ...self.state.deleteModal,
                    show: true,
                    headerTitle: 'Delete Allocated Expense',
                    bodyText: `Delete allocated expense ${expenseName}.`,
                    endPoint: `${END_POINT}/${purchaseOrderId}/expenses/${purchaseOrderExpenseId}?token=${token}`
                }
            });
        });

        axios.get(`${END_POINT}/${purchaseOrderId}?token=${token}`)
            .then((response) => {
                const { data: purchaseOrder } = response.data;
                self.setState({
                    ...self.state,
                    purchaseOrder,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${END_POINT}/${purchaseOrderId}/stores?include=items&token=${token}`)
            .then((response) => {
                const { data: purchaseOrderStores } = response.data;
                self.setState({
                    ...self.state,
                    purchaseOrderStores,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${END_POINT}/${purchaseOrderId}/assigned-staff?token=${token}`)
            .then((response) => {
                const { data: purchaseOrderAssignedStaff } = response.data;
                self.setState({
                    ...self.state,
                    purchaseOrderAssignedStaff,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${END_POINT}/${purchaseOrderId}/expenses?token=${token}`)
            .then((response) => {
                const { data: purchaseOrderExpenses } = response.data;
                self.setState({
                    ...self.state,
                    purchaseOrderExpenses,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    handleChangeSelectSingleStore(e) {
        this.setState({
            ...this.state,
            selectedStore: e
        });
    }

    handleChangeSelectSingleItem(e) {
        this.setState({
            ...this.state,
            selectedItem: e
        });
    }

    handleSubmitStoreItemRequest(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { purchaseOrder } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();
        const table = $('.data-table-wrapper').find(`table.${PO_STORES_DT}`).DataTable();

        axios.post(
                `${apiBaseUrl}/purchase-orders/${purchaseOrder.id}/items?token=${token}`,
                data
            )
            .then(() => {
                self.setState({
                    ...self.state,
                    selectedStore: null,
                    selectedItem: null,
                    error: {},
                });
                table.ajax.reload(null, false);
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                axios.get(`${END_POINT}/${purchaseOrder.id}/stores?include=items&token=${token}`)
                    .then((response) => {
                        const { data: purchaseOrderStores } = response.data;
                        self.setState({
                            ...self.state,
                            purchaseOrderStores,
                        });
                    })
                    .catch(() => {
                        location.href = `${appBaseUrl}`;
                    });
            })
            .catch((error) => {
                const {
                    data,
                    status,
                } = error.response;

                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                if (+status === 422) {
                    const { message: generalMessage } = data;
                    self.setState({
                        ...self.state,
                        selectedStore: null,
                        selectedItem: null,
                        error: { generalMessage },
                    });
                }
            });
    }

    handleChangeSelectSingleUser(e) {
        this.setState({
            ...this.state,
            selectedUser: e
        });
    }

    handleSubmitAssignStaff(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { purchaseOrder } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();
        const table = $('.data-table-wrapper').find(`table.${PO_ASSIGNED_STAFF_DT}`).DataTable();

        axios.post(
                `${apiBaseUrl}/purchase-orders/${purchaseOrder.id}/assigned-staff?token=${token}`,
                data
            )
            .then(() => {
                self.setState({
                    ...self.state,
                    selectedUser: null,
                    error: {},
                });

                table.ajax.reload(null, false);
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                /**
                 * Re-fetch purchase order assigned staff for PDF export.
                 */
                axios.get(`${END_POINT}/${purchaseOrder.id}/assigned-staff?token=${token}`)
                    .then((response) => {
                        const { data: purchaseOrderAssignedStaff } = response.data;
                        self.setState({
                            ...self.state,
                            purchaseOrderAssignedStaff,
                        });
                    })
                    .catch(() => {
                        location.href = `${appBaseUrl}`;
                    });
            })
            .catch((error) => {
                const {
                    data,
                    status,
                } = error.response;

                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                if (+status === 422) {
                    const { message: generalMessage } = data;
                    self.setState({
                        ...self.state,
                        selectedUser: null,
                        error: { generalMessage },
                    });
                }
            });
    }

    handleSubmitExpense(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { purchaseOrder } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();
        const table = $('.data-table-wrapper').find(`table.${PO_EXPENSES_DT}`).DataTable();

        axios.post(
                `${apiBaseUrl}/purchase-orders/${purchaseOrder.id}/expenses?token=${token}`,
                data
            )
            .then(() => {
                self.setState({
                    ...self.state,
                    error: {},
                });
                table.ajax.reload(null, false);
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                /**
                 * Re-fetch purchase order expenses for PDF export.
                 */
                axios.get(`${END_POINT}/${purchaseOrder.id}/expenses?token=${token}`)
                    .then((response) => {
                        const { data: purchaseOrderExpenses } = response.data;
                        self.setState({
                            ...self.state,
                            purchaseOrderExpenses,
                        });
                    })
                    .catch(() => {
                        location.href = `${appBaseUrl}`;
                    });
            })
            .catch((error) => {
                const {
                    data,
                    status,
                } = error.response;

                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();

                if (+status === 422) {
                    const { message: generalMessage } = data;
                    self.setState({
                        ...self.state,
                        error: { generalMessage },
                    });
                }
            });
    }

    handleCloseDeleteModal(e) {
        const self = this;
        self.setState({
            ...self.state,
            deleteModal: {
                ...self.state.deleteModal,
                show: false,
                headerTitle: '',
                bodyText: '',
                endPoint: '',
            }
        });
    }

    handleSubmitDeleteModal(e) {
        e.preventDefault();

        const self = this;
        const { deleteModal } = self.state;
        const { endPoint } = deleteModal;
        const tableStores = $('.data-table-wrapper').find(`table.${PO_STORES_DT}`).DataTable();
        const tableStoreItems = $('.data-table-wrapper').find(`table.${PO_STORE_ITEMS_DT}`).DataTable();
        const tableAssignedStaff = $('.data-table-wrapper').find(`table.${PO_ASSIGNED_STAFF_DT}`).DataTable();
        const tableExpenses = $('.data-table-wrapper').find(`table.${PO_EXPENSES_DT}`).DataTable();

        axios.delete(endPoint)
            .then((response) => {
                const data = response.data;
                const { refresh_purchase_order_stores } = data;
                self.setState({
                    ...self.state,
                    deleteModal: {
                        ...self.state.deleteModal,
                        show: false,
                        headerTitle: '',
                        bodyText: '',
                        endPoint: '',
                    }
                });

                if (refresh_purchase_order_stores || refresh_purchase_order_stores === undefined) {
                    tableStores.ajax.reload(null, false);
                } else {
                    tableStoreItems.ajax.reload(null, false);
                }

                tableAssignedStaff.ajax.reload(null, false);
                tableExpenses.ajax.reload(null, false);
            })
            .catch((error) => {
                const {
                    data,
                    status,
                } = error.response;
                if (+status === 422) {
                    const { message: generalMessage } = data;
                    self.setState({
                        ...self.state,
                        deleteModal: {
                            ...self.state.deleteModal,
                            show: false,
                            headerTitle: '',
                            bodyText: '',
                            endPoint: '',
                        },
                        error: { generalMessage },
                    });
                }
            });
    }

    handleClickUpdatePurchaseOrderStatus(e) {
        const self = this;
        const token = cookie.load('token');
        const purchaseOrderId = $(e.currentTarget).data('purchase-order-id');
        const purchaseOrderStatusId = $(e.currentTarget).data('purchase-order-status-id');

        const table = $('.data-table-wrapper')
            .find(`table.${PO_STORES_DT}`)
            .DataTable();
        const tableAssignedStaff = $('.data-table-wrapper')
            .find(`table.${PO_ASSIGNED_STAFF_DT}`)
            .DataTable();
        const tableExpenses = $('.data-table-wrapper')
            .find(`table.${PO_EXPENSES_DT}`)
            .DataTable();

        axios.patch(
                `${END_POINT}/${purchaseOrderId}?token=${token}`,
                {purchase_order_status_id: purchaseOrderStatusId}
            )
            .then((response) => {
                const { data: purchaseOrder } = response.data;
                self.setState({
                    ...self.state,
                    purchaseOrder
                });
                table.ajax.reload(null, false);
                tableAssignedStaff.ajax.reload(null, false);
                tableExpenses.ajax.reload(null, false);
            })
            .catch((error) => {
                const {
                    data,
                    status,
                } = error.response;
                if (+status === 422) {
                    const { message: generalMessage } = data;
                    self.setState({
                        ...self.state,
                        error: { generalMessage },
                    });
                }
            });
    }

    render() {
        const {
            purchaseOrder,
            purchaseOrderStores,
            purchaseOrderAssignedStaff,
            purchaseOrderExpenses,
            selectedStore,
            selectedItem,
            selectedUser,
            error,
            deleteModal,
        } = this.state;

        const {
            generalMessage
        } = error;

        let currentStatusVariant = null;
        let nextStatus = null;
        let nextStatusId = null;
        let nextStatusButtonVariant = null;
        if (purchaseOrder) {
            currentStatusVariant = 'danger';
            if (purchaseOrder.status.name == 'Pending') {
                currentStatusVariant = 'warning';
                nextStatus = 'Approve';
                nextStatusId = 2;
                nextStatusButtonVariant = 'success';
            } else {
                if (purchaseOrder.status.name == 'Approved') {
                    currentStatusVariant = 'success';
                    nextStatus = 'Close';
                    nextStatusId = 3;
                    nextStatusButtonVariant = 'danger';
                }
            }
        }

        return (
            <div className="container-fluid my-4">
                { purchaseOrder &&
                    <Breadcrumb>
                        <Breadcrumb.Item href="#/purchase-orders"><i className="fa fa-file"></i> Purchase Orders</Breadcrumb.Item>
                        <Breadcrumb.Item active>{purchaseOrder.code}</Breadcrumb.Item>
                    </Breadcrumb>
                }
                <div className="row">
                    <div className={ purchaseOrder && +purchaseOrder.status.id === 1 ? "col-md-9" : "col-md-12"}>
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    {
                                        purchaseOrder &&
                                        <Alert variant={currentStatusVariant}>
                                            <Badge variant="primary">{purchaseOrder.code}</Badge>&nbsp;
                                            <Badge variant={currentStatusVariant}>{purchaseOrder.status ? purchaseOrder.status.name : ''}</Badge>
                                            <br/><br/>
                                            Location: <em>{purchaseOrder.location}</em>&nbsp;
                                            From: <em>{purchaseOrder.from}</em>&nbsp;
                                            To: <em>{purchaseOrder.to} ({purchaseOrder.days} day{ +purchaseOrder.days > 1 ? 's' : ''})</em>
                                            {
                                                purchaseOrderStores &&
                                                purchaseOrderStores.length > 0 &&
                                                purchaseOrderAssignedStaff &&
                                                purchaseOrderAssignedStaff.length > 0 &&
                                                purchaseOrderExpenses &&
                                                purchaseOrderExpenses.length > 0 &&
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <PDFDownloadLink
                                                            key={uuidv4()}
                                                            document={<PurchaseOrderDetailsPdfDocument
                                                                purchaseOrder={purchaseOrder}
                                                                purchaseOrderStores={purchaseOrderStores}
                                                                purchaseOrderAssignedStaff={purchaseOrderAssignedStaff}
                                                                purchaseOrderExpenses={purchaseOrderExpenses}/>}
                                                            fileName={`PO-${purchaseOrder.code}.pdf`}
                                                            className="btn btn-primary pull-right">
                                                            {({ blob, url, loading, error }) => (
                                                                loading
                                                                    ? "Loading document..."
                                                                    : <span><i className="fa fa-file"></i> Download PO</span>
                                                            )}
                                                        </PDFDownloadLink>
                                                    </div>
                                                </div>
                                            }
                                        </Alert>
                                    }
                                </Card.Title>

                                <div style={!purchaseOrder ? {display: "none"} : null}>
                                    <Card className="my-4">
                                        <Card.Header><i className="fa fa-shopping-cart"></i> Stores</Card.Header>
                                        <Card.Body>
                                            <table className={`table table-striped ${PO_STORES_DT}`} style={{width: 100+'%'}}>
                                                <thead>
                                                    <tr>
                                                        <th scope="col"></th>
                                                        <th scope="col">Code</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Address</th>
                                                        <th scope="col"></th>
                                                    </tr>
                                                </thead>
                                                <tbody></tbody>
                                            </table>
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div style={(!purchaseOrder || +purchaseOrder.status.id === 1) ? {display: "none"} : null}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Card>
                                                <Card.Header><i className="fa fa-users"></i> Assigned Staff</Card.Header>
                                                <Card.Body>
                                                    <table className={`table table-striped ${PO_ASSIGNED_STAFF_DT}`} style={{width: 100+'%'}}>
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">ID</th>
                                                                <th scope="col">Name</th>
                                                                <th scope="col"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    {
                                                        purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                                        <Card>
                                                            <Card.Body>
                                                                <Form onSubmit={this.handleSubmitAssignStaff}>
                                                                    <CommonDropdownSelectSingleUsers
                                                                        key={uuidv4()}
                                                                        label="Staff:"
                                                                        name="biometric_id"
                                                                        selectedUser={selectedUser}
                                                                        handleChange={this.handleChangeSelectSingleUser}/>
                                                                    <hr/>
                                                                    <Button type="submit" block>Assign Staff</Button>
                                                                </Form>
                                                            </Card.Body>
                                                        </Card>
                                                    }
                                                </Card.Body>
                                            </Card>
                                        </div>
                                        <div className="col-md-6">
                                            <Card>
                                                <Card.Header><i className="fa fa-money"></i> Allocated Expenses</Card.Header>
                                                <Card.Body>
                                                    <table className={`table table-striped ${PO_EXPENSES_DT}`} style={{width: 100+'%'}}>
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">Name</th>
                                                                <th scope="col">Amount (Original)</th>
                                                                <th scope="col">Amount (Actual)</th>
                                                                <th scope="col"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    {
                                                        purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                                        <Card>
                                                            <Card.Body>
                                                                <Form onSubmit={this.handleSubmitExpense}>
                                                                    <CommonDropdownSelectSingleExpenseCode
                                                                        key={uuidv4()}
                                                                        label="Expense Type:"
                                                                        name="name"
                                                                        handleChange={null}
                                                                        handleInputChange={null}/>
                                                                    <Form.Group>
                                                                        <Form.Label>Amount (Original):</Form.Label>
                                                                        <Form.Control type="text" name="amount_original"></Form.Control>
                                                                        <div className="invalid-feedback"></div>
                                                                    </Form.Group>
                                                                    <hr/>
                                                                    <Button type="submit" block>Allocate Expense</Button>
                                                                </Form>
                                                            </Card.Body>
                                                        </Card>
                                                    }
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                            </Card.Body>
                            {
                                purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                <Card.Footer>
                                    <div className="pull-right">
                                        <Button
                                            key={`${purchaseOrder.id}-${nextStatusId}`}
                                            onClick={this.handleClickUpdatePurchaseOrderStatus}
                                            data-purchase-order-id={purchaseOrder.id}
                                            data-purchase-order-status-id={nextStatusId}
                                            variant={nextStatusButtonVariant}>
                                                {nextStatus}
                                        </Button>
                                    </div>
                                </Card.Footer>
                            }
                        </Card>
                    </div>
                    { purchaseOrder && +purchaseOrder.status.id === 1 &&
                        <div className="col-md-3">
                            {
                                +purchaseOrder.status.id === 1 &&
                                <Card>
                                    <Card.Header>Add Store Item Request</Card.Header>
                                    <Card.Body>
                                        <Form onSubmit={this.handleSubmitStoreItemRequest}>
                                            <CommonDropdownSelectSingleStore
                                                key={uuidv4()}
                                                name="store_id"
                                                selectedItem={selectedStore}
                                                handleChange={this.handleChangeSelectSingleStore}/>
                                            <CommonDropdownSelectSingleItem
                                                key={uuidv4()}
                                                name="item_id"
                                                selectedItem={selectedItem}
                                                handleChange={this.handleChangeSelectSingleItem}/>
                                            <Form.Group>
                                                <Form.Label>Qty. (Original):</Form.Label>
                                                <Form.Control type="number" name="quantity_original"></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <hr/>
                                            <Button type="submit" block>Add</Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            }
                        </div>
                    }
                </div>
                <CommonDeleteModal
                    isShow={deleteModal.show}
                    headerTitle={deleteModal.headerTitle}
                    bodyText={deleteModal.bodyText}
                    handleClose={this.handleCloseDeleteModal}
                    handleSubmit={this.handleSubmitDeleteModal}/>

                <Modal
                    show={generalMessage !== undefined}
                    onHide={() => { this.setState({...this.state, error: {}})}}
                    backdrop="static"
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Oops! Something went wrong.</Modal.Title>
                    </Modal.Header>
                    <Modal.Body closeButton>
                        <Alert variant="warning">{generalMessage}</Alert>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}
