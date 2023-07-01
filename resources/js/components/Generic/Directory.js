import { Breadcrumb, Row } from "react-bootstrap";

export default function Directory({ items }) {
    return <>
        <Row className="bg-light border-bottom border-primary pt-3">
            <Breadcrumb>
                {
                    items.map(({ icon, label, link }, key) =>
                        <Breadcrumb.Item key={key} href={link ?? ''} active={!link}>
                            <span>
                                <i className={`fa ${icon}`}></i>
                                {label}
                            </span>
                        </Breadcrumb.Item>
                    )
                }
            </Breadcrumb>
        </Row>
    </>;
}
