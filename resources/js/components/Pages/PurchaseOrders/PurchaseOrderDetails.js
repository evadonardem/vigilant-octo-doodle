import React, { useEffect, useState } from 'react';
import { Alert, Badge, Breadcrumb, Button, ButtonGroup, Card, Form, Toast, ToastContainer } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from '../../CommonDeleteModal';
import CommonDropdownSelectSingleUsers from '../../CommonDropdownSelectSingleUsers';
import CommonDropdownSelectSingleExpenseCode from '../../CommonDropdownSelectSingleExpenseCode';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PurchaseOrderDetailsPdfDocument from './PurchaseOrderDetailsPdfDocument';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../Generic/Loader';
import {
    assignStaffPurchaseOrderDetails,
    clearErrorMessage,
    deletePurchaseOrderAssignedStaff,
    deletePurchaseOrderExpense,
    deletePurchaseOrderStore,
    deletePurchaseOrderStoreItem,
    fetchPurchaseOrderDetails,
    purchaseOrderDetailsAllocateExpense,
    purchaseOrderDetailsUpdateExpense,
    updatePurchaseOrder,
    updatePurchaseOrderAssignedStaff,
    updatePurchaseOrderStoreItem
} from '../../../state/purchaseOrderDetails';

const PO_STORES_DT = 'table-purchase-order-stores';
const PO_STORE_ITEMS_DT = 'table-purchase-order-store-items';
const PO_ASSIGNED_STAFF_DT = 'table-purchase-order-assigned-staff';
const PO_EXPENSES_DT = 'table-purchase-order-expenses';
const END_POINT = `${apiBaseUrl}/purchase-orders`;

const PurchaseOrderDetails = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const { purchaseOrderId } = params;

    const {
        isLoading,
        purchaseOrder,
        purchaseOrderAssignedStaff,
        purchaseOrderExpenses,
        purchaseOrderExpensesMeta,
        purchaseOrderStores,
        errorMessage,
    } = useSelector((state) => state.purchaseOrderDetails);

    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        headerTitle: '',
        bodyText: '',
        doDispatch: null,
    });
    const [updatePurchaseOrderPromise, setUpdatePurchaseOrderPromise] = useState(null);
    const [updatePurchaseOrderStoreItemPromise, setUpdatePurchaseOrderStoreItemPromise] = useState(null);

    const init = (purchaseOrderId) => {
        dispatch(fetchPurchaseOrderDetails({ purchaseOrderId })).then(() => initDataTables(purchaseOrderId));
    };

    const initDataTables = (purchaseOrderId) => {
        const token = cookie.load('token');

        const poStoresDataTable = $(`.${PO_STORES_DT}`).DataTable({
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
                { 'data': 'sort_order' },
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
                        const { promodisers } = data;

                        if (promodisers) {
                            return promodisers.map((promodiser) => {
                                return `<p>
                                    ${promodiser.name}<br/>
                                    <span class="badge badge-pill badge-dark">${promodiser.contact_no}</span>
                                </p>`;
                            }).join('');
                        }

                        return null;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (+data.purchase_order_status.id === 1 || +data.purchase_order_status.id === 2) {
                            const editBtn = `<a
                                href="#/purchase-orders/${data.pivot.purchase_order_id}/store-request/${data.pivot.store_id}"
                                class="btn btn-primary">
                                    <i class="fa fa-edit"></i>
                            </a>`;
                            const deleteBtn = `<a
                                href="#"
                                data-purchase-order-id=${data.pivot.purchase_order_id}
                                data-store-id=${data.id}
                                data-store-code=${data.code}
                                data-store-name=${data.name}
                                class="delete-po-store btn btn-warning">
                                    <i class="fa fa-trash"></i>
                            </a>`;

                            return `<div class="btn-group">${editBtn}${deleteBtn}</div>`;
                        }

                        return null;
                    }
                },
            ],
            ordering: false,
            paging: false,
            rowReorder: {
                dataSrc: 'sort_order',
            },
            searching: false,
        });

        $(document).on('click', '.data-table-wrapper .delete-po-store', function (e) {
            e.preventDefault();

            const purchaseOrderId = $(this).data('purchase-order-id');
            const storeId = $(this).data('store-id');
            const storeCode = $(this).data('store-code');
            const storeName = $(this).data('store-name');

            setDeleteModal({
                show: true,
                headerTitle: 'Delete Store',
                bodyText: `Delete store ${storeCode} - ${storeName}.`,
                doDispatch: () => dispatch(deletePurchaseOrderStore({ purchaseOrderId, storeId }))
                    .then(() => {
                        poStoresDataTable.ajax.reload(null, false);
                        setDeleteModal({
                            show: false,
                            headerTitle: '',
                            bodyText: '',
                            doDispatch: null,
                        });
                    }),
            });
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
                            <th scope="col">Unit Price</th>
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
                            { 'data': 'effective_price' },
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
                                    if (+data.purchase_order_status.id === 1 || +data.purchase_order_status.id === 2) {
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

                    $(document).on('change', '.data-table-wrapper .update-po-store-item', function (e) {
                        const storeId = $(this).data('store-id');
                        const itemId = $(this).data('item-id');
                        const quantityType = $(this).data('type');
                        const quantity = $(this).val();
                        const postData = {};
                        postData[quantityType] = quantity;

                        if (updatePurchaseOrderStoreItemPromise) {
                            updatePurchaseOrderStoreItemPromise.abort();
                            setUpdatePurchaseOrderStoreItemPromise(null);
                        }

                        const promise = dispatch(updatePurchaseOrderStoreItem({ purchaseOrderId, storeId, itemId, postData }));
                        setUpdatePurchaseOrderStoreItemPromise(promise);
                    });

                    $(document).on('click', '.data-table-wrapper .delete-po-store-item', function (e) {
                        e.preventDefault();

                        const storeId = $(this).data('store-id');
                        const itemId = $(this).data('item-id');
                        const itemCode = $(this).data('item-code');
                        const itemName = $(this).data('item-name');
                        const poStoreItemsDataTable = $(this).closest('.data-table-wrapper').find(`table.${PO_STORE_ITEMS_DT}`).DataTable();

                        setDeleteModal({
                            show: true,
                            headerTitle: 'Delete Store Item Request',
                            bodyText: `Delete store item request for ${itemCode} - ${itemName}.`,
                            doDispatch: () => dispatch(deletePurchaseOrderStoreItem({ purchaseOrderId, storeId, itemId }))
                                .then((action) => {
                                    const { purchaseOrderStores } = action.payload;
                                    if (purchaseOrderStores.find((store) => +store.id === +storeId)) {
                                        poStoreItemsDataTable.ajax.reload(null, false);
                                    } else {
                                        poStoresDataTable.ajax.reload(null, false);
                                    }
                                    setDeleteModal({
                                        show: false,
                                        headerTitle: '',
                                        bodyText: '',
                                        doDispatch: null,
                                    });
                                }),
                        });
                    });
                }
            }
        });

        poStoresDataTable.on('row-reorder', (e, diff, edit) => {
            poStoresDataTable.one('draw', function () {
                let storesSortOrder = [];
                poStoresDataTable.rows()
                    .every(function (rowIdx, tableLoop, rowLoop) {
                        const rowData = this.data();
                        const { id: store_id, sort_order } = rowData;
                        storesSortOrder.push({
                            store_id,
                            sort_order,
                        });
                    });
                axios.post(
                    `${END_POINT}/${purchaseOrderId}/stores-sort-order?token=${token}`,
                    { sort_order: storesSortOrder }
                )
                    .then(() => {
                        poStoresDataTable.ajax.reload(null, false);
                    })
                    .catch(() => {
                        location.reload();
                    });
            });
        });


        const poAssignedStaffDataTable = $(`.${PO_ASSIGNED_STAFF_DT}`).DataTable({
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
                        return `<div class="form-check">
							<input
								class="form-check-input include-deliveries-to-pay-periods"
								type="checkbox"
								id="includeDeliveriesForPayPeriods"
								data-purchase-order-id=${purchaseOrderId}
                                data-purchase-order-assigned-staff-id=${data.pivot.id}
								${data.pivot.include_deliveries_for_pay_periods ? 'checked' : ''}/>
							<label class="form-check-label" for="includeDeliveriesForPayPeriods"></label>
						</div>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (data.can_delete) {
                            const deleteBtn = `<a
                                href="#"
                                data-purchase-order-assigned-staff-id=${data.pivot.id}
                                data-biometric-id=${data.biometric_id}
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

        $(document).on('click', '.data-table-wrapper .include-deliveries-to-pay-periods', function (e) {
            const purchaseOrderAssignedStaffId = e.target.getAttribute('data-purchase-order-assigned-staff-id');
            const isChecked = e.target.checked;
            const data = { include_deliveries_for_pay_periods: isChecked };
            dispatch(updatePurchaseOrderAssignedStaff({ purchaseOrderId, purchaseOrderAssignedStaffId, serializedData: data }));
        });

        $(document).on('click', '.data-table-wrapper .delete-po-assigned-staff', function (e) {
            e.preventDefault();
            const purchaseOrderAssignedStaffId = $(this).data('purchase-order-assigned-staff-id');
            const biometricId = $(this).data('biometric-id');
            const staffName = $(this).data('staff-name');
            setDeleteModal({
                show: true,
                headerTitle: 'Delete Assigned Staff',
                bodyText: `Delete assigned staff ${biometricId} - ${staffName}.`,
                doDispatch: () => dispatch(deletePurchaseOrderAssignedStaff({ purchaseOrderId, purchaseOrderAssignedStaffId }))
                    .then(() => {
                        poAssignedStaffDataTable.ajax.reload(null, false);
                        setDeleteModal({
                            show: false,
                            headerTitle: '',
                            bodyText: '',
                            doDispatch: null,
                        });
                    }),
            });
        });

        const poExpensesDataTable = $(`.${PO_EXPENSES_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}/${purchaseOrderId}/expenses?token=${token}`,
                error: function (_xhr, _error, code) {
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
                                style="text-align: right;"
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
            columnDefs: [
                {
                    targets: [1, 2],
                    className: 'dt-right',
                }
            ],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function (i) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '') * 1
                        : typeof i === 'number' ? i : 0;
                };

                const totalExpensesAmountOriginal = api
                    .column(1)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalExpensesAmountActual = api
                    .column(2)
                    .data()
                    .reduce(
                        function (a, b) {
                            if (a instanceof Object) {
                                a = a.amount_actual;
                            }
                            if (b instanceof Object) {
                                b = b.amount_actual;
                            }
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(1).footer()).html(totalExpensesAmountOriginal.toFixed(2));
                $(api.column(2).footer()).html(`<input
                    readonly
                    type="number"
                    class="form-control"
                    value="${totalExpensesAmountActual.toFixed(2)}"
                    style="text-align: right;"/>`);
            },
            ordering: false,
            paging: false,
            searching: false,
        });

        $(document).on('change', '.data-table-wrapper .update-po-allocated-expense', function (e) {
            e.preventDefault();

            const purchaseOrderExpenseId = $(this).data('purchase-order-expense-id');
            const type = $(this).data('type');
            const value = $(this).val();
            let data = {};
            data[type] = value;

            dispatch(purchaseOrderDetailsUpdateExpense({ purchaseOrderId, purchaseOrderExpenseId, serializedData: data }))
                .then((action) => {
                    if (action.meta.requestStatus === "fulfilled") {
                        poExpensesDataTable.ajax.reload(null, false);
                    }
                });
        });

        $(document).on('click', '.data-table-wrapper .delete-po-expense', function (e) {
            e.preventDefault();
            const purchaseOrderExpenseId = $(this).data('purchase-order-expense-id');
            const expenseName = $(this).data('expense-name');
            setDeleteModal({
                show: true,
                headerTitle: 'Delete Allocated Expense',
                bodyText: `Delete allocated expense ${expenseName}.`,
                doDispatch: () => dispatch(deletePurchaseOrderExpense({ purchaseOrderId, purchaseOrderExpenseId }))
                    .then(() => {
                        poExpensesDataTable.ajax.reload(null, false);
                        setDeleteModal({
                            show: false,
                            headerTitle: '',
                            bodyText: '',
                            doDispatch: null,
                        });
                    }),
            });
        });
    }

    const handleChangeSelectSingleUser = (e) => {
        setSelectedUser(e);
    }

    const handleSubmitAssignStaff = (e) => {
        e.preventDefault();
        const form = $(e.currentTarget);
        const data = form.serialize();
        dispatch(assignStaffPurchaseOrderDetails({ purchaseOrderId, serializedData: data }))
            .then((action) => {
                setSelectedUser(null);
                if (action.meta.requestStatus === "fulfilled") {
                    const table = $('.data-table-wrapper').find(`table.${PO_ASSIGNED_STAFF_DT}`).DataTable();
                    table.ajax.reload(null, false);
                }
            });
    }

    const handleSubmitExpense = (e) => {
        e.preventDefault();
        const form = $(e.currentTarget);
        const data = form.serialize();
        dispatch(purchaseOrderDetailsAllocateExpense({ purchaseOrderId, serializedData: data }))
            .then((action) => {
                form[0].reset();
                if (action.meta.requestStatus === "fulfilled") {
                    const table = $('.data-table-wrapper').find(`table.${PO_EXPENSES_DT}`).DataTable();
                    table.ajax.reload(null, false);
                }
            });
    }

    const handleCloseDeleteModal = (e) => {
        setDeleteModal({
            show: false,
            headerTitle: '',
            bodyText: '',
            doDispatch: null,
        });
    }

    const handleSubmitDeleteModal = (e) => {
        e.preventDefault();
        const { doDispatch } = deleteModal;
        doDispatch();
    }

    const handleUpdatePurchaseOrder = (e) => {
        const type = $(e.currentTarget).prop('name');
        let data = {};
        data[type] = $(e.currentTarget).val();

        if (updatePurchaseOrderPromise) {
            updatePurchaseOrderPromise.abort();
            setUpdatePurchaseOrderPromise(null);
        }

        const promise = dispatch(updatePurchaseOrder({ purchaseOrderId, serializedData: data }));
        setUpdatePurchaseOrderPromise(promise);
    }

    const handleClickUpdatePurchaseOrderStatus = (e) => {
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
            { purchase_order_status_id: purchaseOrderStatusId }
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


    useEffect(() => {
        init(purchaseOrderId);
    }, [purchaseOrderId]);

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


    // }

    return (
        <>
            {isLoading && !purchaseOrder && <Loader />}

            {purchaseOrder && (purchaseOrderAssignedStaff || purchaseOrderExpenses || purchaseOrderExpensesMeta || purchaseOrderStores) &&
                <>
                    <Breadcrumb>
                        <Breadcrumb.Item href="#/purchase-orders"><i className="fa fa-folder"></i> Purchase Orders</Breadcrumb.Item>
                        <Breadcrumb.Item active>{purchaseOrder.code}</Breadcrumb.Item>
                    </Breadcrumb>
                    <Card className="my-4">
                        <Card.Header>
                            <p>
                                <Badge variant='primary'>PO: {purchaseOrder.code}</Badge>&nbsp;
                                <Badge variant={currentStatusVariant}>
                                    {purchaseOrder.status ? purchaseOrder.status.name : ''}
                                </Badge>
                            </p>
                            <h4>Purchase Order &raquo; Details</h4>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>
                                <Alert variant={currentStatusVariant}>
                                    <div className="row">
                                        <div className="col-md-5">
                                            <Form.Group>
                                                <Form.Label>Location:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    onChange={handleUpdatePurchaseOrder}
                                                    defaultValue={purchaseOrder.location}
                                                    readOnly={+purchaseOrder.status.id === 3}></Form.Control>
                                            </Form.Group>
                                        </div>
                                        <div className="w-100"></div>
                                        <div className="col-md-5">
                                            <Form.Group>
                                                <Form.Label>From:</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="from"
                                                    onChange={handleUpdatePurchaseOrder}
                                                    defaultValue={purchaseOrder.from}
                                                    readOnly={+purchaseOrder.status.id === 3}></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-5">
                                            <Form.Group>
                                                <Form.Label>To:</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="to"
                                                    onChange={handleUpdatePurchaseOrder}
                                                    defaultValue={purchaseOrder.to}
                                                    readOnly={+purchaseOrder.status.id === 3}></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-2">
                                            <Form.Group>
                                                <Form.Label>Trips:</Form.Label>
                                                <Form.Control type="text" value={purchaseOrder.trips} readOnly></Form.Control>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </Alert>
                            </Card.Title>

                            <Card className="my-4">
                                <Card.Header><i className="fa fa-shopping-cart"></i> Stores</Card.Header>
                                <Card.Body>
                                    <table className={`table table-striped ${PO_STORES_DT}`} style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col"></th>
                                                <th scope="col">Code</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Address</th>
                                                <th scope="col">Promodisers</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </Card.Body>
                                {(purchaseOrder.status.id === 1 || purchaseOrder.status.id === 2) &&
                                    <Card.Footer>
                                        <div className='pull-right'>
                                            <Link to={`/purchase-orders/${purchaseOrder.id}/store-request`}>
                                                <Button>
                                                    <i className='fa fa-plus-circle'></i> Store Request
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card.Footer>}
                            </Card>

                            <div style={!purchaseOrder ? { display: "none" } : null}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Header><i className="fa fa-users"></i> Assigned Staff</Card.Header>
                                            <Card.Body>
                                                <table className={`table table-striped ${PO_ASSIGNED_STAFF_DT}`} style={{ width: 100 + '%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">ID</th>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Include Deliveries to Pay Periods</th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </Card.Body>
                                            {purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                                <Card.Footer>
                                                    <Form onSubmit={handleSubmitAssignStaff}>
                                                        <CommonDropdownSelectSingleUsers
                                                            label="Staff:"
                                                            name="biometric_id"
                                                            selectedUser={selectedUser}
                                                            handleChange={handleChangeSelectSingleUser} />
                                                        <Button type="submit" className="mt-4 mb-2 pull-right">Assign Staff</Button>
                                                    </Form>
                                                </Card.Footer>}
                                        </Card>
                                    </div>
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Header><i className="fa fa-money"></i> Allocated Expenses</Card.Header>
                                            <Card.Body>
                                                <table className={`table table-striped ${PO_EXPENSES_DT}`} style={{ width: 100 + '%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Name</th>
                                                            <th scope="col" style={{ textAlign: 'right' }}>Amount (Original)</th>
                                                            <th scope="col" style={{ textAlign: 'right' }}>Amount (Actual)</th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th scope="col">Total:</th>
                                                            <th scope="col" style={{ textAlign: 'right' }}></th>
                                                            <th scope="col" style={{ textAlign: 'right' }}></th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </Card.Body>
                                            {purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                                <Card.Footer>
                                                    <Form onSubmit={handleSubmitExpense}>
                                                        <CommonDropdownSelectSingleExpenseCode
                                                            label="Expense Type:"
                                                            name="name"
                                                            handleChange={null}
                                                            handleInputChange={null} />
                                                        <Form.Group className="my-2">
                                                            <Form.Label>Amount (Original):</Form.Label>
                                                            <Form.Control type="text" name="amount_original"></Form.Control>
                                                            <div className="invalid-feedback"></div>
                                                        </Form.Group>
                                                        <Button type="submit" className="my-2 pull-right">Allocate Expense</Button>
                                                    </Form>
                                                </Card.Footer>}
                                        </Card>
                                    </div>
                                </div>
                            </div>

                        </Card.Body>
                        <Card.Footer>
                            <ButtonGroup className="pull-right">
                                <PDFDownloadLink
                                    key="po-with-price-total-amount"
                                    document={<PurchaseOrderDetailsPdfDocument
                                        purchaseOrder={purchaseOrder}
                                        purchaseOrderStores={purchaseOrderStores}
                                        purchaseOrderAssignedStaff={purchaseOrderAssignedStaff}
                                        purchaseOrderExpenses={purchaseOrderExpenses}
                                        purchaseOrderExpensesMeta={purchaseOrderExpensesMeta}
                                        withUnitPriceAndTotalAmount={true} />}
                                    fileName={`PO-${purchaseOrder.code}.pdf`}
                                    className="btn btn-secondary">
                                    {({ loading }) => (
                                        loading
                                            ? "Loading document..."
                                            : <span><i className="fa fa-download"></i> PO (w/ Price & Total Amt.)</span>
                                    )}
                                </PDFDownloadLink>
                                <PDFDownloadLink
                                    key="po-without-price-total-amount"
                                    document={<PurchaseOrderDetailsPdfDocument
                                        purchaseOrder={purchaseOrder}
                                        purchaseOrderStores={purchaseOrderStores}
                                        purchaseOrderAssignedStaff={purchaseOrderAssignedStaff}
                                        purchaseOrderExpenses={purchaseOrderExpenses}
                                        purchaseOrderExpensesMeta={purchaseOrderExpensesMeta}
                                        withUnitPriceAndTotalAmount={false} />}
                                    fileName={`PO-${purchaseOrder.code}.pdf`}
                                    className="btn btn-secondary">
                                    {({ loading }) => (
                                        loading
                                            ? "Loading document..."
                                            : <span><i className="fa fa-download"></i> PO (w/o Price & Total Amt.)</span>
                                    )}
                                </PDFDownloadLink>
                                {purchaseOrder && +purchaseOrder.status.id !== 3 &&
                                        <Button
                                            key={`${purchaseOrder.id}-${nextStatusId}`}
                                            onClick={handleClickUpdatePurchaseOrderStatus}
                                            data-purchase-order-id={purchaseOrder.id}
                                            data-purchase-order-status-id={nextStatusId}
                                            variant={nextStatusButtonVariant}>
                                            {nextStatus}
                                        </Button>}
                            </ButtonGroup>
                        </Card.Footer>
                    </Card>
                </>
            }
            <CommonDeleteModal
                isShow={deleteModal.show}
                headerTitle={deleteModal.headerTitle}
                bodyText={deleteModal.bodyText}
                handleClose={handleCloseDeleteModal}
                handleSubmit={handleSubmitDeleteModal} />

            {errorMessage &&
                <ToastContainer className="p-3 position-fixed" position="top-center">
                    <Toast bg="danger" onClose={() => dispatch(clearErrorMessage())} show={errorMessage} delay={3000} autohide>
                        <Toast.Body className="text-center text-white">{errorMessage}</Toast.Body>
                    </Toast>
                </ToastContainer>}
        </>
    );
}

export default PurchaseOrderDetails;
