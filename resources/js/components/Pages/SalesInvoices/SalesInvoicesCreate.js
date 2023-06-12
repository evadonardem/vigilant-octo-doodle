import { Button, Card, Form } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import React from 'react';
import cookie from 'react-cookies';
import Directory from '../../Generic/Directory';

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
        label: 'Create Sales Invoice',
    },
];

const SalesInvoicesCreate = () => {
    const token = cookie.load('token');

    const handleCreateInvoiceSubmit = (e) => {
        e.preventDefault();

        const form = $(e.currentTarget);
        const data = form.serialize();

        axios.post(`${END_POINT}?token=${token}`, data)
            .then((response) => {
                const data = response.data;
                const { id: salesInvoiceId } = data;
                location.href = `${appBaseUrl}/#/sales-invoices/${salesInvoiceId}/details`;
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response && error.response.status === 422) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .closest('div')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
                } else {
                    location.href = `${appBaseUrl}`;
                }
            });
    }

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Form onSubmit={handleCreateInvoiceSubmit}>
                <Card className="my-4">
                    <Card.Header as="h5">
                        <i className="fa fa-file"></i> Create Sales Invoice
                    </Card.Header>
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
                                            <Form.Control type="date" name="date_countered" />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-3">
                                        <Form.Group>
                                            <Form.Label>Booklet No.:</Form.Label>
                                            <Form.Control type="text" name="booklet_no" />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-3">
                                        <Form.Group>
                                            <Form.Label>Invoice No.:</Form.Label>
                                            <Form.Control type="text" name="invoice_no" />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <CommonDropdownSelectSingleStoreCategory
                                            label="Sold To:"
                                            name="category_id" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Form.Group>
                                            <Form.Label>From:</Form.Label>
                                            <Form.Control type="date" name="from" />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                    </div>
                                    <div className="col-md-6">
                                        <Form.Group>
                                            <Form.Label>To:</Form.Label>
                                            <Form.Control type="date" name="to" />
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
                            <Link to="/sales-invoices" className="btn btn-secondary">Cancel</Link>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            </Form>
        </>
    );
};

export default SalesInvoicesCreate;
