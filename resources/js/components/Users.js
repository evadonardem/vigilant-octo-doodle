import React, { Component } from 'react';
import { Button, Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';
import AddEditUserModal from './AddEditUserModal';

export default class Users extends Component {
    constructor(props) {
        super(props);

        this.handleShowAddEditUserModal = this.handleShowAddEditUserModal.bind(this);
        this.handleCloseAddEditUserModal = this.handleCloseAddEditUserModal.bind(this);
        this.handleSubmitAddEditUserModal = this.handleSubmitAddEditUserModal.bind(this);

        this.handleCloseDeleteUserModal = this.handleCloseDeleteUserModal.bind(this);
        this.handleSubmitDeleteUserModal = this.handleSubmitDeleteUserModal.bind(this)

        this.state = {
            userId: null,
            userBiometricId: null,
            userName: '',
            userRole: '',
        };

        this.state = {
            showAddEditUserModal: false,
            isEditUser: false,
        };

        this.state = {
            showDeleteUserModal: false,
            isDeleteUserError: false,
            deleteUserErrorHeaderTitle: '',
            deleteUserErrorBodyText: '',
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Users';
        const exportTitle = 'Users';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.usersList).DataTable({
            ajax: apiBaseUrl + '/biometric/users?token=' + token,
            buttons: exportButtons,
            columns: [
                { 'data': 'biometric_id' },
                { 'data': 'name' },
                { 'data': 'role' },
                { 'data': 'current_per_hour_rate_amount' },
                { 'data': 'current_per_delivery_rate_amount' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const historyBtn = '<a href="#" class="rate-history btn btn-secondary" data-user-id="' + row.id + '"><i class="fa fa-history"></i></a>';
                        const editBtn = '<a href="#" class="edit btn btn-primary" data-toggle="modal" data-target="#addEditBiometricUserModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '" data-role="' + row.role + '" data-per-hour-rate-amount="' + row.current_per_hour_rate_amount + '" data-per-delivery-rate-amount="' + row.current_per_delivery_rate_amount + '"><i class="fa fa-edit"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '"><i class="fa fa-trash"></i></a>';

                        return `${historyBtn}&nbsp;${editBtn}&nbsp;${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .rate-history', function(e) {
            e.preventDefault();
            const userId = e.currentTarget.getAttribute('data-user-id');
            location.href = `${appBaseUrl}/#/user-rate-history/${userId}`;
        });

        $(document).on('click', '.data-table-wrapper .edit', function(e) {
            const userId = e.currentTarget.getAttribute('data-user-id');
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            const userRole = e.currentTarget.getAttribute('data-role');
            self.setState({
                showAddEditUserModal: true,
                isEditUser: true,
                userId,
                userBiometricId,
                userName,
                userRole,
            });
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const userId = e.currentTarget.getAttribute('data-user-id');
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            self.setState({
                showDeleteUserModal: true,
                userId,
                userBiometricId,
                userName
            });
        });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table.table-users')
            .DataTable()
            .destroy(true);

        $('.data-table-wrapper .edit').off();
        $('.data-table-wrapper .delete').off();
    }

    handleShowAddEditUserModal() {
        const self = this;
        self.setState({
            showAddEditUserModal: true
        });
    }

    handleCloseAddEditUserModal() {
        const self = this;
        self.setState({
            showAddEditUserModal: false,
            isEditUser: false,
            userId: null,
            userBiometricId: null,
            userName: '',
            userRole: '',
        });
    }

    handleSubmitAddEditUserModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { userId } = self.state;

        const table = $('.data-table-wrapper').find('table.table-users').DataTable();
        const form = e.currentTarget;
        const data = $(form).serialize();
        const modal = $('#addEditUserModal');
        const action = userId ? 'patch' : 'post';
        const actionEndPoint = apiBaseUrl + '/biometric/users' + (userId
            ? '/' + userId
            : ''
        ) + '?token=' + token;

        axios[action](actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({
                    showAddEditUserModal: false,
                    isEditUser: false,
                    userId: null,
                    userBiometricId: null,
                    userName: '',
                    userRole: '',
                });
            })
            .catch((error) => {
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', modal)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleCloseDeleteUserModal() {
        const self = this;
        self.setState({
            userId: null,
            userBiometricId: null,
            userName: '',
            userRole: '',
            showDeleteUserModal: false,
            isDeleteUserError: false,
            deleteUserErrorHeaderTitle: '',
            deleteUserErrorBodyText: '',
        });
    }

    handleSubmitDeleteUserModal() {
        const self = this;
        const token = cookie.load('token');
        const { userId, userBiometricId, userName } = self.state;
        const table = $('.data-table-wrapper').find('table.table-users').DataTable();

        axios.delete(apiBaseUrl + '/biometric/users/' + userId + '?token=' + token)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeleteUserModal: false,
                });
            })
            .catch((error) => {
                self.setState({
                    isDeleteUserError: true,
                    deleteUserErrorHeaderTitle: 'Oh snap! User cannot be deleted!',
                    deleteUserErrorBodyText: `${userBiometricId}-${userName} has active time logs recorded.`,
                });
            });
    }

    render() {
        const {
            userBiometricId,
            userName,
            userRole,
        } = this.state;

        const {
            showAddEditUserModal,
            isEditUser,
            isErrorAddEditUser,
            errorHeaderTitleAddEditUser,
            errorBodyTextAddEditUser,
        } = this.state;

        const {
            showDeleteUserModal,
            isDeleteUserError,
            deleteUserErrorHeaderTitle,
            deleteUserErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-users"></i> Users</h1>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-12">
                        <Button variant='primary' onClick={this.handleShowAddEditUserModal}>
                            <i className="fa fa-plus"></i> Add New User
                        </Button>
                    </div>
                </div>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Body>
                                <table ref="usersList" className="table table-striped table-users" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Biometric ID</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Current Role</th>
                                        <th scope="col">Current Per Hour Rate</th>
                                        <th scope="col">Current Per Delivery Rate</th>
                                        <th></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <AddEditUserModal
                    isShow={showAddEditUserModal}
                    isEdit={isEditUser}
                    userBiometricId={userBiometricId}
                    userName={userName}
                    userRole={userRole}
                    handleClose={this.handleCloseAddEditUserModal}
                    handleSubmit={this.handleSubmitAddEditUserModal}
                    isError={isErrorAddEditUser}
                    errorHeaderTitle={errorHeaderTitleAddEditUser}
                    errorBodyText={errorBodyTextAddEditUser}/>

                <CommonDeleteModal
                    isShow={showDeleteUserModal}
                    headerTitle="Delete User"
                    bodyText={`Are you sure to delete ${userBiometricId}-${userName}?`}
                    handleClose={this.handleCloseDeleteUserModal}
                    handleSubmit={this.handleSubmitDeleteUserModal}
                    isDeleteError={isDeleteUserError}
                    deleteErrorHeaderTitle={deleteUserErrorHeaderTitle}
                    deleteErrorBodyText={deleteUserErrorBodyText}/>

            </div>
        );
    }
}
