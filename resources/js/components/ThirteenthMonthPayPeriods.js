import React, { Component } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from './CommonDeleteModal';

export default class ThirteenthMonthPayPeriods extends Component {
    constructor(props) {
        super(props);
        this.handleSubmitNewPayPeriod = this.handleSubmitNewPayPeriod.bind(this);
        this.handleCloseDeletePayPeriodModal = this.handleCloseDeletePayPeriodModal.bind(this);
        this.handleSubmitDeletePayPeriodModal = this.handleSubmitDeletePayPeriodModal.bind(this);

        this.state = {
            showDeletePayPeriodModal: false,
            payPeriodId: null,
            isDeletePayPeriodError: false,
            deletePayPeriodErrorHeaderTitle: '',
            deletePayPeriodErrorBodyText: '',
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'PayPeriods';
        const exportTitle = 'Pay Periods';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $(this.refs.payPeriodsList).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/thirteenth-month-pay-periods?token=${token}`,
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
                { 'data': 'from' },
                { 'data': 'to' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-pay-period-id="' + row.id + '"><i class="fa fa-folder-open"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-pay-period-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `${openBtn} ${deleteBtn}`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open', function(e) {
            e.preventDefault();
            const payPeriodId = e.currentTarget.getAttribute('data-pay-period-id');
            location.href = `${appBaseUrl}/#/thirteenth-month-pay-period-details/${payPeriodId}`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function(e) {
            const payPeriodId = e.currentTarget.getAttribute('data-pay-period-id');
            self.setState({
                showDeletePayPeriodModal: true,
                payPeriodId,
            });
        });
    }

    handleSubmitNewPayPeriod(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-thirteenth-month-pay-periods').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/thirteenth-month-pay-periods?token=${token}`;

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
                        $('[name=' + key + ']', modal)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleCloseDeletePayPeriodModal() {
        const self = this;
        self.setState({
            showDeletePayPeriodModal: false,
            payPeriodId: null,
            isDeletePayPeriodError: false,
            deletePayPeriodErrorHeaderTitle: '',
            deletePayPeriodErrorBodyText: '',
        });
    }

    handleSubmitDeletePayPeriodModal(e) {
        e.preventDefault();

        const self = this;
        const token = cookie.load('token');
        const { payPeriodId } = self.state;
        const table = $('.data-table-wrapper').find('table.table-thirteenth-month-pay-periods').DataTable();

        axios.delete(`${apiBaseUrl}/thirteenth-month-pay-periods/${payPeriodId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    showDeletePayPeriodModal: false,
                    payPeriodId: null,
                    isDeletePayPeriodError: false,
                    deletePayPeriodErrorHeaderTitle: '',
                    deletePayPeriodErrorBodyText: '',
                });
            })
            .catch((error) => {
                self.setState({
                    isDeletePayPeriodError: true,
                    deletePayPeriodErrorHeaderTitle: 'Oh snap! Pay period cannot be deleted!',
                    deletePayPeriodErrorBodyText: `Pay period ${payPeriodId} has active slips processed.`,
                });
            });
    }

    render() {
        const {
            showDeletePayPeriodModal,
            payPeriodId,
            isDeletePayPeriodError,
            deletePayPeriodErrorHeaderTitle,
            deletePayPeriodErrorBodyText,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-gift"></i> 13<sup>th</sup> Month Pay Periods</h1>

                <hr className="my-4"/>

                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Body>
                                <div className="row">
                                    <div className="col-md-3">
                                        <Card>
                                            <Card.Header>New Pay Period</Card.Header>
                                            <Card.Body>
                                                <Form onSubmit={this.handleSubmitNewPayPeriod}>
                                                    <Form.Group>
                                                        <Form.Label>From:</Form.Label>
                                                        <Form.Control type="month" name="from"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>To:</Form.Label>
                                                        <Form.Control type="month" name="to"></Form.Control>
                                                        <div className="invalid-feedback"></div>
                                                    </Form.Group>
                                                    <hr/>
                                                    <Button type="submit" block>Create</Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <div className="col-md-9">
                                        <table ref="payPeriodsList" className="table table-striped table-thirteenth-month-pay-periods" style={{width: 100+'%'}}>
                                            <thead>
                                                <tr>
                                                <th scope="col">From</th>
                                                <th scope="col">To</th>
                                                <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <CommonDeleteModal
                    isShow={showDeletePayPeriodModal}
                    headerTitle="Delete Pay Period"
                    bodyText={`Are you sure to delete this pay period?`}
                    handleClose={this.handleCloseDeletePayPeriodModal}
                    handleSubmit={this.handleSubmitDeletePayPeriodModal}
                    isDeleteError={isDeletePayPeriodError}
                    deleteErrorHeaderTitle={deletePayPeriodErrorHeaderTitle}
                    deleteErrorBodyText={deletePayPeriodErrorBodyText}/>
            </div>
        );
    }
}
