import { Button, ButtonGroup, Modal } from "react-bootstrap";

const ConfirmationModal = ({
    body,
    handleClose,
    handleSubmit,
    title,
} = props) => {
    return <>
        <Modal
            backdrop="static"
            keyboard={false}
            onHide={handleClose}
            centered
            show>
            <Modal.Header closeButton>{title}</Modal.Header>
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>
                <ButtonGroup>
                    <Button variant="primary" onClick={handleSubmit}>
                        Yes
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
    </>;
};

export default ConfirmationModal;
