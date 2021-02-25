import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class CompensationAndBenefits extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-address-card-o"></i><br/>
                                Pay Periods
                            </h1>
                            <p className="lead text-center">
                                Semi-monthly pay periods.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'pay-periods'}>
                                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                                </Link>
                            </p>
                        </Jumbotron>
                    </div>
                    <div className="col-md-6">
                        <Jumbotron className="bg-primary text-white">
                            <h1 className="text-center">
                                <i className="fa fa-gift"></i><br/>
                                13<sup>th</sup> Month Pay
                            </h1>
                            <p className="lead text-center">
                                Annual 13<sup>th</sup> month pay periods.
                            </p>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'thirteenth-month-pay-periods'}>
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
