import React, { Component } from 'react';
import { Breadcrumb, Button, Card, Form, Jumbotron } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDropdownSelectSingleStore from './CommonDropdownSelectSingleStore';

const END_POINT = `${apiBaseUrl}/reports/delivery-receipt-monitoring`;
const DT_DELIVERY_RECEIPT_MONITORING = `table-delivery-receipt-monitoring`;
const DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPTS = `table-delivery-receipt-monitoring-delivery-receipts`;
const DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPT_STORES = `table-delivery-receipt-monitoring-delivery-receipt-stores`;

const DT_DELIVERY_RECEIPT_MONITORING_SUMMARY = `table-delivery-receipt-monitoring-summary`;

export default class ReportsDeliveryReceiptMonitoring extends Component {
    constructor(props) {
        super(props);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleGenerateCsvReport = this.handleGenerateCsvReport.bind(this);

        this.state = {
            searchFilters: null,
            booklets: [],
            summary: [],
            csvFilters: null,
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const { booklets, summary } = self.state;

        $(`.${DT_DELIVERY_RECEIPT_MONITORING}`).DataTable({
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

				const numberFormat = $.fn.dataTable.render.number(',').display;
				const offset = 2;
				for (let i = 0; i < 4; i++) {
					const totalQuantity = api
						.column(offset + i)
						.data()
						.reduce(
							function (a, b) {
								return intVal(a) + intVal(b);
							},
							0
						);                    
                    $(api.column(offset + i).footer()).html(numberFormat(totalQuantity));
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
                    <span class="badge badge-secondary">Delivery Receipts</span>
                </div>
                <div class="card-body">
                    <table class="table table-striped ${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPTS}" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col"></th>
                            <th scope="col">Delivery Receipt No.</th>
                            <th scope="col">Purchase Order</th>
                            <th scope="col">Qty. (Original)</th>
                            <th scope="col">Qty. (Actual)</th>
                            <th scope="col">Qty. (Bad Orders)</th>
                            <th scope="col">Qty. (Returns)</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                        <tfoot>
							<tr>
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

        const formatDeliveryReceiptDetails = (d) => {

            const stores = d.stores.map((store) => {
                return `<p class="mb-0">${store.code} ${store.name}</p>
                    <table class="table table-striped ${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPT_STORES}-${store.id}" style="width: 100%">
                        <thead>
                            <tr>
                            <th scope="col">Code</th>
                            <th scope="col">Name</th>
                            <th scope="col">Qty. (Original)</th>
                            <th scope="col">Qty. (Actual)</th>
                            <th scope="col">Qty. (Bad Orders)</th>
                            <th scope="col">Qty. (Returns)</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                        <tfoot>
							<tr>
							<th scope="col"></th>
                            <th scope="col">Total:</th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            <th scope="col"></th>
							</tr>
                        </tfoot>
                    </table>`;
            });

            return `<div class="card">
                <div class="card-header">
                    Delivery Receipt No. ${d.id}<br/>
                    <span class="badge badge-secondary">Store Items</span>
                </div>
                <div class="card-body">
                    ${stores.join('')}
                </div>
            </div>`;
        };

        // Add event listener for opening and closing details
        $('tbody', $(`.${DT_DELIVERY_RECEIPT_MONITORING}`)).on('click', 'td.booklet-details-control', function () {
            var refDataTable = $('.data-table-wrapper')
                .find(`table.${DT_DELIVERY_RECEIPT_MONITORING}`)
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
                    const { deliveryReceipts } = data;
                    tr.next().find(`table.${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPTS}`).DataTable({
                        data: deliveryReceipts,
                        buttons: [],
                        columns: [
                            {
                                className: 'delivery-receipt-details-control text-center',
                                data: null,
                                defaultContent: '<i class="fa fa-lg fa-chevron-circle-down"></i>'
                            },
                            { data: 'id' },
                            { data: 'purchase_order.code' },
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
								targets: [3, 4, 5, 6],
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

							const numberFormat = $.fn.dataTable.render.number(',').display;
							const offset = 3;
							for (let i = 0; i < 4; i++) {
								const totalQuantity = api
									.column(offset + i)
									.data()
									.reduce(
										function (a, b) {
											return intVal(a) + intVal(b);
										},
										0
									);                    
								$(api.column(offset + i).footer()).html(numberFormat(totalQuantity));
							}
						},
                        ordering: false,
                        paging: false,
                        searching: false,
                    });
                    tr.next()
                        .find(`table.${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPTS}`)
                        .off()
                        .on('click', 'td.delivery-receipt-details-control', function () {
                            const refDataTable = $('.data-table-wrapper')
                                .find(`table.${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPTS}`)
                                .DataTable();
                            const tr = $(this).closest('tr');
                            const row = refDataTable.row( tr );
                            if ( row.child.isShown() ) {
                                $(this).find('i').removeClass('fa-chevron-circle-up');
                                $(this).find('i').addClass('fa-chevron-circle-down');
                                row.child.hide();
                                tr.removeClass('shown');
                            } else {
                                $(this).find('i').removeClass('fa-chevron-circle-down');
                                $(this).find('i').addClass('fa-chevron-circle-up');
                                row.child( formatDeliveryReceiptDetails(row.data()) ).show();
                                tr.addClass('shown');

                                const data = row.data();
                                const { stores } = data;

                                stores.map((store) => {
                                    tr.next().find(`table.${DT_DELIVERY_RECEIPT_MONITORING_DELIVERY_RECEIPT_STORES}-${store.id}`).DataTable({
                                        data: store.items,
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

											const numberFormat = $.fn.dataTable.render.number(',').display;
											const offset = 2;
											for (let i = 0; i < 4; i++) {
												const totalQuantity = api
													.column(offset + i)
													.data()
													.reduce(
														function (a, b) {
															return intVal(a) + intVal(b);
														},
														0
													);                    
												$(api.column(offset + i).footer()).html(numberFormat(totalQuantity));
											}
										},
                                        ordering: false,
                                        paging: false,
                                        searching: false,
                                    });
                                });
                            }
                        });
                }
            }
        });
        
        $(`.${DT_DELIVERY_RECEIPT_MONITORING_SUMMARY}`).DataTable({
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
                
                const numberFormat = $.fn.dataTable.render.number(',').display;
				const offset = 2;
				for (let i = 0; i < 4; i++) {
					const totalQuantity = api
						.column(offset + i)
						.data()
						.reduce(
							function (a, b) {
								return intVal(a) + intVal(b);
							},
							0
						);                    
                    $(api.column(offset + i).footer()).html(numberFormat(totalQuantity));
				}
            },
            ordering: false,
            paging: false,
            searching: false,
        });
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        const self = this;
        const token = cookie.load('token');
        const table = $('.data-table-wrapper')
            .find(`table.${DT_DELIVERY_RECEIPT_MONITORING}`)
            .DataTable();
        const tableSummary = $('.data-table-wrapper')
            .find(`table.${DT_DELIVERY_RECEIPT_MONITORING_SUMMARY}`)
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
                tableSummary.rows.add(summary).draw();
            });
    }
    
    handleGenerateCsvReport(e) {
		e.preventDefault();
		const reportType = e.target.getAttribute('data-report-type');
		const self = this;
		const token = cookie.load('token');
		const { csvFilters } = self.state;
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
            searchFilters,
            booklets,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Delivery Receipt Monitoring</Breadcrumb.Item>
                </Breadcrumb>

                <div className="row">
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
                                    <CommonDropdownSelectSingleStore name="store_id"/>
                                    <hr className="my-4"/>
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
                                    <h4>Delivery Receipt Monitoring</h4>
                                    {searchFilters.store ? `(${searchFilters.store.code}) ${searchFilters.store.name}` : `All Stores`} | From: {searchFilters.from} To: {searchFilters.to}
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
											<table className={`table table-striped ${DT_DELIVERY_RECEIPT_MONITORING}`} style={{width: 100+'%'}}>
												<thead>
													<tr>
													<th scope="col"></th>
													<th scope="col">Booklet No.</th>
													<th scope="col">Qty. (Original)</th>
													<th scope="col">Qty. (Actual)</th>
													<th scope="col">Qty. (Bad Orders)</th>
													<th scope="col">Qty. (Returns)</th>
													</tr>
												</thead>
												<tbody></tbody>
												<tfoot>
													<tr>
														<th scope="col"></th>
														<th scope="col" style={{textAlign: 'right'}}>Total:</th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
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
											<table className={`table table-striped ${DT_DELIVERY_RECEIPT_MONITORING_SUMMARY}`} style={{width: 100+'%'}}>
												<thead>
													<tr>
													<th scope="col">Code</th>
													<th scope="col">Name</th>
													<th scope="col">Qty. (Original)</th>
													<th scope="col">Qty. (Actual)</th>
													<th scope="col">Qty. (Bad Orders)</th>
													<th scope="col">Qty. (Returns)</th>
													</tr>
												</thead>
												<tbody></tbody>
												<tfoot>
													<tr>
														<th scope="col"></th>
														<th scope="col" style={{textAlign: 'right'}}>Total:</th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
														<th scope="col" style={{textAlign: 'right'}}></th>
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
