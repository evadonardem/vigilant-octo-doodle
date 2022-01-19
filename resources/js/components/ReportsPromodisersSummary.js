import React, { Component } from 'react';
import { Breadcrumb, Button, Alert, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStoreLocation from './CommonDropdownSelectSingleStoreLocation';

const END_POINT = `${apiBaseUrl}/reports/promodisers-summary`;
const PROMODISERS_SUMMARY_DT = `table-promodisers-summary`;

export default class ReportsPromodisersSummary extends Component {
    constructor(props) {
        super(props);    

        this.state = {
            token: null,            
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        self.setState({
            ...self.state,
            token,
        });

        $(`.${PROMODISERS_SUMMARY_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?token=${token}`,
                dataSrc: (response) => {
                    const { data } = response;
                    return data;
                },
            },
            buttons: [],
            ordering: false,        
            searching: false,           
            columns: [
                { 'data': 'name' },
                { 'data': 'contact_no' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let currentRate = '';
                        if (row.job_contracts && row.job_contracts.length > 0) {
                            currentRate = row.job_contracts[0].rate;
                        }
                        return currentRate;
                    }
                },                
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let startDate = '';
                        if (row.job_contracts && row.job_contracts.length > 0) {
                            startDate = row.job_contracts[0].start_date;
                        }
                        return startDate;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let endDate = '';
                        if (row.job_contracts && row.job_contracts.length > 0) {
                            endDate = row.job_contracts[0].end_date;
                            endDate = endDate ? endDate : `<em>TO PRESENT</em>`;
                        }
                        return endDate;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        let remarks = '';
                        if (row.job_contracts && row.job_contracts.length > 0) {
                            remarks = row.job_contracts[0].remarks;
                        }
                        return remarks;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return row.store.location ? row.store.location.name : '';
                    }
                },
                { 'data': 'store.name' },                
            ],
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
                                        <th scope="col">Name</th>
                                        <th scope="col">Contact No.</th>
                                        <th scope="col">Current Rate</th>                                        
                                        <th scope="col">Start Date</th>
                                        <th scope="col">End Date</th>
                                        <th scope="col">Remarks</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">Store</th>
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
