import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Dashboard extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron>
                            <h1 className="text-center">
                                <i className="fa fa-calendar"></i><br/>
                                Attendance Logs
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'attendance-logs'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>                    
                    <div className="col-md-6">
                        <Jumbotron>
                            <h1 className="text-center">
                                <i className="fa fa-users"></i><br/>
                                Biometric Users
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'users'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron>
                            <h1 className="text-center">
                                <i className="fa fa-cogs"></i><br/>
                                General Settings
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'settings'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                </div>
            </div>
        );
    }
}
