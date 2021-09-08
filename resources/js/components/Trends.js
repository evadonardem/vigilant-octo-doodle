import React, { Component } from 'react';
import ChartsSalesByStore from './ChartsSalesByStore';
import ChartsTrendsByItem from './ChartsTrendsByItem';
export default class Trends extends Component {
    render() {
        return (
            <div className="container-fluid my-4">
                <ChartsSalesByStore/>
                <ChartsTrendsByItem/>
            </div>
        );
    }
}
