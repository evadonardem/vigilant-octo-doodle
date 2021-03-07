import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Document, Page } from '@react-pdf/renderer';

export default class Settings extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-users"></i><br/>
                                User Roles
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'settings-user-roles'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-calendar"></i><br/>
                                Overtime Rates
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'settings-overtime-rates'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-list"></i><br/>
                                Items Registry
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'settings-items'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-shopping-basket"></i><br/>
                                Stores Registry
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'settings-stores'}>
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
