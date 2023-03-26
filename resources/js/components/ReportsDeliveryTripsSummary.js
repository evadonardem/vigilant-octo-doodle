import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/reports/delivery-trips-summary`;
const DT_DELIVERY_TRIPS_SUMMARY = `table-delivery-trips-summary`;

export default class ReportsDeliverySalesMonitoring extends Component {
    constructor(props) {
        super(props);
        this.getExportFilename = this.getExportFilename.bind(this);
        this.getExportTitle = this.getExportTitle.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);

        this.state = {
            searchFilters: null,
            trips: [],
            token: null,
        };
    }

    getExportFilename() {
        const self = this;
        const { searchFilters } = self.state;
        if (searchFilters) {
            return `delivery_trips_summary_from_${searchFilters.from}_to_${searchFilters.to}`;
        }
        return 'delivery_trips_summary';
    }

    getExportTitle() {
        const self = this;
        const { searchFilters } = self.state;
        if (searchFilters) {
            return `Delivery Trips Summary From ${searchFilters.from} To ${searchFilters.to}`;
        }
        return 'Delivery Trips Summary';
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const { trips } = self.state;

        self.setState({
            ...self.state,
            token,
        });

        const exportButtons = window.exportButtonsBase;
        exportButtons[0].filename = () => {
            return this.getExportFilename();
        };
        exportButtons[1].filename = () => {
            return this.getExportFilename();
        };
        exportButtons[1].title = () => {
            return this.getExportTitle();
        };

        $(`.${DT_DELIVERY_TRIPS_SUMMARY}`).DataTable({
            data: trips,
            buttons: exportButtons,
            columns: [
                { data: 'biometric_id' },
                { data: 'name' },
                { data: 'coverage_date' },
                { data: 'trips' },
                { data: 'references' },
            ],
            ordering: false,
            paging: false,
        });
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        const self = this;
        const { token } = self.state;
        const table = $('.data-table-wrapper')
            .find(`table.${DT_DELIVERY_TRIPS_SUMMARY}`)
            .DataTable();
        const data = $(e.currentTarget).serialize();

        axios.get(`${END_POINT}?${data}&token=${token}`)
            .then((response) => {
                const { data: trips, meta } = response.data;
                const { search_filters: searchFilters } = meta;
                self.setState({
                    ...self.state,
                    searchFilters,
                    trips,
                });
                table.clear();
                table.rows.add(trips).draw();
            });
    }

    render() {
        const {
            searchFilters,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Delivery Trips Summary</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-3">
                        <Form onSubmit={this.handleSearchSubmit}>
                            <Card>
                                <Card.Header>
                                    <i className="fa fa-filter"></i> Search Filters
                                </Card.Header>
                                <Card.Body>

                                    <Form.Group>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="date" name="from" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="date" name="to" />
                                    </Form.Group>

                                </Card.Body>
                                <Card.Footer>
                                    <Button type="submit" className="pull-right">Generate Report</Button>
                                </Card.Footer>
                            </Card>
                        </Form>
                    </div>
                    <div className="col-md-9">
                        <Card>
                            {
                                searchFilters &&
                                <Card.Header>
                                    <h4>Delivery Trips Summary</h4>
                                    From: {searchFilters.from} To: {searchFilters.to}
                                </Card.Header>
                            }
                            <Card.Body>
                                <div style={!searchFilters ? { display: 'none' } : null}>
                                    <table className={`table table-striped ${DT_DELIVERY_TRIPS_SUMMARY}`} style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col">Biometric ID</th>
                                                <th scope="col">Staff Name</th>
                                                <th scope="col">Coverage Date</th>
                                                <th scope="col">No. of Trips</th>
                                                <th scope="col">References</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
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
