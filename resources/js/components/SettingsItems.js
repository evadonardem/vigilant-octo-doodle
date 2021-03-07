import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Container, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';

export default class SettingsItems extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewItem = this.handleSubmitNewItem.bind(this);
        this.handleCloseDeleteItemModal = this.handleCloseDeleteItemModal.bind(this);
        this.handleSubmitDeleteItemModal = this.handleSubmitDeleteItemModal.bind(this);

        this.state = {
            showDeleteItemModal: false,
            itemId: null,
            isDeleteItemError: false,
            deleteItemErrorHeaderTitle: '',
            deleteItemErrorBodyText: '',
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Items';
        const exportTitle = 'Items';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.itemsList).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/items?token=${token}`,
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
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-item-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const itemId = e.currentTarget.getAttribute('data-item-id');
            self.setState({
                showDeleteItemModal: true,
                itemId,
            });
        });
    }

    handleSubmitNewItem(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-items').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/settings/items?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                form[0].reset();
            })
            .catch((error) => {
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

    handleCloseDeleteItemModal() {
        const self = this;
        self.setState({
            showDeleteItemModal: false,
            itemId: null,
            isDeleteItemError: false,
            deleteItemErrorHeaderTitle: '',
            deleteItemErrorBodyText: '',
        });
    }

    handleSubmitDeleteItemModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { itemId } = self.state;
        const table = $('.data-table-wrapper').find('table.table-items').DataTable();

        axios.delete(`${apiBaseUrl}/settings/items/${itemId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeleteItemModal: false,
                    itemId: null,
                    isDeleteItemError: false,
                    deleteItemErrorHeaderTitle: '',
                    deleteItemErrorBodyText: '',
                });
            })
            .catch((error) => {
                self.setState({
                    isDeleteItemError: true,
                    deleteItemErrorHeaderTitle: 'Oh snap! Item cannot be deleted!',
                    deleteItemErrorBodyText: `Item ${itemId} has active slips processed.`,
                });
            });
    }

    render() {
        const {
            showDeleteItemModal,
            itemId,
            isDeleteItemError,
            deleteItemErrorHeaderTitle,
            deleteItemErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Items Registry</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-9">
                        <Card>
                            <Card.Body>
                                <table ref="itemsList" className="table table-striped table-items" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Code</th>
                                        <th scope="col">Name</th>
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
                            <Card.Header>Add New Item</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewItem}>
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
                                    <hr/>
                                    <Button type="submit" block>Add</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <CommonDeleteModal
                    isShow={showDeleteItemModal}
                    headerTitle="Delete Item"
                    bodyText={`Are you sure to delete this item?`}
                    handleClose={this.handleCloseDeleteItemModal}
                    handleSubmit={this.handleSubmitDeleteItemModal}
                    isDeleteError={isDeleteItemError}
                    deleteErrorHeaderTitle={deleteItemErrorHeaderTitle}
                    deleteErrorBodyText={deleteItemErrorBodyText}/>
            </div>
        );
    }
}
