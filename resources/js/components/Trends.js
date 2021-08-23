import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import ChartsSalesByStore from './ChartsSalesByStore';

export default class Trends extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <ChartsSalesByStore/>                
            </div>
        );
    }
}
