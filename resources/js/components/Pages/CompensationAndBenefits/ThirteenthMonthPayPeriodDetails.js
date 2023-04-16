import React, { Component } from 'react';
import { Badge, Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';

export default class ThirteenthMonthPayPeriodDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            from: null,
            to: null,
            payPeriod: [],
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { thirteenthMonthPayPeriodId } = params;

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => { return this.initExportFilename(); };
        exportButtons[1].filename = () => { return this.initExportFilename(); };
        exportButtons[1].title = () => { return this.initExportTitle(); };

        const table = $(this.refs.payPeriodSummary).DataTable({
            ajax: `${apiBaseUrl}/thirteenth-month-pay-periods/${thirteenthMonthPayPeriodId}/details?token=${token}`,
            buttons: exportButtons,
            searching: true,
            ordering: true,
            columns: [
                { 'data': 'biometric_id' },
                { 'data': 'biometric_name' },
                { 'data': 'position' },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_deliveries_amount'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_gross_amount_without_overtime'
                },
                {
                    className: 'text-right',
                    data: 'meta.duration_thirteenth_month_pay'
                },
                {
                    data: null,
                    'render': function (data, type, row) {
                        return `&nbsp;`;
                    }
                },
            ],
            columnDefs: [
                { orderable: false, targets: [0, 2, 3, 4, 5, 6, 7] }
            ],
            order: [[1, 'asc']],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function ( i ) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '')*1
                        : typeof i === 'number' ? i : 0;
                };

                const totalAmountRegular = api
                    .column(3)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountDeliveries = api
                    .column(4)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalGrossAmount = api
                    .column(5)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalThirteenthMonthPay = api
                    .column(6)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(3).footer()).html(totalAmountRegular.toFixed(2));
                $(api.column(4).footer()).html(totalAmountDeliveries.toFixed(2));
                $(api.column(5).footer()).html(totalGrossAmount.toFixed(2));
                $(api.column(6).footer()).html(totalThirteenthMonthPay.toFixed(2));
            },
        });

        axios.get(`${apiBaseUrl}/thirteenth-month-pay-periods/${thirteenthMonthPayPeriodId}?token=${token}`)
            .then((response) => {
                const { data: payPeriod } = response.data;
                self.setState({
                    id: payPeriod.id,
                    from: payPeriod.from,
                    to: payPeriod.to,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    initExportTitle()
    {
        const {
            from,
            to,
        } = this.state;

        return `13th Month Pay (From: ${from} To: ${to})`;
    }

    initExportFilename()
    {
        return sanitize(this.initExportTitle());
    }

    render() {
        const {
            id,
            from,
            to,
            payPeriod,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-gift"></i> 13<sup>th</sup> Month Pay</h1>
                <p>
                    <Badge variant="secondary">ID: {id}</Badge>&nbsp;
                    <Badge variant="secondary">From: {from}</Badge>&nbsp;
                    <Badge variant="secondary">To: {to}</Badge>
                </p>
                <hr className="my-4"/>
                <Card>
                    <Card.Body>
                        <table
                            ref="payPeriodSummary"
                            className="table table-striped table-pay-period-summary"
                            style={{width: 100+'%'}}>
                            <thead>
                                <tr>
                                <th scope="col">Biometric ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Position</th>
                                <th scope="col">Total Amt. (Reg.)</th>
                                <th scope="col">Total Amt. (Deliveries)</th>
                                <th scope="col">Gross Amt. (Reg. + Deliveries)</th>
                                <th scope="col">13<sup>th</sup> Month Pay</th>
                                <th scope="col">Signature</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="2"></th>
                                    <th>Total:</th>
                                    <th>0.00</th>
                                    <th>0.00</th>
                                    <th>0.00</th>
                                    <th>0.00</th>
                                    <th>&nbsp;</th>
                                </tr>
                            </tfoot>
                        </table>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}
