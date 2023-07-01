import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import CommonDeleteModal from '../../CommonDeleteModal';
import CommonDropdownSelectSingleOvertimeRateTypes from '../../CommonDropdownSelectSingleOvertimeRateTypes';
import React, { Component } from 'react';
import cookie from 'react-cookies';

export default class OvertimeRates extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewOvertimeRate = this.handleSubmitNewOvertimeRate.bind(this);
        this.handleCloseDeleteOvertimeRateModal = this.handleCloseDeleteOvertimeRateModal.bind(this);
        this.handleSubmitDeleteOvertimeRateModal = this.handleSubmitDeleteOvertimeRateModal.bind(this);

        this.state = {
            showDeleteOvertimeRateModal: false,
            overtimeRateId: null,
            isDeleteOvertimeRateError: false,
            deleteOvertimeRateErrorHeaderTitle: '',
            deleteOvertimeRateErrorBodyText: '',
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'OvertimeRates';
        const exportTitle = 'Overtime Rates';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.overtimeRatesList).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/overtime-rates?token=${token}`,
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
                { 'data': 'effectivity_date' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return row.type.title;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `${parseFloat(+row.non_night_shift * 100).toFixed(2)}%`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `${parseFloat(+row.night_shift * 100).toFixed(2)}%`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const overtimeRateId = e.currentTarget.getAttribute('data-id');
            self.setState({
                showDeleteOvertimeRateModal: true,
                overtimeRateId,
            });
        });
    }

    handleSubmitNewOvertimeRate(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-overtime-rates').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/settings/overtime-rates?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                form.find('.is-invalid').removeClass('is-invalid');
                form[0].reset();
            })
            .catch((error) => {
                form.find('.is-invalid').removeClass('is-invalid');

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

    handleCloseDeleteOvertimeRateModal() {
        const self = this;
        self.setState({
            showDeleteOvertimeRateModal: false,
            overtimeRateId: null,
            isDeleteOvertimeRateError: false,
            deleteOvertimeRateErrorHeaderTitle: '',
            deleteOvertimeRateErrorBodyText: '',
        });
    }

    handleSubmitDeleteOvertimeRateModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { overtimeRateId } = self.state;
        const table = $('.data-table-wrapper').find('table.table-overtime-rates').DataTable();

        axios.delete(`${apiBaseUrl}/settings/overtime-rates/${overtimeRateId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeleteOvertimeRateModal: false,
                    overtimeRateId: null,
                    isDeleteOvertimeRateError: false,
                    deleteOvertimeRateErrorHeaderTitle: '',
                    deleteOvertimeRateErrorBodyText: '',
                });
            })
            .catch((error) => {
                self.setState({
                    isDeleteOvertimeRateError: true,
                    deleteOvertimeRateErrorHeaderTitle: 'Oh snap! Overtime rate cannot be deleted!',
                    deleteOvertimeRateErrorBodyText: `Overtime rate Id: ${overtimeRateId} has related records linked.`,
                });
            });
    }

    render() {
        const {
            showDeleteOvertimeRateModal,
            overtimeRateId,
            isDeleteOvertimeRateError,
            deleteOvertimeRateErrorHeaderTitle,
            deleteOvertimeRateErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item active>Overtime Rates</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-9">
                        <Card>
                            <Card.Body>
                                <table ref="overtimeRatesList" className="table table-striped table-overtime-rates" style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Effectivity Date</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Non-night Shift</th>
                                        <th scope="col">Night Shift</th>
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
                            <Card.Header>Create New Overtime Rate</Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSubmitNewOvertimeRate}>
                                    <Form.Group>
                                        <Form.Label>Effectivity:</Form.Label>
                                        <Form.Control type="date" name="effectivity_date"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <CommonDropdownSelectSingleOvertimeRateTypes
                                        key={uuidv4()}
                                        name="overtime_rate_type_id"/>
                                    <Form.Group>
                                        <Form.Label>Non-night Shift %Rate:</Form.Label>
                                        <Form.Control type="number" name="non_night_shift" step="any"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Night Shift %Rate:</Form.Label>
                                        <Form.Control type="number" name="night_shift" step="any"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>
                                    <hr/>
                                    <Button type="submit">Create</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <CommonDeleteModal
                    isShow={showDeleteOvertimeRateModal}
                    headerTitle="Delete Overtime Rate"
                    bodyText={`Are you sure to delete this overtime rate?`}
                    handleClose={this.handleCloseDeleteOvertimeRateModal}
                    handleSubmit={this.handleSubmitDeleteOvertimeRateModal}
                    isDeleteError={isDeleteOvertimeRateError}
                    deleteErrorHeaderTitle={deleteOvertimeRateErrorHeaderTitle}
                    deleteErrorBodyText={deleteOvertimeRateErrorBodyText}/>
            </div>
        );
    }
}
