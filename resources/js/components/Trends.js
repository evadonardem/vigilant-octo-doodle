import React, { Component } from 'react';
export default class Trends extends Component {
    render() {
        const options = [
            {
                icon: 'line-chart',
                title: 'Store Trends',
                description: '',
                to: 'trends-store',
            },
            {
                icon: 'bar-chart',
                title: 'Item Trends',
                description: '',
                to: 'trends-item',
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
