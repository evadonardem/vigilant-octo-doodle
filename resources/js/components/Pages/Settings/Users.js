import { Breadcrumb, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AddEditUserModal from './Users/AddEditUserModal';
import CommonDeleteModal from '../../CommonDeleteModal';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';

const Users = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const allowedToCreateUser = hasRole('Super Admin') || hasPermission("Create or register new user");
    const allowedToUpdateUser = hasRole('Super Admin') || hasPermission("Update existing user");
    const allowedToDeleteUser = hasRole('Super Admin') || hasPermission("Delete or unregister user");
    const allowedToViewUser = hasRole('Super Admin') || hasPermission("View registered user");

    const allowedToManageUserRateHistory = hasRole('Super Admin');
    const allowedToManageUserRolesAndPermissions = hasRole('Super Admin');

    const [showAddEditUserModal, setShowAddEditUserModal] = useState(false);
    const [isEditUser, setIsEditUser] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userBiometricId, setUserBiometricId] = useState(null);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [isDeleteUserError, setIsDeleteUserError] = useState(false);
    const [deleteUserErrorHeaderTitle, setDeleteUserErrorHeaderTitle] = useState('');
    const [deleteUserErrorBodyText, setDeleteUserErrorBodyText] = useState('');

    const [isErrorAddEditUser, setIsErrorAddEditUser] = useState(false);
    const [errorHeaderTitleAddEditUser, setErrorHeaderTitleAddEditUser] = useState('');
    const [errorBodyTextAddEditUser, setErrorBodyTextAddEditUser] = useState('');

    if (!(allowedToCreateUser || allowedToUpdateUser || allowedToViewUser)) {
        location.href = appBaseUrl;
    }

    const loadUsersList = () => {
        const token = cookie.load('token');
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Users';
        const exportTitle = 'Users';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $('table.table-users').DataTable({
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
                        const rolesAndPermissionsBtn = '<a href="#" class="roles-and-permissions btn btn-secondary" data-user-id="' + row.id + '"><i class="fa fa-id-card"></i></a>';
                        const editBtn = '<a href="#" class="edit btn btn-primary" data-toggle="modal" data-target="#addEditBiometricUserModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '" data-role="' + row.role + '" data-per-hour-rate-amount="' + row.current_per_hour_rate_amount + '" data-per-delivery-rate-amount="' + row.current_per_delivery_rate_amount + '"><i class="fa fa-edit"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '"><i class="fa fa-trash"></i></a>';

                        return `<div class="btn-group">${historyBtn}${rolesAndPermissionsBtn}${editBtn}${deleteBtn}</div>`;
                    }
                }
            ],
            drawCallback: function () {
                if (!allowedToManageUserRateHistory) {
                    $(document).find('.data-table-wrapper .rate-history').remove();
                }
                if (!allowedToManageUserRolesAndPermissions) {
                    $(document).find('.data-table-wrapper .roles-and-permissions').remove();
                }
                if (!allowedToUpdateUser) {
                    $(document).find('.data-table-wrapper .edit').remove();
                }
                if (!allowedToDeleteUser) {
                    $(document).find('.data-table-wrapper .delete').remove();
                }
            }
        });

        $(document).on('click', '.data-table-wrapper .rate-history', function(e) {
            e.preventDefault();
            const userId = e.currentTarget.getAttribute('data-user-id');
            location.href = `${appBaseUrl}/#/settings-users-rate-history/${userId}`;
        });

        $(document).on('click', '.data-table-wrapper .roles-and-permissions', function(e) {
            e.preventDefault();
            const userId = e.currentTarget.getAttribute('data-user-id');
            location.href = `${appBaseUrl}/#/settings/users/${userId}/roles-and-permissions`;
        });

        $(document).on('click', '.data-table-wrapper .edit', function(e) {
            e.preventDefault();
            const userId = e.currentTarget.getAttribute('data-user-id');
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            const userRole = e.currentTarget.getAttribute('data-role');
            setShowAddEditUserModal(true);
            setIsEditUser(true);
            setUserId(userId);
            setUserBiometricId(userBiometricId);
            setUserName(userName);
            setUserRole(userRole);
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            e.preventDefault();
            const userId = e.currentTarget.getAttribute('data-user-id');
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            setShowDeleteUserModal(true);
            setUserId(userId);
            setUserBiometricId(userBiometricId);
            setUserName(userName);
        });
    }

    const handleShowAddEditUserModal = () => {
        setShowAddEditUserModal(true);
    };

    const handleCloseAddEditUserModal = () => {
        setShowAddEditUserModal(false);
        setIsEditUser(false);
        setUserId(null);
        setUserBiometricId(null);
        setUserName('');
        setUserRole('');
    };

    const handleSubmitAddEditUserModal = (e) => {
        e.preventDefault();
        const token = cookie.load('token');

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
            .then(() => {
                table.ajax.reload(null, false);
                setShowAddEditUserModal(false);
                setIsEditUser(false);
                setUserId(null);
                setUserBiometricId(null);
                setUserName('');
                setUserRole('');
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
    };

    const handleCloseDeleteUserModal = () => {
        setUserId(null);
        setUserBiometricId(null);
        setUserName('');
        setUserRole('');
        setShowDeleteUserModal(false);
        setIsDeleteUserError(false);
        setDeleteUserErrorHeaderTitle('');
        setDeleteUserErrorBodyText('');
    };

    const handleSubmitDeleteUserModal = () => {
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-users').DataTable();

        axios.delete(apiBaseUrl + '/biometric/users/' + userId + '?token=' + token)
            .then(() => {
                table.ajax.reload(null, false);
                setShowDeleteUserModal(false);
            })
            .catch(() => {
                setIsDeleteUserError(true);
                setDeleteUserErrorHeaderTitle('Oh snap! User cannot be deleted!');
                setDeleteUserErrorBodyText(`${userBiometricId}-${userName} has active time logs recorded.`);
            });
    };

    useEffect(() => {
        loadUsersList();
    }, []);

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkProps={{ to: "/settings" }} linkAs={Link}>
                    <i className="fa fa-cogs"></i> Settings
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <i className="fa fa-users"></i> Users
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="row">
                <div className="col-md-12">
                    <Card>
                        {allowedToCreateUser &&
                            <Card.Header>
                                <Button variant='primary' onClick={handleShowAddEditUserModal}>
                                    <i className="fa fa-plus"></i> Add New User
                                </Button>
                            </Card.Header>}
                        <Card.Body>
                            <table className="table table-striped table-users" style={{ width: 100 + '%' }}>
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
                handleClose={handleCloseAddEditUserModal}
                handleSubmit={handleSubmitAddEditUserModal}
                isError={isErrorAddEditUser}
                errorHeaderTitle={errorHeaderTitleAddEditUser}
                errorBodyText={errorBodyTextAddEditUser} />

            <CommonDeleteModal
                isShow={showDeleteUserModal}
                headerTitle="Delete User"
                bodyText={`Are you sure to delete ${userBiometricId}-${userName}?`}
                handleClose={handleCloseDeleteUserModal}
                handleSubmit={handleSubmitDeleteUserModal}
                isDeleteError={isDeleteUserError}
                deleteErrorHeaderTitle={deleteUserErrorHeaderTitle}
                deleteErrorBodyText={deleteUserErrorBodyText} />

        </>
    );
}

export default Users;
