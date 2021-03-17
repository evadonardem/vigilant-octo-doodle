import React, { Component } from 'react';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import { Badge, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import CommonDeleteModal from './CommonDeleteModal';
import EditPromodiserModal from './EditPromodiserModal';
import CommonDropdownSelectSingleItem from './CommonDropdownSelectSingleItem'

export default class SettingStoreDetails extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewPromodiser = this.handleSubmitNewPromodiser.bind(this);

        this.handleCloseDeletePromodiserModal = this.handleCloseDeletePromodiserModal.bind(this);
        this.handleSubmitDeletePromodiserModal = this.handleSubmitDeletePromodiserModal.bind(this);

        this.handleCloseEditPromodiserModal = this.handleCloseEditPromodiserModal.bind(this);
        this.handleShowEditPromodiserModal = this.handleShowEditPromodiserModal.bind(this);
        this.handleSubmitEditPromodiserModal = this.handleSubmitEditPromodiserModal.bind(this);

        this.handleSubmitNewItemPricing = this.handleSubmitNewItemPricing.bind(this);

        this.handleChangeSelectSingleItem = this.handleChangeSelectSingleItem.bind(this);

        this.state = {
            store: {
                id: null,
                code: null,
                name: null,
                address_line: null,
            },
            deletePromodiser: {
                id: null,
                showModal: false,
                loading: true,
                isDeleteError: false,
                deleteErrorHeaderTitle: '',
                deleteErrorBodyText: '',
            },
            editPromodiser: {
                id: null,
                showModal: false,
                loading: true,
            },
            selectedItem: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { storeId } = params;

        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Stores';
        const exportTitle = 'Stores';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $('.table-store-promodisers').DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/stores/${storeId}/promodisers?token=${token}`,
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
                { 'data': 'name' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const editBtn = '<a href="#" class="edit btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-promodiser-id="' + row.id + '"><i class="fa fa-edit"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-promodiser-id="' + row.id + '"><i class="fa fa-trash"></i></a>';
                        return `${editBtn} ${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper > .table-store-promodisers .edit', function(e) {
            const id = e.currentTarget.getAttribute('data-promodiser-id');
            self.setState({
                ...self.state,
                editPromodiser: {
                    id,
                    showModal: true,
                }
            });
        });

        $(document).on('click', '.data-table-wrapper > .table-store-promodisers .delete', function(e) {
            const id = e.currentTarget.getAttribute('data-promodiser-id');
            self.setState({
                ...self.state,
                deletePromodiser: {
                    id,
                    showModal: true,
                }
            });
        });

        $('.table-store-items').DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/stores/${storeId}/items?token=${token}`,
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
                {
                    className: 'details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { 'data': 'code' },
                { 'data': 'name' },
                { 'data': 'latest_effectivity_date' },
                { 'data': 'latest_amount' },
            ]
        });

        const format = (d) => {
            return `<div class="card">
                <div class="card-header">
                    (${d.code})&nbsp;${d.name}<br/>
                    <span class="badge badge-secondary">Pricing History</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped table-store-item-pricing-history" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col">Effectivity Date</th>
                            <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $('.table-store-items')).on('click', 'td.details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find('table.table-store-items')
                .DataTable();
            var tr = $(this).closest('tr');
            var row = refDataTable.row( tr );

            if ( row.child.isShown() ) {
                $(this).find('i').removeClass('fa-chevron-circle-up');
                $(this).find('i').addClass('fa-chevron-circle-down');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $(this).find('i').removeClass('fa-chevron-circle-down');
                $(this).find('i').addClass('fa-chevron-circle-up');
                row.child( format(row.data()) ).show();
                tr.addClass('shown');

                if ( row.child.isShown() ) {
                    tr.next().find('table.table-store-item-pricing-history').DataTable({
                        ajax: {
                            type: 'get',
                            url: `${apiBaseUrl}/settings/stores/${row.data().store_id}/items/${row.data().id}?token=${token}`,
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
                        searching: false,
                        processing: true,
                        serverSide: true,
                        columns: [
                            { 'data': 'effectivity_date' },
                            { 'data': 'amount' },
                        ]
                    });
                }
            }
        });

        axios.get(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`)
            .then((response) => {
                const { data: store } = response.data;
                self.setState({
                    ...self.state,
                    store,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    handleSubmitNewPromodiser(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const {
            store,
        } = self.state;
        const table = $('.data-table-wrapper').find('table.table-store-promodisers').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/settings/stores/${store.id}/promodisers?token=${token}`;

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

    handleCloseDeletePromodiserModal() {
        const self = this;
        self.setState({
            ...self.state,
            deletePromodiser: {
                showModal: false,
                id: null,
                isDeleteError: false,
                deleteErrorHeaderTitle: '',
                deleteErrorBodyText: '',
            },
        });
    }

    handleCloseEditPromodiserModal() {
        const self = this;
        self.setState({
            ...self.state,
            editPromodiser: {
                id: null,
                showModal: false,
                loading: true,
            },
        });
    }

    handleShowEditPromodiserModal() {
        const token = cookie.load('token');
        const self = this;
        const { store, editPromodiser } = self.state;

        axios.get(`${apiBaseUrl}/settings/stores/${store.id}/promodisers/${editPromodiser.id}?token=${token}`)
            .then((response) => {
                const { data: promodiser } = response.data;
                self.setState({
                    ...self.state,
                    editPromodiser: {
                        ...self.state.editPromodiser,
                        ...promodiser,
                        loading: false,
                    }
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    handleSubmitEditPromodiserModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { store, deletePromodiser } = self.state;
        const form = $(e.currentTarget);
        const promodiserId = $('input[name="id"]', form).val();
        const data = form.serialize();
        const table = $('.data-table-wrapper').find('table.table-store-promodisers').DataTable();

        axios.patch(
                `${apiBaseUrl}/settings/stores/${store.id}/promodisers/${promodiserId}?token=${token}`,
                data
            )
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    editPromodiser: {
                        id: null,
                        showModal: false,
                        loading: true,
                    },
                });
            })
            .catch(() => {
                //
            });
    }

    handleSubmitDeletePromodiserModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { store, deletePromodiser } = self.state;
        const table = $('.data-table-wrapper').find('table.table-store-promodisers').DataTable();

        axios.delete(`${apiBaseUrl}/settings/stores/${store.id}/promodisers/${deletePromodiser.id}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    deletePromodiser: {
                        id: null,
                        showModal: false,
                        isDeleteError: false,
                        deleteErrorHeaderTitle: '',
                        deleteErrorBodyText: '',
                    },
                });
            })
            .catch((error) => {
                self.setState({
                    ...self.state,
                    deletePromodiser: {
                        isDeleteError: true,
                        deleteErrorHeaderTitle: 'Oh snap! Promodiser cannot be deleted!',
                        deleteErrorBodyText: `Promodiser ${deletePromodiser.id} have active related records.`,
                    },
                });
            });
    }

    handleSubmitNewItemPricing(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { store } = self.state;
        const form = $(e.currentTarget);
        const data = form.serialize();
        const table = $('.data-table-wrapper').find('table.table-store-items').DataTable();

        axios.post(
                `${apiBaseUrl}/settings/stores/${store.id}/items?token=${token}`,
                data
            )
            .then(() => {
                self.setState({
                    ...self.state,
                    selectedItem: null,
                });
                table.ajax.reload(null, false);
                $('.form-control', form).removeClass('is-invalid');
                form[0].reset();
            })
            .catch(() => {

            });
    }

    handleChangeSelectSingleItem(e) {
        this.setState({
            ...this.state,
            selectedItem: e
        });
    }

    render() {
        const {
            store,
            deletePromodiser,
            editPromodiser,
            selectedItem,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/settings-stores">Stores Registry</Breadcrumb.Item>
                    <Breadcrumb.Item active>{store.code}</Breadcrumb.Item>
                </Breadcrumb>
                <div className="row">
                    <div className="col-md-9">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{store.code}</Badge></p>
                                    <p>{store.name}</p>
                                </Card.Title>
                                <Card.Subtitle>{store.address_line}</Card.Subtitle>

                                <hr className="my-4"/>
                                <h4>Promodisers</h4>

                                <table className="table table-striped table-store-promodisers" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>

                                <hr className="my-4"/>
                                <h4>Item Pricing</h4>

                                <table className="table table-striped table-store-items" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th></th>
                                        <th scope="col">Code</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Latest Effectivity Date</th>
                                        <th scope="col">Latest Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>

                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-3">
                        <Card bg="dark" text="white" className="mb-3">
                            <Card.Header>Add New Promodiser</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewPromodiser}>
                                    <Form.Group>
                                        <Form.Label>Name:</Form.Label>
                                        <Form.Control type="text" name="name"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <hr/>
                                    <Button type="submit" block>Add</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Register Item Pricing</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewItemPricing}>
                                    <CommonDropdownSelectSingleItem
                                        key={uuidv4()}
                                        name="item_id"
                                        selectedItem={selectedItem}
                                        handleChange={this.handleChangeSelectSingleItem}/>
                                    <Form.Group>
                                        <Form.Label>Effectivity Date:</Form.Label>
                                        <Form.Control type="date" name="effectivity_date"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Amount:</Form.Label>
                                        <Form.Control type="text" name="amount"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <hr/>
                                    <Button type="submit" block>Register</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
                <CommonDeleteModal
                    isShow={deletePromodiser.showModal}
                    headerTitle="Delete Promodiser"
                    bodyText={`Are you sure to delete this promodiser?`}
                    handleClose={this.handleCloseDeletePromodiserModal}
                    handleSubmit={this.handleSubmitDeletePromodiserModal}
                    isDeleteError={deletePromodiser.isDeleteError}
                    deleteErrorHeaderTitle={deletePromodiser.deleteErrorHeaderTitle}
                    deleteErrorBodyText={deletePromodiser.deleteErrorBodyText}/>
                <EditPromodiserModal
                    editPromodiser={editPromodiser}
                    handleClose={this.handleCloseEditPromodiserModal}
                    handleShow={this.handleShowEditPromodiserModal}
                    handleSubmit={this.handleSubmitEditPromodiserModal}/>
            </div>
        );
    }
}
