import { Alert, Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';
import React, { Component } from 'react';
import cookie from 'react-cookies';

const END_POINT_AVAILABLE_ITEMS = `${apiBaseUrl}/reports/stock-cards-monitoring-available-items`;
const END_POINT = `${apiBaseUrl}/reports/stock-cards-monitoring`;
const DT_SALES_INVOICES_MONITORING = `table-stock-cards-monitoring`;

export default class ReportsStockCardsMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleStoreLocationChange = this.handleStoreLocationChange.bind(this);

        this.state = {
            token: null,
            searchFilters: null,
            availableFields: [],
            storeStockCards: [],
            selectedStoreLocation: {},
            inventoryTypes: [
                {
                    label: 'Diser\'s Inventory',
                    table: 'disers_inventory',
                },
                {
                    label: 'Sales Return and Allowances (SRA)',
                    table: 'sra_inventory',
                },
                {
                    label: 'Beginning Inventory',
                    table: 'beginning_inventory',
                },
                {
                    label: 'Delivered',
                    table: 'delivered_inventory',
                },
                {
                    label: 'Sold',
                    table: 'sold_inventory',
                },
                {
                    label: 'Ending Inventory',
                    table: 'ending_inventory',
                },
            ],
            drawReport: false,
            errors: null,
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        self.setState({
            ...self.state,
            token,
        });
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const data = $(e.currentTarget).serialize();
        const { inventoryTypes } = self.state;

        self.setState({
            ...self.state,
            drawReport: false,
        });

        axios.get(`${END_POINT_AVAILABLE_ITEMS}?${data}&token=${token}`)
            .then((response) => {
                const { data: availableFields } = response.data;

                axios.get(`${END_POINT}?${data}&token=${token}`)
                    .then((response) => {
                        const { data: storeStockCards, meta } = response.data;
                        const { search_filters: searchFilters } = meta;
                        self.setState({
                            ...self.state,
                            searchFilters,
                            storeStockCards,
                            drawReport: true,
                            errors: null,
                        });

                        inventoryTypes.forEach((inventoryType) => {
                            const dataTable = $('.data-table-wrapper')
                                .find(`table.${DT_SALES_INVOICES_MONITORING}-${inventoryType.table}`)
                                .DataTable();
                            if (dataTable) {
                                dataTable.destroy();
                            }

                            let columns = [
                                { data: 'store.name' },
                            ];
                            availableFields.forEach((field) => {
                                columns.push({ data: `${field.code}_${inventoryType.table}` });
                            });

                            const table = $(`.${DT_SALES_INVOICES_MONITORING}-${inventoryType.table}`).DataTable({
                                data: storeStockCards,
                                buttons: [],
                                ordering: false,
                                paging: false,
                                searching: false,
                                columns,
                                footerCallback: function (row, data, start, end, display) {
                                    const api = this.api();

                                    const intVal = function (i) {
                                        return typeof i === 'string'
                                            ? i.replace(/[\$,]/g, '') * 1
                                            : typeof i === 'number' ? i : 0;
                                    };

                                    availableFields.forEach((field, key) => {
                                        const columnIndex = key + 1;
                                        const total = api
                                            .column(columnIndex)
                                            .data()
                                            .reduce(
                                                function (a, b) {
                                                    return intVal(a) + intVal(b);
                                                },
                                                0
                                            );
                                        $(api.column(columnIndex).footer()).html(total);
                                    });
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        if (error.response) {
                            const { response } = error;
                            const { data } = response;
                            const { errors } = data;
                            self.setState({
                                ...self.state,
                                errors,
                            });
                        }
                    });

                self.setState({
                    ...self.state,
                    availableFields,
                    errors: null,
                });
            })
            .catch((error) => {
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    self.setState({
                        ...self.state,
                        errors,
                    });
                }
            });
    }

    handleStoreLocationChange(e) {
        const self = this;
        self.setState({
            ...self.state,
            selectedStoreLocation: e
        })
    }

    render() {
        const {
            availableFields,
            searchFilters,
            selectedStoreLocation,
            inventoryTypes,
            drawReport,
            errors,
        } = this.state;

        const errs = [];
        if (errors) {
            for (const key in errors) {
                errs.push(errors[key]);
            }
        }

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Stock Cards Monitoring</Breadcrumb.Item>
                </Breadcrumb>
                <div className="row my-4">
                    <div className="col-md-3">
                        <Card>
                            <Card.Header>
                                <i className="fa fa-filter"></i> Search Filters
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleSearchSubmit}>
                                    <Form.Group>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="date" name="from" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="date" name="to" />
                                    </Form.Group>
                                    <CommonDropdownSelectSingleStoreLocation
                                        name="location_id"
                                        handleChange={this.handleStoreLocationChange}
                                        selectedStoreLocation={selectedStoreLocation} />
                                    <hr className="my-4" />
                                    {errs.length > 0 &&
                                        <Alert variant="danger">
                                            {errs.map((e, idx) => <li key={idx}>{e}</li>)}
                                        </Alert>
                                    }
                                    <Button type="submit">Generate Report</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-9">
                        <Card>
                            {
                                searchFilters &&
                                <Card.Header>
                                    <h4>Stock Cards Monitoring</h4>
                                    {searchFilters.location ? `${searchFilters.location.name}` : `All Locations`} | From: {searchFilters.from} To: {searchFilters.to}
                                </Card.Header>
                            }
                            <Card.Body>
                                {drawReport &&
                                    <>
                                        {inventoryTypes.map((inventoryType, idx) => <Card key={idx} className="mb-4">
                                            <Card.Header>
                                                {inventoryType.label}
                                            </Card.Header>
                                            <Card.Body>
                                                <table className={`table table-striped ${DT_SALES_INVOICES_MONITORING}-${inventoryType.table}`} style={{ width: 100 + '%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Store</th>
                                                            {availableFields.map((field) => <th>{field.name}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody></tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th>Total:</th>
                                                            {availableFields.map((field) => <th>0</th>)}
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </Card.Body>
                                        </Card>)}
                                    </>
                                }
                                {!searchFilters &&

                                    <p className="text-center">
                                        <i className="fa fa-5x fa-info-circle" /><br />
                                        Start by filtering records to search.
                                    </p>}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
