import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Alert, Button, ButtonGroup, Modal, Form } from 'react-bootstrap';

export default class EditPromodiserModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            editPromodiser,
            handleClose,
            handleShow,
            handleSubmit,
        } = this.props;

        return (
            <Modal
                show={editPromodiser.showModal}
                onHide={handleClose}
                onShow={handleShow}
                centered
                backdrop='static'
                keyboard={false}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Promodiser</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { !editPromodiser.loading &&
                            <Form.Group>
                                <Form.Label>Name:</Form.Label>
                                <Form.Control type="text" name="name" defaultValue={editPromodiser.name}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonGroup>
                            <Form.Control type="hidden" name="id" defaultValue={editPromodiser.id} disabled></Form.Control>
                            <Button variant="primary" type="submit">Update</Button>
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}
