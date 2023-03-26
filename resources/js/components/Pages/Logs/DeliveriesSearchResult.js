import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';
import CommonDeleteModal from '../../CommonDeleteModal';
import AddEditDeliveryModal from './AddEditDeliveryModal';

export default class DeliveriesSearchResult extends Component {
    constructor(props) {
        super(props);

        this.handleShowAddEditDeliveryModal = this.handleShowAddEditDeliveryModal.bind(this);
        this.handleCloseAddEditDeliveryModal = this.handleCloseAddEditDeliveryModal.bind(this);
        this.handleSubmitAddEditDeliveryModal = this.handleSubmitAddEditDeliveryModal.bind(this);

        this.handleCloseDeleteDeliveryModal = this.handleCloseDeleteDeliveryModal.bind(this);
        this.handleSubmitDeleteDeliveryModal = this.handleSubmitDeleteDeliveryModal.bind(this)

        this.state = {
            userBiometricId: null,
            userName: '',
            deliveryId: null,
            deliveryDate: null,
            noOfDeliveries: null,
            remarks: null,
        };

        this.state = {
            showDeleteDeliveryModal: false,
            isDeleteUserError: false,
            deleteUserErrorHeaderTitle: '',
            deleteUserErrorBodyText: '',
        };
    }

    componentDidMount() {
        const self = this;

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => { return this.initExportFilename(); };
        exportButtons[1].filename = () => { return this.initExportFilename(); };
        exportButtons[1].title = () => { return this.initExportTitle(); };

        const dataTable = $(this.refs.deliveriesSearcherResult).DataTable({
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
                    'render': function (data, type, row) {
                        const editBtn = '<a href="#" class="edit btn btn-primary" data-toggle="modal" data-target="#AddEditDeliveryModal" data-delivery-id="' + row.id + '" data-biometric-id="' + row.user.biometric_id + '" data-name="' + row.user.name + '" data-delivery-date="' + row.delivery_date + '" data-no-of-deliveries="' + row.no_of_deliveries + '" data-remarks="' + row.remarks + '"><i class="fa fa-edit"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-delivery-id="' + row.id + '" data-biometric-id="' + row.user.biometric_id + '" data-name="' + row.user.name + '" data-delivery-date="' + row.delivery_date + '"><i class="fa fa-trash"></i></a>';

                        return `${editBtn}&nbsp;${deleteBtn}`;
                    }
                }
            ],
            columnDefs: [
                { 'orderable': false, 'targets': [0, 1] }
            ],
            order: [[2, 'asc']]
        });

        $(document).on('click', '.data-table-wrapper .edit', function (e) {
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            const deliveryId = e.currentTarget.getAttribute('data-delivery-id');
            const deliveryDate = e.currentTarget.getAttribute('data-delivery-date');
            const noOfDeliveries = e.currentTarget.getAttribute('data-no-of-deliveries');
            const remarks = e.currentTarget.getAttribute('data-remarks');

            self.setState({
                showAddEditDeliveryModal: true,
                isEditDelivery: true,
                userBiometricId,
                userName,
                deliveryId,
                deliveryDate,
                noOfDeliveries,
                remarks,
            });
        });

        $(document).on('click', '.data-table-wrapper .delete', function (e) {
            const userBiometricId = e.currentTarget.getAttribute('data-biometric-id');
            const userName = e.currentTarget.getAttribute('data-name');
            const deliveryId = e.currentTarget.getAttribute('data-delivery-id');
            const deliveryDate = e.currentTarget.getAttribute('data-delivery-date');
            self.setState({
                showDeleteDeliveryModal: true,
                userBiometricId,
                userName,
                deliveryId,
                deliveryDate,
            });
        });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table.table-deliveries')
            .DataTable()
            .destroy(true);
    }

    initExportTitle() {
        const {
            biometricId,
            biometricName,
            startDate,
            endDate
        } = this.props;

        const user = `User: ${biometricId ? `${biometricId} ${biometricName}` : 'All'}`;
        const label = `${user}${user ? ' ' : ''}From: ${startDate} To: ${endDate}`;

        return `Deliveries ${label}`;
    }

    initExportFilename() {
        return sanitize(this.initExportTitle());
    }

    handleShowAddEditDeliveryModal() {
        const self = this;
        self.setState({
            showAddEditDeliveryModal: true
        });
    }

    handleCloseAddEditDeliveryModal() {
        const self = this;
        self.setState({
            showAddEditDeliveryModal: false,
            isEditDelivery: false,
            userBiometricId: null,
            userName: '',
            deliveryId: null,
            deliveryDate: null,
            noOfDeliveries: null,
            remarks: null,
        });
    }

    handleSubmitAddEditDeliveryModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { deliveryId } = self.state;

        window.console.log(deliveryId);

        const table = $('.data-table-wrapper').find('table.table-users').DataTable();
        const form = e.currentTarget;
        const data = $(form).serialize();
        const modal = $('#addEditDeliveryModal');
        const action = deliveryId ? 'patch' : 'post';
        const actionEndPoint = apiBaseUrl + '/deliveries' + (deliveryId
            ? '/' + deliveryId
            : ''
        ) + '?token=' + token;

        axios[action](actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({
                    showAddEditDeliveryModal: false,
                    isEditDelivery: false,
                    userBiometricId: null,
                    userName: '',
                    deliveryId: null,
                    deliveryDate: null,
                    noOfDeliveries: null,
                    remarks: null,
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

    handleCloseDeleteDeliveryModal() {
        const self = this;
        self.setState({
            userBiometricId: null,
            userName: '',
            deliveryId: null,
            deliveryDate: null,
            noOfDeliveries: null,
            remarks: null,
            showDeleteDeliveryModal: false,
            isDeleteUserError: false,
            deleteUserErrorHeaderTitle: '',
            deleteUserErrorBodyText: '',
        });
    }

    handleSubmitDeleteDeliveryModal() {
        const self = this;
        const token = cookie.load('token');
        const { userBiometricId, userName, deliveryId, deliveryDate } = self.state;
        const table = $('.data-table-wrapper').find('table.table-users').DataTable();

        axios.delete(apiBaseUrl + '/deliveries/' + deliveryId + '?token=' + token)
            .then((response) => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeleteDeliveryModal: false,
                });
            })
            .catch((error) => {
                self.setState({
                    isDeleteUserError: true,
                    deleteUserErrorHeaderTitle: 'Oh snap! Delivery cannot be deleted!',
                    deleteUserErrorBodyText: `Failed to delete ${userBiometricId}-${userName} delivery Id: ${deliveryId} on ${deliveryDate}.`,
                });
            });
    }

    render() {
        const {
            biometricId,
            biometricName,
            startDate,
            endDate
        } = this.props;

        const {
            userBiometricId,
            userName,
            deliveryId,
            deliveryDate,
            noOfDeliveries,
            remarks,
        } = this.state;

        const {
            showAddEditDeliveryModal,
            isEditDelivery,
            isErrorAddEditDelivery,
            errorHeaderTitleAddEditDelivery,
            errorBodyTextAddEditDelivery,
        } = this.state;

        const {
            showDeleteDeliveryModal,
            isDeleteUserError,
            deleteUserErrorHeaderTitle,
            deleteUserErrorBodyText,
        } = this.state;

        const dataTable = $('.data-table-wrapper')
            .find('table.table-deliveries')
            .DataTable();

        if (startDate && endDate) {
            const filters = 'start_date=' + startDate + '&end_date=' + endDate + (biometricId ? '&biometric_id=' + biometricId : '');
            const token = cookie.load('token');
            dataTable.ajax.url(apiBaseUrl + '/deliveries?token=' + token + '&' + filters);
            dataTable.ajax.reload();
        } else {
            dataTable.clear().draw();
        }

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
                        <table ref="deliveriesSearcherResult" className="table table-striped table-deliveries" style={{ width: 100 + '%' }}>
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
                    handleClose={this.handleCloseAddEditDeliveryModal}
                    handleSubmit={this.handleSubmitAddEditDeliveryModal}
                    isError={isErrorAddEditDelivery}
                    errorHeaderTitle={errorHeaderTitleAddEditDelivery}
                    errorBodyText={errorBodyTextAddEditDelivery} />

                <CommonDeleteModal
                    isShow={showDeleteDeliveryModal}
                    headerTitle={`Delete Delivery [ID: ${deliveryId}]`}
                    bodyText={`Are you sure to delete ${userBiometricId}-${userName} delivery on ${deliveryDate}?`}
                    handleClose={this.handleCloseDeleteDeliveryModal}
                    handleSubmit={this.handleSubmitDeleteDeliveryModal}
                    isDeleteError={isDeleteUserError}
                    deleteErrorHeaderTitle={deleteUserErrorHeaderTitle}
                    deleteErrorBodyText={deleteUserErrorBodyText} />
            </div>
        );
    }
}
