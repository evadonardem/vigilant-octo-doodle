import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Document, Page } from '@react-pdf/renderer';

export default class Settings extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <h1><i className="fa fa-cogs"></i> Settings</h1>
                <hr className="my-4"/>
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron>
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
                </div>
            </div>
        );
    }
}
