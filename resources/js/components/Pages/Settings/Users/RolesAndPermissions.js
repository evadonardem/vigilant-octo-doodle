import { Badge, Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import React from 'react';
import cookie from 'react-cookies';
import Directory from "../../../Generic/Directory";

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Settings',
        link: '#/settings'
    },
    {
        icon: '',
        label: 'Users',
        link: '#/settings/users'
    },
    {
        icon: '',
        label: '{user}',
    },
    {
        icon: '',
        label: 'Roles And Permissions',
    },
];

const RolesAndPermissions = () => {
    const params = useParams();
    const { userId } = params;
    const [biometricId, setBiometricId] = useState(null);
    const [name, setName] = useState(null);
    const [userRoles, setUserRoles] = useState(null);

    const loadRolesAndPermissions = () => {
        const token = cookie.load('token');
        axios.get(`${apiBaseUrl}/biometric/users/${userId}?include[roles_and_permissions]=1&token=${token}`)
            .then((response) => {
                const { data: user } = response.data;
                setBiometricId(user.biometric_id);
                setName(user.name);
                setUserRoles(user.roles);
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    };

    const handlePermissionChange = (e) => {
        const token = cookie.load('token');
        const { target: { value, checked } } = e;
        axios.post(`${apiBaseUrl}/settings/users/${userId}/grant-permission?token=${token}`, {name: value, has_permission: checked})
            .then(() => {})
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    };

    useEffect(() => {
        loadRolesAndPermissions();
    }, []);

    const items = userRoles ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{user}', `(${biometricId}) ${name}`);
        return item;
    }) : [];

    return (
        <>
            <Directory items={items}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <Badge><i className="fa fa-id-card"></i> {biometricId}</Badge> {name} (Roles And Permissions)
                </Card.Header>
                <Card.Body>
                    <Row>
                        {userRoles && userRoles.map((role) => <Col key={`role-${role.id}`} md={6}>
                            <Card className="mb-4">
                                <Card.Header>{role.name}</Card.Header>
                                <Card.Body>
                                    {role && role.permissions.map((permission) => <Form.Check
                                        key={`permission-${permission.id}`}
                                        type="switch"
                                        label={permission.name}
                                        value={permission.name}
                                        defaultChecked={permission.has_permission}
                                        onClick={handlePermissionChange} />)}
                                </Card.Body>
                            </Card>
                        </Col>)}
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default RolesAndPermissions;
