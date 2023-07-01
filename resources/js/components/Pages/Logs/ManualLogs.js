import { Button, Card, Form } from 'react-bootstrap';
import CommonDropdownSelectSingleUsers from '../../CommonDropdownSelectSingleUsers';
import React, { useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../../Generic/Directory';
import { useSelector } from 'react-redux';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Logs',
        link: '#/logs'
    },
    {
        icon: '',
        label: 'Manual Logs',
    },
];

const ManualLogs = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canCreateManualBiometricLogs = isSuperAdmin || hasPermission("Create manual biometric logs");
    const canCreateManualDeliveryLogs = isSuperAdmin || hasPermission("Create manual delivery logs");

    const [selectedLogType, setSelectedLogType] = useState(canCreateManualBiometricLogs ? 'biometric' : 'delivery');
    const [selectedUser, setSelectedUser] = useState(null);

    const handleChangeSelectSingleUsers = (e) => {
        setSelectedUser(e);
    };

    const handleChangeLogType = (e) => {
        setSelectedLogType(e.target.value);
    };

    const handleSubmitManualLog = (e) => {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const form = $(e.target);
        const data = form.serialize();

        axios.post(`${apiBaseUrl}/manual-logs?token=${token}`, data)
            .then(() => {
                self.setState({
                    selectedLogType: 'biometric',
                    selectedUser: null,
                });
                form[0].reset();
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    };

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Form onSubmit={handleSubmitManualLog}>
                <Card className="my-4">
                    <Card.Header as="h5">
                        <i className="fa fa-calendar-plus-o"></i> {selectedLogType === 'biometric' ? 'Biometric' : 'Delivery'} Log
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-4">
                            <Form.Check
                                name="log_type"
                                type="radio"
                                label="Biometric"
                                value="biometric"
                                checked={selectedLogType === 'biometric'}
                                onChange={handleChangeLogType}
                                disabled={!canCreateManualBiometricLogs}
                                inline />
                            <Form.Check
                                name="log_type"
                                type="radio"
                                label="Delivery"
                                value="delivery"
                                checked={selectedLogType === 'delivery'}
                                onChange={handleChangeLogType}
                                disabled={!canCreateManualDeliveryLogs}
                                inline />
                        </Form.Group>
                        <CommonDropdownSelectSingleUsers
                            name="biometric_id"
                            selectedUser={selectedUser}
                            handleChange={handleChangeSelectSingleUsers} />
                        <Form.Group className="my-4">
                            <Form.Label>
                                Date{selectedLogType === 'biometric' ? ' and Time' : ''}:
                            </Form.Label>
                            <Form.Control
                                type={selectedLogType === 'biometric' ? 'datetime-local' : 'date'}
                                name={`log_${selectedLogType === 'biometric' ? 'datetime' : 'date'}`} />
                            <div className="invalid-feedback"></div>
                        </Form.Group>
                        {
                            selectedLogType === 'delivery' &&
                            <>
                                <Form.Group className="mb-4">
                                    <Form.Label>No.of Deliveries:</Form.Label>
                                    <Form.Control type="number" name="no_of_deliveries" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>Remarks:</Form.Label>
                                    <Form.Control as="textarea" rows="3" name="remarks" />
                                </Form.Group>
                            </>
                        }
                    </Card.Body>
                    <Card.Footer>
                        <Form.Group>
                            <Form.Control type="hidden" name="type" value={`${selectedLogType}_log`} />
                            <Button type="submit" className="pull-right">Add</Button>
                        </Form.Group>
                    </Card.Footer>
                </Card>
            </Form>
        </>
    );
};

export default ManualLogs;
