import _chart from 'chart.js/auto';
import { Bar, Line } from 'react-chartjs-2';
import { Button, Card, Form } from 'react-bootstrap';
import { NumericFormat } from 'react-number-format';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';
import React, { useState } from 'react';
import cookie from 'react-cookies';

const ChartsTrendsByStore = () => {
    const token = cookie.load('token');
    const [chartType, setChartType] = useState('line');
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [by, setBy] = useState('store');
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [dataSales, setDataSales] = useState(null);
    const [dataDeliveries, setDataDeliveries] = useState(null);
    const [dataReturns, setDataReturns] = useState(null);

    const handleClickChartTypeOption = (e) => {
        setChartType(e.target.value);
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
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
        setDataReturns(null);
    }

    const handleClickSalesByOption = (e) => {
        setBy(e.target.value);
        setSelectedStore(null);
        setSelectedCategory(null);
        setSelectedLocation(null);
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
    }

    const handleChangeStore = (e) => {
        setSelectedStore(e);
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
    }

    const handleChangeCategory = (e) => {
        setSelectedCategory(e);
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
    }

    const handleChangeLocation = (e) => {
        setSelectedLocation(e);
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
    }

    const handleGenerateChart = (e) => {
        e.preventDefault();
        const form = $(e.target);

        if (by === 'store') {
            let stores = selectedStore
                ? selectedStore.map((store) => store.value)
                : [];
            axios.get(`${apiBaseUrl}/charts/sales-by-store-data?from=${from}&to=${to}&stores=${stores.join(',')}&token=${token}`)
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
            axios.get(`${apiBaseUrl}/charts/purchase-orders/deliveries?from=${from}&to=${to}&stores=${stores.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataDeliveries } = response.data;
                    setDataDeliveries(dataDeliveries);
                })
                .catch(() => {

                });
            axios.get(`${apiBaseUrl}/charts/purchase-orders/returns?from=${from}&to=${to}&stores=${stores.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataReturns } = response.data;
                    setDataReturns(dataReturns);
                })
                .catch(() => {

                });
        } else if (by === 'category') {
            let categories = selectedCategory
                ? selectedCategory.map((category) => category.value)
                : [];
            axios.get(`${apiBaseUrl}/charts/sales-by-category-data?from=${from}&to=${to}&categories=${categories.join(',')}&token=${token}`)
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
            axios.get(`${apiBaseUrl}/charts/purchase-orders/deliveries?from=${from}&to=${to}&categories=${categories.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataDeliveries } = response.data;
                    setDataDeliveries(dataDeliveries);
                })
                .catch(() => {

                });
            axios.get(`${apiBaseUrl}/charts/purchase-orders/returns?from=${from}&to=${to}&categories=${categories.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataReturns } = response.data;
                    setDataReturns(dataReturns);
                })
                .catch(() => {

                });
        } else {
            if (by === 'location') {
                let locations = selectedLocation
                    ? selectedLocation.map((location) => location.value)
                    : [];
                axios.get(`${apiBaseUrl}/charts/sales-by-location-data?from=${from}&to=${to}&locations=${locations.join(',')}&token=${token}`)
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
                axios.get(`${apiBaseUrl}/charts/purchase-orders/deliveries?from=${from}&to=${to}&locations=${locations.join(',')}&token=${token}`)
                    .then((response) => {
                        const { data: dataDeliveries } = response.data;
                        setDataDeliveries(dataDeliveries);
                    })
                    .catch(() => {

                    });
                axios.get(`${apiBaseUrl}/charts/purchase-orders/returns?from=${from}&to=${to}&locations=${locations.join(',')}&token=${token}`)
                    .then((response) => {
                        const { data: dataReturns } = response.data;
                        setDataReturns(dataReturns);
                    })
                    .catch(() => {

                    });
            }
        }
    }

    const handleBack = () => {
        setDataSales(null);
        setDataDeliveries(null);
        setDataReturns(null);
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
            <Card key={`store-trends`} className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-line-chart"></i> Store Trends
                </Card.Header>
                <Card.Body>
                    {(dataSales || dataDeliveries || dataReturns) &&
                        <>
                            <div className="row">
                                <div className="col-md-12">
                                    <Button
                                        type="button"
                                        className="pull-right mb-4"
                                        variant="secondary"
                                        onClick={handleBack}>Back</Button>
                                </div>
                            </div>
                            <p>From: {from} To: {to} | {selectedEntities.length > 0 ? selectedEntities.join(', ') : `All ${by}`}</p>
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
                                                        {dataSales.labels.map((label, i) => <th key={`sales-th-${i}`}>{label}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataSales.datasets.map(({ label, data }, i) => <tr key={`sales-tr-${i}`}>
                                                        <th>{label}</th>
                                                        {data.map((value, j) => <td key={`sales-td-${j}`}>
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
                                                        {dataDeliveries.labels.map((label, i) => <th key={`deliveries-th-${i}`}>{label}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataDeliveries.datasets.map(({ label, data }, i) => <tr key={`deliveries-tr-${i}`}>
                                                        <th>{label}</th>
                                                        {data.map((value, j) => <td key={`deliveries-td-${j}`}>
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
                            {dataReturns &&
                                <>
                                    <Card>
                                        <Card.Header>
                                            <i className="fa fa-undo"></i> Returns
                                        </Card.Header>
                                        <Card.Body>
                                            {chartType === 'line' &&
                                                <Line data={dataReturns} />}
                                            {chartType === 'bar' &&
                                                <Bar data={dataReturns} />}
                                        </Card.Body>
                                        <Card.Footer>
                                            <table className="table table-striped my-4" style={{ width: 100 + '%' }}>
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        {dataReturns.labels.map((label, i) => <th key={`returns-th-${i}`}>{label}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataReturns.datasets.map(({ label, data }, i) => <tr key={`returns-tr-${i}`}>
                                                        <th>{label}</th>
                                                        {data.map((value, j) => <td key={`returns-td-${j}`}>
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
                        </>}
                    {(!(dataSales || dataDeliveries || dataReturns)) &&
                        <>
                            <Form onSubmit={handleGenerateChart}>
                                <Card>
                                    <Card.Header>
                                        Generate sales, deliveries, and returns trend by store, category, or location.
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group>
                                            <Form.Label>Chart type:</Form.Label>
                                            <Form.Check
                                                key="line"
                                                type="radio"
                                                label="Line"
                                                value="line"
                                                checked={chartType === 'line'}
                                                onChange={handleClickChartTypeOption} />
                                            <Form.Check
                                                key="bar"
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
                                        <Form.Group>
                                            <Form.Label>Sales by:</Form.Label>
                                            <Form.Check
                                                key="store"
                                                type="radio"
                                                label="Store"
                                                value="store"
                                                checked={by === 'store'}
                                                onChange={handleClickSalesByOption} />
                                            <Form.Check
                                                key="category"
                                                type="radio"
                                                label="Category"
                                                value="category"
                                                checked={by === 'category'}
                                                onChange={handleClickSalesByOption} />
                                            <Form.Check
                                                key="location"
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

export default ChartsTrendsByStore;
