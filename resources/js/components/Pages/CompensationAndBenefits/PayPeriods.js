import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Card, Col, Form, Row } from 'react-bootstrap';
import cookie from 'react-cookies';
import CommonDeleteModal from '../../CommonDeleteModal';
import { Link } from 'react-router-dom';

const PayPeriods = () => {
    const [showDeletePayPeriodModal, setShowDeletePayPeriodModal] = useState(false);
    const [payPeriodId, setPayPeriodId] = useState(null);
    const [isDeletePayPeriodError, setIsDeletePayPeriodError] = useState(false);
    const [deletePayPeriodErrorHeaderTitle, setDeletePayPeriodErrorHeaderTitle] = useState('');
    const [deletePayPeriodErrorBodyText, setDeletePayPeriodErrorBodyText] = useState('');

    const init = () => {
        const token = cookie.load('token');
        const exportButtons = window.exportButtonsBase;
        const exportFilename = 'PayPeriods';
        const exportTitle = 'Pay Periods';
        exportButtons[0].filename = exportFilename;
        exportButtons[1].filename = exportFilename;
        exportButtons[1].title = exportTitle;

        $('.table-pay-periods').DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/pay-periods?token=${token}`,
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
            buttons: exportButtons,
            ordering: false,
            processing: true,
            serverSide: true,
            columns: [
                { 'data': 'from' },
                { 'data': 'to' },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        return `<i class="fa fa-lg fa-${row.include_deliveries_from_purchase_orders ? 'check-square-o' : 'square-o'}"></i>`;
                    }
                },
                {
                    'data': null,
                    'render': function (data, type, row) {
                        const openBtn = '<a href="#" class="open btn btn-primary" data-pay-period-id="' + row.id + '"><i class="fa fa-folder-open"></i></a>';
                        const deleteBtn = '<a href="#" class="delete btn btn-warning" data-toggle="modal" data-target="#deleteModal" data-pay-period-id="' + row.id + '"><i class="fa fa-trash"></i></a>';

                        return `<div class="btn-group">${openBtn}${deleteBtn}</div>`;
                    }
                }
            ]
        });

        $(document).on('click', '.data-table-wrapper .open', function (e) {
            e.preventDefault();
            const payPeriodId = e.currentTarget.getAttribute('data-pay-period-id');
            location.href = `${appBaseUrl}/#/compensation-and-benefits/pay-periods/${payPeriodId}/details`;
        });

        $(document).on('click', '.data-table-wrapper .delete', function (e) {
            e.preventDefault();
            const payPeriodId = e.currentTarget.getAttribute('data-pay-period-id');
            setShowDeletePayPeriodModal(true);
            setPayPeriodId(payPeriodId);
        });
    };

    const handleSubmitNewPayPeriod = (e) => {
        e.preventDefault();
        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-pay-periods').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/pay-periods?token=${token}`;

        axios.post(actionEndPoint, data)
            .then((response) => {
                table.ajax.reload(null, false);
                form[0].reset();
            })
            .catch((error) => {
                if (error.response) {
                    const { response } = error;
                    const { data } = response;
                    const { errors } = data;
                    for (const key in errors) {
                        $('[name=' + key + ']', modal)
                            .addClass('is-invalid')
                            .closest('.form-group')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
                }
            });
    }

    const handleCloseDeletePayPeriodModal = () => {
        setShowDeletePayPeriodModal(false);
        setPayPeriodId(null);
        setIsDeletePayPeriodError(false);
        setDeletePayPeriodErrorHeaderTitle('');
        setDeletePayPeriodErrorBodyText('');
    }

    const handleSubmitDeletePayPeriodModal = (e) => {
        e.preventDefault();

        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-pay-periods').DataTable();

        axios.delete(`${apiBaseUrl}/pay-periods/${payPeriodId}?token=${token}`)
            .then(() => {
                table.ajax.reload(null, false);
                setShowDeletePayPeriodModal(false);
                setPayPeriodId(null);
                setIsDeletePayPeriodError(false);
                setDeletePayPeriodErrorHeaderTitle('');
                setDeletePayPeriodErrorBodyText('');
            })
            .catch(() => {
                setIsDeletePayPeriodError(true);
                setDeletePayPeriodErrorHeaderTitle('Oh snap! Pay period cannot be deleted!');
                setDeletePayPeriodErrorBodyText(`Pay period ${payPeriodId} has active slips processed.`);
            });
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkProps={{ to: "/compensation-and-benefits" }} linkAs={Link}>
                    <i className="fa fa-gift"></i> Compensation and Benefits
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <i className="fa fa-address-card-o"></i> Pay Periods
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <div className="row">
                                <div className="col-md-3">
                                    <Card>
                                        <Card.Header>New Pay Period</Card.Header>
                                        <Card.Body>
                                            <Form onSubmit={handleSubmitNewPayPeriod}>
                                                <Form.Group>
                                                    <Form.Label>From:</Form.Label>
                                                    <Form.Control type="date" name="from"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label>To:</Form.Label>
                                                    <Form.Control type="date" name="to"></Form.Control>
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Check
                                                        type="checkbox"
                                                        defaultChecked={true}
                                                        name="include_deliveries_from_purchase_orders"
                                                        label="Include deliveries from purchase orders" />
                                                    <div className="invalid-feedback"></div>
                                                </Form.Group>
                                                <hr />
                                                <Button type="submit">Create</Button>
                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </div>
                                <div className="col-md-9">
                                    <table className="table table-striped table-pay-periods" style={{ width: 100 + '%' }}>
                                        <thead>
                                            <tr>
                                                <th scope="col">From</th>
                                                <th scope="col">To</th>
                                                <th scope="col">Include deliveries from purchase orders</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <CommonDeleteModal
                isShow={showDeletePayPeriodModal}
                headerTitle="Delete Pay Period"
                bodyText={`Are you sure to delete this pay period?`}
                handleClose={handleCloseDeletePayPeriodModal}
                handleSubmit={handleSubmitDeletePayPeriodModal}
                isDeleteError={isDeletePayPeriodError}
                deleteErrorHeaderTitle={deletePayPeriodErrorHeaderTitle}
                deleteErrorBodyText={deletePayPeriodErrorBodyText} />
        </>
    );
}

export default PayPeriods;