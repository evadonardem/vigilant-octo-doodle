import React, { useState } from 'react';
import { Alert, Button, Col, FloatingLabel, Form, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../state/authenticate';
import LoadingInline from './Generic/LoadingInline';

export default function Login() {
    const { errorMessage, isLoading } = useSelector((state) => state.authenticate);
    const dispatch = useDispatch();

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
        dispatch(login({ biometricId, password }));
    };

    return <>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
            <Col md={3}></Col>
            <Col md={6}>
                <Row>
                    <Col md={6}>
                        <h1 className="h3 mb-3 font-weight-normal text-center">
                            <i className="fa fa-5x fa-user"></i><br />
                            {appName}
                        </h1>
                        <p className="text-center">Please sign in</p>
                    </Col>
                    <Col md={6}>
                        <Form onSubmit={handleSubmit}>
                            <FloatingLabel label="Biometric ID" className="mb-3">
                                <Form.Control autoFocus placeholder="Biometric ID" type="text" onChange={handleBiometricIdChange} />
                            </FloatingLabel>
                            <FloatingLabel label="Password" className="mb-3">
                                <Form.Control placeholder="Password" type="password" onChange={handlePasswordChange} />
                            </FloatingLabel>
                            {errorMessage && <Alert variant="warning">{errorMessage}</Alert>}
                            <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                                {isLoading
                                    ? <LoadingInline/>
                                    : "Sign in"}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Col>
            <Col md={3}></Col>
        </Row>
    </>;
}
