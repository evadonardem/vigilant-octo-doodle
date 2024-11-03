import * as ReactDOM from 'react-dom/client';
import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonGroup } from 'react-bootstrap';
import cookie from 'react-cookies';
import ConfirmationModal from '../Common/Modals/ConfirmationModal';
import ErrorToast from '../Common/Toasts/ErrorToast';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import sanitize from 'sanitize-filename';
DataTable.use(DT);

const ENDPOINT = `${apiBaseUrl}/settings/stores`;

const StoresList = ({ categoryId, categoryName }) => {
    const { user: currentUser } = useSelector((state) => state.authenticate);
    const { roles, permissions } = currentUser;
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole('Super Admin');
    const allowedToDeleteStore = isSuperAdmin || hasPermission("Delete or unregister store");

    const token = cookie.load('token');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState();
    const [isDeleteStoreError, setIsDeleteStoreError] = useState(false);


    const initExportTitle = () => {
        return `Stores ${categoryName}`;
    };

    const initExportFilename = () => {
        return sanitize(initExportTitle());
    };

    const exportButtons = [
        {
            extend: 'csvHtml5',
            exportOptions: {
                columns: "thead th:not(.noExport)",
                orthogonal: 'export',
            },
            filename: initExportFilename(),
            footer: true,
        },
        {
            extend: 'pdfHtml5',
            exportOptions: {
                columns: "thead th:not(.noExport)",
                orthogonal: 'export',
            },
            filename: initExportFilename(),
            footer: true,
            orientation: 'landscape',
            pageSize: 'legal',
            title: initExportTitle(),
        }
    ];
    
    const handleClickStoreDetails = (storeId) => () => {
        location.href = `${appBaseUrl}/#/settings/stores/${storeId}/details`;
    };

    const handleConfirmDeleteStore = (store) => () => {
        setShowDeleteConfirmation(true);
        setStoreToDelete(store);
    };

    const handleDeleteStore = (storeId) => async () => {
        setLoading(true);
        try {
            await axios.delete(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`);
        } catch(_e) {
            setIsDeleteStoreError(true);
        }

        setLoading(false);
        setShowDeleteConfirmation(false);
        setStoreToDelete(null);
    };

    return <>
        {!loading && <DataTable
            ajax={{
                url: `${ENDPOINT}?all=1&category_id=${categoryId}&token=${token}`,
            }}
            className="table"
            columns={[
                { data: 'code' },
                { data: 'name' },
                { data: 'category.name' },
                { data: 'location.name' },
                { data: 'address_line' },
                { data: 'tags' },
                { 
                    data: null,
                    className: 'noExport',
                    orderable: false,
                    searchable: false
                },
            ]}
            onXhr={() => {
                setLoading(false);
            }}
            options={{
                columnDefs: [{
                    targets: 6,
                    createdCell: (td, cellData, _rowData, _row, _col) => {
                        const root = ReactDOM.createRoot(td);
                        root.render(<ButtonGroup>
                            <Button
                                variant='secondary'
                                onClick={(handleClickStoreDetails(cellData.id))}>
                                    <i className='fa fa-folder-open' />
                            </Button>
                            {allowedToDeleteStore && <Button
                                variant='secondary'
                                onClick={handleConfirmDeleteStore(cellData)}>
                                    <i className='fa fa-trash' />
                            </Button>}
                        </ButtonGroup>);
                    }
                }],
                layout: {
                    topStart: {
                        buttons: exportButtons,
                    },
                },
            }}
        >
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Address</th>
                    <th>Tags</th>
                </tr>
            </thead>
        </DataTable>}
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
