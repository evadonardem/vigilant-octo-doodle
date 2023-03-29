import { useEffect, useState } from "react";
import cookie from 'react-cookies';
import { Badge, Breadcrumb, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

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

    return <>
        <Breadcrumb>
            <Breadcrumb.Item linkProps={{ to: "/settings" }} linkAs={Link}>
                <i className="fa fa-cogs"></i> Settings
            </Breadcrumb.Item>
            <Breadcrumb.Item linkProps={{ to: "/settings-users" }} linkAs={Link}>
                <i className="fa fa-users"></i> Users
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
                ({biometricId}) {name}
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
                <i className="fa fa-id-card"></i> Roles and Permissions
            </Breadcrumb.Item>
        </Breadcrumb>
        <Card>
            <Card.Header>
                <Badge>{biometricId}</Badge>
                <h4>{name}</h4>
            </Card.Header>
            <Card.Body>
                <Row>
                    {userRoles && userRoles.map((role) => <Col key={`role-${role.id}`} md={6}>
                        <Card>
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
    </>;
}


export default RolesAndPermissions;
