import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from '../../CommonDeleteModal';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';

const END_POINT_STORE_CATEGORIES = `${apiBaseUrl}/settings/store-categories`;
const DT_STORE_CATEGORIES = 'table-store-categories';
const DT_STORES = 'table-stores';
export default class StoresRegistry extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewStore = this.handleSubmitNewStore.bind(this);
        this.handleCloseDeleteStoreModal = this.handleCloseDeleteStoreModal.bind(this);
        this.handleSubmitDeleteStoreModal = this.handleSubmitDeleteStoreModal.bind(this);
        this.handleStoreCategoryChange = this.handleStoreCategoryChange.bind(this);
        this.handleStoreLocationChange = this.handleStoreLocationChange.bind(this);

        this.exportFilename = this.exportFilename.bind(this);
        this.exportTitle = this.exportTitle.bind(this);

        this.state = {
            storeCategory: {
                id: -1,
                name: '',
            },
            showDeleteStoreModal: false,
            storeId: null,
            isDeleteStoreError: false,
            deleteStoreErrorHeaderTitle: '',
            deleteStoreErrorBodyText: '',
            selectedCategory: {},
            selectedLocation: {},
        };
    }

    exportFilename() {
        const self = this;
        const { storeCategory } = self.state;
        return `stores_${storeCategory.name.replace(' ', '_').toLowerCase()}`;
    }

    exportTitle() {
        const self = this;
        const { storeCategory } = self.state;
        return `Stores ${storeCategory.name}`;
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { storeCategory } = self.state;

        // create stores data table
        const exportButtons = window.exportButtonsBase;
        const exportFilename = () => { return this.exportFilename() };
        const exportTitle = () => { return this.exportTitle() };
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;
        const storesDataTable = $(`.${DT_STORES}`).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/stores?all=1&category_id=${storeCategory.id}&token=${token}`,
                dataSrc: (response) => {
                    const { data } = response;
                    return data;
                },
            },
            buttons: exportButtons,
            ordering: false,
            columns: [
                { 'data': 'code' },
                { 'data': 'name' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (row.category_id) {
                            return row.category.name;
                        }

                        return '-';
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        if (row.location_id) {
                            return row.location.name;
                        }

                        return '-';
                    }
                },
                { 'data': 'address_line' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const tags = row.tags.map(function (tag) {
                            return `<span class="badge badge-pill badge-secondary">${tag}</span>`;
                        });
                        return tags.join(' ');
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = `<a
                            href="#"
                            class="open btn btn-secondary"
                            data-store-id="${row.id}">
                                <i class="fa fa-folder-open"></i>
                            </a>`;
                        const deleteBtn = `<a
                            href="#"
                            class="delete btn btn-secondary"
                            data-toggle="modal"
                            data-target="#deleteModal"
                            data-store-id="${row.id}">
                                <i class="fa fa-trash"></i>
                            </a>`;

                        return `<div class="btn-group" role="group">
                            ${openBtn}
                            ${deleteBtn}
                        </div>`;
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

        // Create data table store categories
        $(`.${DT_STORE_CATEGORIES}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT_STORE_CATEGORIES}?token=${token}`,
                dataSrc: (response) => {
                    const { data } = response;
                    return data;
                },
            },
            buttons: [],
            ordering: false,
            paging: false,
            columns: [
                { 'data': 'name' },
                { 'data': 'stores_count' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = `<a
                            href="#"
                            class="open-store-category btn btn-secondary"
                            data-category-id="${row.id}"
                            data-category-name="${row.name}">
                                <i class="fa fa-folder-open"></i>
                            </a>`;

                        return `<div class="btn-group" role="group">
                            ${openBtn}
                        </div>`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open-store-category', function(e) {
            e.preventDefault();
            const categoryId = +e.currentTarget.getAttribute('data-category-id');
            const categoryName = e.currentTarget.getAttribute('data-category-name');
            self.setState({
                ...self.state,
                storeCategory: {
                    id: categoryId,
                    name: categoryName,
                },
            });
            storesDataTable.ajax.url(`${apiBaseUrl}/settings/stores?all=1&category_id=${categoryId}&token=${token}`).load();
        });
    }

    handleSubmitNewStore(e) {
        e.preventDefault();
        const self = this;
        const { selectedCategory, selectedLocation } = self.state;
        const token = cookie.load('token');
        const storeCategoriesDataTable = $('.data-table-wrapper').find(`table.${DT_STORE_CATEGORIES}`).DataTable();
        const table = $('.data-table-wrapper').find(`table.${DT_STORES}`).DataTable();
        const form = $(e.target);
        const data = {
            code: $('[name="code"]', form).val(),
            name: $('[name="name"]', form).val(),
            category: selectedCategory,
            location: selectedLocation,
            address_line: $('[name="address_line"]', form).val(),
        };

        const actionEndPoint = `${apiBaseUrl}/settings/stores?token=${token}`;

        axios.post(actionEndPoint, data)
            .then(() => {
                self.setState({
                    ...self.state,
                    selectedCategory: {},
                    selectedLocation: {},
                });
                storeCategoriesDataTable.ajax.reload(null, false);
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
        const storeCategoriesDataTable = $('.data-table-wrapper').find(`table.${DT_STORE_CATEGORIES}`).DataTable();
        const table = $('.data-table-wrapper').find('table.table-stores').DataTable();

        axios.delete(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`)
            .then(() => {
                storeCategoriesDataTable.ajax.reload(null, false);
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
            storeCategory,
            showDeleteStoreModal,
            isDeleteStoreError,
            deleteStoreErrorHeaderTitle,
            deleteStoreErrorBodyText,
            selectedCategory,
            selectedLocation,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Stores Registry</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-3">
                        <Card>
                            <Card.Header><i className='fa fa-folder'></i> Store Categories</Card.Header>
                            <Card.Body>
                                <table className={`table table-striped ${DT_STORE_CATEGORIES}`} style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Category</th>
                                        <th scope="col">Stores</th>
                                        <th scope="col"></th>
                                        </tr>
                                    </thead>
                                </table>
                            </Card.Body>
                        </Card>
                        <Card className='mt-4'>
                            <Card.Header><i className='fa fa-shopping-cart'></i> Add New Store</Card.Header>
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
                                    <CommonDropdownSelectSingleStoreCategory
                                        handleChange={this.handleStoreCategoryChange}
                                        selectedValue={selectedCategory}/>
                                    <CommonDropdownSelectSingleStoreLocation
                                        handleChange={this.handleStoreLocationChange}
                                        selectedValue={selectedLocation}/>
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
                    <div className="col-md-9">
                        <Card>
                            { storeCategory.id >= 0 &&
                                <Card.Header><i className="fa fa-folder-open"></i> {storeCategory.name}</Card.Header> }
                            <Card.Body>
                                { storeCategory.id < 0 &&
                                    <div className='text-center'>
                                        <h1><i className="fa fa-info-circle"></i></h1>
                                        <p>Select store category to view or add new store below.</p>
                                    </div> }
                                <div style={{display: `${storeCategory.id < 0 ? 'none' : 'block'}`}}>
                                    <table className={`table table-striped ${DT_STORES}`} style={{width: 100+'%'}}>
                                        <thead>
                                            <tr>
                                            <th scope="col">Code</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Category</th>
                                            <th scope="col">Location</th>
                                            <th scope="col">Address</th>
                                            <th scope="col">Tags</th>
                                            <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <CommonDeleteModal
                    isShow={showDeleteStoreModal}
                    headerTitle="Delete Store"
                    bodyText={`Are you sure to delete this store?`}
                    handleClose={this.handleCloseDeleteStoreModal}
                    handleSubmit={this.handleSubmitDeleteStoreModal}
                    isDeleteError={isDeleteStoreError}
                    deleteErrorHeaderTitle={deleteStoreErrorHeaderTitle}
                    deleteErrorBodyText={deleteStoreErrorBodyText}/>
            </div>
        );
    }
}
