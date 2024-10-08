import { Breadcrumb, Button, Card, Form } from 'react-bootstrap';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';
import React, { Component } from 'react';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/reports/item-sales-monitoring`;

export default class ReportsItemSalesMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleChangeSalesBy = this.handleChangeSalesBy.bind(this);
        this.handleChangeType = this.handleChangeType.bind(this);
        this.handleGenerateCsvReport = this.handleGenerateCsvReport.bind(this);
        this.state = {
			reportType: 'store',
            salesBy: 'quantity',
			token: null,
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

    handleChangeSalesBy(e) {
		const self = this;
		const salesBy = e.target.value;
		self.setState({
			...self.state,
			salesBy,
		});
	}

    handleChangeType(e) {
		const self = this;
		const reportType = e.target.value;
		self.setState({
			...self.state,
			reportType,
		});
	}

    handleGenerateCsvReport(e) {
		e.preventDefault();
		const self = this;
		const { token } = self.state;
		const data = $(e.currentTarget).serialize();
        const filters = data;
		axios.get(`${END_POINT}?${filters}&generate=csv&token=${token}`, {
			responseType: 'arraybuffer',
		})
		.then(response => {
			const filename = response.headers['content-disposition'].split('filename=')[1].split('.')[0];
			const extension = response.headers['content-disposition'].split('.')[1].split(';')[0];
			const blob = new Blob(
				[response.data],
				{ type: 'text/csv' }
			);
			const link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.download = `${filename}.${extension}`;
			link.click();
		});
	}

    render() {
        const { reportType, salesBy } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Item Sales Monitoring</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Header>
                                <i className="fa fa-filter"></i> Search Filters
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={this.handleGenerateCsvReport}>
                                    <Form.Group>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="month" name="from"/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="month" name="to"/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Sales by:</Form.Label>
                                        <Form.Check
											type="radio"
											name="sales_by"
											label="Quantity"
											value="quantity"
											checked={salesBy === 'quantity'}
											onClick={this.handleChangeSalesBy}/>
										<Form.Check
											type="radio"
											name="sales_by"
											label="Amount"
											value="amount"
											checked={salesBy === 'amount'}
											onClick={this.handleChangeSalesBy}/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>By:</Form.Label>
                                        <Form.Check
											type="radio"
											name="by"
											label="Store"
											value="store"
											checked={reportType === 'store'}
											onClick={this.handleChangeType}/>
										<Form.Check
											type="radio"
											name="by"
											label="Category"
											value="category"
											checked={reportType === 'category'}
											onClick={this.handleChangeType}/>
                                        <Form.Check
											type="radio"
											name="by"
											label="Location"
											value="location"
											checked={reportType === 'location'}
											onClick={this.handleChangeType}/>
                                    </Form.Group>
                                    { reportType === 'store' &&
										<CommonDropdownSelectSingleStore name="store_id"/> }
									{ reportType === 'category' &&
										<CommonDropdownSelectSingleStoreCategory name="category_id"/> }
									{ reportType === 'location' &&
										<CommonDropdownSelectSingleStoreLocation name="location_id"/> }
                                    <hr className="my-4"/>
                                    <Button type="submit">Generate CSV</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
