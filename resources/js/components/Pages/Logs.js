import { useSelector } from "react-redux";
import Option from "../Generic/Option";
import { Col, Row } from "react-bootstrap";

const Logs = () => {
    const { roles } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    let allowedAccess = hasRole("Super Admin");

    let options = [
        {
            icon: 'calendar',
            title: 'Attendance Logs',
            description: 'Time logs from biometric device.',
            to: '/attendance-logs',
            isVisible: true,
        },
        {
            icon: 'clock-o',
            title: 'Daily Time Record',
            description: 'Consolidated daily time record.',
            to: '/daily-time-record',
            isVisible: true,
        },
        {
            icon: 'truck',
            title: 'Delivery Logs',
            description: 'Manually entered delivery logs.',
            to: '/deliveries',
            isVisible: allowedAccess,
        },
        {
            icon: 'calendar-plus-o',
            title: 'Manual Logs',
            description: 'Register override time log or delivery log.',
            to: '/manual-logs',
            isVisible: allowedAccess,
        },
    ];

    return (
        <Row>
            {options
                .filter(({ isVisible } = option) => isVisible)
                .map(({ icon, title, description, to } = option) =>
                    <Col key={to} md={6}>
                        <Option key={to} icon={icon} title={title} description={description} to={to}/>
                    </Col>)}
        </Row>
    );
}

export default Logs;
