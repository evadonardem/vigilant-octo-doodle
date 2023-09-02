import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import ConfirmationModal from '../Common/Modals/ConfirmationModal';
import ErrorToast from '../Common/Toasts/ErrorToast';

const ENDPOINT = `${apiBaseUrl}/settings/stores`;

const StoresList = ({ categoryId }) => {
    const token = cookie.load('token');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState();
    const [isDeleteStoreError, setIsDeleteStoreError] = useState(false);
    const [data, setData] = useState([]);

    const fetchStores = async () => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}?all=1&category_id=${categoryId}&token=${token}`);
        const { data } = response.data;

        setData(data);
        setIsLoading(false);
    };

    const handleClickStoreDetails = (storeId) => () => {
        location.href = `${appBaseUrl}/#/settings/stores/${storeId}/details`;
    };

    const handleConfirmDeleteStore = (store) => () => {
        setShowDeleteConfirmation(true);
        setStoreToDelete(store);
    };

    const handleDeleteStore = (storeId) => async () => {
        try {
            await axios.delete(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`);
            fetchStores();
        } catch(_e) {
            setIsDeleteStoreError(true);
        }
        setShowDeleteConfirmation(false);
        setStoreToDelete(null);
    };

    useEffect(() => {
        fetchStores()
    }, []);

    const columns = [
        {
            name: 'Code',
            selector: row => row.code,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Category',
            selector: row => row.category?.name,
            sortable: true,
        },
        {
            name: 'Address',
            selector: row => row.address_line,
        },
        {
            name: 'Tags',
            selector: row => row.tags,
        },
        {
            name: '',
            button: true,
            cell: row => (
                <ButtonGroup className='my-2'>
                    <Button variant='secondary' onClick={handleClickStoreDetails(row.id)}><i className='fa fa-folder-open' /></Button>
                    <Button variant='secondary' onClick={handleConfirmDeleteStore(row)}><i className='fa fa-trash' /></Button>
                </ButtonGroup>
            ),
        }
    ]
    return <>
        <DataTable
            columns={columns}
            progressPending={isLoading}
            data={data}
            dense
            pagination />
        {showDeleteConfirmation && storeToDelete && <ConfirmationModal
            title="Delete Store"
            body={`Are you sure to delete ${storeToDelete.code} ${storeToDelete.name}?`}
            handleClose={() => {
                setShowDeleteConfirmation(false);
                setStoreToDelete(null);
            }}
            handleSubmit={handleDeleteStore(storeToDelete.id)}/>}
        {isDeleteStoreError && <ErrorToast onClose={() => setIsDeleteStoreError(false)} message="Error"/>}
    </>;
};

export default StoresList;
