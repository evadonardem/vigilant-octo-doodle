import React, { Component } from 'react';
import { Card, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import sanitize from 'sanitize-filename';

export default class DailyTimeRecordSearchResult extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const self = this;

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
                { data: 'position' },
                {
                    className: 'text-right',
                    data: 'meta.duration_total_hours'
                },
            ],
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
            const entries = `<table class="table">
                <thead>
                    <th>Day</th>
                    <th>Time-In/Out</th>
                    <th class="text-right">Total Hours</th>
                    <th class="text-right">No. of Deliveries</th>
                    <th>Remarks</th>
                </thead>
                <tbody>
                ${d.logs.map((log)=>{
                    return `<tr>
                        <td>${log.short_date}</td>
                        <td>${log.time_in_out.map((entry) => {
                            if (entry.length == 2) {
                                return `(In: ${entry[0]} - Out: ${entry[1]})`;
                            }
                            return `(In: ${entry[0]} - Out: ?)`;
                        }).join('<br>')}</td>
                        <td class="text-right">${log.total_hours}</td>
                        <td class="text-right">${log.deliveries}</td>
                        <td></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>`;

            return `<div class="card">
                <div class="card-header">
                    <span class="badge badge-success">${d.biometric_id}</span><br>
                    ${d.biometric_name}<br>
                    ${d.position}
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
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table.table-daily-time-record')
            .DataTable()
            .destroy(true);
        $('tbody', $(this.refs.dailyTimeRecordSearchResult))
            .off();
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
                    <Jumbotron>
                        <p className="text-center">
                            <i className="fa fa-5x fa-info-circle"/><br/>
                            Start by filtering records to search.
                        </p>
                    </Jumbotron>
                }

                <Card style={{ display: (hideTable ? 'none' : '') }}>
                    <Card.Header>
                        <h4><i className="fa fa-search"/> Search Result</h4>
                        User: { biometricId ? `${biometricId} ${biometricName}` : 'All' } From: {startDate} To: {endDate}
                    </Card.Header>
                    <Card.Body>
                        <table
                            ref="dailyTimeRecordSearchResult"
                            className="table table-striped table-daily-time-record"
                            style={{width: 100+'%'}}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th scope="col">Biometric ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Position</th>
                                    <th scope="col">Duration Total Hours</th>
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
