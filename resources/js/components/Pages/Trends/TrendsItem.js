import { Breadcrumb } from 'react-bootstrap';
import ChartsTrendsByItem from './ChartsTrendsByItem';
import React from 'react';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-signal',
        label: 'Trends',
        link: '#/trends'
    },
    {
        icon: 'fa-bar-chart',
        label: 'Item',
    },
];

const TrendsItem = () => {
    return (
        <div className="container-fluid my-4">
            <Breadcrumb>
                {
                    BREADCRUMB_ITEMS.map(({icon, label, link}, key) =>
                        <Breadcrumb.Item key={key} href={link ?? ''} active={!link}>
                            <span>
                                <i className={`fa ${icon}`}></i>&nbsp;
                                {label}
                            </span>
                        </Breadcrumb.Item>
                    )
                }
            </Breadcrumb>
            <ChartsTrendsByItem/>
        </div>
    );
}

export default TrendsItem;
