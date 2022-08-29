import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';

const END_POINT = `${apiBaseUrl}/reports/item-sales-monitoring`;

export default class ReportsDeliverySalesMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleChangeType = this.handleChangeType.bind(this); 
        this.handleGenerateCsvReport = this.handleGenerateCsvReport.bind(this);
        this.state = {
			reportType: 'store',
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
        const { reportType } = this.state;

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
                                    { reportType === 'store' && 
										<CommonDropdownSelectSingleStore name="store_id"/> }
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
