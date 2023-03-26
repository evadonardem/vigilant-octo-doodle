import React, { Component } from 'react';
import Option from './Generic/Option';

export default class CompensationAndBenefits extends Component {
    render() {
        const options = [
            {
                icon: 'address-card-o',
                title: 'Pay Periods',
                description: 'Semi-monthly pay periods.',
                to: 'pay-periods',
            },
            {
                icon: 'gift',
                title: '13<sup>th</sup> Month Pay',
                description: 'Annual 13<sup>th</sup> month pay periods.',
                to: 'thirteenth-month-pay-periods',
            },
        ];

        return (
            <div className="container-fluid my-4">
                <div className="row">
                    {options.map(({icon, title, description, to} = option) =>
                        <div className="col-md-6">
                            <Option icon={icon} title={title} description={description} to={to} />
                        </div>)}
                </div>
            </div>
        );
    }
}
