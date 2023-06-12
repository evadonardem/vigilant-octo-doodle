import { Card } from 'react-bootstrap';
import AddEditDeliveryModal from './AddEditDeliveryModal';
import CommonDeleteModal from '../../CommonDeleteModal';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';
import { useSelector } from 'react-redux';

const DeliveriesSearchResult = ({ biometricId, biometricName, startDate, endDate }) => {
    const token = cookie.load('token');
    const [userBiometricId, setUserBiometricId] = useState(biometricId);
    const [userName, setUserName] = useState(biometricName);
    const [deliveryId, setDeliveryId] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [noOfDeliveries, setNoOfDeliveries] = useState(null);
    const [remarks, setRemarks] = useState(null);
    const [showAddEditDeliveryModal, setShowAddEditDeliveryModal] = useState(false);
    const [isErrorAddEditDelivery, setIsErrorAddEditDelivery] = useState(false);
    const [errorHeaderTitleAddEditDelivery, setErrorHeaderTitleAddEditDelivery] = useState('');
    const [errorBodyTextAddEditDelivery, setErrorBodyTextAddEditDelivery] = useState('');
    const [isEditDelivery, setIsEditDelivery] = useState(false);
    const [showDeleteDeliveryModal, setShowDeleteDeliveryModal] = useState(false);
    const [isDeleteUserError, setIsDeleteUserError] = useState(false);
    const [deleteUserErrorHeaderTitle, setDeleteUserErrorHeaderTitle] = useState('');
    const [deleteUserErrorBodyText, setDeleteUserErrorBodyText] = useState('');

    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);

    const allowedToUpdateManualDeliveryLogs = hasRole('Super Admin') || hasPermission("Update manual delivery logs");
    const allowedToDeleteManualDeliveryLogs = hasRole('Super Admin') || hasPermission("Delete manual delivery logs");

    const initExportTitle = () => {
        const user = `User: ${biometricId ? `${biometricId} ${biometricName}` : 'All'}`;
        const label = `${user}${user ? ' ' : ''}From: ${startDate} To: ${endDate}`;

        return `Deliveries ${label}`;
    }

    const initExportFilename = () => {
        return sanitize(initExportTitle());
    };

    const handleCloseAddEditDeliveryModal = () => {
        setShowAddEditDeliveryModal(false);
        setIsErrorAddEditDelivery(false);
        setErrorHeaderTitleAddEditDelivery('');
        setErrorBodyTextAddEditDelivery('');
        setIsEditDelivery(false);
        setUserBiometricId(null);
        setUserName(null);
        setDeliveryId(null);
        setDeliveryDate(null);
        setNoOfDeliveries(null);
        setRemarks(null);
    };

    const handleSubmitAddEditDeliveryModal = (e) => {
        e.preventDefault();
        const table = $('.data-table-wrapper').find('table.table-deliveries').DataTable();
        const form = e.currentTarget;
        const data = $(form).serialize();
        const action = deliveryId ? 'patch' : 'post';
        const actionEndPoint = apiBaseUrl + '/deliveries' + (deliveryId
            ? '/' + deliveryId
            : ''
        ) + '?token=' + token;

        axios[action](actionEndPoint, data)
            .then(() => {
                table.ajax.reload(null, false);
                setShowAddEditDeliveryModal(false);
                setIsEditDelivery(false);
                setUserBiometricId(null);
                setUserName(null);
                setDeliveryId(null);
                setDeliveryDate(null);
                setNoOfDeliveries(null);
                setRemarks(null);
            })
            .catch(() => {
                setIsErrorAddEditDelivery(true);
                setErrorHeaderTitleAddEditDelivery('Oh snap! Delivery cannot be updated!');
                setErrorBodyTextAddEditDelivery(`Failed to update ${userBiometricId}-${userName} delivery Id: ${deliveryId} on ${deliveryDate}.`);
            });
    };

    const handleCloseDeleteDeliveryModal = () => {
        setUserBiometricId(null);
        setUserName('');
        setDeliveryId(null);
        setDeliveryDate(null);
        setNoOfDeliveries(null);
        setRemarks(null);
        setShowDeleteDeliveryModal(false);
        setIsDeleteUserError(false);
        setDeleteUserErrorHeaderTitle('');
        setDeleteUserErrorBodyText('');
    };

    const handleSubmitDeleteDeliveryModal = () => {
        const table = $('.data-table-wrapper').find('table.table-deliveries').DataTable();

        axios.delete(apiBaseUrl + '/deliveries/' + deliveryId + '?token=' + token)
            .then(() => {
                table.ajax.reload(null, false);
                setShowDeleteDeliveryModal(false);
            })
            .catch(() => {
                setIsDeleteUserError(true);
                setDeleteUserErrorHeaderTitle('Oh snap! Delivery cannot be deleted!');
                setDeleteUserErrorBodyText(`Failed to delete ${userBiometricId}-${userName} delivery Id: ${deliveryId} on ${deliveryDate}.`);
            });
    };

    const init = (currStartDate, currEndDate) => {
        if (currStartDate && currEndDate) {
            if ($.fn.DataTable.isDataTable('.table-deliveries')) {
                $('.data-table-wrapper')
                    .find('table.table-deliveries')
                    .DataTable()
                    .destroy();
            }

            const exportButtons = window.exportButtonsBase;
            exportButtons[0].filename = () => { return initExportFilename(); };
            exportButtons[1].filename = () => { return initExportFilename(); };
            exportButtons[1].title = () => { return initExportTitle(); };

            const dataTable = $('.table-deliveries').DataTable({
                ajax: {
                    error: function (xhr, error, code) {
                        if (code === 'Unauthorized') {
                            location.reload();
                        }
                        dataTable.clear().draw();
                    }
                },
                searching: false,
                buttons: exportButtons,
                columns: [
                    { 'data': 'user.biometric_id' },
                    { 'data': 'user.name' },
                    { 'data': 'delivery_date' },
                    { 'data': 'no_of_deliveries' },
                    { 'data': 'remarks' },
                    {
                        'data': null,
                        'render': function (_data, _type, row) {
                            const editBtn = '<a href="#" class="edit btn btn-primary" data-toggle="modal" data-target="#AddEditDeliveryModal" data-delivery-id="' + row.id + '" data-biometric-id="' + row.user.biometric_id + '" data-name="' + row.user.name + '" data-delivery-date="' + row.delivery_date + '" data-no-of-deliveries="' + row.no_of_deliveries + '" data-remarks="' + row.remarks + '"><i class="fa fa-edit"></i></a>';
                            const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-delivery-id="' + row.id + '" data-biometric-id="' + row.user.biometric_id + '" data-name="' + row.user.name + '" data-delivery-date="' + row.delivery_date + '"><i class="fa fa-trash"></i></a>';

                            return `<div class="btn-group">${editBtn}${deleteBtn}</div>`;
                        }
                    }
                ],
                columnDefs: [
                    { 'orderable': false, 'targets': [0, 1, 5] }
                ],
                drawCallback: () => {
                    if (!allowedToUpdateManualDeliveryLogs) {
                        $(document).find('.data-table-wrapper .edit').remove();
                    }
                    if (!allowedToDeleteManualDeliveryLogs) {
                        $(document).find('.data-table-wrapper .delete').remove();
                    }
                },
                order: [[2, 'asc']]
            });

            $(document).on('click', '.data-table-wrapper .edit', function (e) {
                e.preventDefault();
                const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
                const userName = e.currentTarget.getAttribute('data-name');
                const deliveryId = e.currentTarget.getAttribute('data-delivery-id');
                const deliveryDate = e.currentTarget.getAttribute('data-delivery-date');
                const noOfDeliveries = e.currentTarget.getAttribute('data-no-of-deliveries');
                const remarks = e.currentTarget.getAttribute('data-remarks');

                setShowAddEditDeliveryModal(true);
                setIsEditDelivery(true);
                setUserBiometricId(userBiometricId);
                setUserName(userName);
                setDeliveryId(deliveryId);
                setDeliveryDate(deliveryDate);
                setNoOfDeliveries(noOfDeliveries);
                setRemarks(remarks);
            });

            $(document).on('click', '.data-table-wrapper .delete', function (e) {
                e.preventDefault();
                const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
                const userName = e.currentTarget.getAttribute('data-name');
                const deliveryId = e.currentTarget.getAttribute('data-delivery-id');
                const deliveryDate = e.currentTarget.getAttribute('data-delivery-date');
                setShowDeleteDeliveryModal(true);
                setUserBiometricId(userBiometricId);
                setUserName(userName);
                setDeliveryId(deliveryId);
                setDeliveryDate(deliveryDate);
            });

            const filters = 'start_date=' + currStartDate + '&end_date=' + currEndDate + (biometricId ? '&biometric_id=' + biometricId : '');
            dataTable.ajax.url(apiBaseUrl + '/deliveries?token=' + token + '&' + filters);
            dataTable.ajax.reload();
        }
    };

    useEffect(() => {
        init(startDate, endDate);
    }, [startDate, endDate]);

    const hideTable = !startDate || !endDate;

    return (
        <div>
            {
                (!startDate || !endDate) &&
                <p className="text-center">
                    <i className="fa fa-5x fa-info-circle" /><br />
                    Start by filtering records to search.
                </p>
            }

            <Card style={{ display: (hideTable ? 'none' : '') }}>
                <Card.Header>
                    <h4><i className="fa fa-search" /> Search Result</h4>
                    User: {biometricId ? `${biometricId} ${biometricName}` : 'All'} From: {startDate} To: {endDate}
                </Card.Header>
                <Card.Body>
                    <table className="table table-striped table-deliveries" style={{ width: 100 + '%' }}>
                        <thead>
                            <tr>
                                <th scope="col">Biometric ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Date</th>
                                <th scope="col">No. of Deliveries</th>
                                <th scope="col">Remarks</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </Card.Body>
            </Card>

            <AddEditDeliveryModal
                isShow={showAddEditDeliveryModal}
                isEdit={isEditDelivery}
                userBiometricId={userBiometricId}
                userName={userName}
                deliveryId={deliveryId}
                deliveryDate={deliveryDate}
                noOfDeliveries={noOfDeliveries}
                remarks={remarks}
                handleClose={handleCloseAddEditDeliveryModal}
                handleSubmit={handleSubmitAddEditDeliveryModal}
                isError={isErrorAddEditDelivery}
                errorHeaderTitle={errorHeaderTitleAddEditDelivery}
                errorBodyText={errorBodyTextAddEditDelivery} />

            <CommonDeleteModal
                isShow={showDeleteDeliveryModal}
                headerTitle={`Delete Delivery [ID: ${deliveryId}]`}
                bodyText={`Are you sure to delete ${userBiometricId}-${userName} delivery on ${deliveryDate}?`}
                handleClose={handleCloseDeleteDeliveryModal}
                handleSubmit={handleSubmitDeleteDeliveryModal}
                isDeleteError={isDeleteUserError}
                deleteErrorHeaderTitle={deleteUserErrorHeaderTitle}
                deleteErrorBodyText={deleteUserErrorBodyText} />
        </div>
    );
};

export default DeliveriesSearchResult;
