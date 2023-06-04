import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import React, { Component } from 'react';

export default class AddEditUserModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            isShow,
            isEdit,
            userBiometricId,
            userName,
            handleClose,
            handleSubmit,
            isError,
            errorHeaderTitle,
            errorBodyText
        } = this.props;

        return (
            <Modal
                id="addEditUserModal"
                show={isShow}
                onHide={handleClose}
                centered
                backdrop='static'
                keyboard={false}>
                <Form onSubmit={handleSubmit}>
                    {
                        !isError &&
                        <Modal.Header closeButton>
                            <Modal.Title>{!isEdit ? 'Add New User' : 'Edit User'}</Modal.Title>
                        </Modal.Header>
                    }
                    <Modal.Body>
                        {
                            !isError &&
                            <div>
                                <Form.Group>
                                    <Form.Label>Biometric ID: <small>Max 8 characters</small></Form.Label>
                                    <Form.Control type="text" name="biometric_id" maxLength="8" defaultValue={userBiometricId} readOnly={isEdit}></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Name: <small>Max 25 characters</small></Form.Label>
                                    <Form.Control type="text" name="name" maxLength="25" defaultValue={userName}></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                            </div>
                        }
                        {
                            isError &&
                            <Alert variant="warning">
                                <Alert.Heading><i className="fa fa-warning"></i> {errorHeaderTitle}</Alert.Heading>
                                <p>{errorBodyText}</p>
                                <Button variant="warning" onClick={handleClose}>Close</Button>
                            </Alert>
                        }
                    </Modal.Body>
                    {
                        !isError &&
                        <Modal.Footer>
                            <ButtonGroup>
                                <Button variant="primary" type="submit">
                                    { !isEdit ? 'Save' : 'Update' }
                                </Button>
                                <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </ButtonGroup>
                        </Modal.Footer>
                    }
                </Form>
            </Modal>
        );
    }
}
