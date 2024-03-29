import { Button, Card, Toast, ToastContainer } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import AddEditUserModal from './Users/AddEditUserModal';
import CommonDeleteModal from '../../CommonDeleteModal';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../../Generic/Directory';

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
    },
];

const Users = () => {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');
    const allowedToCreateUser = isSuperAdmin || hasPermission("Create or register new user");
    const allowedToUpdateUser = isSuperAdmin || hasPermission("Update existing user");
    const allowedToDeleteUser = isSuperAdmin || hasPermission("Delete or unregister user");
    const allowedToViewUser = isSuperAdmin || hasPermission("View registered user");

    const allowedToManageUserRateHistory = isSuperAdmin;
    const allowedToManageUserRolesAndPermissions = isSuperAdmin;

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

    const [showDefaultPasswordToast, setShowDefaultPasswordToast] = useState(false);
    const [defaultPasswordToastHeader, setDefaultPasswordToastHeader] = useState('');
    const [defaultPasswordToastMessage, setDefaultPasswordToastMessage] = useState('');

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

        jQuery(document).off('click', '.data-table-wrapper .rate-history');
        jQuery(document).off('click', '.data-table-wrapper .roles-and-permissions');
        jQuery(document).off('click', '.data-table-wrapper .default-password');
        jQuery(document).off('click', '.data-table-wrapper .edit');
        jQuery(document).off('click', '.data-table-wrapper .delete');

        if (!$.fn.DataTable.isDataTable('table.table-users')) {
            $('table.table-users').DataTable({
                ajax: apiBaseUrl + '/biometric/users?token=' + token,
                buttons: exportButtons,
                columns: [
                    { 'data': 'biometric_id' },
                    { 'data': 'name' },
                    { 'data': 'current_per_hour_rate_amount' },
                    { 'data': 'current_per_delivery_rate_amount' },
                    {
                        'data': null,
                        'render': function (_data, _type, row) {
                            const historyBtn = '<a href="#" class="rate-history btn btn-secondary" data-user-id="' + row.id + '"><i class="fa fa-history"></i></a>';
                            const rolesAndPermissionsBtn = '<a href="#" class="roles-and-permissions btn btn-secondary" data-user-id="' + row.id + '"><i class="fa fa-id-card"></i></a>';
                            const resetPasswordBtn = '<a href="#" class="default-password btn btn-success" data-toggle="modal" data-target="#deleteModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '"><i class="fa fa-key"></i></a>';
                            const editBtn = '<a href="#" class="edit btn btn-primary" data-toggle="modal" data-target="#addEditBiometricUserModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '" data-role="' + row.role + '" data-per-hour-rate-amount="' + row.current_per_hour_rate_amount + '" data-per-delivery-rate-amount="' + row.current_per_delivery_rate_amount + '"><i class="fa fa-edit"></i></a>';
                            const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-user-id="' + row.id + '" data-biometric-id="' + row.biometric_id + '" data-name="' + row.name + '"><i class="fa fa-trash"></i></a>';

                            return `<div class="btn-group">${historyBtn}${rolesAndPermissionsBtn}${resetPasswordBtn}${editBtn}${deleteBtn}</div>`;
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
                        $(document).find('.data-table-wrapper .default-password').remove();
                        $(document).find('.data-table-wrapper .edit').remove();
                    }
                    if (!allowedToDeleteUser) {
                        $(document).find('.data-table-wrapper .delete').remove();
                    }

                    $(document).find('.data-table-wrapper .default-password').each((_index, element) => {
                        const userId = $(element).data('user-id');
                        if (currentUser.id === userId) {
                            $(element).remove();
                        }
                    });

                    $(document).find('.data-table-wrapper .delete').each((_index, element) => {
                        const userId = $(element).data('user-id');
                        if (currentUser.id === userId) {
                            $(element).remove();
                        }
                    });
                }
            });

            $(document).on('click', '.data-table-wrapper .rate-history', function (e) {
                e.preventDefault();
                const userId = e.currentTarget.getAttribute('data-user-id');
                location.href = `${appBaseUrl}/#/settings-users-rate-history/${userId}`;
            });

            $(document).on('click', '.data-table-wrapper .roles-and-permissions', function (e) {
                e.preventDefault();
                const userId = e.currentTarget.getAttribute('data-user-id');
                location.href = `${appBaseUrl}/#/settings/users/${userId}/roles-and-permissions`;
            });

            $(document).on('click', '.data-table-wrapper .default-password', function (e) {
                e.preventDefault();
                const userId = e.currentTarget.getAttribute('data-user-id');
                const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
                const userName = e.currentTarget.getAttribute('data-name');
                const generateRandomString = (length) => Math.random().toString(36).slice(2, length + 2);
                const defaultPassword = generateRandomString(6);
                axios.patch(`${apiBaseUrl}/settings/users/${userId}/default-password?token=${token}`, { default_password: defaultPassword })
                    .then(() => {
                        setShowDefaultPasswordToast(true);
                        setDefaultPasswordToastHeader(`(${userBiometricId}) ${userName}`);
                        setDefaultPasswordToastMessage(`Default Password: ${defaultPassword}`);
                    })
                    .catch(() => location.reload());
            });

            $(document).on('click', '.data-table-wrapper .edit', function (e) {
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

            $(document).on('click', '.data-table-wrapper .delete', function (e) {
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
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-users"></i> Users
                </Card.Header>
                <Card.Body>
                    <table className="table table-striped table-users" style={{ width: 100 + '%' }}>
                        <thead>
                            <tr>
                                <th scope="col">Biometric ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Current Per Hour Rate</th>
                                <th scope="col">Current Per Delivery Rate</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </Card.Body>
                {allowedToCreateUser &&
                    <Card.Footer>
                        <Button variant='primary' onClick={handleShowAddEditUserModal}>
                            <i className="fa fa-plus"></i> Add New User
                        </Button>
                    </Card.Footer>}
            </Card>

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

            {showDefaultPasswordToast && <ToastContainer className="p-3 position-fixed" position="middle-center">
                <Toast bg="success" onClose={() => {
                    setShowDefaultPasswordToast(false);
                    setDefaultPasswordToastHeader('');
                    setDefaultPasswordToastMessage('');
                }}>
                    <Toast.Header>{defaultPasswordToastHeader}</Toast.Header>
                    <Toast.Body>{defaultPasswordToastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>}
        </>
    );
}

export default Users;
