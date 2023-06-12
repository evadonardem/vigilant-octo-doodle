import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../../../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Settings',
        link: '#/settings'
    },
    {
        icon: '',
        label: 'Users',
        link: '#/settings/users'
    },
    {
        icon: '',
        label: '{user}',
    },
    {
        icon: '',
        label: 'Rate History',
    },
];

const RateHistory = () => {
    const params = useParams();
    const { userId } = params;
    const [id, setId] = useState(null);
    const [biometricId, setBiometricId] = useState(null);
    const [name, setName] = useState(null);

    const loadRateHistory = () => {
        const token = cookie.load('token');
        const exportButtons = window.exportButtonsBase;

        $('.data-table-wrapper').find('table').DataTable().destroy(true);

        axios.get(`${apiBaseUrl}/biometric/users/${userId}?token=${token}`)
            .then((response) => {
                const { data: user } = response.data;
                setId(user.id);
                setBiometricId(user.biometric_id);
                setName(user.name);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        $(".table-hourly-rate-history").DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/biometric/users/${userId}/rates?filters[rate_type_id]=1&token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;

                    return data;
                },
            },
            ordering: false,
            processing: true,
            serverSide: true,
            buttons: exportButtons,
            columns: [
                { 'data': 'amount' },
                { 'data': 'effectivity_date' },
            ]
        });

        $(".table-delivery-rate-history").DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/biometric/users/${userId}/rates?filters[rate_type_id]=2&token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;

                    return data;
                },
            },
            ordering: false,
            processing: true,
            serverSide: true,
            buttons: exportButtons,
            columns: [
                { 'data': 'amount' },
                { 'data': 'effectivity_date' },
            ]
        });
    }

    const handleSubmitRate = (e) => {
        e.preventDefault();
        const token = cookie.load('token');
        const form = $(e.target);
        const formId = form.prop('id');
        const data = form.serialize();
        let table = null;
        if (formId === 'perHourRateForm') {
            table = $(".table-hourly-rate-history").DataTable();
        } else {
            if (formId === 'perDeliveryRateForm') {
                table = $(".table-delivery-rate-history").DataTable();
            }
        }
        axios.post(`${apiBaseUrl}/biometric/users/${userId}/rates?token=${token}`, data)
            .then(() => {
                form[0].reset();
                table.ajax.reload(null, false);
            })
            .catch(() => {
            });
    };

    useEffect(() => {
        loadRateHistory();
    }, []);

    const items = biometricId && name ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{user}', `(${biometricId}) ${name}`);
        return item;
    }) : [];

    return (
        <>
            <Directory items={items}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <Badge><i className="fa fa-id-card"></i> {biometricId}</Badge> {name} (Rate History)
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-6">
                            <Card>
                                <Card.Header>Hourly Rate</Card.Header>
                                <Card.Body>
                                    <Card>
                                        <Card.Body>
                                            <Form id="perHourRateForm" onSubmit={handleSubmitRate}>
                                                <Form.Group>
                                                    <Form.Label>Effectivity Date:</Form.Label>
                                                    <Form.Control type="date" name="effectivity_date"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group className="mt-2">
                                                    <Form.Label>Amount:</Form.Label>
                                                    <Form.Control type="text" name="amount"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group className="mt-4">
                                                    <Form.Control type="hidden" name="type" value="per_hour"></Form.Control>
                                                    <Button type="submit" className="pull-right">Create</Button>
                                                </Form.Group>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                    <hr />
                                    <table className="table table-striped table-hourly-rate-history" style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col">Rate</th>
                                                <th scope="col">Effectivity Date</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-6">
                            <Card>
                                <Card.Header>Delivery Rate</Card.Header>
                                <Card.Body>
                                    <Card>
                                        <Card.Body>
                                            <Form id="perDeliveryRateForm" onSubmit={handleSubmitRate}>
                                                <Form.Group>
                                                    <Form.Label>Effectivity Date:</Form.Label>
                                                    <Form.Control type="date" name="effectivity_date"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group className="mt-2">
                                                    <Form.Label>Hourly Rate Amount:</Form.Label>
                                                    <Form.Control type="text" name="amount"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group className="mt-4">
                                                    <Form.Control type="hidden" name="type" value="per_delivery"></Form.Control>
                                                    <Button type="submit" className="pull-right">Create</Button>
                                                </Form.Group>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                    <hr />
                                    <table className="table table-striped table-delivery-rate-history" style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col">Rate</th>
                                                <th scope="col">Effectivity Date</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

export default RateHistory;
