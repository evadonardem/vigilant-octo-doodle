import ChartsTrendsByItem from './ChartsTrendsByItem';
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
        label: 'Item',
    },
];

const TrendsItem = () => {
    return (
        <>
            <Directory items={BREADCRUMB_ITEMS}/>
            <ChartsTrendsByItem/>
        </>
    );
}

export default TrendsItem;
