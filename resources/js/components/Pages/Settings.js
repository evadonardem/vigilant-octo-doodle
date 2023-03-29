import React from 'react';
import Option from '../Generic/Option';

export default function Settings() {
    const options = [
        {
            icon: "users",
            title: "Users",
            description: 'List of registered users.',
            to: "/settings-users",
        },
        {
            icon: "calendar",
            title: "Overtime Rates",
            description: null,
            to: "/settings-overtime-rates",
        },
        {
            icon: "list",
            title: "Items Registry",
            description: null,
            to: "/settings-items",
        },
        {
            icon: "shopping-basket",
            title: "Stores Registry",
            description: null,
            to: "/settings-stores",
        },
    ];

    return <>
        <div className="container-fluid my-4">
            <div className="row">
                {options.map(({ icon, title, description, to } = options) => <div className="col-md-6">
                    <Option icon={icon} title={title} description={description} to={to} />
                </div>)}
            </div>
        </div>
    </>;
}
