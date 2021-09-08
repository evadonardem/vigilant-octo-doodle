import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Button, Card, Form } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import NumberFormat from 'react-number-format';
import CommonDropdownSelectSingleItem from './CommonDropdownSelectSingleItem';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from './CommonDropdownSelectSingleStoreLocation';
import { Jumbotron } from 'react-bootstrap';

export default class ChartsTrendsByItem extends Component {
    constructor(props) {
        super(props);
        this.handleClickChartTypeOption = this.handleClickChartTypeOption.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleClickSalesByOption = this.handleClickSalesByOption.bind(this);
        this.handleChangeItems = this.handleChangeItems.bind(this);
        this.handleChangeStore = this.handleChangeStore.bind(this);
        this.handleChangeCategory = this.handleChangeCategory.bind(this);
        this.handleChangeLocation = this.handleChangeLocation.bind(this);
        this.handleGenerateChart = this.handleGenerateChart.bind(this);
        this.handleBack = this.handleBack.bind(this);

        this.state = {
            token: '',
            chartType: 'line',
            from: null,
            to: null,
            by: 'store',
            selectedItems: null,
            selectedStore: null,
            selectedCategory: null,
            selectedLocation: null,
            dataSales: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        self.setState({
            ...self.state,
            token,
        });
    }

    handleClickChartTypeOption(e) {
        const self = this;
        self.setState({
            ...self.state,
            chartType: e.target.value,
            dataSales: null,
        });
    }

    handleDateChange(e) {
        const self = this;
        const name = e.target.getAttribute('name');

        let newState = {
            ...self.state,
            dataSales: null,            
        };
        newState[name] = e.target.value;

        self.setState(newState);
    }

    handleClickSalesByOption(e) {
        const self = this;
        self.setState({
            ...self.state,
            by: e.target.value,
            selectedStore: null,
            selectedCategory: null,
            selectedLocation: null,
            dataSales: null,            
        });        
    }

    handleChangeItems(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedItems: e,
            dataSales: null,            
        });
    }

    handleChangeStore(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedStore: e,
            dataSales: null,            
        });
    }

    handleChangeCategory(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedCategory: e,
            dataSales: null,            
        });
    }

    handleChangeLocation(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedLocation: e,
            dataSales: null,            
        });
    }

    handleGenerateChart(e) {
        e.preventDefault();
        const form = $(e.target);
        const self = this;
        const {
            token,
            from,
            to,
            by,
            selectedItems,
            selectedStore,
            selectedCategory,
            selectedLocation,
        } = self.state;

        let items = selectedItems
            ? selectedItems.map((item) => item.value)
            : [];

        if (by === 'store') {
            let stores = selectedStore
                ? selectedStore.map((store) => store.value)
                : [];
            axios.get(`${apiBaseUrl}/charts/item-sales?from=${from}&to=${to}&items=${items}&stores=${stores.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataSales } = response.data;
                    self.setState({
                        ...self.state,
                        dataSales,
                    });
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
                                .closest('.form-group')
                                .find('.invalid-feedback')
                                .text(errors[key][0]);
                        }
                    }
                });        
        } else if (by === 'category') {
            let categories = selectedCategory
                ? selectedCategory.map((category) => category.value)
                : [];
            axios.get(`${apiBaseUrl}/charts/item-sales?from=${from}&to=${to}&items=${items}&categories=${categories.join(',')}&token=${token}`)
                .then((response) => {
                    const { data: dataSales } = response.data;
                    self.setState({
                        ...self.state,
                        dataSales,
                    });
                })
                .catch(() => {
                    
                });            
        } else {
            if (by === 'location') {
                let locations = selectedLocation
                    ? selectedLocation.map((location) => location.value)
                    : [];
                axios.get(`${apiBaseUrl}/charts/item-sales?from=${from}&to=${to}&items=${items}&locations=${locations.join(',')}&token=${token}`)
                    .then((response) => {
                        const { data: dataSales } = response.data;
                        self.setState({
                            ...self.state,
                            dataSales,
                        });
                    })
                    .catch(() => {
                        
                    });                
            }
        }
    }

    handleBack() {
        const self = this;
        self.setState({
            ...self.state,
            selectedItems: null,
            selectedStore: null,
            selectedCategory: null,
            selectedLocation: null,
            dataSales: null,            
        });        
    }

    render() {
        const {
            chartType,
            from,
            to,
            by,
            selectedItems,
            selectedStore,
            selectedCategory,
            selectedLocation,
            dataSales,
        } = this.state;

        const options = {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        };

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
            <div className="container-fluid my-4">
                <Card>
                    <Card.Body>
                        <Jumbotron>
                            <h1 className="display-3"><i className="fa fa-signal"></i> Item Sales Trends</h1>
                            <p className="lead">
                                { !dataSales && 
                                    'Generate item sales by store, category, or location.' }
                                { dataSales &&
                                    `From: ${from} To: ${to} | ${ selectedItems && selectedItems.length > 0 
                                        ? selectedItems.map((item) => item.label).join(',')
                                        : 'All Items' } | ${ selectedEntities.length > 0
                                        ? selectedEntities.join(',')
                                        : `All ${by}` }` }
                            </p>
                        </Jumbotron>                    
                        <div className="row">                            
                            <div className="col-md-12">
                                <Button
                                    type="button"
                                    className="pull-right mb-4"
                                    variant="secondary"
                                    onClick={this.handleBack}>Back</Button>
                            </div>
                        </div>
                        { dataSales &&
                            <>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <i className="fa fa-money"></i> Sales
                                    </Card.Header>
                                    <Card.Body>
                                        { chartType === 'line' &&
                                            <Line data={dataSales} options={options}/> }
                                        { chartType === 'bar' &&
                                            <Bar data={dataSales} options={options}/> }                                                        
                                    </Card.Body>
                                    <Card.Footer>
                                        <table className="table table-striped my-4" style={{width: 100+'%'}}>
                                            <thead>
                                                <th></th>
                                                { dataSales.labels.map((label) => <th>{label}</th>) }
                                            </thead>
                                            <tbody>
                                                { dataSales.datasets.map(({ label, data } = dataset) => <tr>
                                                    <th>{label}</th>
                                                    { data.map((value) => <td>
                                                        <NumberFormat
                                                            value={value}
                                                            displayType="text"
                                                            prefix="Php"
                                                            decimalScale="2"
                                                            fixedDecimalScale
                                                            thousandSeparator/>
                                                    </td>) }
                                                </tr>) }
                                            </tbody>
                                        </table>
                                    </Card.Footer>
                                </Card>
                            </> }
                            
                        {!dataSales &&
                            <>                                
                                <Form onSubmit={this.handleGenerateChart}>
                                    <Card>
                                        <Card.Body>
                                            <Form.Group>
                                                <Form.Label>Chart type:</Form.Label>
                                                <Form.Check
                                                    type="radio"
                                                    label="Line"
                                                    value="line"
                                                    checked={chartType==='line'}
                                                    onClick={this.handleClickChartTypeOption}/>
                                                <Form.Check
                                                    type="radio"
                                                    label="Bar"
                                                    value="bar"
                                                    checked={chartType==='bar'}
                                                    onClick={this.handleClickChartTypeOption}/>                                                
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>From:</Form.Label>
                                                <Form.Control
                                                    type="month"
                                                    name="from"
                                                    value={from}
                                                    onChange={this.handleDateChange}/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>To:</Form.Label>
                                                <Form.Control
                                                    type="month"
                                                    name="to"
                                                    value={to}
                                                    onChange={this.handleDateChange}/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <CommonDropdownSelectSingleItem
                                                name="items"
                                                handleChange={this.handleChangeItems}
                                                selectedStore={selectedItems}
                                                isMulti/>
                                            <Form.Group>
                                                <Form.Label>Sales by:</Form.Label>
                                                <Form.Check
                                                    type="radio"
                                                    label="Store"
                                                    value="store"
                                                    checked={by==='store'}
                                                    onClick={this.handleClickSalesByOption}/>
                                                <Form.Check
                                                    type="radio"
                                                    label="Category"
                                                    value="category"
                                                    checked={by==='category'}
                                                    onClick={this.handleClickSalesByOption}/>
                                                <Form.Check
                                                    type="radio"
                                                    label="Location"
                                                    value="location"
                                                    checked={by==='location'}
                                                    onClick={this.handleClickSalesByOption}/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            { by === 'store' && 
                                                <CommonDropdownSelectSingleStore
                                                    name="stores"
                                                    handleChange={this.handleChangeStore}
                                                    selectedStore={selectedStore}
                                                    isMulti/> }
                                            { by === 'category' && 
                                                <CommonDropdownSelectSingleStoreCategory
                                                    handleChange={this.handleChangeCategory}
                                                    selectedValue={selectedCategory}
                                                    isMulti/> }
                                            { by === 'location' && 
                                                <CommonDropdownSelectSingleStoreLocation
                                                    handleChange={this.handleChangeLocation}
                                                    selectedValue={selectedLocation}
                                                    isMulti/> }
                                        </Card.Body>
                                        <Card.Footer>
                                            <Button type="submit" block>Generate</Button>
                                        </Card.Footer>
                                    </Card>
                                </Form>
                            </> }
                    </Card.Body>
                </Card>            
            </div>
        );
    }
}