import { Breadcrumb, Card, Form } from 'react-bootstrap';
import { fn } from 'jquery';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import CommonDropdownSelectSingleStoreCategory from '../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../CommonDropdownSelectSingleStoreLocation';
import React, { Component } from 'react';
import axios from 'axios';
import cookie from 'react-cookies';
import date from 'date-and-time';

const COMMONT_END_POINT_RATINGS = `${apiBaseUrl}/common/ratings`;
const END_POINT = `${apiBaseUrl}/reports/promodisers-summary`;
const END_POINT_PROMODISERS = `${apiBaseUrl}/promodisers`;
const PROMODISERS_SUMMARY_DT = `table-promodisers-summary`;

fn.dataTableExt.oSort["rating-pre"] = function(x) {
    const range = document.createRange();
    return parseInt($('.promodiser-rating', $(range.createContextualFragment(x))).data('rating-score'));
}

export default class ReportsPromodisersSummary extends Component {
    constructor(props) {
        super(props);

        this.getCurrentState = this.getCurrentState.bind(this);
        this.handleChangeInstanceType = this.handleChangeInstanceType.bind(this);
        this.handleChangeInstance = this.handleChangeInstance.bind(this);
        this.handleChangeMonitorPayment = this.handleChangeMonitorPayment.bind(this);
        this.handleChangeMonitorPaymentType = this.handleChangeMonitorPaymentType.bind(this);
        this.handleChangeMonitorPaymentYearMonth = this.handleChangeMonitorPaymentYearMonth.bind(this);
        this.updatePromodisersSummary = this.updatePromodisersSummary.bind(this);

        this.state = {
            isMonitoryPayment: false,
            monitorPaymentType: null,
            monitorPaymentYearMonth: null,
            ratings: [],
            searchFilters: {
                instanceType: 'store',
                instanceId: null,
            },
            token: null,
        };
    }

    componentDidMount() {
        const self = this;
        const token = cookie.load('token');
        const now = new Date();
        const exportButtons = window.exportButtonsBase;
        const exportFilename = `${date.format(now, 'YYYY-MM-DD')}_promodisers_summary`;
        const exportTitle = `${date.format(now, 'YYYY-MM-DD')} Promodisers Summary`;
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        self.setState({
            ...self.state,
            token,
        });

        axios.get(`${COMMONT_END_POINT_RATINGS}`)
            .then((response) => {
                const { data: ratings } = response.data;
                self.setState({
                    ...self.state,
                    ratings,
                });

                const datatable = $(`.${PROMODISERS_SUMMARY_DT}`).DataTable({
                    ajax: {
                        type: 'get',
                        url: `${END_POINT}?token=${token}`,
                        dataSrc: (response) => {
                            const { data } = response;
                            return data;
                        },
                    },
                    buttons: exportButtons,
                    columns: [
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                return row.store.location ? row.store.location.name : '';
                            }
                        },
                        { 'data': 'store.name' },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                return row.store.category ? row.store.category.name : '';
                            }
                        },
                        { 'data': 'name' },
                        { 'data': 'contact_no' },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                let currentRate = '';
                                if (row.current_job_contract) {
                                    currentRate = row.current_job_contract.rate;
                                }
                                return currentRate;
                            }
                        },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                let startDate = '';
                                let endDate = '';
                                let remarks = '';
                                if (row.current_job_contract) {
                                    startDate = row.current_job_contract.start_date;
                                }
                                if (row.current_job_contract) {
                                    endDate = row.current_job_contract.end_date;
                                    endDate = endDate ? endDate : `<em>PRESENT</em>`;
                                }
                                if (row.current_job_contract) {
                                    remarks = row.current_job_contract.remarks;
                                }
                                return `${startDate} to ${endDate}${type === 'display' ? '<br/>' : ' '}${remarks}`;
                            }
                        },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                let ratingId = null;
                                let rating = 'No Rating';
                                let ratingScore = 0;
                                if (row.latest_rating) {
                                    ratingId = row.latest_rating.id;
                                    rating = row.latest_rating.title;
                                    ratingScore = row.latest_rating.score;
                                }

                                if (type === 'export') {
                                    return rating;
                                }

                                const ratingOptions = ratings.map((ratingOption) => `<option
                                    value="${ratingOption.id}"
                                    ${ratingId === ratingOption.id ? "selected" : ""}>${ratingOption.title}</option>`);

                                return `<span
                                    class="promodiser-rating"
                                    data-promodiser-id=${row.id} data-rating-score=${ratingScore}>${rating}</span>
                                <div
                                    class="promodiser-rating-select btn-group"
                                    role="group"
                                    style="display: none;">
                                    <select class="form-control">
                                        ${ ratingOptions }
                                        ${ !ratingId ? `<option value="" ${!ratingId ? "selected" : ""}>No Rating</option>` : null }
                                    </select>
                                    <a href="#" role="button" class="promodiser-rating-select-cancel btn btn-danger"><i class="fa fa-icon fa-times"></i></a>
                                </div>`;
                            }
                        },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                let latestDateRated = 'N/A';
                                if (row.latest_rating) {
                                    latestDateRated = row.latest_rating.latest_date_rated;
                                }
                                return latestDateRated;
                            }
                        },
                        {
                            'data': null,
                            'render': function (data, type, row) {
                                const currentState = self.getCurrentState();
                                const { isMonitoryPayment, monitorPaymentType, monitorPaymentYearMonth } = currentState;

                                if (isMonitoryPayment) {
                                    if (monitorPaymentType === 'paid') {
                                        return `<div>
                                            ${type === 'display' ? `<i class="text-success fa fa-icon fa-lg fa-check-circle"></i>&nbsp;` : ''}
                                            ${monitorPaymentYearMonth} (${String(monitorPaymentType).toUpperCase()})
                                        </div>`;
                                    } else {
                                        if (type === 'display') {
                                            return `<div
                                                class="btn-group"
                                                role="group">
                                                <input class="form-control" readonly value="${monitorPaymentYearMonth} (${String(monitorPaymentType).toUpperCase()})"/>
                                                <button
                                                    type="button"
                                                    class="promodiser-payment-mark-as-paid btn btn-primary"
                                                    data-promodiser-id=${row.id}
                                                    data-payment-year-month=${monitorPaymentYearMonth}>
                                                    <i class="fa fa-icon fa-check"></i>
                                                </button>
                                            </div>`;
                                        } else {
                                            return `${monitorPaymentYearMonth} (${String(monitorPaymentType).toUpperCase()})`;
                                        }
                                    }
                                }

                                return 'N/A';
                            }
                        },
                    ],

                    aoColumnDefs: [
                        {
                            sType: "rating",
                            bSortable: true,
                            aTargets: 7,
                        },
                        {
                            bSortable: false,
                            aTargets: [4, 6, 8],
                        }
                    ],
                    searching: false,
                    paging: false,
                });

                datatable.column(0).visible(false);
                datatable.column(1).visible(true);
                datatable.column(2).visible(false);
                datatable.column(9).visible(false);
                datatable.order([[1, 'asc']]);

                $(`.${PROMODISERS_SUMMARY_DT}`).on( 'dblclick', 'tbody td', function () {
                    const promodiserRating = $('.promodiser-rating:visible', $(this));
                    const promodiserRatingSelect = $('.promodiser-rating-select:visible', $(this));
                    if (promodiserRating.length) {
                        const promodiserRatingSelect = $('.promodiser-rating-select', $(this));
                        const promodiserRatingSelectCancel = $('.promodiser-rating-select-cancel', $(this));
                        const promodiserId = promodiserRating.data('promodiser-id');
                        promodiserRating.hide();
                        promodiserRatingSelect.show().off().on('change', function () {
                            const ratingId = +$('select', promodiserRatingSelect).val();
                            $(this).hide();
                            promodiserRating.show();
                            axios.post(`${END_POINT_PROMODISERS}/${promodiserId}/ratings?token=${token}`, {data: {rating_id: ratingId}})
                                .then(() => datatable.ajax.reload().draw());
                        });
                        promodiserRatingSelectCancel.off().on('click', function(e) {
                            e.preventDefault();
                            promodiserRating.show();
                            promodiserRatingSelect.hide();
                        });
                    }
                    if (promodiserRatingSelect.length) {
                        const promodiserRating = $('.promodiser-rating', $(this));
                        promodiserRatingSelect.hide();
                        promodiserRating.show();
                    }
                });

                $(`.${PROMODISERS_SUMMARY_DT}`).on( 'click', 'tbody td', function () {
                    const markAsPaid = $('.promodiser-payment-mark-as-paid:visible', $(this));
                    if (markAsPaid.length) {
                        const promodiserId = markAsPaid.data('promodiser-id');
                        const paymentYearMonth = markAsPaid.data('payment-year-month');
                        axios.post(`${END_POINT_PROMODISERS}/${promodiserId}/payments?token=${token}`, {data: {payment_year_month: paymentYearMonth}})
                            .then(() => datatable.ajax.reload().draw());
                    }
                });
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    getCurrentState() {
        const self = this;
        return self.state;
    }

    handleChangeInstanceType(e) {
		const self = this;
        const { monitorPaymentType, monitorPaymentYearMonth } = self.state;
        const instanceType = e.target.value;
        self.setState({
			...self.state,
			searchFilters: {
                instanceType,
                instanceId: null,
            },
		});
        this.updatePromodisersSummary(instanceType, null, monitorPaymentType, monitorPaymentYearMonth);
	}

    handleChangeInstance(e) {
        const self = this;
        const { monitorPaymentType, monitorPaymentYearMonth, searchFilters } = self.state;
        const { instanceType } = searchFilters;
        const instanceId = e ? e.value : null;
        self.setState({
			...self.state,
			searchFilters: {
                ...self.state.searchFilters,
                instanceId,
            },
		});
        this.updatePromodisersSummary(instanceType, instanceId, monitorPaymentType, monitorPaymentYearMonth);
    }

    handleChangeMonitorPayment(e) {
        const self = this;
        const { searchFilters} = self.state;
        const { instanceType, instanceId } = searchFilters;
        const isMonitoryPayment = e.target.checked;
        const monitorPaymentType = isMonitoryPayment ? 'paid' : null;
        const monitorPaymentYearMonth = isMonitoryPayment ? new Date().toISOString().slice(0, 7) : null;
        self.setState({
			...self.state,
			isMonitoryPayment,
            monitorPaymentType,
            monitorPaymentYearMonth,
		});

        this.updatePromodisersSummary(instanceType, instanceId, monitorPaymentType, monitorPaymentYearMonth);
    }

    handleChangeMonitorPaymentType(e) {
        const self = this;
        const { monitorPaymentYearMonth, searchFilters} = self.state;
        const { instanceType, instanceId } = searchFilters;
        const monitorPaymentType = e.target.value;
        self.setState({
            ...self.state,
            monitorPaymentType,
		});

        this.updatePromodisersSummary(instanceType, instanceId, monitorPaymentType, monitorPaymentYearMonth);
    }

    handleChangeMonitorPaymentYearMonth(e) {
        const self = this;
        const { monitorPaymentType, searchFilters } = self.state;
        const { instanceType, instanceId } = searchFilters;
        const monitorPaymentYearMonth = e.target.value;
        self.setState({
            ...self.state,
            monitorPaymentYearMonth,
		});

        this.updatePromodisersSummary(instanceType, instanceId, monitorPaymentType, monitorPaymentYearMonth);
    }

    updatePromodisersSummary(instanceType, instanceId, paymentType, paymentYearMonth) {
        const self = this;
        const { token } = self.state;
        const filtersMonitorPayment = paymentType ? `&filters[payment_type]=${paymentType}&filters[payment_year_month]=${paymentYearMonth}` : '';
        const table = $('.data-table-wrapper')
            .find(`table.${PROMODISERS_SUMMARY_DT}`)
            .DataTable();
            table.ajax.url(`${END_POINT}?filters[instance_type]=${instanceType}&filters[instance_id]=${instanceId ?? 0}${filtersMonitorPayment}&token=${token}`);
            table.ajax.reload().draw();

        if (instanceType === 'store') {
            table.column(0).visible(false);
            table.column(1).visible(true);
            table.column(2).visible(false);
            table.order([[1, 'asc']]);
        } else if (instanceType === 'category') {
            table.column(0).visible(false);
            table.column(1).visible(false);
            table.column(2).visible(true);
            table.order([[2, 'asc']]);
        } else if (instanceType === 'location') {
            table.column(0).visible(true);
            table.column(1).visible(false);
            table.column(2).visible(false);
            table.order([[0, 'asc']]);
        }

        if (paymentType) {
            table.column(9).visible(true);
        } else {
            table.column(9).visible(false);
        }
    }

    render() {
        const {
            isMonitoryPayment,
            monitorPaymentType,
            monitorPaymentYearMonth,
            searchFilters,
        } = this.state;
        const {
            instanceType,
        } = searchFilters;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/reports"><i className="fa fa-book"></i> Reports</Breadcrumb.Item>
                    <Breadcrumb.Item active>Promodisers Summary</Breadcrumb.Item>
                </Breadcrumb>
                <div className="row my-4">
                    <div className="col-md-2">
                        <Card>
                            <Card.Header>
                                <i className="fa fa-filter"></i> Search Filters
                            </Card.Header>
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label>By:</Form.Label>
                                    <Form.Check
                                        type="radio"
                                        name="by"
                                        label="Store"
                                        value="store"
                                        checked={instanceType === 'store'}
                                        onChange={() => false}
                                        onClick={this.handleChangeInstanceType}/>
                                    <Form.Check
                                        type="radio"
                                        name="by"
                                        label="Category"
                                        value="category"
                                        checked={instanceType === 'category'}
                                        onChange={() => false}
                                        onClick={this.handleChangeInstanceType}/>
                                    <Form.Check
                                        type="radio"
                                        name="by"
                                        label="Location"
                                        value="location"
                                        checked={instanceType === 'location'}
                                        onChange={() => false}
                                        onClick={this.handleChangeInstanceType}/>
                                </Form.Group>
                                { instanceType === 'store' &&
									<CommonDropdownSelectSingleStore handleChange={this.handleChangeInstance}/> }
                                { instanceType === 'category' &&
                                    <CommonDropdownSelectSingleStoreCategory handleChange={this.handleChangeInstance}/> }
                                { instanceType === 'location' &&
                                    <CommonDropdownSelectSingleStoreLocation handleChange={this.handleChangeInstance}/> }
                                <hr/>
                                <Form.Check
                                    type="checkbox"
                                    label="Monitor payment"
                                    checked={isMonitoryPayment}
                                    onChange={() => false}
                                    onClick={this.handleChangeMonitorPayment}/>
                                { isMonitoryPayment &&
                                    <Form.Group>
                                        <Form.Check
                                            type="radio"
                                            name="monitor_payment_type"
                                            label="Paid"
                                            value="paid"
                                            checked={monitorPaymentType === 'paid'}
                                            onChange={() => false}
                                            onClick={this.handleChangeMonitorPaymentType}/>
                                        <Form.Check
                                            type="radio"
                                            name="monitor_payment_type"
                                            label="Unpaid"
                                            value="unpaid"
                                            checked={monitorPaymentType === 'unpaid'}
                                            onChange={() => false}
                                            onClick={this.handleChangeMonitorPaymentType}/>
                                        <Form.Label>From:</Form.Label>
                                        <Form.Control type="month" name="from" value={monitorPaymentYearMonth} onChange={this.handleChangeMonitorPaymentYearMonth}/>
                                    </Form.Group> }
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-10">
                        <Card>
                            <Card.Header>
                                <h4><i className='fa fa-lg fa-id-card'></i> Promodisers Summary</h4>
                            </Card.Header>
                            <Card.Body>
                                <table className={`table table-striped ${PROMODISERS_SUMMARY_DT}`} style={{width: 100+'%'}}>
                                    <thead>
                                        <tr>
                                        <th scope="col">Location</th>
                                        <th scope="col">Store</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Contact No.</th>
                                        <th scope="col">Current Rate</th>
                                        <th scope="col">Job Contract</th>
                                        <th scope="col" width="15%">Rating</th>
                                        <th scope="col" width="15%">Date Rated</th>
                                        <th scope="col" width="15%">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
