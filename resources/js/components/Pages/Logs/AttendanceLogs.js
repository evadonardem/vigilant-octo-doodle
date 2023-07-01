import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import AttendanceLogsSearchResult from './AttendanceLogsSearchResult';
import CommonSearchFilters from '../../CommonSearchFilters';
import React, { useState } from 'react';
import Directory from '../../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Logs',
        link: '#/logs'
    },
    {
        icon: '',
        label: 'Attendance Logs',
    },
];

export default function AttendanceLogs() {
    const { user } = useSelector((state) => state.authenticate);
    const { roles, permissions } = user;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canAccessOtherUserAttendanceLogs = isSuperAdmin || hasPermission("View manual biometric logs") || hasPermission("View pay period");

    const [biometricId, setBiometricId] = useState(canAccessOtherUserAttendanceLogs ? '' : user.biometric_id);
    const [biometricName, setBiometricName] = useState(canAccessOtherUserAttendanceLogs ? '' : user.name);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchErrors, setSearchErrors] = useState({});

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (canAccessOtherUserAttendanceLogs) {
            const biometricId = $(e.currentTarget).find('[name="biometric_id"]').val();
            const biometricName = $(e.currentTarget).find('[name="biometric_name"]').val();
            setBiometricId(biometricId);
            setBiometricName(biometricName);
        }
        const startDate = $(e.currentTarget).find('[name="start_date"]').val();
        const endDate = $(e.currentTarget).find('[name="end_date"]').val();
        setStartDate(startDate);
        setEndDate(endDate);
    };

    const handleSearchResultErrors = (searchErrors) => {
        setStartDate('');
        setEndDate('');
        setSearchErrors(searchErrors);
    };

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-calendar"></i> Attendance Logs
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md="3">
                            <CommonSearchFilters
                                handleSubmit={handleSearchSubmit}
                                withUserSelection={canAccessOtherUserAttendanceLogs}
                                searchErrors={searchErrors} />
                        </Col>
                        <Col md="9">
                            <AttendanceLogsSearchResult
                                biometricId={biometricId}
                                biometricName={biometricName}
                                startDate={startDate}
                                endDate={endDate}
                                handleSearchResultErrors={handleSearchResultErrors} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}
