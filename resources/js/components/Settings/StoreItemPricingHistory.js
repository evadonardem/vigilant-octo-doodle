import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";

const ENDPOINT = `${apiBaseUrl}/settings/stores`;

const StoreItemPricingHistory = ({ storeItem }) => {
    const token = cookie.load('token');

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [data, setData] = useState([]);

    const fetchStoreItemPricingHistory = async (currentPage) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}/${storeItem.store_id}/items/${storeItem.id}?page=${currentPage}&per_page=${perPage}&token=${token}`);
        const { data, total: totalRows } = response.data;

        setData(data);
        setTotalRows(totalRows);
        setIsLoading(false);
    };

    const handlePageChange = page => {
		fetchStoreItemPricingHistory(page);
        setPage(page);
	};

    const handlePerRowsChange = async (newPerPage, page) => {
		setIsLoading(true);
		const response = await axios.get(`${ENDPOINT}/${storeItem.store_id}/items/${storeItem.id}?page=${page}&per_page=${newPerPage}&token=${token}`);
        const { data } = response.data;

        setData(data);
        setPage(page);
        setPerPage(newPerPage);
        setIsLoading(false);
	};

    useEffect(() => {
        fetchStoreItemPricingHistory(page)
    }, []);

    const columns = [
        {
            name: 'Effectivity Date',
            selector: row => row.effectivity_date,
        },
        {
            name: 'Amount',
            selector: row => row.amount,
        },
    ]
    return <>
        <Card className='my-4'>
            <Card.Header>
                <i className='fa fa-history'/> Item Pricing History
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
                    paginationServer/>
            </Card.Body>
        </Card>
    </>;
};

export default StoreItemPricingHistory;
