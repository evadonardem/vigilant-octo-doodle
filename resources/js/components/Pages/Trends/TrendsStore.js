import { Breadcrumb } from 'react-bootstrap';
import ChartsTrendsByStore from './ChartsTrendsByStore';
import React from 'react';

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
                    BREADCRUMB_ITEMS.map(({ icon, label, link }, key) =>
                        <Breadcrumb.Item key={key} href={link ?? ''} active={!link}>
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
