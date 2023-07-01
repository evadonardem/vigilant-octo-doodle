import { Breadcrumb, Card, Form, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import CommonDropdownSelectSingleStore from '../../CommonDropdownSelectSingleStore';
import LoadingInline from '../../Generic/LoadingInline';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cookie from 'react-cookies';
import Directory from '../../Generic/Directory';
import { useSelector } from 'react-redux';

const END_POINT = `${apiBaseUrl}/stock-cards`;

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Stock Cards',
        link: '#/stock-cards'
    },
    {
        icon: '',
        label: 'Stock Card {stockCardId}',
    },
];

let ajaxRequest;

const StockCardsShow = () => {
    const { roles, permissions } = useSelector((state) => state.authenticate.user);
    const hasRole = (name) => !!_.find(roles, (role) => role.name === name);
    const hasPermission = (name) => !!_.find(permissions, (permission) => permission.name === name);
    const isSuperAdmin = hasRole("Super Admin");
    const canUpdateStockCard = isSuperAdmin || hasPermission("Update stock card");

    const token = cookie.load('token');
    const params = useParams();
    const { stockCardId } = params;
    const stockCardTypes = [
        {
            code: 'disers_inventory',
            label: 'Diser\'s Inventory',
        },
        {
            code: 'sra_inventory',
            label: 'Sales Return and Allowances (SRA)',
        },
        {
            code: 'beginning_inventory',
            label: 'Beginning Inventory',
        },
        {
            code: 'delivered_inventory',
            label: 'Delivered',
        },
        {
            code: 'sold_inventory',
            label: 'Sold',
        },
        {
            code: 'ending_inventory',
            label: 'Ending Inventory',
        },
    ];
    const [stockCard, setStockCard] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isLoadingStockCardDetails, setIsLoadingStockCardDetails] = useState(true);

    const fetchStockCard = () => {
        axios.get(`${END_POINT}/${stockCardId}?token=${token}`)
            .then((response) => {
                const { data: stockCard } = response.data;
                setSelectedStore({
                    value: stockCard.store.id,
                    label: `${stockCard.store.code} - ${stockCard.store.name}`,
                });
                fetchStockCardDetails(stockCard);
            })
            .catch(() => { });
    };

    const fetchStockCardDetails = (currentStockCard) => {
        axios.get(`${END_POINT}/${stockCardId}/details?token=${token}`)
            .then((response) => {
                const { data: stockCardDetails } = response.data;
                let { items } = currentStockCard;

                items = items.map((item) => {
                    item.details = stockCardDetails.filter((detail) => detail.item_id == item.id);
                    return item;
                });

                setStockCard({
                    ...currentStockCard,
                    items,
                });
                setIsLoadingStockCardDetails(false);
            })
            .catch(() => { });
    };

    const handleChangeQuantity = (e) => {
        e.preventDefault();
        const element = e.currentTarget;
        const { type, itemId: item_id } = element.dataset;
        const quantity = +element.value;

        if (ajaxRequest !== undefined) {
            ajaxRequest.cancel();
        }
        ajaxRequest = axios.CancelToken.source();

        setIsLoadingStockCardDetails(true);
        axios.post(
            `${END_POINT}/${stockCard.id}/details?token=${token}`,
            {
                type,
                item_id,
                quantity,
            },
            {
                cancelToken: ajaxRequest.token,
            }
        )
            .then(() => {
                fetchStockCardDetails(stockCard);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchStockCard();
    }, []);

    const items = stockCard ? BREADCRUMB_ITEMS.map((item) => {
        item.label = item.label.replace('{stockCardId}', stockCardId);
        return item;
    }) : [];

    return (
        <>
            {stockCard &&
                <>
                    <Directory items={items} />
                    <Card className="my-4">
                        <Card.Header as="h5">
                            <i className="fa fa-file"></i> Stock Card {stockCardId}
                        </Card.Header>
                        <Card.Body>
                            <Card>
                                <Card.Header>
                                    <i className="fa fa-info-circle"></i> General Info
                                </Card.Header>
                                <Card.Body>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <CommonDropdownSelectSingleStore
                                                selectedItem={selectedStore}
                                                readOnly />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>From:</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="from"
                                                    defaultValue={stockCard.from}
                                                    readOnly />
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>To:</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="to"
                                                    defaultValue={stockCard.to}
                                                    readOnly />
                                                <div className="invalid-feedback"></div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                            <Card className="mt-4">
                                <Card.Header>
                                    <i className="fa fa-clipboard"></i> Details
                                </Card.Header>
                                <Card.Body>
                                    {stockCardTypes.map((stockCardType, key) => (
                                        <Table key={key} striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th colSpan={stockCard.items.length}>
                                                        {stockCardType.label}&nbsp;
                                                        {stockCardType.code === 'ending_inventory' && isLoadingStockCardDetails &&
                                                            <LoadingInline label="Re-calculating" />}
                                                    </th>
                                                </tr>
                                                <tr>
                                                    {stockCard.items.map((item, key) => (
                                                        <th key={key}>{item.name}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {stockCard.items.map((item, key) => {
                                                        const detail = item.details
                                                            ? item.details.find((detail) => detail.type === stockCardType.code)
                                                            : null;
                                                        let value = detail ? detail.quantity : null;
                                                        if (stockCardType.code === 'ending_inventory' && isLoadingStockCardDetails) {
                                                            value = null;
                                                        }
                                                        return <td key={key}>
                                                            <Form.Control
                                                                type="number"
                                                                data-type={stockCardType.code}
                                                                data-item-id={item.id}
                                                                defaultValue={value}
                                                                value={stockCardType.code === 'ending_inventory' ? value : null}
                                                                readOnly={stockCardType.code === 'ending_inventory' || !canUpdateStockCard}
                                                                onBlur={stockCardType.code !== 'ending_inventory' && canUpdateStockCard
                                                                    ? handleChangeQuantity
                                                                    : null} />
                                                        </td>;
                                                    })}
                                                </tr>
                                            </tbody>
                                        </Table>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </>
            }
        </>
    );
}

export default StockCardsShow;
