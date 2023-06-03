import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import React, { Component } from 'react';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/stock-cards`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-clipboard',
        label: 'Stock Cards',
        link: '#/stock-cards'
    },
    {
        icon: 'fa-file',
        label: 'Create Stock Card',
    },
];

export default class StockCardsCreate extends Component {
    constructor(props) {
        super(props);
        this.handleChangeStore = this.handleChangeStore.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleCreateStockCardSubmit = this.handleCreateStockCardSubmit.bind(this);

        this.state = {
            token: '',
            selectedStore: {},
            from: null,
            to: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        self.setState({
            ...self.state,
            token
        });
    }

    handleChangeStore(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedStore: e,
        });
    }

    handleChangeDate(e) {
        e.preventDefault();
        const self = this;
        const name = e.currentTarget.name;
        const value = e.currentTarget.value;

        let data = {};
        data[name] = value;

        self.setState({
            ...self.state,
            ...data,
        });
    }

    handleCreateStockCardSubmit(e) {
        e.preventDefault();
        const self = this;
        const form = $(e.currentTarget);
        const { token, selectedStore, from, to } = self.state;
        const data = {
            store_id: selectedStore ? selectedStore.value : null,
            from,
            to,
        };

        axios.post(`${END_POINT}?token=${token}`, data)
            .then((response) => {
                const data = response.data;
                const { id: stockCardId } = data;
                location.href = `${appBaseUrl}/#/stock-cards/${stockCardId}/details`;
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
                }
            });
    }

    render() {
        const {
            selectedStore,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    {
                        BREADCRUMB_ITEMS.map(({ icon, label, link }, key) =>
                            <Breadcrumb.Item key={key} href={link ?? ''} active={!link}>
                                <span>
                                    <i className={`fa ${icon}`}></i>&nbsp;
                                    {label}
                                </span>
                            </Breadcrumb.Item>
                        )
                    }
                </Breadcrumb>
                <Form onSubmit={this.handleCreateStockCardSubmit}>
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
                                                handleChange={this.handleChangeStore}
                                                selectedStore={selectedStore} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>From:</Form.Label>
                                                <Form.Control type="date" name="from" onChange={this.handleChangeDate} />
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>To:</Form.Label>
                                                <Form.Control type="date" name="to" onChange={this.handleChangeDate} />
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Card.Body>
                        <Card.Footer>
                            <ButtonGroup className="pull-right">
                                <Button type="submit">Create</Button>
                                <Link to="stock-cards" className="btn btn-secondary">Cancel</Link>
                            </ButtonGroup>
                        </Card.Footer>
                    </Card>
                </Form>
            </div>
        );
    }
}
