import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Document, Page } from '@react-pdf/renderer';

export default class Reports extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-file"></i><br/>
                                Delivery Sales Monitoring
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'reports-delivery-sales-monitoring'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-file"></i><br/>
                                Delivery Receipt Monitoring
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'reports-delivery-receipt-monitoring'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-file"></i><br/>
                                Sales Invoice Monitoring
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'reports-sales-invoice-monitoring'}>
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
