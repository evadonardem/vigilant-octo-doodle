import { isNumber, map } from 'lodash';
import React, { Component } from 'react';
import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';

const END_POINT = `${apiBaseUrl}/purchase-orders`;
const END_POINT_SETTINGS = `${apiBaseUrl}/settings`;

let ajaxRequest = null;

export default class PurchaseOrderStoreRequest extends Component {
    constructor(props) {
        super(props);

        this.handleChangeSelectSingleStore = this.handleChangeSelectSingleStore.bind(this);
        this.handleChangeItemQuantity = this.handleChangeItemQuantity.bind(this);
        
        this.state = {
            purchaseOrder: null,
            selectedStore: null,
            storeItems: [],
            token: null,
            isEdit: false,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { purchaseOrderId, storeId } = params;

        self.setState({
            ...self.state,
            token,
        });

        axios.get(`${END_POINT}/${purchaseOrderId}?token=${token}`)
            .then((response) => {
                const { data: purchaseOrder } = response.data;
                if (storeId) {
                    axios.get(`${END_POINT_SETTINGS}/stores/${storeId}?token=${token}`)
                        .then((response) => {
                            const { data: store } = response.data;
                            axios.get(`${END_POINT}/${purchaseOrder.id}/stores/${store.id}/requests?token=${token}`)
                                .then((response) => {
                                    const { data: storeItems } = response.data;
                                    self.setState({
                                        ...self.state,
                                        purchaseOrder,
                                        selectedStore: {
                                            value: store.id,
                                            label: store.name,
                                        },
                                        storeItems,
                                        isEdit: true,
                                    });
                                })
                                .catch(() => {});
                        })
                        .catch(() => {});
                } else {
                    self.setState({
                        ...self.state,
                        purchaseOrder,
                    });
                }                
            })
            .catch(() => {
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    handleChangeSelectSingleStore(e) {
        const self = this;
        const state = this.state;
        const { purchaseOrder, token } = state;

        const selectedStore = e;

        if (selectedStore) {
            axios.get(`${END_POINT}/${purchaseOrder.id}/stores/${selectedStore.value}/requests?token=${token}`)
                .then((response) => {
                    const { data: storeItems } = response.data;
                    self.setState({
                        ...state,
                        selectedStore,
                        storeItems,
                    });
                })
                .catch(() => {});
        } else {
            self.setState({
                ...state,
                selectedStore,
                storeItems: [],
            });
        }
    }

    handleChangeItemQuantity(e) {
        const self = this;
        const state = this.state;
        const { purchaseOrder, selectedStore, storeItems, token } = state;

        const target = e.currentTarget;
        const storeId = selectedStore.value;
        const itemId = target.getAttribute('data-item-id');
        const quantityOriginal = target.value;

        const data = {
            store_id: storeId,
            item_id: itemId,
            quantity_original: quantityOriginal,
        };

        self.setState({
            ...state,
            storeItems: storeItems.map((item) => {
                if (+item.id === +itemId) {
                    if (item.pivot) {
                        item.pivot = {
                            ...item.pivot,
                            quantity_original: quantityOriginal,
                        };
                    } else {
                        item['pivot'] = {
                            quantity_original: quantityOriginal,
                        };
                    }
                }
                return item;
            }),
        });

        // cancel  previous ajax if exists
        if (ajaxRequest) {
            ajaxRequest.cancel(); 
        }

        // creates a new token for upcomming ajax (overwrite the previous one)
        ajaxRequest = axios.CancelToken.source();

        axios.post(
            `${END_POINT}/${purchaseOrder.id}/items?token=${token}`,
            data,
            { cancelToken: ajaxRequest.token }
        )
        .then(() => {})
        .catch(() => {});
    }

    render() {
        const {
            purchaseOrder,
            selectedStore,
            storeItems,
            isEdit,
        } = this.state;

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
            <div className="container-fluid my-4">
                { purchaseOrder &&
                    <Breadcrumb>
                        <Breadcrumb.Item href="#/purchase-orders"><i className="fa fa-folder"></i> Purchase Orders</Breadcrumb.Item>
                        <Breadcrumb.Item href={`#/purchase-order-details/${purchaseOrder.id}`}>{purchaseOrder.code}</Breadcrumb.Item>
                        <Breadcrumb.Item active>Store Request</Breadcrumb.Item>
                    </Breadcrumb>
                }
                { purchaseOrder && (+purchaseOrder.status.id === 1 || +purchaseOrder.status.id === 2) &&
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
                                key={uuidv4()}
                                name="store_id"
                                selectedItem={selectedStore}
                                readOnly={isEdit}
                                handleChange={this.handleChangeSelectSingleStore}/>
                            { storeItems.length > 0 &&
                                <div className="row">
                                    {
                                        storeItems.map((item, key) => <div className="col-md-6">
                                            <Card key={key}>
                                                <Card.Body>
                                                    <Form.Label>{item.name} Qty. (Original):</Form.Label>
                                                    <Form.Control
                                                        type='number'
                                                        data-item-id={item.id}
                                                        value={item.pivot ?? false ? item.pivot.quantity_original : 0}
                                                        onChange={this.handleChangeItemQuantity}></Form.Control>
                                                </Card.Body>
                                            </Card>
                                        </div>)
                                    }
                                </div>
                            }
                        </Card.Body>
                        <Card.Footer>
                            <div className='pull-right'>
                                <Link to={`/purchase-order-details/${purchaseOrder.id}`}>
                                    <Button variant='secondary'>Back</Button>
                                </Link>
                            </div>
                        </Card.Footer>
                    </Card>
                }
            </div>
        );
    }
}
