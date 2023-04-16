import { Spinner } from "react-bootstrap";

const LoadingInline = ({ label } = props) => {
    return (
        <>
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true" /> {label ? label : "Loading ..."}
        </>
    );
};

export default LoadingInline;
