import axios from 'axios';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import ConfirmationModal from '../../Common/Modals/ConfirmationModal';

const ENDPOINT = `${apiBaseUrl}/payments/stores`;
const ENDPOINT_STORE_DELIVERY_RECEIPT_PAYMENTS = `${apiBaseUrl}/stores/{storeId}/delivery-receipt-payments`;

const StoresDeliveryReceiptsPayments = () => {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');

    // delivery receipt payments permissions
    const allowedToCreateOrUpdateDeliveryReceiptPayments = isSuperAdmin || hasPermission("Create or update delivery receipt payments");
    const allowedToDeleteDeliveryReceiptPayments = isSuperAdmin || hasPermission("Delete delivery receipt payments");

    const token = cookie.load('token');

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [data, setData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const coverageFrom = useRef();
    const coverageTo = useRef();

    const filterByStore = useRef();
    const filterByCategory = useRef();

    const filterByPaymentStatusAll = useRef();
    const filterByPaymentStatusPaid = useRef();
    const filterByPaymentStatusUnpaid = useRef();

    const filterByDeliveryReceiptNo = useRef();

    const [coverageSet, setCoverageSet] = useState(false);
    const [showStores, setShowStores] = useState(true);
    const [showCategories, setShowCategories] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
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
        const referenceId = row.id ?? `${row.store_id}-${row.delivery_receipt_no}`;
        if (expanded) {
            expandedRows.push(referenceId);
            setExpandedRows(expandedRows);
        } else {
            const index = expandedRows.indexOf(referenceId);
            expandedRows.splice(index, 1);
            setExpandedRows(expandedRows);
        }
    };

    const handleAddPayment = async (e, deliveryReceipt) => {
        e.preventDefault();
        const form = document.getElementById(`add-payment-${deliveryReceipt.store_id}-${deliveryReceipt.delivery_receipt_no}-form`);
        const formData = new FormData(form);
        const paymentDate = formData.get(`payment_date_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`);
        const amount = formData.get(`amount_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`);
        const remarks = formData.get(`remarks_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`);

        const endpoint = ENDPOINT_STORE_DELIVERY_RECEIPT_PAYMENTS
            .replace('{storeId}', deliveryReceipt.store_id);

        try {
            await axios.post(`${endpoint}?token=${token}`, {
                'delivery_receipt_no': deliveryReceipt.delivery_receipt_no,
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
                    $('[name=' + key + '_' + deliveryReceipt.store_id + '_' + deliveryReceipt.delivery_receipt_no + ']', form)
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
        const form = document.getElementById(`add-payment-${paymentToDelete.store_id}-${paymentToDelete.delivery_receipt_no}-form`);
        const endpoint = ENDPOINT_STORE_DELIVERY_RECEIPT_PAYMENTS
            .replace('{storeId}', paymentToDelete.store_id);

        await axios.delete(`${endpoint}/${paymentToDelete.id}?token=${token}`);
        form.reset();
        fetchData(page, filters);
        setShowConfirmDeletePayment(false);
    };

    const columnsStoreDeliveryReceiptPayments = [
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
                {allowedToDeleteDeliveryReceiptPayments && <Button onClick={() => {
                    setShowConfirmDeletePayment(true);
                    setPaymentToDelete(row);
                }}>
                    <i className='fa fa-trash' />
                </Button>}
            </ButtonGroup>,
        }
    ];

    const columnsStoreDeliveryReceiptPurchaseOrderItems = [
        {
            name: 'Purchase Order',
            cell: row => row.purchase_order_code,
        },
        {
            name: 'Item',
            cell: row => `(${row.item.code}) ${row.item.name}`,
        },
        {
            name: 'Amount Due',
            cell: row => Number(row.amount_due ?? 0),
        },
    ];

    const ExpandedComponentDeliveryReceiptPayments = ({ data: deliveryReceipt }) => <div className="m-4">
        <Card className='mb-2'>
            <Card.Header>
                Payments
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={!allowedToCreateOrUpdateDeliveryReceiptPayments ? 12 : 8}>
                        <DataTable
                            columns={columnsStoreDeliveryReceiptPayments}
                            data={deliveryReceipt.payments} />
                    </Col>
                    {allowedToCreateOrUpdateDeliveryReceiptPayments && <Col md={4}>
                        <Form
                            id={`add-payment-${deliveryReceipt.store_id}-${deliveryReceipt.delivery_receipt_no}-form`}
                            onSubmit={(e) => handleAddPayment(e, deliveryReceipt)}>
                            <Card>
                                <Card.Body>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Payment Date: </Form.Label>
                                        <Form.Control type="date" name={`payment_date_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`} />
                                        <Form.Control.Feedback type="invalid" />
                                    </Form.Group>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Amount: </Form.Label>
                                        <Form.Control type="number" step="any" name={`amount_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`} />
                                        <Form.Control.Feedback type="invalid" />
                                    </Form.Group>
                                    <Form.Group className='mb-2 field'>
                                        <Form.Label>Remarks: </Form.Label>
                                        <Form.Control as="textarea" name={`remarks_${deliveryReceipt.store_id}_${deliveryReceipt.delivery_receipt_no}`} />
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
                    </Col>}
                </Row>
            </Card.Body>
        </Card>
        <Card className='mb-2'>
            <Card.Header>Related Purchase Order Items</Card.Header>
            <Card.Body>
                <DataTable
                    columns={columnsStoreDeliveryReceiptPurchaseOrderItems}
                    data={deliveryReceipt.purchase_order_items} />
            </Card.Body>
        </Card>
    </div>;

    const columnsStoreDeliveryReceipts = [
        {
            name: 'Delivery Receipt No.',
            cell: row => row.delivery_receipt_no,
        },
        {
            name: 'Total Amount Due',
            cell: row => Number(row.total_amount_due ?? 0).toFixed(2),
        },
        {
            name: 'Total Payments',
            cell: row => Number(row.total_payments ?? 0).toFixed(2),
        },
        {
            name: 'Total Balance',
            cell: row => Number(row.total_balance ?? 0).toFixed(2),
        },
    ];

    const conditionalRowStylesDeliveryReceipts = [
        {
            when: row => {
                const amountDue = Number(row.total_amount_due ?? 0);
                const payments = Number(row.total_payments ?? 0);
                return (amountDue - payments) <= 0;
            },
            style: {
                backgroundColor: 'green',
                color: 'white',
            },
        },
        {
            when: row => {
                const amountDue = Number(row.total_amount_due ?? 0);
                const payments = Number(row.total_payments ?? 0);
                return (amountDue - payments) > 0;
            },
            style: {
                backgroundColor: 'orange',
                color: 'white',
            },
        },
        {
            when: row => {
                const payments = Number(row.total_payments ?? 0);
                return payments === 0;
            },
            style: {
                backgroundColor: 'red',
                color: 'white',
            },
        },
    ];

    const ExpandedComponentStoreDeliveryReceipts = ({ data: store }) => {
        const deliveryReceiptNos = store.delivery_receipt_nos;
        return <div className="m-4">
            <Card>
                <Card.Header>
                    <i className='fa fa-receipt'></i>Delivery Receipts
                </Card.Header>
                <Card.Body>
                    <DataTable
                        columns={columnsStoreDeliveryReceipts}
                        data={deliveryReceiptNos}
                        conditionalRowStyles={conditionalRowStylesDeliveryReceipts}
                        expandableRowsComponent={ExpandedComponentDeliveryReceiptPayments}
                        expandableRowExpanded={rowPreExpanded}
                        onRowExpandToggled={handlePerRowExpandToggled}
                        expandableRows />
                </Card.Body>
            </Card>
        </div>;
    };

    // const ExpandedComponentPurchaseOrderStoreItems = ({ data: store }) => <div className="m-4">
    //     <Card>
    //         <Card.Header>
    //             Purchase Order Item Payments
    //         </Card.Header>
    //         <Card.Body>
    //             <DataTable
    //                 columns={columnsPurchaseOrderStoreItems}
    //                 conditionalRowStyles={conditionalRowStylesPurchaseOrderStoreItems}
    //                 data={store.purchase_order_items}
    //                 expandableRowsComponent={ExpandedComponentPurchaseOrderStoreItemPayments}
    //                 expandableRowExpanded={rowPreExpanded}
    //                 onRowExpandToggled={handlePerRowExpandToggled}
    //                 expandableRows />
    //         </Card.Body>
    //     </Card>
    // </div>;

    const handleFindDeliveryReceiptPayments = () => {
        let updatedFilters = [];

        const coverageFromValue = coverageFrom.current.value;
        const coverageToValue = coverageTo.current.value;
        if (coverageFromValue) {
            updatedFilters.push(`filters[coverage_from]=${coverageFromValue}`);
        }
        if (coverageToValue) {
            updatedFilters.push(`filters[coverage_to]=${coverageToValue}`);
        }

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

        const deliveryReceiptNo = filterByDeliveryReceiptNo.current.value;

        updatedFilters.push(`filters[payment_status]=${paymentStatus}`);

        if (by === 'store' && selectedStore !== null) {
            updatedFilters.push(`filters[${by}_id]=${selectedStore.value}`);
        }

        if (by === 'category' && selectedCategory !== null) {
            updatedFilters.push(`filters[${by}_id]=${selectedCategory.value}`);
        }

        if (deliveryReceiptNo) {
            updatedFilters.push(`filters[delivery_receipt_no]=${deliveryReceiptNo}`);
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
            cell: row => Number(row.delivery_receipt_total_amount_due ?? 0).toFixed(2),
        },
        {
            name: 'Total Payments',
            cell: row => Number(row.delivery_receipt_total_payments ?? 0).toFixed(2),
        },
        {
            name: 'Total Balance',
            cell: row => Number(row.delivery_receipt_total_balance ?? 0).toFixed(2),
        },
    ];

    const rowPreExpanded = row => expandedRows.includes(row.id ?? `${row.store_id}-${row.delivery_receipt_no}`);

    return <>
        <Row>
            <Col md={3}>
                <Card>
                    <Card.Body>
                        <Card.Title className='mb-2'>
                            <i className='fa fa-book' /> Delivery Receipt Payments
                        </Card.Title>
                        <Form.Group className='mb-2 field'>
                            <Form.Label>Coverage: </Form.Label><br />
                            <Row>
                                <Col md={6}>
                                    <Form.Control
                                        ref={coverageFrom}
                                        type="date"
                                        name="coverage_from"
                                        onChange={(e) => {
                                            setCoverageSet(e.target.value && coverageTo.current.value);
                                        }}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Control
                                        ref={coverageTo}
                                        type="date"
                                        name="coverage_to"
                                        onChange={(e) => {
                                            setCoverageSet(e.target.value && coverageFrom.current.value);
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                        </Form.Group>
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
                                    setData([]);
                                }}
                                inline />
                        </Form.Group>
                        {showStores && <CommonDropdownSelectSingleStore
                            handleChange={(e) => {
                                setSelectedStore(e);
                                setData([]);
                            }} />}
                        {showCategories && <CommonDropdownSelectSingleStoreCategory
                            handleChange={(e) => {
                                setSelectedCategory(e);
                                setData([]);
                            }} />}

                        {(selectedStore || selectedCategory) && <Form.Group className='mb-2 field'>
                            <Form.Label>Delivery Receipt No.: </Form.Label>
                            <Form.Control
                                ref={filterByDeliveryReceiptNo}
                                type="text"
                                name="delivery_receipt_no"
                                onChange={() => { setData([]); }}></Form.Control>
                            <div className="invalid-feedback"></div>
                        </Form.Group>}

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
                                disabled={selectedStore === null && selectedCategory === null || !coverageSet}>
                                <i className='fa fa-search'></i> Find
                            </Button>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            </Col>
            <Col md={9}>
                <Card>
                    <Card.Body>
                        <DataTable
                            columns={columns}
                            expandableRowsComponent={ExpandedComponentStoreDeliveryReceipts}
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
