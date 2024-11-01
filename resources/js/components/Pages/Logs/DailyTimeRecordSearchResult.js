import { Card } from 'react-bootstrap';
import React, { Component } from 'react';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';

export default class DailyTimeRecordSearchResult extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => { return this.initExportFilename(); };
        exportButtons[1].filename = () => { return this.initExportFilename(); };
        exportButtons[1].title = () => { return this.initExportTitle(); };

        const dataTable = $(this.refs.dailyTimeRecordSearchResult).DataTable({
            ajax: {
                error: function (xhr, error, code) {
                    if (code === 'Unauthorized') {
                        location.reload();
                    }
                    dataTable.clear().draw();
                }
            },
            searching: false,
            ordering: false,
            buttons: exportButtons,
            columns: [
                {
                    className: 'details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { data: 'biometric_id' },
                { data: 'biometric_name' },
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
            ],
        });

        const format = (d) => {
            const entries = `<table class="table">
                <thead>
                    <th>Day</th>
                    <th>Time-In/Out</th>
                    <th class="text-right">Total Hrs. (Reg.)</th>
                    <th class="text-right">Total Amt. (Reg.)</th>
                    <th class="text-right">Total Hrs. (OT)</th>
                    <th class="text-right">Total Amt. (OT)</th>
                    <th class="text-right">Total Amt. (Reg. + OT)</th>
                    <th class="text-right">No. of Deliveries</th>
                    <th class="text-right">Deliveries Amt.</th>
                    <th>Remarks</th>
                </thead>
                <tbody>
                ${d.logs.map((log) => {
                const logTotalAmount = parseFloat(+log.total_amount + +log.total_amount_overtime).toFixed(2);
                return `<tr>
                        <td>${log.date}</td>
                        <td>${log.time_in_out.map((entry) => {
                    if (entry.hasOwnProperty('in') && entry.hasOwnProperty('out')) {
                        let detail = `<em>In: ${entry.in}<br/>Out: ${entry.out}</em><br/>`;
                        detail += '<ul>';
                        if (+entry.amount > 0) {
                            detail += `<li>${entry.hours} Hrs. @ Php. ${entry.per_hour_rate_amount}/Hr. = Php. ${entry.amount}</li>`;
                        }
                        if (+entry.amount_overtime > 0) {
                            detail += `<li>(OT) ${entry.hours_overtime} Hrs. @ Php. ${entry.per_hour_rate_amount_overtime}/Hr. = Php. ${entry.amount_overtime}</li>`;
                        }
                        return detail += '</ul>';
                    }
                    return `<em>In: ${entry.in}<br/>Out: ?</em><br/>`;
                }).join('<br>')}</td>
                        <td class="text-right">${log.total_hours}</td>
                        <td class="text-right">${log.total_amount}</td>
                        <td class="text-right">${log.total_hours_overtime}</td>
                        <td class="text-right">${log.total_amount_overtime}</td>
                        <td class="text-right">${logTotalAmount}</td>
                        <td class="text-right">${log.total_deliveries}</td>
                        <td class="text-right">${log.total_deliveries_amount}</td>
                        <td>${log.remarks}</td>
                    </tr>`;
            }).join('')}
                </tbody>
            </table>`;

            return `<div class="card">
                <div class="card-header">
                    <span class="badge bg-primary">${d.biometric_id}</span> ${d.biometric_name}
                </div>
                <div class="card-body">
                    ${entries}
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(this.refs.dailyTimeRecordSearchResult)).on('click', 'td.details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find('table.table-daily-time-record')
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
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table.table-daily-time-record')
            .DataTable()
            .destroy(true);
        $('tbody', $(this.refs.dailyTimeRecordSearchResult))
            .off();
    }

    initExportTitle() {
        const {
            biometricId,
            biometricName,
            startDate,
            endDate
        } = this.props;

        const user = `User: ${biometricId ? `${biometricId} ${biometricName}` : 'All'}`;
        const label = `${user}${user ? ' ' : ''}From: ${startDate} To: ${endDate}`;

        return `Attendance Logs ${label}`;
    }

    initExportFilename() {
        return sanitize(this.initExportTitle());
    }

    render() {
        const {
            biometricId,
            biometricName,
            startDate,
            endDate
        } = this.props;

        const dataTable = $('.data-table-wrapper')
            .find('table.table-daily-time-record')
            .DataTable();

        if (startDate && endDate) {
            const filters = 'start_date=' + startDate + '&end_date=' + endDate + (biometricId ? '&biometric_id=' + biometricId : '');
            const token = cookie.load('token');
            dataTable.ajax.url(apiBaseUrl + '/daily-time-record?token=' + token + '&' + filters);
            dataTable.ajax.reload();
        } else {
            dataTable.clear().draw();
        }

        const hideTable = !startDate || !endDate;

        return (
            <div>
                {
                    (!startDate || !endDate) &&
                    <p className="text-center">
                        <i className="fa fa-5x fa-info-circle" /><br />
                        Start by filtering records to search.
                    </p>
                }

                <Card style={{ display: (hideTable ? 'none' : '') }}>
                    <Card.Header>
                        <h4><i className="fa fa-search" /> Search Result</h4>
                        User: {biometricId ? `${biometricId} ${biometricName}` : 'All'} From: {startDate} To: {endDate}
                    </Card.Header>
                    <Card.Body>
                        <table
                            ref="dailyTimeRecordSearchResult"
                            className="table table-striped table-daily-time-record"
                            style={{ width: 100 + '%' }}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th scope="col">Biometric ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Total Hrs. (Reg.)</th>
                                    <th scope="col">Total Amt. (Reg.)</th>
                                    <th scope="col">Total Hrs. (OT)</th>
                                    <th scope="col">Total Amt. (OT)</th>
                                    <th scope="col">Total Amt. (Reg. + OT)</th>
                                    <th scope="col">No. of Deliveries</th>
                                    <th scope="col">Deliveries Amt.</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}
