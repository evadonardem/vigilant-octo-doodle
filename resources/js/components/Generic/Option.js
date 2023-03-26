import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Option({ icon, title, description, to } = props) {
    return <>
        <Card bg="primary" className="mb-3">
            <Card.Body>
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
                        <Button variant="secondary" size="lg">Continue &raquo;</Button>
                    </Link>
                </p>
            </Card.Body>
        </Card>
    </>;
}
