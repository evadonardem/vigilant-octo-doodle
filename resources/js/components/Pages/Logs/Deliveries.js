import { Card } from 'react-bootstrap';
import CommonSearchFilters from '../../CommonSearchFilters';
import DeliveriesSearchResult from './DeliveriesSearchResult';
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
        label: 'Delivery Logs',
    },
];

const Deliveries = () => {
    const [biometricId, setBiometricId] = useState('');
    const [biometricName, setBiometricName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchErrors, setSearchErrors] = useState({});

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const biometricId = $(e.currentTarget).find('[name="biometric_id"]').val();
        const biometricName = $(e.currentTarget).find('[name="biometric_name"]').val();
        const startDate = $(e.currentTarget).find('[name="start_date"]').val();
        const endDate = $(e.currentTarget).find('[name="end_date"]').val();
        setBiometricId(biometricId);
        setBiometricName(biometricName);
        setStartDate(startDate);
        setEndDate(endDate);
    };

    const handleSearchResultErrors = (searchErrors) => {
        setStartDate('');
        setEndDate('');
        setSearchErrors(searchErrors);
    }

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className='fa fa-truck'></i> Delivery Logs
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-3">
                            <CommonSearchFilters
                                handleSubmit={handleSearchSubmit}
                                searchErrors={searchErrors} />
                        </div>
                        <div className="col-md-9">
                            <DeliveriesSearchResult
                                biometricId={biometricId}
                                biometricName={biometricName}
                                startDate={startDate}
                                endDate={endDate}
                                handleSearchResultErrors={handleSearchResultErrors} />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

export default Deliveries;
