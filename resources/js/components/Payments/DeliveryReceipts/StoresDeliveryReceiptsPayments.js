import axios from 'axios';
import { useRef, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import ConfirmationModal from '../../Common/Modals/ConfirmationModal';
import PurchaseOrdersDropdown from '../../Common/Dropdowns/PurchaseOrdersDropdown';

const ENDPOINT = `${apiBaseUrl}/payments/stores`;
const ENDPOINT_PURCHASE_ORDER_STORE_ITEM_PAYMENTS = `${apiBaseUrl}/purchase-order-store-items/{purchaseOrderStoreItemId}/payments`;

const StoresDeliveryReceiptsPayments = () => {
    const token = cookie.load('token');

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [data, setData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const filterByStore = useRef();
    const filterByCategory = useRef();

    const filterByPaymentStatusAll = useRef();
    const filterByPaymentStatusPaid = useRef();
    const filterByPaymentStatusUnpaid = useRef();
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState();

    const [showStores, setShowStores] = useState(true);
    const [showCategories, setShowCategories] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState(null);
    const [filters, setFilters] = useState([]);

    const [showConfirmDeletePayment, setShowConfirmDeletePayment] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    const fetchData = async (currentPage, filters) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}?page=${currentPage}&per_page=${perPage}&${filters.join('&')}&token=${token}`);
        const { data, total: totalRows } = response.data;

        setFilters(filters);
        setData(data);
        setTotalRows(totalRows);
        setIsLoading(false);
    };

    const handlePageChange = page => {
        fetchData(page, filters);
        setPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}?page=${page}&per_page=${newPerPage}&${filters}&token=${token}`);
        const { data } = response.data;

        setData(data);
        setPage(page);
        setPerPage(newPerPage);
        setIsLoading(false);
    };

    const handlePerRowExpandToggled = (expanded, row) => {
        if (expanded) {
            expandedRows.push(row.id);
            setExpandedRows(expandedRows);
        } else {
            const index = expandedRows.indexOf(row.id);
            expandedRows.splice(index, 1);
            setExpandedRows(expandedRows);
        }
    };

    const handleAddPayment = async (e, purchaseOrderItem) => {
        e.preventDefault();
        const form = document.getElementById(`add-payment-${purchaseOrderItem.id}-form`);
        const formData = new FormData(form);
        const paymentDate = formData.get(`payment_date_${purchaseOrderItem.id}`);
        const amount = formData.get(`amount_${purchaseOrderItem.id}`);
        const remarks = formData.get(`remarks_${purchaseOrderItem.id}`);

        const endpoint = ENDPOINT_PURCHASE_ORDER_STORE_ITEM_PAYMENTS
            .replace('{purchaseOrderStoreItemId}', purchaseOrderItem.id);

        try {
            await axios.post(`${endpoint}?token=${token}`, {
                'payment_date': paymentDate,
                amount,
                remarks,
            });
            form.reset();
            fetchData(page, filters);
        } catch (e) {
            const { errors } = e.response.data;
            if (errors) {
                for (const key in errors) {
                    $('[name=' + key + '_' + purchaseOrderItem.id + ']', form)
                        .addClass('is-invalid')
                        .closest('.field')
                        .find('.invalid-feedback')
                        .text(errors[key][0]);
                }
                $(form).find('.invalid-feedback').css('display', 'block');
            }
        }
    };

    const handleDeletePayment = async (e) => {
        e.preventDefault();
        const form = document.getElementById(`add-payment-${paymentToDelete.purchase_order_store_item_id}-form`);
        const endpoint = ENDPOINT_PURCHASE_ORDER_STORE_ITEM_PAYMENTS
            .replace('{purchaseOrderStoreItemId}', paymentToDelete.purchase_order_store_item_id);

        await axios.delete(`${endpoint}/${paymentToDelete.id}?token=${token}`);
        form.reset();
        fetchData(page, filters);
        setShowConfirmDeletePayment(false);
    };

    const columnsPurchaseOrderStoreItemPayments = [
        {
            name: 'Payment Date',
            cell: row => `${row.payment_date}`,
        },
        {
            name: 'Amount',
            cell: row => Number(`${row.amount}`).toFixed(2),
        },
        {
            name: 'Remarks',
            cell: row => row.remarks,
        },
        {
            cell: row => <ButtonGroup>
                <Button onClick={() => {
                    setShowConfirmDeletePayment(true);
                    setPaymentToDelete(row);
                }}>
                    <i className='fa fa-trash' />
                </Button>
            </ButtonGroup>,
        }
    ];
    const ExpandedComponentPurchaseOrderStoreItemPayments = ({ data: purchaseOrderItem }) => <div className="m-4">
        <Card>
            <Card.Header>
                Payments
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={8}>
                        <DataTable
                            columns={columnsPurchaseOrderStoreItemPayments}
                            data={purchaseOrderItem.payments} />
                    </Col>
                    <Col md={4}>
                        <Form
                            id={`add-payment-${purchaseOrderItem.id}-form`}
                            onSubmit={(e) => handleAddPayment(e, purchaseOrderItem)}>
                            <Card>
                                <Card.Body>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Payment Date: </Form.Label>
                                        <Form.Control type="date" name={`payment_date_${purchaseOrderItem.id}`} />
                                        <Form.Control.Feedback type="invalid" />
                                    </Form.Group>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Amount: </Form.Label>
                                        <Form.Control type="number" step="any" name={`amount_${purchaseOrderItem.id}`} />
                                        <Form.Control.Feedback type="invalid" />
                                    </Form.Group>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Remarks: </Form.Label>
                                        <Form.Control as="textarea" name={`remarks_${purchaseOrderItem.id}`} />
                                        <Form.Control.Feedback type="invalid" />
                                    </Form.Group>
                                </Card.Body>
                                <Card.Footer>
                                    <ButtonGroup className='pull-right'>
                                        <Button type="submit">
                                            <i className='fa fa-plus'></i> Add Payment
                                        </Button>
                                    </ButtonGroup>
                                </Card.Footer>
                            </Card>
                        </Form>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    </div>;

    const columnsPurchaseOrderStoreItems = [
        {
            name: 'Purchase Order',
            cell: row => <a
                href={`#/purchase-orders/${row.purchase_order_id}/details`}
                target="_blank"
                rel="noopener noreferrer">
                {row.purchase_order_code}
            </a>,
        },
        {
            name: 'Item',
            cell: row => `(${row.item.code}) ${row.item.name}`,
        },
        {
            name: 'Delivery Receipt No.',
            cell: row => `${row.delivery_receipt_no}`,
        },
        {
            name: 'Booklet No.',
            cell: row => `${row.booklet_no}`,
        },
        {
            name: 'Amount Due',
            cell: row => Number(`${row.amount_due}`).toFixed(2),
        },
        {
            name: 'Payments',
            cell: row => Number(`${row.payments_sum_amount ?? 0}`).toFixed(2),
        },
        {
            name: 'Balance',
            cell: row => {
                const amountDue = Number(`${row.amount_due}`);
                const payments = Number(Number(`${row.payments_sum_amount ?? 0}`));
                return Number(amountDue - payments).toFixed(2);
            },
        },
    ];

    const conditionalRowStylesPurchaseOrderStoreItems = [
        {
            when: row => {
                const amountDue = Number(`${row.amount_due}`);
                const payments = Number(Number(`${row.payments_sum_amount ?? 0}`));
                return (amountDue - payments) <= 0;
            },
            style: {
                backgroundColor: 'green',
                color: 'white',
            },
        },
        {
            when: row => {
                const amountDue = Number(`${row.amount_due}`);
                const payments = Number(Number(`${row.payments_sum_amount ?? 0}`));
                return (amountDue - payments) > 0;
            },
            style: {
                backgroundColor: 'orange',
                color: 'white',
            },
        },
        {
            when: row => {
                const payments = Number(Number(`${row.payments_sum_amount ?? 0}`));
                return payments === 0;
            },
            style: {
                backgroundColor: 'red',
                color: 'white',
            },
        },
    ];

    const ExpandedComponentPurchaseOrderStoreItems = ({ data: store }) => <div className="m-4">
        <Card>
            <Card.Header>
                Purchase Order Item Payments
            </Card.Header>
            <Card.Body>
                <DataTable
                    columns={columnsPurchaseOrderStoreItems}
                    conditionalRowStyles={conditionalRowStylesPurchaseOrderStoreItems}
                    data={store.purchase_order_items}
                    expandableRowsComponent={ExpandedComponentPurchaseOrderStoreItemPayments}
                    expandableRowExpanded={rowPreExpanded}
                    onRowExpandToggled={handlePerRowExpandToggled}
                    expandableRows />
            </Card.Body>
        </Card>
    </div>;

    const handleFindDeliveryReceiptPayments = () => {
        let updatedFilters = [];

        const by = filterByStore.current.checked
            ? filterByStore.current.value
            : filterByCategory.current.value;

        let paymentStatus;
        if (filterByPaymentStatusAll.current.checked) {
            paymentStatus = filterByPaymentStatusAll.current.value;
        } else if (filterByPaymentStatusPaid.current.checked) {
            paymentStatus = filterByPaymentStatusPaid.current.value;
        } else {
            paymentStatus = filterByPaymentStatusUnpaid.current.value;
        }

        setSelectedPaymentStatus(paymentStatus);

        updatedFilters.push(`filters[payment_status]=${paymentStatus}`);

        if (by === 'store' && selectedStore !== null) {
            updatedFilters.push(`filters[${by}_id]=${selectedStore.value}`);
        }

        if (by === 'category' && selectedCategory !== null) {
            updatedFilters.push(`filters[${by}_id]=${selectedCategory.value}`);
        }

        if (selectedPurchaseOrders) {
            selectedPurchaseOrders.map((selectedPurchaseOrder) =>
                updatedFilters.push(`filters[purchase_order_id][]=${selectedPurchaseOrder.value}`));
        }

        fetchData(page, updatedFilters);
    };

    const columns = [
        {
            name: 'Store',
            cell: row => `(${row.code}) ${row.name}`,
        },
        {
            name: 'Category',
            selector: row => row.category?.name ?? null,
        },
        {
            name: 'Total Amount Due',
            cell: row => row
                .purchase_order_items
                .reduce((due, item) => due + Number(item.amount_due), 0)
                .toFixed(2),
        },
        {
            name: 'Total Payments',
            cell: row => row
                .purchase_order_items
                .reduce((payments, item) => payments + Number(item.payments_sum_amount), 0)
                .toFixed(2),
        },
        {
            name: 'Total Balance',
            cell: row => {
                const totalAmountDue = row
                    .purchase_order_items
                    .reduce((due, item) => due + Number(item.amount_due), 0);
                const totalPayments = row
                    .purchase_order_items
                    .reduce((payments, item) => payments + Number(item.payments_sum_amount), 0);
                return Number(totalAmountDue - totalPayments).toFixed(2);
            },
        },
    ];

    const rowPreExpanded = row => expandedRows.includes(row.id);

    return <>
        <Row>
            <Col md={3}>
                <Card>
                    <Card.Body>
                        <Form.Group className='mb-2 field'>
                            <Form.Label>Filter By: </Form.Label><br />
                            <Form.Check
                                ref={filterByStore}
                                type='radio'
                                name='by'
                                label='Store'
                                value='store'
                                onClick={(e) => {
                                    filterByStore.current = e.target;
                                    setShowStores(true);
                                    setShowCategories(false);
                                    setSelectedCategory(null);
                                    setSelectedPurchaseOrders(null);
                                    setData([]);
                                }}
                                defaultChecked
                                inline />
                            <Form.Check
                                ref={filterByCategory}
                                type='radio'
                                name='by'
                                label='Category'
                                value='category'
                                onClick={(e) => {
                                    filterByCategory.current = e.target;
                                    setShowStores(false);
                                    setShowCategories(true);
                                    setSelectedStore(null);
                                    setSelectedPurchaseOrders(null);
                                    setData([]);
                                }}
                                inline />
                        </Form.Group>
                        {showStores && <CommonDropdownSelectSingleStore
                            handleChange={(e) => {
                                setSelectedStore(e);
                                setSelectedPurchaseOrders(null);
                                setData([]);
                            }} />}
                        {showCategories && <CommonDropdownSelectSingleStoreCategory
                            handleChange={(e) => {
                                setSelectedCategory(e);
                                setSelectedPurchaseOrders(null);
                                setData([]);
                            }} />}

                        {(selectedStore || selectedCategory) && <PurchaseOrdersDropdown
                            isMulti={true}
                            purchaseOrderStatusId={3}
                            categoryId={selectedCategory?.value}
                            storeId={selectedStore?.value}
                            handleChange={(e) => {
                                setSelectedPurchaseOrders(e);
                                setData([]);
                            }}
                            selectedItem={selectedPurchaseOrders} />}

                        <Form.Group className='mb-2 field'>
                            <Form.Label>Payment Status: </Form.Label><br />
                            <Form.Check
                                ref={filterByPaymentStatusAll}
                                type='radio'
                                name='payment_status'
                                label='All'
                                value='all'
                                onClick={(e) => {
                                    filterByPaymentStatusAll.current = e.target;
                                    setData([]);
                                }}
                                defaultChecked
                                inline />
                            <Form.Check
                                ref={filterByPaymentStatusUnpaid}
                                type='radio'
                                name='payment_status'
                                label='Unpaid'
                                value='unpaid'
                                onClick={(e) => {
                                    filterByPaymentStatusUnpaid.current = e.target;
                                    setData([]);
                                }}
                                inline />
                            <Form.Check
                                ref={filterByPaymentStatusPaid}
                                type='radio'
                                name='payment_status'
                                label='Paid'
                                value='paid'
                                onClick={(e) => {
                                    filterByPaymentStatusPaid.current = e.target;
                                    setData([]);
                                }}
                                inline />
                        </Form.Group>
                    </Card.Body>
                    <Card.Footer>
                        <ButtonGroup className='pull-right'>
                            <Button
                                onClick={handleFindDeliveryReceiptPayments}
                                disabled={selectedStore === null && selectedCategory === null}>
                                <i className='fa fa-search'></i> Find
                            </Button>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            </Col>
            <Col md={9}>
                <Card>
                    <Card.Header>
                        <i className='fa fa-book' /> Purchase Order Delivery Receipt Payments
                    </Card.Header>
                    <Card.Body>
                        {(data.length > 0 && selectedStore) && <>
                            <p><strong>Store:</strong><br />
                                <Badge>{selectedStore.label}</Badge></p>
                        </>}
                        {(data.length > 0 && selectedCategory) && <>
                            <p><strong>Category:</strong><br />
                                <Badge>{selectedCategory.label}</Badge></p>
                        </>}
                        {(data.length > 0 && selectedPurchaseOrders && selectedPurchaseOrders.length > 0) && <>
                            <p><strong>Purchase Orders:</strong><br />
                                {selectedPurchaseOrders
                                    .map((selectedPurchaseOrder) => <>
                                        <Badge>{selectedPurchaseOrder.label}</Badge>&nbsp;
                                    </>)}</p>
                        </>}
                        {(data.length > 0 && (!selectedPurchaseOrders || selectedPurchaseOrders.length === 0)) && <>
                            <p><strong>Purchase Orders:</strong><br />
                                <Badge>ALL</Badge></p>
                        </>}
                        {(data.length > 0 && selectedPaymentStatus) && <>
                            <p><strong>Payment Status:</strong><br />
                                <Badge>{selectedPaymentStatus.toUpperCase()}</Badge></p>
                        </>}
                        <DataTable
                            columns={columns}
                            expandableRowsComponent={ExpandedComponentPurchaseOrderStoreItems}
                            expandableRowExpanded={rowPreExpanded}
                            progressPending={isLoading}
                            data={data}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onRowExpandToggled={handlePerRowExpandToggled}
                            paginationTotalRows={totalRows}
                            expandableRows
                            pagination
                            paginationServer />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        {showConfirmDeletePayment && <ConfirmationModal
            handleClose={() => {
                setShowConfirmDeletePayment(false);
                setPaymentToDelete(null);
            }}
            handleSubmit={handleDeletePayment}
            body="Are you sure to delete this payment record?"
            title="Delete Payment" />}
    </>;
};

export default StoresDeliveryReceiptsPayments;
