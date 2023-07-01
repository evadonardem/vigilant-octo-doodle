import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import React, { Component } from 'react';

export default class AddEditDeliveryModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedRole: ''
        }
    }

    render() {
        const {
            isShow,
            isEdit,
            userBiometricId,
            userName,
            deliveryId,
            deliveryDate,
            noOfDeliveries,
            remarks,
            handleClose,
            handleSubmit,
            isError,
            errorHeaderTitle,
            errorBodyText
        } = this.props;

        return (
            <Modal
                id="addEditDeliveryModal"
                show={isShow}
                onHide={handleClose}
                centered
                backdrop='static'
                keyboard={false}>
                <Form onSubmit={handleSubmit}>
                    {
                        !isError &&
                        <Modal.Header closeButton>
                            <Modal.Title>{!isEdit ? 'Add New Delivery' : `Edit Delivery [ID: ${deliveryId}]`}</Modal.Title>
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
                                    <Form.Control type="text" name="name" maxLength="25" defaultValue={userName} readOnly></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Delivery Date:</Form.Label>
                                    <Form.Control type="date" name="delivery_date" defaultValue={deliveryDate} readOnly={isEdit}></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>No. of Deliveries:</Form.Label>
                                    <Form.Control type="number" name="no_of_deliveries" defaultValue={noOfDeliveries}></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Remarks:</Form.Label>
                                    <Form.Control as="textarea" rows="3" name="remarks" defaultValue={remarks}/>
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
