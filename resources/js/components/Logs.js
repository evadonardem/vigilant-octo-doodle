import React, { Component } from 'react';


export default class Logs extends Component {
    render() {
        const options = [
            {
                icon: 'clock-o',
                title: 'Daily Time Record',
                description: 'Consolidated daily time record.',
                to: 'daily-time-record',
            },
            {
                icon: 'truck',
                title: 'Delivery Logs',
                description: 'Manually entered delivery logs.',
                to: 'deliveries',
            },
            {
                icon: 'calendar-plus-o',
                title: 'Manual Logs',
                description: 'Register override time log or delivery log.',
                to: 'manual-logs',
            },
        ];

        return (
            <div className="container-fluid my-4">
                <div className="row">
                    {options.map(({ icon, title, description, to } = option) =>
                        <div className="col-md-6">
                            <Option icon={icon} title={title} description={description} to={to} />
                        </div>)}
                </div>
            </div>
        );
    }
}
