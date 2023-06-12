import ChartsTrendsByStore from './ChartsTrendsByStore';
import React from 'react';
import Directory from '../../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Trends',
        link: '#/trends'
    },
    {
        icon: '',
        label: 'Store',
    },
];

const TrendsStore = () => {
    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <ChartsTrendsByStore/>
        </>
    );
}

export default TrendsStore;
