import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';

export default class SettingsStores extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewStore = this.handleSubmitNewStore.bind(this);
        this.handleCloseDeleteStoreModal = this.handleCloseDeleteStoreModal.bind(this);
        this.handleSubmitDeleteStoreModal = this.handleSubmitDeleteStoreModal.bind(this);

        this.state = {
            showDeleteStoreModal: false,
            storeId: null,
            isDeleteStoreError: false,
            deleteStoreErrorHeaderTitle: '',
            deleteStoreErrorBodyText: '',
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Stores';
        const exportTitle = 'Stores';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.storesList).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/stores?token=${token}`,
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
            buttons: exportButtons,
            ordering: false,
            processing: true,
            serverSide: true,
            columns: [
                { 'data': 'code' },
                { 'data': 'name' },
                { 'data': 'address_line' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-store-id="' + row.id + '"><i class="fa fa-folder-open"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-store-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `${openBtn} ${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open', function(e) {
            e.preventDefault();
            const storeId = e.currentTarget.getAttribute('data-store-id');
            location.href = `${appBaseUrl}/#/settings-store-details/${storeId}`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const storeId = e.currentTarget.getAttribute('data-store-id');
            self.setState({
                showDeleteStoreModal: true,
                storeId,
            });
        });
    }

    handleSubmitNewStore(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-stores').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/settings/stores?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleCloseDeleteStoreModal() {
        const self = this;
        self.setState({
            showDeleteStoreModal: false,
            storeId: null,
            isDeleteStoreError: false,
            deleteStoreErrorHeaderTitle: '',
            deleteStoreErrorBodyText: '',
        });
    }

    handleSubmitDeleteStoreModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { storeId } = self.state;
        const table = $('.data-table-wrapper').find('table.table-stores').DataTable();

        axios.delete(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeleteStoreModal: false,
                    storeId: null,
                    isDeleteStoreError: false,
                    deleteStoreErrorHeaderTitle: '',
                    deleteStoreErrorBodyText: '',
                });
            })
            .catch((error) => {
                self.setState({
                    isDeleteStoreError: true,
                    deleteStoreErrorHeaderTitle: 'Oh snap! Store cannot be deleted!',
                    deleteStoreErrorBodyText: `Store ${storeId} has active slips processed.`,
                });
            });
    }

    render() {
        const {
            showDeleteStoreModal,
            storeId,
            isDeleteStoreError,
            deleteStoreErrorHeaderTitle,
            deleteStoreErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Stores Registry</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-9">
                        <Card>
                            <Card.Body>
                                <table ref="storesList" className="table table-striped table-stores" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Code</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Address</th>
                                        <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-3">
                        <Card bg="dark" text="white">
                            <Card.Header>Add New Store</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewStore}>
                                    <Form.Group>
                                        <Form.Label>Code:</Form.Label>
                                        <Form.Control type="text" name="code"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Name:</Form.Label>
                                        <Form.Control type="text" name="name"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Address:</Form.Label>
                                        <Form.Control as="textarea" name="address_line"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <hr/>
                                    <Button type="submit" block>Add</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <CommonDeleteModal
                    isShow={showDeleteStoreModal}
                    headerTitle="Delete Store"
                    bodyText={`Are you sure to delete this pay period?`}
                    handleClose={this.handleCloseDeleteStoreModal}
                    handleSubmit={this.handleSubmitDeleteStoreModal}
                    isDeleteError={isDeleteStoreError}
                    deleteErrorHeaderTitle={deleteStoreErrorHeaderTitle}
                    deleteErrorBodyText={deleteStoreErrorBodyText}/>
            </div>
        );
    }
}
