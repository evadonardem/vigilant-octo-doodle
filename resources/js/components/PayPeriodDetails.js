import React, { Component } from 'react';
import { Badge, Button, Card, Form, FormControl, InputGroup } from 'react-bootstrap';
import cookie from 'react-cookies';

import { PDFDownloadLink } from '@react-pdf/renderer';
import PaySlipsPdfDocument from './PaySlipsPdfDocument';

export default class PayPeriodDetails extends Component {
    constructor(props) {
        super(props);
        this.handleClickDeductionType = this.handleClickDeductionType.bind(this);
        this.handleSubmitCommonDeductions = this.handleSubmitCommonDeductions.bind(this);
        this.state = {
            id: null,
            from: null,
            to: null,
            commonDeductions: [],
            deductionTypes: [],
            payPeriod: [],
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { payPeriodId } = params;

        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Pay Period Summary';
        const exportTitle = 'Pay Period Summary';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        const table = $(this.refs.payPeriodSummary).DataTable({
            ajax: `${apiBaseUrl}/pay-periods/${payPeriodId}/details?token=${token}`,
            buttons: exportButtons,
            searching: true,
            ordering: true,
            columns: [
                {
                    className: 'details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { 'data': 'biometric_id' },
                { 'data': 'biometric_name' },
                { 'data': 'position' },
                { 'data': 'effective_per_hour_rate' },
                { 'data': 'effective_per_delivery_rate' },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_deliveries'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_deliveries_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_gross_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_deductions_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_net_amount'
                },
            ],
            columnDefs: [
                { orderable: false, targets: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
            ],
            order: [[2, 'asc']],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function ( i ) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '')*1
                        : typeof i === 'number' ? i : 0;
                };

                const totalGrossAmount = api
                    .column(10)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalDeductions = api
                    .column(11)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalNetAmount = api
                    .column(12)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(10).footer()).html(totalGrossAmount.toFixed(2));
                $(api.column(11).footer()).html(totalDeductions.toFixed(2));
                $(api.column(12).footer()).html(totalNetAmount.toFixed(2));
            }
        });

        const format = (d) => {
            const header = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px; width: 100%;">'+
                '<tr>'+
                    '<td>ID:</td>'+
                    '<td>'+d.biometric_id+'</td>'+
                    '<td>NAME:</td>'+
                    '<td>'+d.biometric_name+'</td>'+
                '</tr>'+
                '<tr>'+
                    '<td>POSITION:</td>'+
                    '<td>'+d.position+'</td>'+
                    '<td>COVERAGE:</td>'+
                    '<td>'+d.meta.from+' - '+d.meta.to+'</td>'+
                '</tr>'+
            '</table>';

            let payPeriodId = null;
            const deductions = d.deductions.map((deduction) => {
                const deductionType = deduction.deduction_type;
                payPeriodId = payPeriodId === null
                    ? deduction.pay_period_id
                    : payPeriodId;
                return `<div class="input-group mb-3">
                    <div class="input-group-prepend w-50">
                        <span class="input-group-text" style="width: 100%;">${deductionType.title}</span>
                    </div>
                    <input
                        type="number"
                        name="amount_${deduction.id}"
                        class="form-control text-right"
                        placeholder="Amount"
                        value="${+deduction.amount}">
                </div>`;
            }).join('');

            return `<div class="card">
                <div class="card-header">
                    <span class="badge badge-success">${d.biometric_id}</span><br>
                    ${d.biometric_name}<br>
                    ${d.position}
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">Compensations</div>
                                <div class="card-body">
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend w-50">
                                            <span class="input-group-text" style="width: 100%;">Total Hours / Amount</span>
                                        </div>
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Amount"
                                            value="${+d.meta.duration_total_hours}">
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Amount"
                                            value="${+d.meta.duration_total_hours_amount}">
                                    </div>
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend w-50">
                                            <span class="input-group-text" style="width: 100%;">No. of Deliveries / Amount</span>
                                        </div>
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            value="${+d.meta.duration_total_deliveries}">
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            value="${+d.meta.duration_total_deliveries_amount}">
                                    </div>
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend w-50">
                                            <span class="input-group-text" style="width: 100%;">TOTAL</span>
                                        </div>
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            value="-">
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            value="${+d.meta.duration_total_gross_amount}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">Deductions</div>
                                <div class="card-body">
                                    <form type="post" class="pay-period-update-deductions">
                                        ${deductions}
                                        <hr/>
                                        <div class="input-group mb-3">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text" style="width: 100%;">TOTAL</span>
                                            </div>
                                            <input
                                                type="number"
                                                disabled
                                                class="form-control text-right"
                                                value="${+d.meta.duration_total_deductions_amount}">
                                        </div>
                                        <input type="hidden" name="biometric_id" value="${d.biometric_id}">
                                        <input type="hidden" name="pay_period_id" value="${payPeriodId}">
                                        <button
                                            type="submit"
                                            class="form-control btn-primary">Update Deductions</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(this.refs.payPeriodSummary)).on('click', 'td.details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find('table.table-pay-period-summary')
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
            }
        });

        $(document).on('submit', '.pay-period-update-deductions', function (e) {
            e.preventDefault();
            const form = $(e.target);
            const data = form.serialize();
            axios.post(`${apiBaseUrl}/update-user-pay-period-deductions?token=${token}`, data)
                .then((response) => {
                    table.ajax.reload();
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });

            self.setState({ payPeriod: [] })
            axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}/details?token=${token}`)
                .then((response) => {
                    const { data: payPeriod } = response.data;
                    self.setState({ payPeriod });
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });
        });

        axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}?token=${token}`)
            .then((response) => {
                const { data: payPeriod } = response.data;
                self.setState({
                    id: payPeriod.id,
                    from: payPeriod.from,
                    to: payPeriod.to,
                    commonDeductions: payPeriod.common_deductions,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${apiBaseUrl}/settings/deduction-types?token=${token}`)
            .then((response) => {
                const { data: deductionTypes } = response.data;
                self.setState({ deductionTypes });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}/details?token=${token}`)
            .then((response) => {
                const { data: payPeriod } = response.data;
                self.setState({ payPeriod });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    handleClickDeductionType(e) {
        const isChecked = e.target.checked;
        const deductionTypeCode = e.target.value;
        const targetElement = $('[name="' + deductionTypeCode + '_amount"]');
        targetElement.prop('disabled', !isChecked);
        if (!isChecked) {
            targetElement.val('');
        }
    }

    handleSubmitCommonDeductions(e) {
        e.preventDefault();
        const token = cookie.load('token');
        const self = this;
        const form = $(e.target);
        const data = form.serialize();
        const { params } = self.props.match;
        const { payPeriodId } = params;

        axios.post(`${apiBaseUrl}/pay-periods/${payPeriodId}/common-deductions?token=${token}`, data)
            .then((response) => {
                form[0].reset();
                window.location.reload();
            })
            .catch((error) => {

            });
    }

    render() {
        const {
            id,
            from,
            to,
            commonDeductions,
            deductionTypes,
            payPeriod,
        } = this.state;

        const deductionTypeOptions = deductionTypes.map((type) => {
            return <InputGroup key={`deduction-type-${type.id}`} className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Checkbox value={type.code} onClick={this.handleClickDeductionType}/>
                </InputGroup.Prepend>
                <InputGroup.Prepend>
                    <InputGroup.Text>{type.title}</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl type="number" name={`${type.code}_amount`} placeholder="Default Amount" disabled />
            </InputGroup>;
        });

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-address-card-o"></i> Pay Period Details</h1>
                <p>
                    <Badge variant="secondary">ID: {id}</Badge>&nbsp;
                    <Badge variant="secondary">From: {from}</Badge>&nbsp;
                    <Badge variant="secondary">To: {to}</Badge>
                </p>
                <hr className="my-4"/>
                {
                    commonDeductions.length === 0 &&
                    <Card>
                        <Card.Header>
                            <i className="fa fa-cogs"></i>&nbsp;
                            Setup Common Deductions
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={this.handleSubmitCommonDeductions}>
                                {deductionTypeOptions}
                                <hr/>
                                <Button type="submit" className="pull-right">Next &gt;&gt;</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                }
                <Card className={commonDeductions.length > 0 ? 'visible' : 'invisible'}>
                    <Card.Body>
                        <div className="row">
                            <div className="col-md-12">
                                { payPeriod.length > 0 &&
                                    <PDFDownloadLink document={<PaySlipsPdfDocument payPeriod={payPeriod} />} fileName={`payslips-${id}.pdf`} className="btn btn-primary pull-right">
                                        {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download Payslips')}
                                    </PDFDownloadLink>
                                }
                            </div>
                        </div>
                        <hr className="my-4"/>
                        <table
                            ref="payPeriodSummary"
                            className="table table-striped table-pay-period-summary"
                            style={{width: 100+'%'}}>
                            <thead>
                                <tr>
                                <th></th>
                                <th scope="col">Biometric ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Position</th>
                                <th scope="col">Effective Per Hour Rate</th>
                                <th scope="col">Effective Delivery Rate</th>
                                <th scope="col">Total Hours</th>
                                <th scope="col">Total Amount (Hours)</th>
                                <th scope="col">Total No. of Deliveries</th>
                                <th scope="col">Total Amount (Deliveries)</th>
                                <th scope="col">Gross Amount</th>
                                <th scope="col">Total Deductions Amount</th>
                                <th scope="col">Net Amount</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="9"></th>
                                    <th>Total:</th>
                                    <th>0.00</th>
                                    <th>0.00</th>
                                    <th>0.00</th>
                                </tr>
                            </tfoot>
                        </table>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}
