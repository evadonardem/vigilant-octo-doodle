import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import cookie from 'react-cookies';
import jwt_decode from 'jwt-decode';

export default class Dashboard extends Component {
	constructor(props) {
        super(props);
        this.state = {
			currentUser: null,
		};
    }
    
	componentDidMount() {
        const self = this;
        const token = cookie.load('token');
	}
	
    render() {
		const { currentUser } = this.state;
        return (
            <div className="container-fluid my-4">
				<p>{currentUser ? JSON.stringify(currentUser) : ''}</p>
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
                                <i className="fa fa-clock-o"></i><br/>
                                Daily Time Record
                            </h1>
                            <hr className="my-4"/>
                            <p className="lead text-center">
                                <Link to={'daily-time-record'}>
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
