import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup, Card, Form, Offcanvas } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import ConfirmationModal from '../Common/Modals/ConfirmationModal';
import ErrorToast from '../Common/Toasts/ErrorToast';
import StorePromodiserJobContractsHistory from './StorePromodiserJobContractsHistory';

const ENDPOINT = `${apiBaseUrl}/settings/stores`;

const StorePromodisers = ({ storeId }) => {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');

    // store promodiser permissions
    const allowedToCreatePromodiser = isSuperAdmin || hasPermission("Create or register new store promodiser");
    const allowedToUpdatePromodiser = isSuperAdmin || hasPermission("Update existing store promodiser");
    const allowedToDeletePromodiser = isSuperAdmin || hasPermission("Delete or unregister store promodiser");
    const allowedToViewPromodiser = isSuperAdmin || hasPermission("View registered store promodiser");

    const token = cookie.load('token');    

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [showAddEditPromodiser, setShowAddEditPromodiser] = useState(false);
    const [editPromodiser, setEditPromodiser] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [promodiserToDelete, setPromodiserToDelete] = useState();
    const [isDeletePromodiserError, setIsDeletePromodiserError] = useState(false);
    const [data, setData] = useState([]);

    const fetchPromodisers = async (currentPage) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}/${storeId}/promodisers?page=${currentPage ?? 1}&per_page=${perPage}&token=${token}`);
        const { data, total: totalRows } = response.data;

        setData(data);
        setTotalRows(totalRows);
        setIsLoading(false);
    };

    const handlePageChange = page => {
		fetchPromodisers(page);
        setPage(page);
	};

    const handlePerRowsChange = async (newPerPage, page) => {
		setIsLoading(true);
		const response = await axios.get(`${ENDPOINT}/${storeId}/promodisers?page=${page ?? 1}&per_page=${newPerPage}&token=${token}`);
        const { data } = response.data;

        setData(data);
        setPage(page);
        setPerPage(newPerPage);
        setIsLoading(false);
	};

    const handleSubmitPromodiser = async (e) => {
        e.preventDefault();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint =
            `${apiBaseUrl}/settings/stores/${storeId}/promodisers${editPromodiser ? `/${editPromodiser.id}` : ''}?token=${token}`;

        try {
            await axios[editPromodiser ? 'patch' : 'post'](actionEndPoint, data);
            $('.form-control', form).removeClass('is-invalid');
            form[0].reset();
            setShowAddEditPromodiser(false);
            setEditPromodiser(null);
            fetchPromodisers(page);
        } catch (e) {
            const { errors } = e.response.data;
            if (errors) {
                for (const key in errors) {
                    $('[name=' + key + ']', form)
                        .addClass('is-invalid')
                        .closest('.field')
                        .find('.invalid-feedback')
                        .text(errors[key][0]);
                }
                $(form).find('.invalid-feedback').css('display', 'block');
            }
        }
    };

    const handleEditPromodiser = (promodiser) => () => {
        setEditPromodiser(promodiser);
        setShowAddEditPromodiser(true);
    };

    const handleConfirmDeletePromodiser = (promodiser) => () => {
        setShowDeleteConfirmation(true);
        setPromodiserToDelete(promodiser);
    };

    const handleDeletePromodiser = (promodiserId) => async () => {
        try {
            await axios.delete(`${apiBaseUrl}/settings/stores/${storeId}/promodisers/${promodiserId}?token=${token}`);
            fetchPromodisers(page);
        } catch (_e) {
            setIsDeletePromodiserError(true);
        }
        setShowDeleteConfirmation(false);
        setPromodiserToDelete(null);
    };

    const ExpandedComponent = ({ data: promodiser }) => <div className='mx-4'>
        <StorePromodiserJobContractsHistory promodiser={promodiser}/>
    </div>;

    useEffect(() => {
        fetchPromodisers()
    }, []);

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Contact No.',
            selector: row => row.contact_no,
            sortable: true,
        },
        {
            name: '',
            width: '25%',
            button: true,
            cell: row => <ButtonGroup className='m-2'>
                {allowedToUpdatePromodiser &&
                    <Button variant='secondary' onClick={handleEditPromodiser(row)}><i className='fa fa-edit'/></Button>}
                {allowedToDeletePromodiser &&
                    <Button variant='secondary' onClick={handleConfirmDeletePromodiser(row)}><i className='fa fa-trash'/></Button>}
            </ButtonGroup>,
        }
    ]
    return <>
        <Card>
            <Card.Header>
                <i className='fa fa-users'/> Promodisers
            </Card.Header>
            <Card.Body>
                <DataTable
                    columns={columns}
                    progressPending={isLoading}
                    data={data}
                    dense
                    expandableRows={allowedToViewPromodiser}
                    expandableRowsComponent={ExpandedComponent}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}/>
            </Card.Body>
            {allowedToCreatePromodiser && <Card.Footer>
                <ButtonGroup className='pull-right'>
                    <Button onClick={() => setShowAddEditPromodiser(true)}>
                        <i className='fa fa-user-plus'/> Add Promodiser
                    </Button>
                </ButtonGroup>
            </Card.Footer>}
        </Card>
        <Offcanvas
            show={showAddEditPromodiser}
            onHide={() => {
                setShowAddEditPromodiser(false);
                setEditPromodiser(null);
            }}
            placement='end'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title><i className='fa fa-user-plus' /> {editPromodiser ? 'Edit' : 'Add'} Promodiser</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmitPromodiser}>
                    <Card>
                        <Card.Body>
                            <Form.Group className='field mb-2'>
                                <Form.Label>Name:</Form.Label>
                                <Form.Control type="text" name="name" defaultValue={editPromodiser?.name}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                            <Form.Group className='field mb-2'>
                                <Form.Label>Contact No:</Form.Label>
                                <Form.Control type="text" name="contact_no" defaultValue={editPromodiser?.contact_no}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
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
        {showDeleteConfirmation && promodiserToDelete && <ConfirmationModal
            title="Delete Promodiser"
            body={`Are you sure to delete ${promodiserToDelete.name}?`}
            handleClose={() => {
                setShowDeleteConfirmation(false);
                setPromodiserToDelete(null);
            }}
            handleSubmit={handleDeletePromodiser(promodiserToDelete.id)} />}
        {isDeletePromodiserError && <ErrorToast onClose={() => setIsDeletePromodiserError(false)} message="Error" />}
    </>;
};

export default StorePromodisers;
