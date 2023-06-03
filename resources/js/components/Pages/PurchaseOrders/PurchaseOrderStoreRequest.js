import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { fetchPurchaseOrderStoreRequest, updatePurchaseOrderStoreRequest } from '../../../state/purchaseOrderStoreRequest';
import { useDispatch, useSelector } from 'react-redux';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import Loader from '../../Generic/Loader';
import React, { useEffect, useState } from 'react';

const PurchaseOrderStoreRequest = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const { purchaseOrderId, storeId } = params;

    const {
        isLoading,
        purchaseOrder,
        storeItems,
    } = useSelector((state) => state.purchaseOrderStoreRequest);

    const isEdit = !!storeId;
    const [selectedStore, setSelectedStore] = useState(null);
    const [changeItemQuantityPromise, setChangeItemQuantityPromise] = useState(null);

    const init = (purchaseOrderId, storeId) => {
        dispatch(fetchPurchaseOrderStoreRequest({ purchaseOrderId, storeId })).then((action) => {
            const { store } = action.payload;
            if (store) {
                setSelectedStore({
                    value: store.id,
                    label: store.name,
                });
            }
        });
    };

    const handleChangeSelectSingleStore = (e) => {
        const selectedStore = e;
        setSelectedStore(selectedStore);
        dispatch(fetchPurchaseOrderStoreRequest({ purchaseOrderId, storeId: selectedStore ? selectedStore.value : null }));
    };

    const handleChangeItemQuantity = (e) => {
        const target = e.currentTarget;
        const storeId = selectedStore.value;
        const itemId = target.getAttribute('data-item-id');
        const quantityOriginal = target.value;
        const data = {
            store_id: storeId,
            item_id: itemId,
            quantity_original: quantityOriginal,
        };

        if (changeItemQuantityPromise) {
            changeItemQuantityPromise.abort();
            setChangeItemQuantityPromise(null);
        }

        const promise = dispatch(updatePurchaseOrderStoreRequest({ purchaseOrderId, postData: data }));
        setChangeItemQuantityPromise(promise);
    };

    useEffect(() => {
        init(purchaseOrderId, storeId);
    }, [purchaseOrderId, storeId]);

    let currentStatusVariant = null;
    if (purchaseOrder) {
        currentStatusVariant = 'danger';
        if (purchaseOrder.status.name == 'Pending') {
            currentStatusVariant = 'warning';
        } else {
            if (purchaseOrder.status.name == 'Approved') {
                currentStatusVariant = 'success';
            }
        }
    }

    return (
        <>
            {purchaseOrder &&
                <Breadcrumb>
                    <Breadcrumb.Item href="#/purchase-orders"><i className="fa fa-folder"></i> Purchase Orders</Breadcrumb.Item>
                    <Breadcrumb.Item href={`#/purchase-orders/${purchaseOrder.id}/details`}>{purchaseOrder.code}</Breadcrumb.Item>
                    <Breadcrumb.Item active>Store Request</Breadcrumb.Item>
                </Breadcrumb>
            }
            {purchaseOrder && (+purchaseOrder.status.id === 1 || +purchaseOrder.status.id === 2) &&
                <Card>
                    <Card.Header>
                        <p>
                            <Badge variant='primary'>PO: {purchaseOrder.code}</Badge>&nbsp;
                            <Badge variant={currentStatusVariant}>
                                {purchaseOrder.status ? purchaseOrder.status.name : ''}
                            </Badge>
                        </p>
                        <h4>Purchase Order &raquo; Store Request</h4>
                    </Card.Header>
                    <Card.Body>
                        <CommonDropdownSelectSingleStore
                            name="store_id"
                            selectedItem={selectedStore}
                            readOnly={isEdit}
                            handleChange={handleChangeSelectSingleStore} />
                        {isLoading && <Loader />}
                        {storeItems.length > 0 &&
                            <div className="row">
                                <hr className="mt-4" />
                                {
                                    storeItems.map((item, key) => <div className="col-md-6">
                                        <Card key={key} className="my-2">
                                            <Card.Body>
                                                <Form.Label>{item.name} Qty. (Original):</Form.Label>
                                                <Form.Control
                                                    type='number'
                                                    data-item-id={item.id}
                                                    defaultValue={item.pivot ?? false ? item.pivot.quantity_original : 0}
                                                    onChange={handleChangeItemQuantity}></Form.Control>
                                            </Card.Body>
                                        </Card>
                                    </div>)
                                }
                            </div>
                        }
                    </Card.Body>
                    <Card.Footer>
                        <div className='pull-right'>
                            <Link to={`/purchase-orders/${purchaseOrder.id}/details`}>
                                <Button variant='secondary'>Back</Button>
                            </Link>
                        </div>
                    </Card.Footer>
                </Card>
            }
        </>
    );
}

export default PurchaseOrderStoreRequest;
