import React, { Component, useContext, useEffect, useState } from 'react';
import CommonSearchFilters from './CommonSearchFilters';
import AttendanceLogsSearchResult from './AttendanceLogsSearchResult';
import { Auth } from './App';

export default function AttendanceLogs() {
    const { hasRole } = useContext(Auth);
    const [biometricId, setBiometricId] = useState('');
    const [biometricName, setBiometricName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchErrors, setSearchErrors] = useState({});
    const [withUserSelection, setWithUserSelection] = useState(false);

    function handleSearchSubmit(e) {
        e.preventDefault();
        const biometricId = $(e.currentTarget).find('[name="biometric_id"]').val();
        const biometricName = $(e.currentTarget).find('[name="biometric_name"]').val();
        const startDate = $(e.currentTarget).find('[name="start_date"]').val();
        const endDate = $(e.currentTarget).find('[name="end_date"]').val();

        setBiometricId(biometricId);
        setBiometricName(biometricName);
        setStartDate(startDate);
        setEndDate(endDate);
    }

    function handleSearchResultErrors(searchErrors) {
        setStartDate('');
        setEndDate('');
        setSearchErrors(searchErrors);
    }

    useEffect(() => setWithUserSelection(hasRole("Super Admin")),[withUserSelection]);

    return (
        <div className="container-fluid my-4">
            <h1><i className="fa fa-calendar"></i> Attendance Logs</h1>

            <hr className="my-4" />

            <div className="row">
                <div className="col-md-3">
                    <CommonSearchFilters
                        handleSubmit={handleSearchSubmit}
                        withUserSelection={true}
                        searchErrors={searchErrors} />
                </div>
                <div className="col-md-9">
                    <AttendanceLogsSearchResult
                        biometricId={biometricId}
                        biometricName={biometricName}
                        startDate={startDate}
                        endDate={endDate}
                        handleSearchResultErrors={handleSearchResultErrors} />
                </div>
            </div>
        </div>
    );
}
