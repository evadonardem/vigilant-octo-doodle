import React, { Component } from 'react';
import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';

const END_POINT = `${apiBaseUrl}/sales-invoices`;
let ajaxRequest = null;

export default class SalesInvoiceStoreItemsShow extends Component {
    constructor(props) {
        super(props);

        this.handleChangeSelectSingleStore = this.handleChangeSelectSingleStore.bind(this);
        this.handleChangeItemQuantity = this.handleChangeItemQuantity.bind(this);
        
        this.state = {
            salesInvoice: null,
            selectedStore: null,
            storeItems: [],
            token: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { salesInvoiceId } = params;

        self.setState({
            ...self.state,
            token,
        });

        axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
            .then((response) => {
                const { data: salesInvoice } = response.data;
                self.setState({
                    ...self.state,
                    salesInvoice,
                });                
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    window.location.reload();
                }
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
        const { salesInvoice, token } = state;

        const selectedStore = e;

        if (selectedStore) {
            axios.get(`${END_POINT}/${salesInvoice.id}/stores/${selectedStore.value}/items?token=${token}`)
                .then((response) => {
                    const { data: storeItems } = response.data;
                    self.setState({
                        ...state,
                        selectedStore,
                        storeItems,
                    });
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        window.location.reload();
                    }
                });
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
        const { salesInvoice, selectedStore, storeItems, token } = state;

        const target = e.currentTarget;
        const storeId = selectedStore.value;
        const itemId = target.getAttribute('data-item-id');
        const quantity = target.value;

        const data = {
            store_id: storeId,
            item_id: itemId,
            quantity,
        };

        self.setState({
            ...state,
            storeItems: storeItems.map((item) => {
                if (+item.id === +itemId) {
                    item['quantity'] = quantity;
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
            `${END_POINT}/${salesInvoice.id}/items?token=${token}`,
            data,
            { cancelToken: ajaxRequest.token }
        )
        .then(() => {})
        .catch((error) => {
            if (error.response.status === 401) {
                window.location.reload();
            }
        });
    }

    render() {
        const {
            salesInvoice,
            selectedStore,
            storeItems,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                { salesInvoice &&
                    <Breadcrumb>
                        <Breadcrumb.Item href="#/sales-invoices"><i className="fa fa-folder"></i> Sales Invoices</Breadcrumb.Item>
                        <Breadcrumb.Item href={`#/sales-invoice-details/${salesInvoice.id}`}>{salesInvoice.id}</Breadcrumb.Item>
                        <Breadcrumb.Item active>Store Items</Breadcrumb.Item>
                    </Breadcrumb>
                }
                { salesInvoice &&
                    <Card>
                        <Card.Header>
                            <p>
                                <Badge variant='primary'>SI: {salesInvoice.id}</Badge>
                            </p>
                            <h4>Sales Invoice &raquo; Store Items</h4>
                        </Card.Header>
                        <Card.Body>
                            <CommonDropdownSelectSingleStore
                                key={uuidv4()}
                                name="store_id"
                                selectedItem={selectedStore}                                
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
                                                        value={item.quantity ?? false ? item.quantity : 0}
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
                                <Link to={`/sales-invoice-details/${salesInvoice.id}`}>
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
