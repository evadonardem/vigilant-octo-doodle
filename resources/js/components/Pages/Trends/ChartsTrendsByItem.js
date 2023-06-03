import { Bar, Line } from 'react-chartjs-2';
import { Button, Card, Form } from 'react-bootstrap';
import { NumericFormat } from 'react-number-format';
import CommonDropdownSelectSingleItem from '../../CommonDropdownSelectSingleItem';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';
import React, { useState } from 'react';
import cookie from 'react-cookies';

const ChartsTrendsByItem = () => {
    const token = cookie.load('token');
    const [chartType, setChartType] = useState('line');
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [by, setBy] = useState('store');
    const [selectedItems, setSelectedItems] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [dataSales, setDataSales] = useState(null);
    const [dataDeliveries, setDataDeliveries] = useState(null);

    const handleClickChartTypeOption = (e) => {
        setChartType(e.target.value);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleDateChange = (e) => {
        const name = e.target.getAttribute('name');

        if (name === 'from') {
            setFrom(e.target.value);
        }

        if (name === 'to') {
            setTo(e.target.value);
        }

        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleClickSalesByOption = (e) => {
        setBy(e.target.value);
        setSelectedStore(null);
        setSelectedCategory(null);
        setSelectedLocation(null);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleChangeItems = (e) => {
        setSelectedItems(e);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleChangeStore = (e) => {
        setSelectedStore(e);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleChangeCategory = (e) => {
        setSelectedCategory(e);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleChangeLocation = (e) => {
        setSelectedLocation(e);
        setDataSales(null);
        setDataDeliveries(null);
    }

    const handleGenerateChart = (e) => {
        e.preventDefault();
        const form = $(e.target);

        let items = selectedItems
            ? selectedItems.map((item) => item.value).join(',')
            : '';

        let entityType = null;
        let entityIds = null;
        if (by === 'store') {
            entityType = 'stores';
            entityIds = selectedStore
                ? selectedStore.map((store) => store.value).join(',')
                : '';

        } else if (by === 'category') {
            entityType = 'categories';
            entityIds = selectedCategory
                ? selectedCategory.map((category) => category.value).join(',')
                : '';
        } else {
            if (by === 'location') {
                entityType = 'locations';
                entityIds = selectedLocation
                    ? selectedLocation.map((location) => location.value).join(',')
                    : '';
            }
        }
        axios.get(`${apiBaseUrl}/charts/item-sales?from=${from}&to=${to}&items=${items}&${entityType}=${entityIds}&token=${token}`)
            .then((response) => {
                const { data: dataSales } = response.data;
                setDataSales(dataSales);
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .next()
                            .text(errors[key][0]);
                    }
                }
            });
        axios.get(`${apiBaseUrl}/charts/purchase-orders/deliveries?from=${from}&to=${to}&${entityType}=${entityIds}&token=${token}`)
            .then((response) => {
                const { data: dataDeliveries } = response.data;
                setDataDeliveries(dataDeliveries);
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', form)
                            .addClass('is-invalid')
                            .next()
                            .text(errors[key][0]);
                    }
                }
            });
    }

    const handleBack = () => {
        setDataSales(null);
        setDataDeliveries(null);
    }

    let selectedEntities = null;
    if (by === 'store') {
        selectedEntities = selectedStore
            ? selectedStore.map((store) => store.label)
            : [];
    } else if (by === 'category') {
        selectedEntities = selectedCategory
            ? selectedCategory.map((category) => category.label)
            : [];
    } else {
        if (by === 'location') {
            selectedEntities = selectedLocation
                ? selectedLocation.map((location) => location.label)
                : [];
        }
    }

    return (
        <>
            <Card key={`item-trends`}>
                <Card.Body>
                    <h1 className="display-3"><i className="fa fa-bar-chart"></i> Item Trends</h1>
                    <p className="lead">
                        {!dataSales &&
                            'Generate item sales by store, category, or location.'}
                        {dataSales &&
                            `From: ${from} To: ${to} | ${selectedItems && selectedItems.length > 0
                                ? selectedItems.map((item) => item.label).join(',')
                                : 'All Items'} | ${selectedEntities.length > 0
                                    ? selectedEntities.join(',')
                                    : `All ${by}`}`}
                    </p>
                    {(dataSales || dataDeliveries) &&
                        <div className="row">
                            <div className="col-md-12">
                                <Button
                                    type="button"
                                    className="pull-right mb-4"
                                    variant="secondary"
                                    onClick={handleBack}>Back</Button>
                            </div>
                        </div>}
                    {dataSales &&
                        <>
                            <Card className="mb-4">
                                <Card.Header>
                                    <i className="fa fa-money"></i> Sales
                                </Card.Header>
                                <Card.Body>
                                    {chartType === 'line' &&
                                        <Line data={dataSales} />}
                                    {chartType === 'bar' &&
                                        <Bar data={dataSales} />}
                                </Card.Body>
                                <Card.Footer>
                                    <table className="table table-striped my-4" style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                {dataSales.labels.map((label, i) => <th key={`item-trends-sales-th-${i}`}>{label}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataSales.datasets.map(({ label, data }, i) => <tr key={`item-trends-sales-tr-${i}`}>
                                                <th>{label}</th>
                                                {data.map((value, j) => <td key={`item-trends-sales-td-${j}`}>
                                                    <NumericFormat
                                                        value={value}
                                                        displayType="text"
                                                        prefix="Php"
                                                        decimalScale="2"
                                                        fixedDecimalScale
                                                        thousandSeparator />
                                                </td>)}
                                            </tr>)}
                                        </tbody>
                                    </table>
                                </Card.Footer>
                            </Card>
                        </>}

                    {dataDeliveries &&
                        <>
                            <Card className="mb-4">
                                <Card.Header>
                                    <i className="fa fa-truck"></i> Deliveries
                                </Card.Header>
                                <Card.Body>
                                    {chartType === 'line' &&
                                        <Line data={dataDeliveries} />}
                                    {chartType === 'bar' &&
                                        <Bar data={dataDeliveries} />}
                                </Card.Body>
                                <Card.Footer>
                                    <table className="table table-striped my-4" style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                {dataDeliveries.labels.map((label, i) => <th key={`item-trends-deliveries-th-${i}`}>{label}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataDeliveries.datasets.map(({ label, data }, i) => <tr key={`item-trends-deliveries-tr-${i}`}>
                                                <th>{label}</th>
                                                {data.map((value, j) => <td key={`item-trends-deliveries-td-${j}`}>
                                                    <NumericFormat
                                                        value={value}
                                                        displayType="text"
                                                        thousandSeparator />
                                                </td>)}
                                            </tr>)}
                                        </tbody>
                                    </table>
                                </Card.Footer>
                            </Card>
                        </>}

                    {!(dataSales || dataDeliveries) &&
                        <>
                            <Form onSubmit={handleGenerateChart}>
                                <Card>
                                    <Card.Body>
                                        <Form.Group>
                                            <Form.Label>Chart type:</Form.Label>
                                            <Form.Check
                                                type="radio"
                                                label="Line"
                                                value="line"
                                                checked={chartType === 'line'}
                                                onChange={handleClickChartTypeOption} />
                                            <Form.Check
                                                type="radio"
                                                label="Bar"
                                                value="bar"
                                                checked={chartType === 'bar'}
                                                onChange={handleClickChartTypeOption} />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>From:</Form.Label>
                                            <Form.Control
                                                type="month"
                                                name="from"
                                                value={from}
                                                onChange={handleDateChange} />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>To:</Form.Label>
                                            <Form.Control
                                                type="month"
                                                name="to"
                                                value={to}
                                                onChange={handleDateChange} />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        <CommonDropdownSelectSingleItem
                                            name="items"
                                            handleChange={handleChangeItems}
                                            selectedItem={selectedItems}
                                            isMulti />
                                        <Form.Group>
                                            <Form.Label>Sales by:</Form.Label>
                                            <Form.Check
                                                type="radio"
                                                label="Store"
                                                value="store"
                                                checked={by === 'store'}
                                                onChange={handleClickSalesByOption} />
                                            <Form.Check
                                                type="radio"
                                                label="Category"
                                                value="category"
                                                checked={by === 'category'}
                                                onChange={handleClickSalesByOption} />
                                            <Form.Check
                                                type="radio"
                                                label="Location"
                                                value="location"
                                                checked={by === 'location'}
                                                onChange={handleClickSalesByOption} />
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        {by === 'store' &&
                                            <CommonDropdownSelectSingleStore
                                                name="stores"
                                                handleChange={handleChangeStore}
                                                selectedItem={selectedStore}
                                                isMulti />}
                                        {by === 'category' &&
                                            <CommonDropdownSelectSingleStoreCategory
                                                handleChange={handleChangeCategory}
                                                selectedValue={selectedCategory}
                                                isMulti />}
                                        {by === 'location' &&
                                            <CommonDropdownSelectSingleStoreLocation
                                                handleChange={handleChangeLocation}
                                                selectedValue={selectedLocation}
                                                isMulti />}
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button type="submit">Generate</Button>
                                    </Card.Footer>
                                </Card>
                            </Form>
                        </>}
                </Card.Body>
            </Card>
        </>
    );
}

export default ChartsTrendsByItem;
