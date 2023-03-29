import React from 'react';
import Option from '../Generic/Option';

export default function Settings() {
    const options = [
        {
            icon: "users",
            title: "Users Registry",
            description: 'List of registered users.',
            to: "/settings/users",
        },
        {
            icon: "calendar",
            title: "Overtime Rates",
            description: 'Overtime rates matrix.',
            to: "/settings/overtime-rates",
        },
        {
            icon: "list",
            title: "Items Registry",
            description: 'List of registered items.',
            to: "/settings/items-registry",
        },
        {
            icon: "shopping-basket",
            title: "Stores Registry",
            description: 'List of registered stores.',
            to: "/settings/stores-registry",
        },
    ];

    return <>
        <div className="container-fluid my-4">
            <div className="row">
                {options.map(({ icon, title, description, to } = options) => <div key={to} className="col-md-6">
                    <Option icon={icon} title={title} description={description} to={to} />
                </div>)}
            </div>
        </div>
    </>;
}
