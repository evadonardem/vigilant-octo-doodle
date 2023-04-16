import React, { Component } from 'react';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import { Badge, Breadcrumb, Button, ButtonGroup, Card, Form } from 'react-bootstrap';
import CommonDeleteModal from './CommonDeleteModal';
import CommonDropdownSelectSingleItem from './CommonDropdownSelectSingleItem'
import CommonDropdownSelectSingleStoreCategory from './CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from './CommonDropdownSelectSingleStoreLocation';

const END_POINT = `${apiBaseUrl}/settings/stores`;
const JOB_CONTRACTS_DT = 'table-promodiser-job-contracts';

export default class SettingStorePromodiserJobHistory extends Component {
    constructor(props) {
        super(props);

        this.handleOnClickToPresent = this.handleOnClickToPresent.bind(this);
        this.handleSubmitAddJobContract = this.handleSubmitAddJobContract.bind(this);
        this.handleCloseDeleteJobContractModal = this.handleCloseDeleteJobContractModal.bind(this);
        this.handleSubmitDeleteJobContractModal = this.handleSubmitDeleteJobContractModal.bind(this);

        this.state = {
            promodiser: {
                id: null,
                name: null,
                contact_no: null,
                store: {
                    id: null,
                    code: null,
                    name: null,
                },
            },
            deleteJobContract: {
                id: null,
                showModal: false,
                isDeleteError: false,
                deleteErrorHeaderTitle: '',
                deleteErrorBodyText: '',
            },
            toPresent: false,
            token: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { storeId, promodiserId } = params;

        self.setState({
            ...self.state,
            token,
        });

        axios.get(`${apiBaseUrl}/settings/stores/${storeId}/promodisers/${promodiserId}?token=${token}`)
            .then((response) => {
                const { data: promodiser } = response.data;
                self.setState({
                    ...self.state,
                    promodiser,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });

        const jobContractsDataTable = $(`.${JOB_CONTRACTS_DT}`).DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/settings/stores/${storeId}/promodisers/${promodiserId}/job-contracts?token=${token}`,
                dataFilter: (data) => {
                    let json = jQuery.parseJSON(data);
                    json.recordsTotal = json.total;
                    json.recordsFiltered = json.total;

                    return JSON.stringify(json);
                },
                dataSrc: (response) => {
                    const { data } = response;

                    return data;
                },
            },
            buttons: [],
            ordering: false,
            processing: true,
            searching: false,
            serverSide: true,
            columns: [
                { 'data': 'start_date' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const presentContract = `<input
                                class="form-control update-job-contract"
                                data-job-contract-id="${row.id}"
                                placeholder="TO PRESENT"
                                type="date"
                                name="end_date"/>
                            <div class="invalid-feedback"></div>`;
                        return row.end_date ? row.end_date : presentContract;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `<input
                            class="form-control update-job-contract"
                            data-job-contract-id="${row.id}"
                            type="number"
                            name="rate"
                            step="any"
                            value="${row.rate}"/>
                        <div class="invalid-feedback"></div>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `<input
                            class="form-control update-job-contract"
                            data-job-contract-id="${row.id}"
                            type="text"
                            name="remarks"
                            value="${row.remarks}"/>
                        <div class="invalid-feedback"></div>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const deleteBtn = `<a
                            href="#"
                            class="delete btn btn-secondary"
                            data-toggle="modal"
                            data-job-contract-id="${row.id}">
                                <i class="fa fa-trash"></i>
                            </a>`;
                        return `<div class="action-a btn-group" role="group">
                            ${deleteBtn}
                        </div>`;
                    }
                },
            ],
        });

        $(document).on('change', `.data-table-wrapper > .${JOB_CONTRACTS_DT} .update-job-contract`, function(e) {
            const id = +e.currentTarget.getAttribute('data-job-contract-id');
            const tableRow = $(e.currentTarget).closest('tr');
            const inputName = e.currentTarget.getAttribute('name');
            const inputValue = e.currentTarget.value;
            const payload = {
                data: {
                    id,
                    attributes: {},
                },
            };
            payload.data.attributes[inputName] = inputValue;

            axios.patch(`${END_POINT}/${storeId}/promodisers/${promodiserId}/job-contracts/${id}?token=${token}`, payload)
                .then(() => {
                    $('[name=' + inputName + ']', tableRow).closest('td').find('.form-control').removeClass('is-invalid');
                    if (inputName === 'end_date') {
                        jobContractsDataTable.ajax.reload(null, false);
                    }
                })
                .catch((error) => {
                    $('[name=' + inputName + ']', tableRow).closest('td').find('.form-control').removeClass('is-invalid');
                    if (error.response) {
                        const { response } = error;
                        const { data } = response;
                        const { errors } = data;
                        for (const key in errors) {
                            let attributeName = key.replace('data.attributes.', '');
                            $('[name=' + attributeName + ']', tableRow)
                                .addClass('is-invalid')
                                .closest('td')
                                .find('.invalid-feedback')
                                .text(errors[key][0]);
                        }
                    }
                });
        });

        $(document).on('click', `.data-table-wrapper > .${JOB_CONTRACTS_DT} .delete`, function(e) {
            const id = e.currentTarget.getAttribute('data-job-contract-id');
            self.setState({
                ...self.state,
                deleteJobContract: {
                    id,
                    showModal: true,
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

    handleOnClickToPresent(e) {
        const self = this;
        const toPresent = e.currentTarget.checked;
        self.setState({
            ...self.state,
            toPresent,
        });
    }

    handleSubmitAddJobContract(e) {
        e.preventDefault();
        const self = this;
        const { promodiser, token, toPresent } = self.state;
        const form = e.target;
        const formData = new FormData(form);
        const startDate = formData.get('start_date');
        const endDate = formData.get('end_date');
        const rate = formData.get('rate');
        const payload = {
            data: {
                attributes: {
                    start_date: startDate,
                    end_date: endDate,
                    to_present: toPresent,
                    rate,
                },
            },
        };

        const table = $('.data-table-wrapper').find(`table.${JOB_CONTRACTS_DT}`).DataTable();

        axios.post(`${END_POINT}/${promodiser.store.id}/promodisers/${promodiser.id}/job-contracts?token=${token}`, payload)
            .then((response) => {
                $('.form-control', form).removeClass('is-invalid');
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    toPresent: false,
                });
                form.reset();
            })
            .catch((error) => {
                $('.form-control', form).removeClass('is-invalid');
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        let attributeName = key.replace('data.attributes.', '');
                        $('[name=' + attributeName + ']', form)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
               }
            });
    }

    handleCloseDeleteJobContractModal() {
        const self = this;
        self.setState({
            ...self.state,
            deleteJobContract: {
                showModal: false,
                id: null,
                isDeleteError: false,
                deleteErrorHeaderTitle: '',
                deleteErrorBodyText: '',
            },
        });
    }

    handleSubmitDeleteJobContractModal(e) {
        e.preventDefault();

        const self = this;
        const { deleteJobContract, promodiser, token } = self.state;
        const table = $('.data-table-wrapper').find(`table.${JOB_CONTRACTS_DT}`).DataTable();

        axios.delete(`${apiBaseUrl}/settings/stores/${promodiser.store.id}/promodisers/${promodiser.id}/job-contracts/${deleteJobContract.id}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                self.setState({
                    ...self.state,
                    deleteJobContract: {
                        id: null,
                        showModal: false,
                        isDeleteError: false,
                        deleteErrorHeaderTitle: '',
                        deleteErrorBodyText: '',
                    },
                });
            })
            .catch((error) => {
                self.setState({
                    ...self.state,
                    deletePromodiser: {
                        isDeleteError: true,
                        deleteErrorHeaderTitle: 'Oh snap!',
                        deleteErrorBodyText: `Error deleting job contract!`,
                    },
                });
            });
    }

    render() {
        const {
            promodiser,
            toPresent,
            deleteJobContract,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/settings-stores">Stores Registry</Breadcrumb.Item>
                    <Breadcrumb.Item href={`#/settings-store-details/${promodiser.store.id}`}>{promodiser.store.code}</Breadcrumb.Item>
                    <Breadcrumb.Item active>{promodiser.name} Job Histories</Breadcrumb.Item>
                </Breadcrumb>
                <Card>
                    <Card.Header>
                        <i className='fa fa-icon fa-id-card'></i> {promodiser.name}<br/>
                        <Badge variant='primary'>Contact No.: {promodiser.contact_no}</Badge>&nbsp;
                        <Badge variant='primary'>Store: {`${promodiser.store.code} | ${promodiser.store.name}`}</Badge>
                    </Card.Header>
                    <Card.Body>
                       <div className='row'>
                           <div className='col-md-9'>
                                <Card>
                                    <Card.Header>Job Contracts</Card.Header>
                                    <Card.Body>
                                        <table className={`table table-striped ${JOB_CONTRACTS_DT}`} style={{width: 100+'%'}}>
                                            <thead>
                                                <tr>
                                                <th scope="col">Start Date</th>
                                                <th scope="col">End Date</th>
                                                <th scope="col">Rate</th>
                                                <th scope="col">Remarks</th>
                                                <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody></tbody>
                                        </table>
                                    </Card.Body>
                                </Card>
                           </div>
                           <div className='col-md-3'>
                               <Card>
                                   <Card.Header>
                                       Add Job Contract
                                   </Card.Header>
                                   <Card.Body>
                                        <Form onSubmit={this.handleSubmitAddJobContract}>
                                            <Form.Group>
                                                <Form.Label>Start Date:</Form.Label>
                                                <Form.Control type="date" name="start_date"></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            { !toPresent &&
                                                <Form.Group>
                                                    <Form.Label>End Date:</Form.Label>
                                                    <Form.Control type="date" name="end_date"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group> }
                                            <Form.Group>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="To present (active contract)"
                                                    checked={toPresent}
                                                    onClick={this.handleOnClickToPresent}
                                                    onChange={() => {}}/>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>Rate:</Form.Label>
                                                <Form.Control type="number" name="rate" step="any"></Form.Control>
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                            <hr/>
                                            <Button type="submit">Register</Button>
                                        </Form>
                                   </Card.Body>
                               </Card>
                           </div>
                        </div>
                    </Card.Body>
                </Card>
                <CommonDeleteModal
                    isShow={deleteJobContract.showModal}
                    headerTitle="Delete Job Contract"
                    bodyText={`Are you sure to delete this job contract?`}
                    handleClose={this.handleCloseDeleteJobContractModal}
                    handleSubmit={this.handleSubmitDeleteJobContractModal}
                    isDeleteError={deleteJobContract.isDeleteError}
                    deleteErrorHeaderTitle={deleteJobContract.deleteErrorHeaderTitle}
                    deleteErrorBodyText={deleteJobContract.deleteErrorBodyText}/>
            </div>
        );
    }
}
