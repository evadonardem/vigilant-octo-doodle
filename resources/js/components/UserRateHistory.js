import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Card, Badge } from 'react-bootstrap';

export default class UserRateHistory extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            id: null,
            biometricId: null,
            name: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { userId } = params;

        const exportButtons = window.exportButtonsBase;

        axios.get(`${apiBaseUrl}/biometric/users/${userId}?token=${token}`)
            .then((response) => {
                const { data: user } = response.data;
                this.setState({
                    id: user.id,
                    biometricId: user.biometric_id,
                    name: user.name,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        $(this.refs.hourlyRateHistory).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/biometric/users/${userId}/rates?filters[rate_type_id]=1&token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;
                    
                    return data;
                },
            },
            ordering: false,
            processing: true,
            serverSide: true,            
            buttons: exportButtons,
            columns: [                
                { 'data': 'amount' },
                { 'data': 'created_at' },
            ]
        });

        $(this.refs.deliveryRateHistory).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/biometric/users/${userId}/rates?filters[rate_type_id]=2&token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;
                    
                    return data;
                },
            },
            ordering: false,
            processing: true,
            serverSide: true,            
            buttons: exportButtons,
            columns: [                
                { 'data': 'amount' },
                { 'data': 'created_at' },
            ]
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
            id,
            biometricId,
            name,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-history"></i> Rate History</h1>
                <hr className="my-4"/>
                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{biometricId}</Badge></p>
                                    <h4>{name}</h4>
                                </Card.Title>
                                <hr/>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    <h5>Hourly Rate</h5>
                                                </Card.Title>
                                                <hr/>
                                                <table ref="hourlyRateHistory" className="table table-striped" style={{width: 100+'%'}}>
                                                    <thead>
                                                        <tr>                                        
                                                        <th scope="col">Rate</th>
                                                        <th scope="col">Effectivity Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>                                         
                                    </div>
                                    <div className="col-md-6">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    <h5>Delivery Rate</h5>
                                                </Card.Title>
                                                <hr/>
                                                <table ref="deliveryRateHistory" className="table table-striped" style={{width: 100+'%'}}>
                                                    <thead>
                                                        <tr>                                        
                                                        <th scope="col">Rate</th>
                                                        <th scope="col">Effectivity Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>                                                  
                            </Card.Body>                            
                        </Card>                    
                    </div>
                </div>
            </div>
        );
    }
}
