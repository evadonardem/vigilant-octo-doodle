import { Breadcrumb, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CommonSearchFilters from '../../CommonSearchFilters';
import DailyTimeRecordSearchResult from './DailyTimeRecordSearchResult';
import React, { useState } from 'react';

export default function DailyTimeRecord() {
    const { user } = useSelector((state) => state.authenticate);
    const { roles } = user;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);

    const isAdmin = hasRole('Super Admin');

    const [biometricId, setBiometricId] = useState(isAdmin ? '' : user.biometric_id);
    const [biometricName, setBiometricName] = useState(isAdmin ? '' : user.name);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchErrors, setSearchErrors] = useState({});

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (isAdmin) {
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
            <Breadcrumb>
                <Breadcrumb.Item linkProps={{ to: "/logs" }} linkAs={Link}>
                    <i className="fa fa-folder-open"></i> Logs
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Daily Time Record</Breadcrumb.Item>
            </Breadcrumb>

            <hr className="my-4" />

            <Row>
                <Col md="3">
                    <CommonSearchFilters
                        handleSubmit={handleSearchSubmit}
                        withUserSelection={isAdmin}
                        searchErrors={searchErrors} />
                </Col>
                <Col md="9">
                    <DailyTimeRecordSearchResult
                        biometricId={biometricId}
                        biometricName={biometricName}
                        startDate={startDate}
                        endDate={endDate}
                        handleSearchResultErrors={handleSearchResultErrors} />
                </Col>
            </Row>
        </>
    );
}
