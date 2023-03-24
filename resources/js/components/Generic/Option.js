import { Button, Jumbotron } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Option({ icon, title, description, to } = props) {
    return <>
        <Jumbotron className="bg-primary text-white">
            <h1 className="text-center">
                <i className={`fa fa-${icon}`}></i><br />
                {title}
            </h1>
            {description &&
                <p className="lead text-center">
                    {description}
                </p>}
            <hr className="my-4" />
            <p className="lead text-center">
                <Link to={to}>
                    <Button variant="primary" size="lg">Continue &raquo;</Button>
                </Link>
            </p>
        </Jumbotron>
    </>;
}
