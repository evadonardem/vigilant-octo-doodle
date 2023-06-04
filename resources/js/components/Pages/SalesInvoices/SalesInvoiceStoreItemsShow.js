import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/sales-invoices`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Sales Invoices',
        link: '#/sales-invoices'
    },
    {
        icon: '',
        label: '{salesInvoiceId}',
        link: '#/sales-invoices/{salesInvoiceId}/details'
    },
    {
        icon: '',
        label: 'Store Items',
    },
];

let ajaxRequest = null;

const SalesInvoiceStoreItemsShow = () => {
    const token = cookie.load('token');
    const params = useParams();
    const { salesInvoiceId } = params;
    const [salesInvoice, setSalesInvoice] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [storeItems, setStoreItems] = useState([]);

    const handleChangeSelectSingleStore = (e) => {
        const selectedStore = e;
        if (selectedStore) {
            axios.get(`${END_POINT}/${salesInvoice.id}/stores/${selectedStore.value}/items?token=${token}`)
                .then((response) => {
                    const { data: storeItems } = response.data;
                    setSelectedStore(selectedStore);
                    setStoreItems(storeItems);
                })
                .catch((error) => {
                    if (error.response?.status === 401) {
                        window.location.reload();
                    }
                });
        } else {
            setSelectedStore(selectedStore);
            setStoreItems([]);
        }
    };

    const handleChangeItemQuantity = (e) => {
        e.preventDefault();

        const target = e.currentTarget;
        const storeId = selectedStore.value;
        const itemId = target.getAttribute('data-item-id');
        const quantity = target.value;

        const data = {
            store_id: storeId,
            item_id: itemId,
            quantity,
        };

        setStoreItems(storeItems.map((item) => {
            if (+item.id === +itemId) {
                item['quantity'] = quantity;
            }
            return item;
        }));

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
            .then(() => { })
            .catch((error) => {
                if (error.response?.status === 401) {
                    window.location.reload();
                }
            });
    };

    const init = () => {
        axios.get(`${END_POINT}/${salesInvoiceId}?token=${token}`)
            .then((response) => {
                const { data: salesInvoice } = response.data;
                setSalesInvoice(salesInvoice);
            })
            .catch((error) => {
                if (error.response?.status === 401) {
                    window.location.reload();
                }
            });
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            {salesInvoice &&
                <Card>
                    <Card.Header>
                        <Breadcrumb>
                            {
                                BREADCRUMB_ITEMS.map(({ icon, label, link }, key) =>
                                    <Breadcrumb.Item key={key} href={link ? link.replace('{salesInvoiceId}', salesInvoice.id) : ''} active={!link}>
                                        <span>
                                            <i className={`fa ${icon}`}></i>
                                            {label.replace('{salesInvoiceId}', `Sales Invoice No. ${salesInvoice.id}`)}
                                        </span>
                                    </Breadcrumb.Item>
                                )
                            }
                        </Breadcrumb>
                        <h5><i className="fa fa-file"></i> Sales Invoice No. {salesInvoice.id} Store Items</h5>
                    </Card.Header>
                    <Card.Body>
                        <CommonDropdownSelectSingleStore
                            key={uuidv4()}
                            name="store_id"
                            selectedItem={selectedStore}
                            handleChange={handleChangeSelectSingleStore} />
                        {storeItems.length > 0 &&
                            <div className="row">
                                {
                                    storeItems.map((item, key) => <div key={key} className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <Form.Label>{item.name} Qty. (Original):</Form.Label>
                                                <Form.Control
                                                    type='number'
                                                    data-item-id={item.id}
                                                    value={item.quantity ?? false ? item.quantity : 0}
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
                            <Link to={`/sales-invoices/${salesInvoice.id}/details`}>
                                <Button variant='secondary'>Back</Button>
                            </Link>
                        </div>
                    </Card.Footer>
                </Card>
            }
        </>
    );
}

export default SalesInvoiceStoreItemsShow;
