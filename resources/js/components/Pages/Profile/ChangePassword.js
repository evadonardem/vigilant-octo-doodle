import { Button, Card, Col, Form, Row } from "react-bootstrap";
import React, { useRef } from 'react';
import Directory from "../../Generic/Directory";
import axios from "axios";
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/change-password`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Change Password',
    },
];

const ChangePassword = () => {
    const token = cookie.load('token');
    const oldPassword = useRef('');
    const newPassword = useRef('');
    const confirmNewPassword = useRef('');

    const handleSubmitChangePassword = (e) => {
        e.preventDefault();
        const form = $(e.currentTarget);

        axios.post(`${END_POINT}?token=${token}`, {
            old_password: oldPassword.current,
            new_password: newPassword.current,
            confirm_new_password: confirmNewPassword.current
        })
            .then(() => {
                $('.form-control', form).removeClass('is-invalid');
                location.href = `${appBaseUrl}`;
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response && error.response.status === 422) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .closest('div')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
                } else {
                    location.href = `${appBaseUrl}`;
                }
            });
    };

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Form onSubmit={handleSubmitChangePassword}>
                <Card className="my-4">
                    <Card.Header as="h5">
                        <i className="fa fa-key"></i> Change Password
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md="3">
                                <Form.Group className="mb-4">
                                    <Form.Label>Old Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="old_password"
                                        maxLength={6}
                                        defaultValue={oldPassword.current}
                                        onChange={(e) => oldPassword.current = e.currentTarget.value}
                                        required />
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>New Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="new_password"
                                        maxLength={6}
                                        defaultValue={newPassword.current}
                                        onChange={(e) => newPassword.current = e.currentTarget.value}
                                        required />
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>Confirm New Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirm_new_password"
                                        maxLength={6}
                                        defaultValue={confirmNewPassword.current}
                                        onChange={(e) => confirmNewPassword.current = e.currentTarget.value}
                                        required />
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <hr />
                                <Button type="submit">Update</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Form>
        </>
    );
}

export default ChangePassword;
