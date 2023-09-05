import { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ErrorToast = ({ message, onClose } = props) => {
    const [show, setShow] = useState(true);

    return <>
        <ToastContainer
            className="p-3"
            position="top-center">
            <Toast bg="danger"
                onClose={() => {
                    setShow(false);
                    onClose();
                }}
                show={show}
                delay={3000}
                autohide>
                <Toast.Body className="text-white">{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    </>;
};

export default ErrorToast;
