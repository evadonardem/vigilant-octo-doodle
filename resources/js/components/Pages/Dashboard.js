import React, { useContext } from 'react';
import { Auth } from '../App';
import Option from '../Generic/Option';

const Dashboard = () => {
    const { hasRole } = useContext(Auth);
    let allowedAccess = hasRole("Super Admin");

    return (
        <div className="container-fluid my-4">

            <div className="row">
                <div className="col-md-6">
                    <Option
                        icon="calendar"
                        title="Attendance Logs"
                        description="Time logs from biometric device."
                        to="/attendance-logs" />
                </div>
                <div className="col-md-6">
                    <Option
                        icon="clock-o"
                        title="Daily Time Record"
                        description="Consolidated daily time record."
                        to="/daily-time-record" />
                </div>
                {allowedAccess && <div className="col-md-6">
                    <Option
                        icon="fa-users"
                        title="Biometric Users"
                        to="/users" />
                </div>}
                {allowedAccess && <div className="col-md-6">
                    <Option
                        icon="fa-cogs"
                        title="General Settings"
                        to="/settings" />
                </div>}
            </div>
        </div >
    );
}

export default Dashboard;
