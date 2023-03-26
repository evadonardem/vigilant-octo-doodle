import React, { Component } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';

import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';

const END_POINT = `${apiBaseUrl}/sales-invoices`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-files-o',
        label: 'Sales Invoices',
        link: '#/sales-invoices'
    },
    {
        icon: 'fa-file',
        label: 'Create Sales Invoice',
    },
];

export default class SalesInvoices extends Component {
    constructor(props) {
        super(props);
        this.handleCreateInvoiceSubmit = this.handleCreateInvoiceSubmit.bind(this);

        this.state = {
            token: '',
            selectedCategory: {},
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

    handleCreateInvoiceSubmit (e) {
        e.preventDefault();
        const self = this;
        const { token } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();

        axios.post(`${END_POINT}?token=${token}`, data)
            .then((response) => {
                const data = response.data;
                const { id: salesInvoiceId } = data;
                location.href = `${appBaseUrl}/#/sales-invoice-details/${salesInvoiceId}`;
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
            selectedCategory,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    {
                        BREADCRUMB_ITEMS.map(({icon, label, link} = item) =>
                            <Breadcrumb.Item href={link ?? ''} active={!link}>
                                <span>
                                    <i className={`fa ${icon}`}></i>&nbsp;
                                    {label}
                                </span>
                            </Breadcrumb.Item>
                        )
                    }
                </Breadcrumb>
                <Form onSubmit={this.handleCreateInvoiceSubmit}>
                    <Card>                        
                        <Card.Body>
                            <Card>
                                <Card.Header>
                                    <i className="fa fa-info-circle"></i> General Info
                                </Card.Header>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <Form.Group>
                                                <Form.Label>Date Countered:</Form.Label>
                                                <Form.Control type="date" name="date_countered"/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <Form.Group>
                                                <Form.Label>Booklet No.:</Form.Label>
                                                <Form.Control type="text" name="booklet_no"/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-3">
                                            <Form.Group>
                                                <Form.Label>Invoice No.:</Form.Label>
                                                <Form.Control type="text" name="invoice_no"/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <CommonDropdownSelectSingleStoreCategory
                                                label="Sold To:"
                                                name="category_id"
                                                handleChange={this.handleStoreCategoryChange}
                                                selectedCategory={selectedCategory}/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>From:</Form.Label>
                                                <Form.Control type="date" name="from"/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>To:</Form.Label>
                                                <Form.Control type="date" name="to"/>
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
                                <Link to="sales-invoices" className="btn btn-secondary">Cancel</Link>
                            </ButtonGroup>
                        </Card.Footer>
                    </Card>
                </Form>
            </div>
        );
    }
}
