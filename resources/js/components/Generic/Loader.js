import { Spinner } from "react-bootstrap";

const Loader = () => {
    return (
        <>
            <div className="vh-100 d-flex justify-content-center align-items-center my-5">
                <Spinner role="status"/>&nbsp;Gift of Grace Food Manufacturing Corporation
            </div>
        </>
    );
};

export default Loader;
