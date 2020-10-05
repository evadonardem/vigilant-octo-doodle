import React, { Component } from 'react';
import { Button, Card, Form, Modal, ButtonGroup } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';

export default class SettingsUserRoles extends Component {
    constructor(props) {
        super(props);
        this.handleAddUserRole = this.handleAddUserRole.bind(this);
        this.handleAddEditUserRoleSubmit = this.handleAddEditUserRoleSubmit.bind(this);
        this.handleCloseAddEditUserRole = this.handleCloseAddEditUserRole.bind(this);

        this.handleDeleteUserRoleSubmit = this.handleDeleteUserRoleSubmit.bind(this);
        this.handleCloseDeleteUserRole = this.handleCloseDeleteUserRole.bind(this);

        this.state = {
            showAddEditUserRoleModal: false,
            addEditUserRoleModalHeaderTitle: '',
            addEditUserRoleModalSubmitButtonLabel: '',
            editUserRoleId: '',
            editUserRoleDescription: '',
        }

        this.state = {
            isDeleteUserRoleError: false,
            deleteUserRoleErrorHeaderTitle: '',
            deleteUserRoleErrorBodyText: '',
        }
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Roles';
        const exportTitle = 'Roles';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.userRolesList).DataTable({
            ajax: apiBaseUrl + '/settings/roles?token=' + token,
            buttons: exportButtons,
            columns: [
                { 'data': 'id'},
                { 'data': 'description' },
                {
                    'data': null,
                    'render': function(data, type, row) {
                        const actionButtons = $('<div class="btn-group" role="group" aria-label="actions"/>');
                        const editButton = $('<button type="button" class="edit btn btn-primary" data-role-id="' + row.id + '" data-role-description="' + row.description + '"/>')
                            .html('<i class="fa fa-edit"></i>');
                        const deleteButton = $('<button type="button" class="delete btn btn-warning" data-role-id="' + row.id + '"/>')
                            .html('<i class="fa fa-trash"></i>');

                        actionButtons.append(editButton);
                        actionButtons.append('&nbsp;');
                        actionButtons.append(deleteButton);

                        return actionButtons.html();
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .edit', function(e) {
            const editUserRoleId = e.currentTarget.getAttribute('data-role-id');
            const editUserRoleDescription = e.currentTarget.getAttribute('data-role-description');
            self.setState({
                showAddEditUserRoleModal: true,
                addEditUserRoleModalHeaderTitle: 'Edit',
                addEditUserRoleModalSubmitButtonLabel: 'Update',
                editUserRoleId,
                editUserRoleDescription
            });
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const deleteUserRoleId = e.currentTarget.getAttribute('data-role-id');
            self.setState({
                showDeleteUserRoleModal: true,
                deleteUserRoleId
            });
        });
    }

    componentWillUnmount(){
        $('.data-table-wrapper')
            .find('table.table-user-roles')
            .DataTable()
            .destroy(true);

        $('.data-table-wrapper .edit').off();
        $('.data-table-wrapper .delete').off();
    }

    handleAddUserRole() {
        const self = this;
        self.setState({
            showAddEditUserRoleModal: true,
            addEditUserRoleModalHeaderTitle: 'Add',
            addEditUserRoleModalSubmitButtonLabel: 'Save',
            editUserRoleId: '',
            editUserRoleDescription: '',
        });

        self.setState({
            showDeleteUserRoleModal: false,
            deleteUserRoleId: '',
        });
    }

    handleAddEditUserRoleSubmit(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');

        const table = $('.data-table-wrapper').find('table.table-user-roles').DataTable();
        const form = e.currentTarget;
        const data = $(form).serialize();
        const modal = $('#addEditUserRoleModal');

        axios[self.state.editUserRoleId ? 'patch' : 'post'](apiBaseUrl + (
                    this.state.editUserRoleId ?
                        '/settings/roles/' + this.state.editUserRoleId + '?token='
                        : '/settings/roles?token='
                ) + token, data)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({ showAddEditUserRoleModal: false });
            })
            .catch((error) => {
               if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', modal)
                            .addClass('is-invalid')
                            .next()
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleDeleteUserRoleSubmit(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { deleteUserRoleId } = self.state;
        const table = $('.data-table-wrapper').find('table.table-user-roles').DataTable();

        axios.delete(apiBaseUrl + '/settings/roles/' + deleteUserRoleId + '?token=' + token)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({ showDeleteUserRoleModal: false });
            })
            .catch((error) => {
                self.setState({
                    isDeleteUserRoleError: true,
                    deleteUserRoleErrorHeaderTitle: 'Oh snap! Cannot delete role!',
                    deleteUserRoleErrorBodyText: `There are active users as ${deleteUserRoleId} role.`,
                });
            });
    }

    handleCloseAddEditUserRole() {
        const self = this;
        this.setState({ showAddEditUserRoleModal: false });
    }

    handleCloseDeleteUserRole() {
        const self = this;
        this.setState({ showDeleteUserRoleModal: false, isDeleteUserRoleError: false });
    }

    render() {
        const {
            showAddEditUserRoleModal,
            addEditUserRoleModalHeaderTitle,
            addEditUserRoleModalSubmitButtonLabel,
            editUserRoleId,
            editUserRoleDescription,
        } = this.state;


        const {
            showDeleteUserRoleModal,
            deleteUserRoleId,
            isDeleteUserRoleError,
            deleteUserRoleErrorHeaderTitle,
            deleteUserRoleErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-users"></i> User Roles</h1>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-12 pull-right">
                        <Button variant='primary' onClick={this.handleAddUserRole}>
                            <i className="fa fa-plus"></i> Add New User Role
                        </Button>
                    </div>
                </div>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Body>
                                <table ref="userRolesList" className="table table-striped table-user-roles">
                                    <thead>
                                        <tr>
                                            <th scope="col">Role</th>
                                            <th scope="col">Description</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <Modal
                    id="addEditUserRoleModal"
                    show={showAddEditUserRoleModal}
                    onHide={this.handleCloseAddEditUserRole}
                    centered
                    backdrop='static'
                    keyboard={false}>
                    <Form id="addEditForm" onSubmit={this.handleAddEditUserRoleSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>{addEditUserRoleModalHeaderTitle} User Role</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Title:</Form.Label>
                                <Form.Control type="text" name="role_title" defaultValue={editUserRoleId} readOnly={editUserRoleId && editUserRoleId.length > 0}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Description:</Form.Label>
                                <Form.Control as="textarea" name="role_description" defaultValue={editUserRoleDescription}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <ButtonGroup>
                                <Button variant="primary" type="submit">
                                    {addEditUserRoleModalSubmitButtonLabel}
                                </Button>
                                <Button variant="secondary" onClick={this.handleCloseAddEditUserRole}>
                                    Cancel
                                </Button>
                            </ButtonGroup>
                        </Modal.Footer>
                    </Form>
                </Modal>

                <CommonDeleteModal
                    isShow={showDeleteUserRoleModal}
                    headerTitle="Delete User Role"
                    bodyText={`Are you sure to delete role ${deleteUserRoleId}?`}
                    handleClose={this.handleCloseDeleteUserRole}
                    handleSubmit={this.handleDeleteUserRoleSubmit}
                    isDeleteError={isDeleteUserRoleError}
                    deleteErrorHeaderTitle={deleteUserRoleErrorHeaderTitle}
                    deleteErrorBodyText={deleteUserRoleErrorBodyText}/>
            </div>
        );
    }
}
