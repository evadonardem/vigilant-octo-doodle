import React, { Component } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import CommonDropdownSelectSingleRoles from './CommonDropdownSelectSingleRoles';
import CommonDropdownSelectSingleUsers from './CommonDropdownSelectSingleUsers';

export default class CommonSearchFilters extends Component {
    constructor(props) {
        super(props);
        this.handleChangeSelectSingleRoles = this.handleChangeSelectSingleRoles.bind(this);
        this.handleChangeSelectSingleUsers = this.handleChangeSelectSingleUsers.bind(this);
        this.state = {
            biometricName: '',
            selectedUser: null,
            selectedRole: null,
        }
    }

    handleChangeSelectSingleRoles(e) {
        this.setState({
            biometricName: '',
            selectedUser: null,
            selectedRole: e,
        });
    }

    handleChangeSelectSingleUsers(e) {
        this.setState({
            biometricName: e ? e.label : '',
            selectedUser: e
        });
    }

    render() {
        const {
            handleSubmit,
            showRolesFilter,
            searchErrors,
        } = this.props;
        const {
            biometricName,
            selectedUser,
            selectedRole,
        } = this.state;

        let userFilters = {};
        if (selectedRole) {
            userFilters.role_id = selectedRole.value;
        }

        return (
            <div>
                <Form className={!searchErrors ? 'was-validated' : ''} onSubmit={handleSubmit}>
                    <Card>
                        <Card.Header>
                            <i className="fa fa-user"/> User
                        </Card.Header>
                         <Card.Body>
                            {
                                showRolesFilter &&
                                <CommonDropdownSelectSingleRoles
                                    name="role_id"
                                    selectedRole={selectedRole}
                                    handleChange={this.handleChangeSelectSingleRoles}/>
                            }
                            <CommonDropdownSelectSingleUsers
                                key={uuidv4()}
                                name="biometric_id"
                                selectedUser={selectedUser}
                                handleChange={this.handleChangeSelectSingleUsers}
                                filters={userFilters}/>
                            <Form.Control type="hidden" name="biometric_name" defaultValue={biometricName}></Form.Control>
                         </Card.Body>
                    </Card>
                    <br/>
                    <Card>
                        <Card.Header>
                            <i className="fa fa-calendar-o"/> Date Coverage
                        </Card.Header>
                         <Card.Body>
                            <Form.Group>
                                <Form.Label>Start Date:</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    isInvalid={searchErrors && searchErrors.start_date}
                                    required></Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {searchErrors.start_date && searchErrors.start_date[0]}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>End Date:</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    isInvalid={searchErrors && searchErrors.end_date}
                                    required></Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {searchErrors.end_date && searchErrors.end_date[0]}
                                </Form.Control.Feedback>
                            </Form.Group>
                         </Card.Body>
                    </Card>
                    <hr/>
                    <Button type="submit" className="pull-right" variant="primary">
                        <i className="fa fa-search"/> Search
                    </Button>
                </Form>
            </div>
        );
    }
}
