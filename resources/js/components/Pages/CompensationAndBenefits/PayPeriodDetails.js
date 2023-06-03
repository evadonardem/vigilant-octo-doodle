import { Breadcrumb, Button, ButtonGroup, Card, Form, FormControl, InputGroup } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PaySlipsPdfDocument from './PaySlipsPdfDocument';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';

const PayPeriodDetails = () => {
    const params = useParams();
    const { payPeriodId } = params;
    const [id, setId] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [commonDeductions, setCommonDeductions] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);
    const [payPeriod, setPayPeriod] = useState([]);

    const init = () => {
        const token = cookie.load('token');
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'Pay Period Summary';
        const exportTitle = 'Pay Period Summary';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        const table = $('.table-pay-period-summary').DataTable({
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
                    data: 'meta.duration_total_hours_overtime'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours_amount_overtime'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours_amount_with_overtime'
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
                { orderable: false, targets: [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
            ],
            order: [[2, 'asc']],
            footerCallback: function () {
                const api = this.api();

                const intVal = function (i) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '') * 1
                        : typeof i === 'number' ? i : 0;
                };

                const totalHoursRegular = api
                    .column(6)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountRegular = api
                    .column(7)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalHoursOvertime = api
                    .column(8)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountOvertime = api
                    .column(9)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountRegularAndOvertime = api
                    .column(10)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalDeliveries = api
                    .column(11)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalDeliveriesAmount = api
                    .column(12)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalGrossAmount = api
                    .column(13)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalDeductions = api
                    .column(14)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalNetAmount = api
                    .column(15)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(6).footer()).html(totalHoursRegular.toFixed(3));
                $(api.column(7).footer()).html(totalAmountRegular.toFixed(2));
                $(api.column(8).footer()).html(totalHoursOvertime.toFixed(3));
                $(api.column(9).footer()).html(totalAmountOvertime.toFixed(2));
                $(api.column(10).footer()).html(totalAmountRegularAndOvertime.toFixed(2));
                $(api.column(11).footer()).html(totalDeliveries.toFixed(0));
                $(api.column(12).footer()).html(totalDeliveriesAmount.toFixed(2));
                $(api.column(13).footer()).html(totalGrossAmount.toFixed(2));
                $(api.column(14).footer()).html(totalDeductions.toFixed(2));
                $(api.column(15).footer()).html(totalNetAmount.toFixed(2));
            }
        });

        const format = (d) => {

            const deductions = d.deductions.map((deduction) => {
                const deductionType = deduction.deduction_type;
                return `<div class="input-group mb-3">
                    <div class="input-group-prepend w-50">
                        <span class="input-group-text" style="width: 100%;">${deductionType.title}</span>
                    </div>
                    <input
                        type="number"
                        name="amount_${deduction.id}"
                        class="form-control text-right"
                        placeholder="Amount"
                        value="${parseFloat(+deduction.amount).toFixed(2)}">
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
                                            <span class="input-group-text" style="width: 100%;">Total Hrs. / Amt. (Reg.)</span>
                                        </div>
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Total Hrs. (Reg.)"
                                            value="${parseFloat(+d.meta.duration_total_hours).toFixed(3)}">
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Total Amt. (Reg.)"
                                            value="${parseFloat(+d.meta.duration_total_hours_amount).toFixed(2)}">
                                    </div>
                                    <div class="input-group mb-3">
                                        <div class="input-group-prepend w-50">
                                            <span class="input-group-text" style="width: 100%;">Total Hrs. / Amt. (OT)</span>
                                        </div>
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Total Hrs. (OT)"
                                            value="${parseFloat(+d.meta.duration_total_hours_overtime).toFixed(3)}">
                                        <input
                                            type="number"
                                            disabled
                                            class="form-control text-right"
                                            placeholder="Total Amt. (OT)"
                                            value="${parseFloat(+d.meta.duration_total_hours_amount_overtime).toFixed(2)}">
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
                                            value="${parseFloat(+d.meta.duration_total_deliveries_amount).toFixed(2)}">
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
                                            value="${parseFloat(+d.meta.duration_total_gross_amount).toFixed(2)}">
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
                                                value="${parseFloat(+d.meta.duration_total_deductions_amount).toFixed(2)}">
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
        $('tbody', $('.table-pay-period-summary')).on('click', 'td.details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find('table.table-pay-period-summary')
                .DataTable();
            var tr = $(this).closest('tr');
            var row = refDataTable.row(tr);

            if (row.child.isShown()) {
                $(this).find('i').removeClass('fa-chevron-circle-up');
                $(this).find('i').addClass('fa-chevron-circle-down');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $(this).find('i').removeClass('fa-chevron-circle-down');
                $(this).find('i').addClass('fa-chevron-circle-up');
                row.child(format(row.data())).show();
                tr.addClass('shown');
            }
        });

        $(document).on('submit', '.pay-period-update-deductions', function (e) {
            e.preventDefault();
            const form = $(e.target);
            const data = form.serialize();
            axios.post(`${apiBaseUrl}/update-user-pay-period-deductions?token=${token}`, data)
                .then(() => {
                    table.ajax.reload();
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });

            setPayPeriod([]);
            axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}/details?token=${token}`)
                .then((response) => {
                    const { data: payPeriod } = response.data;
                    setPayPeriod(payPeriod);
                })
                .catch(() => {
                    location.href = `${appBaseUrl}`;
                });
        });

        axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}?token=${token}`)
            .then((response) => {
                const { data: payPeriod } = response.data;
                setId(payPeriod.id);
                setFrom(payPeriod.from);
                setTo(payPeriod.to);
                setCommonDeductions(payPeriod.common_deductions);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${apiBaseUrl}/settings/deduction-types?token=${token}`)
            .then((response) => {
                const { data: deductionTypes } = response.data;
                setDeductionTypes(deductionTypes);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        axios.get(`${apiBaseUrl}/pay-periods/${payPeriodId}/details?token=${token}`)
            .then((response) => {
                const { data: payPeriod } = response.data;
                setPayPeriod(payPeriod);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    };

    const handleClickDeductionType = (e) => {
        const isChecked = e.target.checked;
        const deductionTypeCode = e.target.value;
        const targetElement = $('[name="' + deductionTypeCode + '_amount"]');
        targetElement.prop('disabled', !isChecked);
        if (!isChecked) {
            targetElement.val('');
        }
    };

    const handleSubmitCommonDeductions = (e) => {
        e.preventDefault();
        const token = cookie.load('token');
        const form = $(e.target);
        const data = form.serialize();

        $('[type="submit"]', form).prop('disabled', true);
        axios.post(`${apiBaseUrl}/pay-periods/${payPeriodId}/common-deductions?token=${token}`, data)
            .then(() => {
                form[0].reset();
                window.location.reload();
            })
            .catch(() => {
                window.location.reload();
            });
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkProps={{ to: "/compensation-and-benefits" }} linkAs={Link}>
                    <i className="fa fa-gift"></i> Compensation and Benefits
                </Breadcrumb.Item>
                <Breadcrumb.Item linkProps={{ to: "/compensation-and-benefits/pay-periods" }} linkAs={Link}>
                    <i className="fa fa-address-card-o"></i> Pay Periods
                </Breadcrumb.Item>
                <Breadcrumb.Item active>From: {from} To: {to}</Breadcrumb.Item>
            </Breadcrumb>

            {
                commonDeductions.length === 0 &&
                <Card>
                    <Card.Header>
                        <i className="fa fa-cogs"></i>&nbsp;
                        Setup Common Deductions
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmitCommonDeductions}>
                            {deductionTypes && deductionTypes.map((type) =>
                                <InputGroup key={`deduction-type-${type.id}`} className="mb-3">
                                    <InputGroup.Checkbox value={type.code} onClick={handleClickDeductionType} />
                                    <InputGroup.Text>{type.title}</InputGroup.Text>
                                    <FormControl type="number" name={`${type.code}_amount`} placeholder="Default Amount" disabled />
                                </InputGroup>
                            )}
                            <hr />
                            <Button type="submit" className="pull-right">Next &gt;&gt;</Button>
                        </Form>
                    </Card.Body>
                </Card>
            }
            <Card className={`${commonDeductions.length > 0 ? 'visible' : 'invisible'} mb-4`}>
                <Card.Body>
                    <table
                        className="table table-striped table-pay-period-summary"
                        style={{ width: 100 + '%' }}>
                        <thead>
                            <tr>
                                <th></th>
                                <th scope="col">Biometric ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Position</th>
                                <th scope="col">Effective Rate/Hr.</th>
                                <th scope="col">Effective Rate/Delivery</th>
                                <th scope="col">Total Hrs. (Reg.)</th>
                                <th scope="col">Total Amt. (Reg.)</th>
                                <th scope="col">Total Hrs. (OT)</th>
                                <th scope="col">Total Amt. (OT)</th>
                                <th scope="col">Total Amt. (Reg. + OT)</th>
                                <th scope="col">Total No. of Deliveries</th>
                                <th scope="col">Total Amt.</th>
                                <th scope="col">Gross Amt.</th>
                                <th scope="col">Total Deductions Amt.</th>
                                <th scope="col">Net Amt.</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="5"></th>
                                <th>Total:</th>
                                <th>0.000</th>
                                <th>0.00</th>
                                <th>0.000</th>
                                <th>0.00</th>
                                <th>0.00</th>
                                <th>0</th>
                                <th>0.00</th>
                                <th>0.00</th>
                                <th>0.00</th>
                                <th>0.00</th>
                            </tr>
                        </tfoot>
                    </table>
                </Card.Body>
                <Card.Footer>
                    <ButtonGroup className="pull-right">
                        {payPeriod.length > 0 &&
                            <PDFDownloadLink
                                document={<PaySlipsPdfDocument
                                    payPeriod={payPeriod} />}
                                fileName={`payslips-${id}.pdf`}
                                className="btn btn-primary">
                                {({ loading }) => (loading
                                    ? 'Loading document...'
                                    : <span><i className="fa fa-download"></i> Download Payslips</span>)}
                            </PDFDownloadLink>}
                    </ButtonGroup>
                </Card.Footer>
            </Card>
        </>
    );
}

export default PayPeriodDetails;
