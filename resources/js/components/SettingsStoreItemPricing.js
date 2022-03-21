import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Badge, Breadcrumb, Card, Form } from 'react-bootstrap';

const END_POINT = `${apiBaseUrl}/settings/stores`;

let ajaxRequest = null;

export default class SettingsStoreItemPricing extends Component {
    constructor(props) {
        super(props);
        this.handleChangeEffectivityDate = this.handleChangeEffectivityDate.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);

        this.state = {
            effectivityDate: null,
            store: {},
            items: [],
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { storeId } = params;

        self.setState({
            ...self.state,
            token,
        });

        axios.get(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`)
            .then((response) => {
                const { data: store } = response.data;
                self.setState({
                    ...self.state,
                    store,
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

    handleChangeEffectivityDate(e) {
        e.preventDefault();
        const self = this;
        const { store, token } = self.state;
        const effectivityDate = e.target.value;

        if (effectivityDate) {
            axios.get(`${apiBaseUrl}/settings/stores/${store.id}/item-pricing/${effectivityDate}?token=${token}`)
                .then((response) => {
                    const { data: items } = response.data;
                    self.setState({
                        ...self.state,
                        effectivityDate,
                        items,
                    });
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });
        } else {
            self.setState({
                ...self.state,
                effectivityDate: null,
                items: [],
            });
        }
    }

    handleChangeAmount(e) {
        const self = this;
        const { effectivityDate, store, items, token } = self.state;
        const target = e.target;
        const itemId = target.getAttribute('data-item-id');

        const updatedItems = items.map((item) => {
            if (+item.id === +itemId) {
                item.amount = target.value;
            }
            return item;
        });

        self.setState({
            ...self.state,
            items: updatedItems,
        });

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
        .then(() => {})
        .catch(() => {});
    }

    render() {
        const {
            store,
            items,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/settings-stores">Stores Registry</Breadcrumb.Item>
                    <Breadcrumb.Item href={`#/settings-store-details/${store.id}`}>{store.code}</Breadcrumb.Item>
                    <Breadcrumb.Item active>Item Pricing</Breadcrumb.Item>
                </Breadcrumb>
                <Card>
                    <Card.Header>
                        <p><Badge variant='primary'>Code: {store.code}</Badge></p>
                        <h4>{store.name} &raquo; Item Pricing</h4>
                    </Card.Header>
                    <Card.Body>
                        <div className='row'>
                            <div className='col-md-4'>
                                <Form.Group>
                                    <Form.Label>Effectivity Date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="effectivity_date"
                                        onChange={this.handleChangeEffectivityDate}></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                            </div>                            
                        </div>                        
                        { items &&
                            <div className='row'>
                            { items.map((item) => <>
                                <div className='col-md-4'>
                                    <Card>
                                        <Card.Header>
                                            Code: <Badge variant='primary'>{item.code}</Badge><br/>
                                            Name: {item.name}
                                        </Card.Header>
                                        <Card.Body>
                                            <Form.Group>
                                                <Form.Label>Amount:</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="amount"
                                                    value={item.amount}
                                                    style={{textAlign: 'right'}}
                                                    data-item-id={item.id}
                                                    onChange={this.handleChangeAmount}></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </>) }
                        </div> }
                    </Card.Body>
                </Card>
            </div>
        );
    }
}
