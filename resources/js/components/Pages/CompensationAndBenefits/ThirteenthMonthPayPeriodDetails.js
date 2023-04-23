import React, { Component, useEffect, useState } from 'react';
import { Badge, Breadcrumb, Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import { Link, useParams } from 'react-router-dom';
import sanitize from 'sanitize-filename';

const ThirteenthMonthPayPeriodDetails = () => {
    const params = useParams();
    const { thirteenthMonthPayPeriodId } = params;
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const initExportTitle = () =>
    {
        const {
            from,
            to,
        } = this.state;

        return `13th Month Pay (From: ${from} To: ${to})`;
    };

    const initExportFilename = () =>
    {
        return sanitize(initExportTitle());
    }

    const init = () => {
        const token = cookie.load('token');

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => initExportFilename();
        exportButtons[1].filename = () => initExportFilename();
        exportButtons[1].title = () => initExportTitle();

        const table = $('.table-pay-period-summary').DataTable({
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
                setFrom(payPeriod.from);
                setTo(payPeriod.to);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
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
                <Breadcrumb.Item linkProps={{ to: "/compensation-and-benefits/thirteenth-month-pay-periods" }} linkAs={Link}>
                    <i className="fa fa-id-card"></i> 13th Month Pay
                </Breadcrumb.Item>
                <Breadcrumb.Item active>From: {from} To: {to}</Breadcrumb.Item>
            </Breadcrumb>

            <Card>
                <Card.Body>
                    <table
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
        </>
    );
}

export default ThirteenthMonthPayPeriodDetails;
