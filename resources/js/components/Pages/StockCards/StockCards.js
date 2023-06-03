import { Button, ButtonGroup, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CommonDeleteModal from '../../CommonDeleteModal';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';

const END_POINT = `${apiBaseUrl}/stock-cards`;
const STOCK_CARDS_TABLE = 'table-stock-cards';


const StockCards = () => {
    const token = cookie.load('token');
    const [stockCardDeleteModal, setStockCardDeleteModal] = useState({
        show: false,
        stockCardId: null,
    });

    const handleCloseDeleteStockCardModal = () => {
        setStockCardDeleteModal({
            show: false,
            stockCardId: null,
        });
    };

    const handleSubmitDeleteStockCardModal = (e) => {
        e.preventDefault();
        const table = $('.data-table-wrapper').find(`table.${STOCK_CARDS_TABLE}`).DataTable();
        axios.delete(`${END_POINT}/${stockCardDeleteModal.stockCardId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                setStockCardDeleteModal({
                    show: false,
                    stockCardId: null,
                });
            })
            .catch(() => { });
    };

    const init = () => {
        $(`.${STOCK_CARDS_TABLE}`).DataTable({
            ajax: {
                type: 'get',
                url: `${END_POINT}?token=${token}`,
                dataFilter: (data) => {
                    let json = JSON.parse(data);
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
            serverSide: true,
            columns: [
                { data: 'id' },
                {
                    data: null,
                    render: function (_data, _type, row) {
                        return row.store
                            ? `${row.store.code} - ${row.store.name}`
                            : null;
                    }
                },
                { 'data': 'from' },
                { 'data': 'to' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-stock-card-id="' + row.id + '"><i class="fa fa-file"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-stock-card-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `<div class="btn-group" role="group">
                            ${openBtn}
                            ${deleteBtn}
                        </div>`;
                    }
                }
            ],
        });

        $(document).on('click', '.data-table-wrapper .open', function (e) {
            e.preventDefault();
            const stockCardId = e.currentTarget.getAttribute('data-stock-card-id');
            location.href = `${appBaseUrl}/#/stock-cards/${stockCardId}/details`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function (e) {
            e.preventDefault();
            const stockCardId = e.currentTarget.getAttribute('data-stock-card-id');
            setStockCardDeleteModal({
                show: true,
                stockCardId,
            });
        });
    };

    useEffect(() => {
        init();
    }, []);

    return <>
        <Card className="mt-4">
            <Card.Header as="h5">
                <i className='fa fa-clipboard'></i> Stock Cards
            </Card.Header>
            <Card.Body>
                <table className={`table table-striped ${STOCK_CARDS_TABLE}`} style={{ width: 100 + '%' }}>
                    <thead>
                        <tr>
                            <th scope="col">Stock Card ID</th>
                            <th scope="col">Store</th>
                            <th scope="col">From</th>
                            <th scope="col">To</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </Card.Body>
            <Card.Footer>
                <div className="row">
                    <div className="col-md-12">
                        <ButtonGroup>
                            <Link to={'/stock-cards/create'}>
                                <Button>
                                    <i className="fa fa-file"></i> Create Stock Card
                                </Button>
                            </Link>
                        </ButtonGroup>
                    </div>
                </div>
            </Card.Footer>
        </Card>
        <CommonDeleteModal
            isShow={stockCardDeleteModal.show}
            headerTitle="Delete Stock Card"
            bodyText={`Are you sure to delete Stock Card Id: ${stockCardDeleteModal.stockCardId}?`}
            handleClose={handleCloseDeleteStockCardModal}
            handleSubmit={handleSubmitDeleteStockCardModal} />
    </>;
};

export default StockCards;
