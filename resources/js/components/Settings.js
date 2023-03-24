import React, { Component } from 'react';
import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Option from './Generic/Option';

export default function Settings() {
    const options = [
        {
            icon: "users",
            title: "User Roles",
            description: null,
            to: "settings-user-roles",
        },
        {
            icon: "calendar",
            title: "Overtime Rates",
            description: null,
            to: "settings-overtime-rates",
        },
        {
            icon: "list",
            title: "Items Registry",
            description: null,
            to: "settings-items",
        },
        {
            icon: "shopping-basket",
            title: "Stores Registry",
            description: null,
            to: "settings-stores",
        },
        {
            icon: "users",
            title: "Roles and Permissions",
            description: "User roles and permissions setting.",
            to: "settings-roles-and-permissions",
        }
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
