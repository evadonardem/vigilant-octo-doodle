import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import ChartsTrendsByStore from './ChartsTrendsByStore';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-signal',
        label: 'Trends',
        link: '#/trends'
    },
    {
        icon: 'fa-line-chart',
        label: 'Store',
    },
];

const TrendsStore = () => {
    return (
        <>
            <Breadcrumb>
                {
                    BREADCRUMB_ITEMS.map(({ icon, label, link } = item) =>
                        <Breadcrumb.Item href={link ?? ''} active={!link}>
                            <span>
                                <i className={`fa ${icon}`}></i>&nbsp;
                                {label}
                            </span>
                        </Breadcrumb.Item>
                    )
                }
            </Breadcrumb>
            <ChartsTrendsByStore/>
        </>
    );
}

export default TrendsStore;
