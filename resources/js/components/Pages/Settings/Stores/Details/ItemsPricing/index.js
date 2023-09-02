import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStore } from '../../../../../../state/settings/store';
import Directory from '../../../../../Generic/Directory';

const END_POINT = `${apiBaseUrl}/settings/stores`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard',
    },
    {
        icon: '',
        label: 'Settings',
        link: '#/settings',
    },
    {
        icon: '',
        label: 'Stores',
        link: '#/settings/stores',
    },
    {
        icon: '',
        label: '{storeCode}',
        link: '#/settings/stores/{storeId}/details'
    },
    {
        icon: '',
        label: 'Items Pricing',
    },
];

let ajaxRequest = null;

const StoreItemsPricingLedger = () => {
    const token = cookie.load('token');
    const dispatch = useDispatch();
    const store = useSelector((state) => state.store);
    const params = useParams();
    const { storeId } = params;
    const [effectivityDate, setEffectivityDate] = useState(null);
    const [items, setItems] = useState([]);

    const init = () => {
        dispatch(getStore(storeId));
    }

    const handleChangeEffectivityDate = (e) => {
        e.preventDefault();
        const effectivityDate = e.target.value;

        if (effectivityDate) {
            axios.get(`${apiBaseUrl}/settings/stores/${store.id}/item-pricing/${effectivityDate}?token=${token}`)
                .then((response) => {
                    const { data: items } = response.data;
                    setEffectivityDate(effectivityDate);
                    setItems(items);
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });
        } else {
            setEffectivityDate(null);
            setItems([]);
        }
    };

    const handleChangeAmount = (e) => {
        const target = e.target;
        const itemId = target.getAttribute('data-item-id');

        const updatedItems = items.map((item) => {
            if (+item.id === +itemId) {
                item.amount = target.value;
            }
            return item;
        });

        setItems(updatedItems);

        const data = {
            effectivity_date: effectivityDate,
            item_id: itemId,
            amount: target.value,
        };

        // cancel  previous ajax if exists
        if (ajaxRequest) {
            ajaxRequest.cancel();
        }

        // creates a new token for upcomming ajax (overwrite the previous one)
        ajaxRequest = axios.CancelToken.source();

        axios.post(
            `${apiBaseUrl}/settings/stores/${store.id}/items?token=${token}`,
            data,
            { cancelToken: ajaxRequest.token }
        )
            .then(() => { })
            .catch(() => { });
    };

    const breadcrumbItems = !store.isLoading ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{storeCode}', store.code);
        item.link = item.link?.replace('{storeId}', store.id);
        return item;
    }) : BREADCRUMB_ITEMS;

    useEffect(() => {
        init();
    }, []);

    return <>
        {!store.isLoading && <Directory items={breadcrumbItems} />}

        <Card className='my-4'>
            <Card.Header>
                <i className='fa fa-list' /> Items Pricing
            </Card.Header>
            <Card.Body>
                <p><Badge variant='primary'>Code: {store.code}</Badge></p>
                <h4>{store.name} &raquo; Item Pricing</h4>
                <div className='row'>
                    <div className='col-md-4'>
                        <Form.Group className='mb-4'>
                            <Form.Label>Effectivity Date:</Form.Label>
                            <Form.Control
                                type="date"
                                name="effectivity_date"
                                onChange={handleChangeEffectivityDate}></Form.Control>
                            <div className="invalid-feedback"></div>
                        </Form.Group>
                    </div>
                </div>
                {items &&
                    <Row>
                        {items.map((item, i) => <Col key={i} md={4}>
                            <Card className='mb-4'>
                                <Card.Header>
                                    Code: <Badge variant='primary'>{item.code}</Badge><br />
                                    Name: {item.name}
                                </Card.Header>
                                <Card.Body>
                                    <Form.Group>
                                        <Form.Label>Amount:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="amount"
                                            value={item.amount}
                                            style={{ textAlign: 'right' }}
                                            data-item-id={item.id}
                                            onChange={handleChangeAmount}></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>)}
                    </Row>}
            </Card.Body>
        </Card>
    </>;
}

export default StoreItemsPricingLedger;
