import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';

export default class AttendanceLogsSearchResult extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const self = this;

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => { return this.initExportFilename(); };
        exportButtons[1].filename = () => { return this.initExportFilename(); };
        exportButtons[1].title = () => { return this.initExportTitle(); };

        const dataTable = $(this.refs.attendanceLogsSearchResult).DataTable({
            ajax: {
                error: function (xhr, error, code) {
                    if (code === 'Unauthorized') {
                        location.reload();
                    }
                    dataTable.clear().draw();
                }
            },
            searching: false,
            buttons: exportButtons,
            columns: [
                { 'data': 'biometric_id' },
                { 'data': 'biometric_name' },
                { 'data': 'biometric_timestamp' }
            ],
            columnDefs: [
                { 'orderable': false, 'targets': [0, 1] }
            ],
            order: [[2, 'asc']]
        });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table.table-attendance-logs')
            .DataTable()
            .destroy(true);
    }

    initExportTitle()
    {
        const {
            biometricId,
            biometricName,
            startDate,
            endDate
        } = this.props;

        const user = `User: ${ biometricId ? `${biometricId} ${biometricName}` : 'All' }`;
        const label = `${user}${user ? ' ' : ''}From: ${startDate} To: ${endDate}`;

        return `Attendance Logs ${label}`;
    }

    initExportFilename()
    {
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
            .find('table.table-attendance-logs')
            .DataTable();

        if (startDate && endDate) {
            const filters = 'start_date=' + startDate + '&end_date=' + endDate + (biometricId ? '&biometric_id=' + biometricId : '');
            const token = cookie.load('token');
            dataTable.ajax.url(apiBaseUrl + '/biometric/attendance-logs?token=' + token + '&' + filters);
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
                        <h4><i className="fa fa-search"/> Search Result</h4>
                        User: { biometricId ? `${biometricId} ${biometricName}` : 'All' } From: {startDate} To: {endDate}
                    </Card.Header>
                    <Card.Body>
                        <table ref="attendanceLogsSearchResult" className="table table-striped table-attendance-logs" style={{width: 100+'%'}}>
                            <thead>
                                <tr>
                                    <th scope="col">Biometric ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Date Time</th>
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
