import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import cookie from 'react-cookies';
import DataTable from "react-data-table-component";
import { Link } from 'react-router-dom';
import StoreItemPricingHistory from './StoreItemPricingHistory';

const ENDPOINT = `${apiBaseUrl}/settings/stores`;

const StoreItemsPricing = ({ storeId }) => {
    const token = cookie.load('token');

    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [data, setData] = useState([]);

    const fetchStoreItemsPricing = async (currentPage) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}/${storeId}/items?page=${currentPage}&per_page=${perPage}&token=${token}`);
        const { data, total: totalRows } = response.data;

        setData(data);
        setTotalRows(totalRows);
        setIsLoading(false);
    };

    const handlePageChange = page => {
        fetchStoreItemsPricing(page);
        setPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setIsLoading(true);
        const response = await axios.get(`${ENDPOINT}/${storeId}/items?page=${page}&per_page=${newPerPage}&token=${token}`);
        const { data } = response.data;

        setData(data);
        setPage(page);
        setPerPage(newPerPage);
        setIsLoading(false);
    };

    const ExpandedComponent = ({ data: storeItem }) => <StoreItemPricingHistory storeItem={storeItem} />

    useEffect(() => {
        fetchStoreItemsPricing(page)
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
            name: 'Latest Effectivity Date',
            selector: row => row.latest_effectivity_date,
        },
        {
            name: 'Latest Amount',
            selector: row => row.latest_amount,
        },
    ]
    return <>
        <Card>
            <Card.Header>
                <i className='fa fa-list' /> Items Pricing
            </Card.Header>
            <Card.Body>
                <DataTable
                    columns={columns}
                    progressPending={isLoading}
                    data={data}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange} />
            </Card.Body>
            <Card.Footer>
                <ButtonGroup className='pull-right'>
                    <Link to={`/settings/stores/${storeId}/items-pricing`}>
                        <Button>
                            <i className='fa fa-refresh' /> Update Pricing
                        </Button>
                    </Link>
                </ButtonGroup>
            </Card.Footer>
        </Card>
    </>;
};

export default StoreItemsPricing;
