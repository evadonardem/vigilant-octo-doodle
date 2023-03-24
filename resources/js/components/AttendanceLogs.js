import React, { useContext, useState } from 'react';
import CommonSearchFilters from './CommonSearchFilters';
import AttendanceLogsSearchResult from './AttendanceLogsSearchResult';
import { Auth } from './App';

export default function AttendanceLogs() {
    const { user, hasRole } = useContext(Auth);
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
        <div className="container-fluid my-4">
            <h1><i className="fa fa-calendar"></i> Attendance Logs</h1>

            <hr className="my-4" />

            <div className="row">
                <div className="col-md-3">
                    <CommonSearchFilters
                        handleSubmit={handleSearchSubmit}
                        withUserSelection={isAdmin}
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
