import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Button, Card, Badge, Form } from 'react-bootstrap';

export default class UserRateHistory extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitRate = this.handleSubmitRate.bind(this);
        this.state = {
            id: null,
            biometricId: null,
            name: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { userId } = params;

        const exportButtons = window.exportButtonsBase;

        axios.get(`${apiBaseUrl}/biometric/users/${userId}?token=${token}`)
            .then((response) => {
                const { data: user } = response.data;
                this.setState({
                    id: user.id,
                    biometricId: user.biometric_id,
                    name: user.name,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        $(this.refs.hourlyRateHistory).DataTable({
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

        $(this.refs.deliveryRateHistory).DataTable({
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

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    handleSubmitRate(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { userId } = params;
        const form = $(e.target);
        const formId = form.prop('id');
        const data = form.serialize();
        let table = null;
        if (formId === 'perHourRateForm') {
            table = $(self.refs.hourlyRateHistory).DataTable();
        } else {
            if (formId === 'perDeliveryRateForm') {
                table = $(self.refs.deliveryRateHistory).DataTable();
            }
        }
        axios.post(`${apiBaseUrl}/biometric/users/${userId}/rates?token=${token}`, data)
            .then((response) => {
                form[0].reset();
                table.ajax.reload(null, false);
            })
            .catch((error) => {
                
            });
    }

    render() {
        const {
            id,
            biometricId,
            name,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-history"></i> Rate History</h1>
                <hr className="my-4"/>
                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{biometricId}</Badge></p>
                                    <h4>{name}</h4>
                                </Card.Title>
                                <hr/>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    <h5>Hourly Rate</h5>
                                                </Card.Title>
                                                <hr/>
                                                <Form id="perHourRateForm" onSubmit={this.handleSubmitRate}>
                                                    <Form.Group>
                                                        <Form.Label>Effectivity Date:</Form.Label>
                                                        <Form.Control type="date" name="effectivity_date"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>Amount:</Form.Label>
                                                        <Form.Control type="text" name="amount"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Control type="hidden" name="type" value="per_hour"></Form.Control>
                                                        <Button type="submit">Create</Button>
                                                    </Form.Group>
                                                </Form>
                                                <hr/>
                                                <table ref="hourlyRateHistory" className="table table-striped" style={{width: 100+'%'}}>
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
                                            <Card.Body>
                                                <Card.Title>
                                                    <h5>Delivery Rate</h5>
                                                </Card.Title>
                                                <hr/>
                                                <Form id="perDeliveryRateForm" onSubmit={this.handleSubmitRate}>
                                                    <Form.Group>
                                                        <Form.Label>Effectivity Date:</Form.Label>
                                                        <Form.Control type="date" name="effectivity_date"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>Hourly Rate Amount:</Form.Label>
                                                        <Form.Control type="text" name="amount"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Control type="hidden" name="type" value="per_delivery"></Form.Control>
                                                        <Button type="submit">Create</Button>
                                                    </Form.Group>
                                                </Form>
                                                <hr/>
                                                <table ref="deliveryRateHistory" className="table table-striped" style={{width: 100+'%'}}>
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
                    </div>
                </div>
            </div>
        );
    }
}
