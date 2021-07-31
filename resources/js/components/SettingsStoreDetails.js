import React, { Component } from 'react';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import { Breadcrumb, Button, ButtonGroup, Card, Form } from 'react-bootstrap';
import CommonDeleteModal from './CommonDeleteModal';
import CommonDropdownSelectSingleItem from './CommonDropdownSelectSingleItem'
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from './CommonDropdownSelectSingleStoreLocation';

const END_POINT = `${apiBaseUrl}/settings/stores`;

export default class SettingStoreDetails extends Component {
    constructor(props) {
        super(props);

        this.handleToggleUpdateDetails = this.handleToggleUpdateDetails.bind(this);
        this.handleCancelUpdateDetails = this.handleCancelUpdateDetails.bind(this);
        this.handleSubmitUpdateDetails = this.handleSubmitUpdateDetails.bind(this);

        this.handleSubmitNewPromodiser = this.handleSubmitNewPromodiser.bind(this);

        this.handleCloseDeletePromodiserModal = this.handleCloseDeletePromodiserModal.bind(this);
        this.handleSubmitDeletePromodiserModal = this.handleSubmitDeletePromodiserModal.bind(this);

        this.handleSubmitNewItemPricing = this.handleSubmitNewItemPricing.bind(this);
        this.handleChangeSelectSingleItem = this.handleChangeSelectSingleItem.bind(this);

        this.handleStoreCategoryChange = this.handleStoreCategoryChange.bind(this);
        this.handleStoreLocationChange = this.handleStoreLocationChange.bind(this);

        this.state = {
            store: {
                id: null,
                code: null,
                name: null,
                address_line: null,
            },
            selectedCategory: {},
            selectedLocation: {},
            updateStoreDetails: false,
            cancelledUpdateStoreDetails: false,
            deletePromodiser: {
                id: null,
                showModal: false,
                loading: true,
                isDeleteError: false,
                deleteErrorHeaderTitle: '',
                deleteErrorBodyText: '',
            },
            selectedItem: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { storeId } = params;

        const dataTablePromodisers = $('.table-store-promodisers').DataTable({
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
            buttons: [],
            ordering: false,
            processing: true,
            serverSide: true,
            columns: [
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `<input
                            class="form-control update-promodiser"
                            type="text"
                            name="name"
                            value="${data.name}"
                            readonly/>
                        <div class="invalid-feedback"></div>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `<input
                            class="form-control update-promodiser"
                            type="text"
                            name="contact_no"
                            value="${data.contact_no}"
                            readonly/>
                        <div class="invalid-feedback"></div>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const editBtn = `<a
                            href="#"
                            class="edit btn btn-secondary">
                                <i class="fa fa-edit"></i>
                            </a>`;
                        const deleteBtn = `<a
                            href="#"
                            class="delete btn btn-secondary"
                            data-toggle="modal"
                            data-promodiser-id="${row.id}">
                                <i class="fa fa-trash"></i>
                            </a>`;
                        return `<div class="action-a btn-group" role="group">
                            ${editBtn}
                            ${deleteBtn}
                        </div>
                        <div class="action-b btn-group" role="group" style="display: none;">
                            <a href="#" class="save btn btn-secondary" data-promodiser-id="${row.id}">
                                <i class="fa fa-save"></i>
                            </a>
                            <a href="#" class="cancel btn btn-secondary">
                                <i class="fa fa-undo"></i>
                            </a>
                        </div>`;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: [2],
                    className: 'text-center',
                }
            ],
        });

        $(document).on('click', '.data-table-wrapper > .table-store-promodisers .edit', function(e) {
            e.preventDefault();
            const tableRow = $(e.currentTarget).closest('tr');
            tableRow.find('.update-promodiser').prop('readonly', false);
            tableRow.find('.action-a').hide();
            tableRow.find('.action-b').show();
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

        $(document).on('click', '.data-table-wrapper > .table-store-promodisers .cancel', function(e) {
            e.preventDefault();
            const tableRow = $(e.currentTarget).closest('tr');
            tableRow.find('.update-promodiser').prop('readonly', true);
            tableRow.find('.action-a').show();
            tableRow.find('.action-b').hide();
            dataTablePromodisers.ajax.reload(null, false);
        });

        $(document).on('click', '.data-table-wrapper > .table-store-promodisers .save', function(e) {
            e.preventDefault();
            const { store } = self.state;
            const promodiserId = $(e.currentTarget).data('promodiser-id');
            const tableRow = $(e.currentTarget).closest('tr');
            const inputFields = tableRow.find('.update-promodiser');
            let data = {};
            inputFields.each(function () {
                data[$(this).prop('name')] = $(this).val();
            });
            axios.patch(`${END_POINT}/${store.id}/promodisers/${promodiserId}?token=${token}`, data)
                .then(() => {
                    tableRow.find('.form-control').removeClass('is-invalid');
                    tableRow.find('.update-promodiser').prop('readonly', true);
                    tableRow.find('.action-a').show();
                    tableRow.find('.action-b').hide();
                })
                .catch((error) => {
                    if (error.response) {
                        const { response } = error;
                        const { data } = response;
                        const { errors } = data;
                        tableRow.find('.form-control').removeClass('is-invalid');
                        for (const key in errors) {
                            $('[name=' + key + ']', tableRow)
                                .addClass('is-invalid')
                                .closest('td')
                                .find('.invalid-feedback')
                                .text(errors[key][0]);
                        }
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
            buttons: [],
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
                        buttons: [],
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
                    selectedCategory: (store.category ? { value: store.category.id, label: store.category.name } : {}),
                    selectedLocation: (store.location ? { value: store.location.id, label: store.location.name } : {}),
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

    handleToggleUpdateDetails(e) {
        const self = this;
        self.setState({
            ...self.state,
            updateStoreDetails: true,
            cancelledUpdateStoreDetails: false,
        });
    }

    handleCancelUpdateDetails(e) {
        const self = this;
        self.setState({
            ...self.state,
            cancelledUpdateStoreDetails: true,
            updateStoreDetails: false,
        })
    }

    handleSubmitUpdateDetails(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const { store, selectedCategory, selectedLocation } = self.state;
        const form = $(e.target);
        const data = {
            code: $('[name="code"]', form).val(),
            name: $('[name="name"]', form).val(),
            category: selectedCategory,
            location: selectedLocation,
            address_line: $('[name="address_line"]', form).val(),
        };

        axios.patch(`${END_POINT}/${store.id}?token=${token}`, data)
            .then((response) => {
                $('.form-control', form).removeClass('is-invalid');
                const { data: store } = response.data;
                self.setState({
                    ...self.state,
                    store,
                    selectedCategory: { value: store.category.id, label: store.category.name },
                    selectedLocation: { value: store.location.id, label: store.location.name },
                    updateStoreDetails: false,
                });
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
            .then(() => {
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

    handleStoreCategoryChange(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedCategory: e
        })
    }

    handleStoreLocationChange(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedLocation: e
        })
    }

    render() {
        const {
            store,
            updateStoreDetails,
            cancelledUpdateStoreDetails,
            deletePromodiser,
            selectedItem,
            selectedCategory,
            selectedLocation,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/settings-stores">Stores Registry</Breadcrumb.Item>
                    <Breadcrumb.Item active>{store.code}</Breadcrumb.Item>
                </Breadcrumb>
                <Card>
                    <Card.Body>
                        <Card>
                            <Card.Header>General Details</Card.Header>
                            <Card.Body>
                                <Form
                                    key={cancelledUpdateStoreDetails ? uuidv4() : store.id}
                                    onSubmit={this.handleSubmitUpdateDetails}>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <Form.Group>
                                                <Form.Label>Code:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="code"
                                                    defaultValue={store.code}
                                                    readOnly={!updateStoreDetails}></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>Name:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    defaultValue={store.name}
                                                    readOnly={!updateStoreDetails}></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-2">
                                            <CommonDropdownSelectSingleStoreCategory
                                                readOnly={!updateStoreDetails}
                                                handleChange={this.handleStoreCategoryChange}
                                                selectedValue={selectedCategory}/>
                                        </div>
                                        <div className="col-md-2">
                                            <CommonDropdownSelectSingleStoreLocation
                                                readOnly={!updateStoreDetails}
                                                handleChange={this.handleStoreLocationChange}
                                                selectedValue={selectedLocation}/>
                                        </div>
                                    </div>
                                    <Form.Group>
                                        <Form.Label>Address:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address_line"
                                            defaultValue={store.address_line}
                                            readOnly={!updateStoreDetails}></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <hr className="my-4"/>
                                    {
                                        updateStoreDetails
                                            ? <ButtonGroup className="pull-right">
                                                <Button
                                                    type="submit"
                                                    variant="primary">Save</Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={this.handleCancelUpdateDetails}>Cancel</Button>
                                            </ButtonGroup>
                                            : <Button
                                                type="button"
                                                className="pull-right"
                                                onClick={this.handleToggleUpdateDetails}>Update Details</Button>
                                    }
                                </Form>
                            </Card.Body>
                        </Card>
                        <div className="row my-4">
                            <div className="col-md-8">
                                <Card>
                                    <Card.Header>Promodisers</Card.Header>
                                    <Card.Body>
                                        <table className="table table-striped table-store-promodisers" style={{width: 100+'%'}}>
                                            <thead>
                                                <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Contact No.</th>
                                                <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="col-md-4">
                                <Card>
                                    <Card.Header>Add New Promodiser</Card.Header>
                                    <Card.Body>
                                        <Form onSubmit={this.handleSubmitNewPromodiser}>
                                            <Form.Group>
                                                <Form.Label>Name:</Form.Label>
                                                <Form.Control type="text" name="name"></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Contact No:</Form.Label>
                                                <Form.Control type="text" name="contact_no"></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <hr/>
                                            <Button type="submit" block>Add</Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                        <div className="row my-4">
                            <div className="col-md-8">
                                <Card>
                                    <Card.Header>Item Pricing</Card.Header>
                                    <Card.Body>
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
                            <div className="col-md-4">
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
                    </Card.Body>
                </Card>
                <CommonDeleteModal
                    isShow={deletePromodiser.showModal}
                    headerTitle="Delete Promodiser"
                    bodyText={`Are you sure to delete this promodiser?`}
                    handleClose={this.handleCloseDeletePromodiserModal}
                    handleSubmit={this.handleSubmitDeletePromodiserModal}
                    isDeleteError={deletePromodiser.isDeleteError}
                    deleteErrorHeaderTitle={deletePromodiser.deleteErrorHeaderTitle}
                    deleteErrorBodyText={deletePromodiser.deleteErrorBodyText}/>
            </div>
        );
    }
}
