import React, { Component } from 'react';
import { Breadcrumb, Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import date from 'date-and-time';

const COMMONT_END_POINT_RATINGS = `${apiBaseUrl}/common/ratings`;
const END_POINT = `${apiBaseUrl}/reports/promodisers-summary`;
const PROMODISERS_SUMMARY_DT = `table-promodisers-summary`;

export default class ReportsPromodisersSummary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ratings: [],
            token: null,
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const now = new Date();
        const exportButtons = window.exportButtonsBase;
        const exportFilename = `${date.format(now, 'YYYY-MM-DD')}_promodisers_summary`;
        const exportTitle = `${date.format(now, 'YYYY-MM-DD')} Promodisers Summary`;
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        self.setState({
            ...self.state,
            token,
        });

        const x = $(`.${PROMODISERS_SUMMARY_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?token=${token}`,
                dataSrc: (response) => {
                    const { data } = response;
                    return data;
                },
            },
            buttons: exportButtons,
            ordering: false,
            searching: false,
            paging: false,
            columns: [
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return row.store.location ? row.store.location.name : '';
                    }
                },
                { 'data': 'store.name' },
                { 'data': 'name' },
                { 'data': 'contact_no' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let currentRate = '';
                        if (row.current_job_contract) {
                            currentRate = row.current_job_contract.rate;
                        }
                        return currentRate;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let startDate = '';
                        if (row.current_job_contract) {
                            startDate = row.current_job_contract.start_date;
                        }
                        return startDate;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let endDate = '';
                        if (row.current_job_contract) {
                            endDate = row.current_job_contract.end_date;
                            endDate = endDate ? endDate : `<em>TO PRESENT</em>`;
                        }
                        return endDate;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let remarks = '';
                        if (row.current_job_contract) {
                            remarks = row.current_job_contract.remarks;
                        }
                        return remarks;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let rating = '';
                        if (row.latest_ratring) {
                            rating = row.latest_ratring.title;
                        }
                        return rating;
                    }
                },
            ],
        });

        $(`.${PROMODISERS_SUMMARY_DT}`).on( 'click', 'tbody td', function () {
            console.log(x.cell(this).render('display'));
        } );

        axios.get(`${COMMONT_END_POINT_RATINGS}`)
            .then((response) => {
                const { data: ratings } = response;
                self.setState({
                    ...self.state,
                    ratings,
                });
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    render() {
        const {
            token,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Promodisers Summary</Breadcrumb.Item>
                </Breadcrumb>
                <div className="row my-4">
                    <div className="col-md-12">
                        <Card>
                            <Card.Header>
                                <h4><i className='fa fa-lg fa-id-card'></i> Promodisers Summary</h4>
                            </Card.Header>
                            <Card.Body>
                                <table className={`table table-striped ${PROMODISERS_SUMMARY_DT}`} style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Location</th>
                                        <th scope="col">Store</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Contact No.</th>
                                        <th scope="col">Current Rate</th>
                                        <th scope="col">Start Date</th>
                                        <th scope="col">End Date</th>
                                        <th scope="col">Remarks</th>
                                        <th scope="col">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
