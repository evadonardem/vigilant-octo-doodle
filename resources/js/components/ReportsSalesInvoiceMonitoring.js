import React, { Component } from 'react';
import { Breadcrumb, Button, ButtonGroup, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from './CommonDropdownSelectSingleStoreLocation';

const END_POINT = `${apiBaseUrl}/reports/sales-invoices-monitoring`;
const DT_SALES_INVOICES_MONITORING = `table-sales-invoices-monitoring`;
const DT_SALES_INVOICES_MONITORING_INVOICES = `table-sales-invoices-monitoring-invoices`;
const DT_SALES_INVOICES_MONITORING_SUMMARY = `table-sales-invoices-monitoring-summary`;

export default class ReportsSalesInvoiceMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleChangeType = this.handleChangeType.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleGenerateCsvReport = this.handleGenerateCsvReport.bind(this);

        this.state = {
            booklets: [],
            csvFilters: null,
            reportType: 'store',
            searchFilters: null,
            summary: [],
            token: null,
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const { booklets, summary } = self.state;
        const currencyFormat = $.fn.dataTable.render.number(',', '.', 2, 'Php').display;

        self.setState({
            ...self.state,
            token,
        });

        $(`.${DT_SALES_INVOICES_MONITORING}`).DataTable({
            data: booklets,
            buttons: [],
            columns: [
                {
                    className: 'booklet-details-control text-center',
                    data: null,
                    defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                },
                { data: 'id' },
                {
					data: 'total_sales',
					render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
				},
                {
					data: 'vat_amount',
					render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
				},
                {
					data: 'total_sales_less_vat',
					render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
				},
                {
					data: 'total_amount_due',
					render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
				}
            ],
            columnDefs: [
				{
					targets: [2, 3, 4, 5],
					className: 'dt-right',
				},
            ],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function ( i ) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '')*1
                        : typeof i === 'number' ? i : 0;
                };
                
                const offset = 2;
                for (let i = 0; i < 4; i++) {
					const totalAmount = api
						.column(offset + i)
						.data()
						.reduce(
							function (a, b) {
								return intVal(a) + intVal(b);
							},
							0
						);
					$(api.column(offset + i).footer()).html(currencyFormat(totalAmount));
				}
            },
            ordering: false,
            paging: false,
            searching: false,
        });

        const format = (d) => {
            return `<div class="card">
                <div class="card-header">
                    Booklet No. ${d.id}<br/>
                    <span class="badge badge-secondary">Sales Invoices</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped ${DT_SALES_INVOICES_MONITORING_INVOICES}" style="width: 100%">
                        <thead>
                            <tr>
                                <th scope="col">Invoice No.</th>
                                <th scope="col">Sold To</th>
                                <th scope="col">From</th>
                                <th scope="col">To</th>
                                <th scope="col">Total Sales</th>
                                <th scope="col">Less VAT</th>
                                <th scope="col">Amount Net less VAT</th>
                                <th scope="col">Total Amount Due</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                        <tfoot>
							<tr>
								<th scope="col"></th>
								<th scope="col"></th>
								<th scope="col"></th>
								<th scope="col">Total:</th>
								<th scope="col"></th>
								<th scope="col"></th>
								<th scope="col"></th>
								<th scope="col"></th>
							</tr>
						</tfoot>
                    </table>
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(`.${DT_SALES_INVOICES_MONITORING}`)).on('click', 'td.booklet-details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find(`table.${DT_SALES_INVOICES_MONITORING}`)
                .DataTable();
            var tr = $(this).closest('tr');
            var row = refDataTable.row( tr );

            if ( row.child.isShown() ) {
                $(this).find('i').removeClass('fa-chevron-circle-up');
                $(this).find('i').addClass('fa-chevron-circle-down');
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $(this).find('i').removeClass('fa-chevron-circle-down');
                $(this).find('i').addClass('fa-chevron-circle-up');
                row.child( format(row.data()) ).show();
                tr.addClass('shown');
                if (row.child.isShown()) {
                    const data = row.data();
                    const { invoices } = data;
                    
                    tr.next().find(`table.${DT_SALES_INVOICES_MONITORING_INVOICES}`).DataTable({
                        data: invoices,
                        buttons: [],
                        columns: [
                            { data: 'invoice_no' },
                            {
                                'data': null,
                                'render': function (data, type, row) {
                                    return `${row.category.name}`;
                                }
                            },
                            { data: 'from' },
                            { data: 'to' },
                            {
                                data: 'total_sales',
                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                            },
                            {
                                data: 'vat_amount',
                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                            },
                            {
                                data: 'total_sales_less_vat',
                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                            },
                            {
                                data: 'total_amount_due',
                                render: $.fn.dataTable.render.number(',', '.', 2, 'Php'),
                            },
                        ],
                        columnDefs: [
							{
								targets: [4, 5, 6, 7],
								className: 'dt-right',
							},
						],
						footerCallback: function (row, data, start, end, display) {
							const api = this.api();

							const intVal = function ( i ) {
								return typeof i === 'string'
									? i.replace(/[\$,]/g, '')*1
									: typeof i === 'number' ? i : 0;
							};
							
							const offset = 4;
							for (let i = 0; i < 4; i++) {
								const totalAmount = api
									.column(offset + i)
									.data()
									.reduce(
										function (a, b) {
											return intVal(a) + intVal(b);
										},
										0
									);
								$(api.column(offset + i).footer()).html(currencyFormat(totalAmount));
							}
						},
                        ordering: false,
                        paging: false,
                        searching: false,
                    });
                }
            }
        });
        
        $(`.${DT_SALES_INVOICES_MONITORING_SUMMARY}`).DataTable({
            data: summary,
            buttons: [],
            columns: [
                { data: 'code' },
                { data: 'name' },
                {
					data: 'quantity_original',
					render: $.fn.dataTable.render.number(','),
				},
                {
					data: 'quantity_actual',
					render: $.fn.dataTable.render.number(','),
				},
                {
					data: 'quantity_bad_orders',
					render: $.fn.dataTable.render.number(','),
				},
                {
					data: 'quantity_returns',
					render: $.fn.dataTable.render.number(','),
				},
            ],
            columnDefs: [
                {
                    targets: [2, 3, 4, 5],
                    className: 'dt-right',
                },
            ],
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();

                const intVal = function ( i ) {
                    return typeof i === 'string'
                        ? i.replace(/[\$,]/g, '')*1
                        : typeof i === 'number' ? i : 0;
                };
                
                const offset = 2;
				for (let i = 0; i < 4; i++) {
					const totalAmount = api
						.column(offset + i)
						.data()
						.reduce(
							function (a, b) {
								return intVal(a) + intVal(b);
							},
							0
						);                    
                    $(api.column(offset + i).footer()).html(currencyFormat(totalAmount));
				}
            },
            ordering: false,
            paging: false,
            searching: false,
        });
    }
    
    handleChangeType(e) {
		const self = this;
		const reportType = e.target.value;
		self.setState({
			...self.state,
			booklets: [],
			csvFilters: null,
			searchFilters: null,
			summary: [],
			reportType,
		});
	}

    handleSearchSubmit(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const table = $('.data-table-wrapper')
            .find(`table.${DT_SALES_INVOICES_MONITORING}`)
            .DataTable();
        const tableSummary = $('.data-table-wrapper')
            .find(`table.${DT_SALES_INVOICES_MONITORING_SUMMARY}`)
            .DataTable();
        const data = $(e.currentTarget).serialize();
        const csvFilters = data;

        axios.get(`${END_POINT}?${data}&token=${token}`)
            .then((response) => {
                const { data: booklets, meta } = response.data;
                const { search_filters: searchFilters, summary } = meta;
                self.setState({
                    ...self.state,
                    searchFilters,
                    booklets,
                    summary,
                    csvFilters,
                });
                table.clear();
                table.rows.add(booklets).draw();
                tableSummary.clear();
                tableSummry.rows.add(summary).draw();
            });
    }
    
    handleGenerateCsvReport(e) {
		e.preventDefault();
		const reportType = e.target.getAttribute('data-report-type');
		const self = this;
		const { csvFilters, token } = self.state;
		axios.get(`${END_POINT}?${csvFilters}&generate=csv&report_type=${reportType}&token=${token}`, {
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
        const {
			reportType,
            searchFilters,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Sales Invoice Monitoring</Breadcrumb.Item>
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
                                        <Form.Control type="date" name="from"/>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>To:</Form.Label>
                                        <Form.Control type="date" name="to"/>
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
                                    <Button type="submit" block>Generate Report</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-9">
                        <Card>
                            {
                                searchFilters &&
                                <Card.Header>
                                    <h4>Sales Invoice Monitoring</h4>
                                    {searchFilters.store ? `${searchFilters.store.name}` : `All Stores`} | From: {searchFilters.from} To: {searchFilters.to}
                                </Card.Header>
                            }
                            <Card.Body>
                                <div style={!searchFilters ? {display: 'none'} : null}>
									<Card>
										<Card.Header>
											<b>Full Detail</b> (Per Booklet)
										</Card.Header>
										<Card.Body>
											<div className="row">
												<div className="col-md-12">
													<Button className="pull-right" onClick={this.handleGenerateCsvReport} data-report-type="full">
														<i className="fa fa-icon fa-download"></i> CSV
													</Button>
												</div>
											</div>
											<table className={`table table-striped ${DT_SALES_INVOICES_MONITORING}`} style={{width: 100+'%'}}>
												<thead>
													<tr>
														<th scope="col"></th>
														<th scope="col">Booklet No.</th>
														<th scope="col">Total Sales</th>
														<th scope="col">Less VAT</th>
														<th scope="col">Amount Net less VAT</th>
														<th scope="col">Total Amount Due</th>
													</tr>
												</thead>
												<tbody></tbody>
												<tfoot>
													<tr>
														<th></th>
														<th>Total:</th>
														<th>0.00</th>
														<th>0.00</th>
														<th>0.00</th>
														<th>0.00</th>
													</tr>
												</tfoot>
											</table>
										</Card.Body>
									</Card>
                                    <Card className="mt-4">
										<Card.Header>
											<b>Summary</b> (Per Item)
										</Card.Header>
										<Card.Body>
											<div className="row">
												<div className="col-md-12">
													<Button className="pull-right" onClick={this.handleGenerateCsvReport} data-report-type="summary">
														<i className="fa fa-icon fa-download"></i> CSV
													</Button>
												</div>
											</div>
											<table className={`table table-striped ${DT_SALES_INVOICES_MONITORING_SUMMARY}`} style={{width: 100+'%'}}>
												<thead>
													<tr>
														<th scope="col">Code</th>
														<th scope="col">Name</th>
														<th scope="col">Total Sales</th>
														<th scope="col">Less VAT</th>
														<th scope="col">Amount Net less VAT</th>
														<th scope="col">Total Amount Due</th>
													</tr>
												</thead>
												<tbody></tbody>
												<tfoot>
													<tr>
														<th scope="col"></th>
														<th scope="col" style={{textAlign: 'right'}}>Total:</th>
														<th scope="col"></th>
														<th scope="col"></th>
														<th scope="col"></th>
														<th scope="col"></th>
													</tr>
												</tfoot>
											</table>
										</Card.Body>
									</Card>
                                </div>
                                { !searchFilters &&
                                    <Jumbotron className="mb-0">
                                        <p className="text-center">
                                            <i className="fa fa-5x fa-info-circle"/><br/>
                                            Start by filtering records to search.
                                        </p>
                                    </Jumbotron>
                                }
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
