import { Container, Nav, NavDropdown, Navbar, Offcanvas } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import { logout } from "../../state/authenticate";
import { useDispatch } from "react-redux";

const Layout = ({ brand, links, signedInUser } = props) => {
    const dispatch = useDispatch();
    let menuIndex = 0;
    let submenuIndex = 0;

    return (
        <>
            <Navbar bg="primary" variant="dark" expand={false} className="mb-3">
                <Container fluid>
                    <Navbar.Brand href="#">{brand && brand}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Offcanvas
                        id="basic-navbar-nav"
                        placement="end">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>
                                {brand && brand}
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="me-auto">
                                {links && links.map((link) => {
                                    if (link.links) {
                                        const dropdownItems = link.links && link.links.map((dropdownLink) =>
                                            <Link
                                                key={'menu-' + menuIndex + '-dropdown-item-' + submenuIndex++}
                                                className={'dropdown-item'}
                                                to={dropdownLink.to}
                                                title={dropdownLink.label}>
                                                <i className={dropdownLink.icon}></i> {dropdownLink.label}
                                            </Link>);
                                        return (
                                            <NavDropdown
                                                key={'menu-' + menuIndex++ + '-dropdown'}
                                                title={<span><i className={link.icon}></i> {link.label}</span>}
                                                id="collapsible-nav-dropdown">
                                                {dropdownItems}
                                            </NavDropdown>
                                        );
                                    } else {
                                        return (<Link key={'menu-' + menuIndex++} className={'nav-link'} to={link.to} title={link.label}>
                                            <i className={link.icon}></i> {link.label}
                                        </Link>);
                                    }
                                }
                                )}
                            </Nav>
                            <Nav>
                                <NavDropdown title={<span><i className="fa fa-user"></i> {signedInUser}</span>}>
                                    <NavDropdown.Item
                                        href="#">
                                        <i className="fa fa-key"> Change password</i>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        href="#" onClick={(e) => { e.preventDefault(); dispatch(logout()); }}>
                                        <i className="fa fa-sign-out"> Sign-out</i>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
            <Container fluid>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;
