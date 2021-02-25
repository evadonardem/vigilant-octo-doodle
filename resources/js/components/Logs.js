import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Document, Page } from '@react-pdf/renderer';

export default class Logs extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-clock-o"></i><br/>
                                Daily Time Record
                            </h1>
                            <p className="lead text-center">
                                Consolidated daily time record.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'daily-time-record'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-calendar"></i><br/>
                                Attendance Logs
                            </h1>
                            <p className="lead text-center">
                                Time logs from biometric device.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'attendance-logs'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-truck"></i><br/>
                                Delivery Logs
                            </h1>
                            <p className="lead text-center">
                                Manually entered delivery logs.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'deliveries'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-calendar-plus-o"></i><br/>
                                Manual Logs
                            </h1>
                            <p className="lead text-center">
                                Register override time log or delivery log.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'manual-logs'}>
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
