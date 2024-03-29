import { Breadcrumb, Card } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';
import Directory from '../../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Compensation and Benefits',
        link: '#/compensation-and-benefits'
    },
    {
        icon: '',
        label: '13th Month Pay',
        link: '#/compensation-and-benefits/thirteenth-month-pay-periods'
    },
    {
        icon: '',
        label: 'From: {from} To: {to}',
    },
];

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
                { orderable: false, targets: [0, 1, 2, 3, 4, 5, 6] }
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
                    .column(2)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalAmountDeliveries = api
                    .column(3)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalGrossAmount = api
                    .column(4)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                const totalThirteenthMonthPay = api
                    .column(5)
                    .data()
                    .reduce(
                        function (a, b) {
                            return intVal(a) + intVal(b);
                        },
                        0
                    );

                $(api.column(2).footer()).html(totalAmountRegular.toFixed(2));
                $(api.column(3).footer()).html(totalAmountDeliveries.toFixed(2));
                $(api.column(4).footer()).html(totalGrossAmount.toFixed(2));
                $(api.column(5).footer()).html(totalThirteenthMonthPay.toFixed(2));
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

    const items = from && to ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{from}', from).replace('{to}', to);
        return item;
    }) : [];

    return (
        <>
            <Directory items={items}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-id-card"></i> 13th Month Pay (From: {from} To: {to})
                </Card.Header>
                <Card.Body>
                    <table
                        className="table table-striped table-pay-period-summary"
                        style={{width: 100+'%'}}>
                        <thead>
                            <tr>
                            <th scope="col">Biometric ID</th>
                            <th scope="col">Name</th>
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
                                <th colSpan="2">Total:</th>
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
