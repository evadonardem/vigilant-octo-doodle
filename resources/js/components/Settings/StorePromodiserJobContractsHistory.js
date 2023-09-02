import axios from 'axios';
import { useEffect, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Form, Offcanvas } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import ConfirmationModal from '../Common/Modals/ConfirmationModal';
import ErrorToast from '../Common/Toasts/ErrorToast';

const ENDPOINT =
    `${apiBaseUrl}/settings/stores/{storeId}/promodisers/{promodiserId}/job-contracts?page={page}&per_page={perPage}&token={token}`;
const ENDPOINT_JOB_CONTRACTS =
    `${apiBaseUrl}/settings/stores/{storeId}/promodisers/{promodiserId}/job-contracts`;

const StorePromodiserJobContractsHistory = ({ promodiser }) => {
    const token = cookie.load('token');

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [data, setData] = useState([]);

    const [showAddEditContract, setShowAddEditContract] = useState(false);
    const [confirmDeleteContract, setConfirmDeleteContract] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);
    const [contractToEdit, setContractToEdit] = useState(null);
    const [isDeleteContractError, setIsDeleteContractError] = useState(false);
    const [toPresent, setToPresent] = useState(false);

    const fetchStorePromodiserJobContractsHistory = async (currentPage) => {
        const endpoint = ENDPOINT
            .replace('{storeId}', promodiser.store_id)
            .replace('{promodiserId}', promodiser.id)
            .replace('{page}', currentPage)
            .replace('{perPage}', perPage)
            .replace('{token}', token);
        setIsLoading(true);
        const response = await axios.get(endpoint);
        const { data, total: totalRows } = response.data;

        setData(data);
        setTotalRows(totalRows);
        setIsLoading(false);
    };

    const handlePageChange = page => {
        fetchStorePromodiserJobContractsHistory(page);
        setPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        const endpoint = ENDPOINT
            .replace('{storeId}', promodiser.store_id)
            .replace('{promodiserId}', promodiser.id)
            .replace('{page}', page)
            .replace('{perPage}', newPerPage)
            .replace('{token}', token);
        setIsLoading(true);
        const response = await axios.get(endpoint);
        const { data } = response.data;

        setData(data);
        setPage(page);
        setPerPage(newPerPage);
        setIsLoading(false);
    };

    const handleDeleteContract = (jobContractId) => async () => {
        const endpoint = ENDPOINT_JOB_CONTRACTS
            .replace('{storeId}', promodiser.store_id)
            .replace('{promodiserId}', promodiser.id);

        try {
            await axios.delete(`${endpoint}/${jobContractId}?token=${token}`);
            fetchStorePromodiserJobContractsHistory(page);
        } catch (_e) {
            setIsDeleteContractError(true);
        }
        setConfirmDeleteContract(false);
        setContractToDelete(null);
    };

    const handleShowDeleteContract = (contract) => () => {
        setConfirmDeleteContract(true);
        setContractToDelete(contract);
    };

    const handleSubmitContract = async (e) => {
        e.preventDefault();

        let endpoint = ENDPOINT_JOB_CONTRACTS
            .replace('{storeId}', promodiser.store_id)
            .replace('{promodiserId}', promodiser.id);

        const form = e.target;
        const formData = new FormData(form);

        let payload;
        if (!contractToEdit) {
            const startDate = formData.get('start_date');
            const endDate = formData.get('end_date');
            const rate = formData.get('rate');

            payload = {
                data: {
                    attributes: {
                        start_date: startDate,
                        end_date: endDate,
                        to_present: toPresent,
                        rate,
                    },
                },
            };
        } else {
            const remarks = formData.get('remarks');
            payload = {
                data: {
                    id: contractToEdit.id,
                    attributes: {
                        remarks,
                    }
                }
            }
        }

        endpoint = `${endpoint}${contractToEdit ? `/${contractToEdit.id}` : ''}?token=${token}`;

        try {
            await axios[contractToEdit ? 'patch' : 'post'](endpoint, payload);
            $('.form-control', form).removeClass('is-invalid');
            form.reset();
            setShowAddEditContract(false);
            setContractToEdit(null);
            fetchStorePromodiserJobContractsHistory(page);
        } catch (e) {
            console.log(e);
            const { errors } = e.response.data;
            if (errors) {
                for (const key in errors) {
                    $('[name=' + key.replace('data.attributes.', '') + ']', form)
                        .addClass('is-invalid')
                        .closest('.field')
                        .find('.invalid-feedback')
                        .text(errors[key][0].replace('data.attributes.', ''));
                }
                $(form).find('.invalid-feedback').css('display', 'block');
            }
        }
    };

    const handleUpdateContractRemarks = (contract) => () => {
        setShowAddEditContract(true);
        setContractToEdit(contract);
    };

    useEffect(() => {
        fetchStorePromodiserJobContractsHistory(page)
    }, []);

    const columns = [
        {
            name: 'Start Date',
            selector: row => row.start_date,
        },
        {
            name: 'End Date',
            selector: row => row.end_date ?? 'TO PRESENT',
        },
        {
            name: 'Rate',
            selector: row => row.rate,
        },
        {
            name: 'Remarks',
            selector: row => row.remarks,
        },
        {
            name: '',
            width: '25%',
            button: true,
            cell: row => <ButtonGroup className='m-2'>
                <Button variant='secondary' onClick={handleUpdateContractRemarks(row)}><i className='fa fa-comment' /></Button>
                <Button variant='secondary' onClick={handleShowDeleteContract(row)}><i className='fa fa-trash' /></Button>
            </ButtonGroup>,
        }
    ]
    return <>
        <Card className='my-4'>
            <Card.Header>
                <i className='fa fa-history' /> Job Contracts
            </Card.Header>
            <Card.Body>
                <DataTable
                    columns={columns}
                    data={data}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    paginationTotalRows={totalRows}
                    progressPending={isLoading}
                    pagination
                    paginationServer />
            </Card.Body>
            <Card.Footer>
                <ButtonGroup className='pull-right'>
                    <Button onClick={() => setShowAddEditContract(true)}><i className='fa fa-file' /> Add Contract</Button>
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <Offcanvas
            show={showAddEditContract}
            onHide={() => {
                setShowAddEditContract(false);
                setContractToEdit(null);
            }}
            placement='end'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title><i className='fa fa-file' /> {contractToEdit ? 'Edit' : 'Add'} Contract</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmitContract}>
                    <Card>
                        <Card.Header>
                            <h5><i className='fa fa-user' /> {promodiser.name}</h5>
                            <Badge>Contact No.: {promodiser.contact_no}</Badge>
                        </Card.Header>
                        <Card.Body>
                            {!contractToEdit && <>
                                <Form.Group className='field mb-2'>
                                    <Form.Label>Start Date:</Form.Label>
                                    <Form.Control type="date" name="start_date"></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                {!toPresent &&
                                    <Form.Group className='field mb-2'>
                                        <Form.Label>End Date:</Form.Label>
                                        <Form.Control type="date" name="end_date"></Form.Control>
                                        <div className="invalid-feedback"></div>
                                    </Form.Group>}
                                <Form.Group className='field mb-2'>
                                    <Form.Check
                                        type="checkbox"
                                        label="To present (active contract)"
                                        checked={toPresent}
                                        onClick={() => setToPresent(!toPresent)}
                                        onChange={() => { }} />
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                                <Form.Group className='field mb-2'>
                                    <Form.Label>Rate:</Form.Label>
                                    <Form.Control type="number" name="rate" step="any"></Form.Control>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                            </>}
                            {contractToEdit && <>
                                <Form.Group className='mb-2'>
                                    <Form.Label>Start Date:</Form.Label>
                                    <p>{contractToEdit.start_date}</p>
                                </Form.Group>
                                <Form.Group className='mb-2'>
                                    <Form.Label>End Date:</Form.Label>
                                    <p>{contractToEdit.end_date ?? 'TO PRESENT'}</p>
                                </Form.Group>
                                <Form.Group className='field mb-2'>
                                    <Form.Label>Remarks:</Form.Label>
                                    <Form.Control as="textarea"
                                        name="remarks"
                                        rows={2}
                                        defaultValue={contractToEdit.remarks}/>
                                    <div className="invalid-feedback"></div>
                                </Form.Group>
                            </>}
                        </Card.Body>
                        <Card.Footer>
                            <ButtonGroup className='pull-right'>
                                <Button type="submit">Submit</Button>
                            </ButtonGroup>
                        </Card.Footer>
                    </Card>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
        {confirmDeleteContract && contractToDelete && <ConfirmationModal
            title="Delete Contract"
            body={`Are you sure to delete contract from ${contractToDelete.start_date}
             to ${contractToDelete.end_date ?? 'TO PRESENT'} with a given rate of ${contractToDelete.rate}?`}
            handleClose={() => {
                setConfirmDeleteContract(false);
                setContractToDelete(null);
            }}
            handleSubmit={handleDeleteContract(contractToDelete.id)} />}
        {isDeleteContractError &&
            <ErrorToast onClose={() => setIsDeleteContractError(false)} message="Error deleting contract." />}
    </>;
};

export default StorePromodiserJobContractsHistory;
