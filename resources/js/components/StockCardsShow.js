import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Breadcrumb, Card, Form, Table } from 'react-bootstrap';

import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';
import axios from 'axios';

const END_POINT = `${apiBaseUrl}/stock-cards`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-clipboard',
        label: 'Stock Cards',
        link: '#/stock-cards'
    },
    {
        icon: 'fa-file',
        label: 'Stock Card {stockCardId}',
    },
];

let ajaxRequest;

export default class StockCardsShow extends Component {
    constructor(props) {
        super(props);

        this.handleChangeQuantity = this.handleChangeQuantity.bind(this);

        this.state = {
            token: '',
            stockCard: null,
            stockCardTypes: [
                {
                    code: 'disers_inventory',
                    label: 'Diser\'s Inventory',
                },
                {
                    code: 'sra_inventory',
                    label: 'Sales Return and Allowances (SRA)',
                },
                {
                    code: 'beginning_inventory',
                    label: 'Beginning Inventory',
                },
                {
                    code: 'delivered_inventory',
                    label: 'Delivered',
                },
                {
                    code: 'sold_inventory',
                    label: 'Sold',
                },
                {
                    code: 'ending_inventory',
                    label: 'Ending Inventory',
                },
            ],
        };
    }

    fetchStockCard(self, token, stockCardId) {
        axios.get(`${END_POINT}/${stockCardId}?token=${token}`)
            .then((response) => {
                const { data: stockCard } = response.data;
                self.setState({
                    ...self.state,
                    stockCard,
                    selectedStore: {
                        value: stockCard.store.id,
                        label: `${stockCard.store.code} - ${stockCard.store.name}`,
                    },
                });
                
                axios.get(`${END_POINT}/${stockCardId}/details?token=${token}`)
                    .then((response) => {                    
                        const { data: stockCardDetails } = response.data;
                        let { items } = self.state.stockCard;

                        items = items.map((item) => {
                            item.details = stockCardDetails.filter((detail) => detail.item_id == item.id);
                            return item;
                        });

                        self.setState({
                            ...self.state,
                            stockCard: {
                                ...self.state.stockCard,
                                items
                            },
                        });
                    })
                    .catch((error) => {

                    });
            })
            .catch((error) => {
                
            });
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { stockCardId } = params;

        self.setState({
            ...self.state,
            token,
        });

        this.fetchStockCard(self, token, stockCardId);
    }

    handleChangeQuantity(e) {
        e.preventDefault();
        const self = this;
        const { token, stockCard } = self.state;
        const element = e.currentTarget;
        const { type, itemId: item_id } = element.dataset;
        const quantity = +element.value;

        if (ajaxRequest !== undefined) {
            ajaxRequest.cancel();
        }
        ajaxRequest = axios.CancelToken.source();

        axios.post(
            `${END_POINT}/${stockCard.id}/details?token=${token}`,
            {
                type,
                item_id,
                quantity,
            },
            {
                cancelToken: ajaxRequest.token,
            }
        )
            .then(() => {
                this.fetchStockCard(self, token, stockCard.id);
            })
            .catch((error) => {

            });
    }

    render() {
        const {
            stockCard,
            selectedStore,
            stockCardTypes,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                { stockCard &&
                    <>
                        <Breadcrumb>
                            {
                                BREADCRUMB_ITEMS.map(({icon, label, link} = item) =>
                                    <Breadcrumb.Item href={link ?? ''} active={!Boolean(link)}>
                                        <span>
                                            <i className={`fa ${icon}`}></i>&nbsp;
                                            {label.replace('{stockCardId}', stockCard.id)}
                                        </span>
                                    </Breadcrumb.Item>
                                )
                            }
                        </Breadcrumb>
                        <Card>                        
                            <Card.Body>
                                <Card>
                                    <Card.Header>
                                        <i className="fa fa-info-circle"></i> General Info
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <CommonDropdownSelectSingleStore
                                                    selectedItem={selectedStore}
                                                    readOnly/>
                                            </div>
                                        </div>
                                        <div className="row">                                            
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label>From:</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="from"
                                                        defaultValue={stockCard.from}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group>
                                                    <Form.Label>To:</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="to"
                                                        defaultValue={stockCard.to}
                                                        readOnly/>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                            </div>
                                        </div>                                        
                                    </Card.Body>
                                </Card>
                                <Card className="mt-4">
                                    <Card.Header>
                                        <i className="fa fa-clipboard"></i> Details
                                    </Card.Header>
                                    <Card.Body>
                                        {stockCardTypes.map((stockCardType) => (
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th colSpan={stockCard.items.length}>{stockCardType.label}</th>
                                                    </tr>
                                                    <tr>
                                                        {stockCard.items.map((item) => (
                                                            <th>{item.name}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        {stockCard.items.map((item) => {
                                                            const detail = item.details
                                                                ? item.details.find((detail) => detail.type === stockCardType.code)
                                                                : null;                                                            
                                                            return <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    data-type={stockCardType.code}
                                                                    data-item-id={item.id}
                                                                    defaultValue={detail ? detail.quantity : null}
                                                                    readOnly={stockCardType.code === 'ending_inventory'}
                                                                    onBlur={stockCardType.code !== 'ending_inventory'
                                                                        ? this.handleChangeQuantity
                                                                        : null}/>
                                                            </td>;
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        ))}
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                    </>
                }
            </div>
        );
    }
}
