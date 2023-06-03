import { Button, Card, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import CommonDropdownSelectSingleUsers from '../../CommonDropdownSelectSingleUsers';
import React, { Component } from 'react';
import cookie from 'react-cookies';

export default class ManualLogs extends Component {
    constructor(props) {
        super(props);
        this.handleChangeSelectSingleUsers = this.handleChangeSelectSingleUsers.bind(this);
        this.handleChangeLogType = this.handleChangeLogType.bind(this);
        this.handleSubmitManualLog = this.handleSubmitManualLog.bind(this);
        this.state = {
            selectedLogType: 'biometric',
            selectedUser: null,
        };
    }

    handleChangeSelectSingleUsers(e) {
        this.setState({
            selectedUser: e
        });
    }

    handleChangeLogType(e) {
        this.setState({
            selectedLogType: e.target.value,
        });
    }

    handleSubmitManualLog(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const form = $(e.target);
        const data = form.serialize();

        axios.post(`${apiBaseUrl}/manual-logs?token=${token}`, data)
            .then((response) => {
                self.setState({
                    selectedLogType: 'biometric',
                    selectedUser: null,
                });
                form[0].reset();
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    render() {
        const { selectedLogType, selectedUser } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-calendar-plus-o"></i> Manual Logs</h1>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-6">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <h4>{selectedLogType === 'biometric' ? 'Biometric' : 'Delivery'} Log</h4>
                                </Card.Title>
                                <hr/>
                                <Form onSubmit={this.handleSubmitManualLog}>
                                    <Form.Group>
                                        <Form.Check
                                            name="log_type"
                                            type="radio"
                                            label="Biometric"
                                            value="biometric"
                                            checked={selectedLogType === 'biometric'}
                                            onChange={this.handleChangeLogType}
                                            inline/>
                                        <Form.Check
                                            name="log_type"
                                            type="radio"
                                            label="Delivery"
                                            value="delivery"
                                            checked={selectedLogType === 'delivery'}
                                            onChange={this.handleChangeLogType}
                                            inline/>
                                    </Form.Group>
                                    <CommonDropdownSelectSingleUsers
                                        key={uuidv4()}
                                        name="biometric_id"
                                        selectedUser={selectedUser}
                                        handleChange={this.handleChangeSelectSingleUsers}/>
                                    <Form.Group>
                                        <Form.Label>
                                            Date{selectedLogType === 'biometric' ? ' and Time' : ''}:
                                        </Form.Label>
                                        <Form.Control
                                            type={selectedLogType === 'biometric' ? 'datetime-local' : 'date'}
                                            name={`log_${selectedLogType === 'biometric' ? 'datetime' : 'date'}`}/>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    {
                                        selectedLogType === 'delivery' &&
                                        <div>
                                            <Form.Group>
                                                <Form.Label>No.of Deliveries:</Form.Label>
                                                <Form.Control type="number" name="no_of_deliveries"/>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Remarks:</Form.Label>
                                                <Form.Control as="textarea" rows="3" name="remarks"/>
                                            </Form.Group>
                                        </div>
                                    }
                                    <Form.Group>
                                        <Form.Control type="hidden" name="type" value={`${selectedLogType}_log`}/>
                                        <Button type="submit" className="pull-right">Add</Button>
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-6">

                    </div>
                </div>
            </div>
        );
    }
}
