import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
export default class Trends extends Component {
    render() {        
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-line-chart"></i><br/>
                                Store Trends
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'trends-store'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-bar-chart"></i><br/>
                                Item Trends
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'trends-item'}>
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
