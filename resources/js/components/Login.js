import React, { useState } from 'react';
import { Alert, Button, Col, FloatingLabel, Form, Row } from 'react-bootstrap';

export default function Login({ onSubmit, errorMessage } = props) {
    const [biometricId, setBiometricId] = useState(null);
    const [password, setPassword] = useState(null);

    const handleBiometricIdChange = (e) => {
        setBiometricId(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ biometricId, password });
    };

    return <>
        <Row>
            <Col md={4} className="offset-md-4 text-center">
                <Form onSubmit={handleSubmit}>
                    <h1 className="h3 mb-3 font-weight-normal">
                        <i className="fa fa-5x fa-user"></i><br />
                        {appName}
                    </h1>
                    <p>Please sign in</p>
                    <FloatingLabel label="Biometric ID" className="mb-3">
                        <Form.Control autoFocus placeholder="Biometric ID" type="text" onChange={handleBiometricIdChange}/>
                    </FloatingLabel>
                    <FloatingLabel label="Password" className="mb-3">
                        <Form.Control placeholder="Password" type="password" onChange={handlePasswordChange}/>
                    </FloatingLabel>
                    {errorMessage && <Alert variant="warning">{errorMessage}</Alert>}
                    <Button type="submit" variant="primary" size="lg">Sign in</Button>
                </Form>
            </Col>
        </Row>
    </>;
}
