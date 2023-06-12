import { Breadcrumb, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CommonDeleteModal from '../../CommonDeleteModal';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../../Generic/Directory';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Compensation and Benefits',
        link: '#/compensation-and-benefits'
    },
    {
        icon: '',
        label: '13th Month Pay',
    },
];

const ThirteenthMonthPayPeriods = () => {

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

        $('.table-thirteenth-month-pay-periods').DataTable({
            ajax: {
                type: 'get',
                url: `${apiBaseUrl}/thirteenth-month-pay-periods?token=${token}`,
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
            location.href = `${appBaseUrl}/#/compensation-and-benefits/thirteenth-month-pay-periods/${payPeriodId}/details`;
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
        const table = $('.data-table-wrapper').find('table.table-thirteenth-month-pay-periods').DataTable();
        const form = $(e.target);
        const data = $(form).serialize();
        const actionEndPoint = `${apiBaseUrl}/thirteenth-month-pay-periods?token=${token}`;

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
                            .closest('div')
                            .find('.invalid-feedback')
                            .text(errors[key][0]);
                    }
                }
            });
    };

    const handleCloseDeletePayPeriodModal = () => {
        setShowDeletePayPeriodModal(false);
        setPayPeriodId(null);
        setIsDeletePayPeriodError(false);
        setDeletePayPeriodErrorHeaderTitle('');
        setDeletePayPeriodErrorBodyText('');
    };

    const handleSubmitDeletePayPeriodModal = (e) => {
        e.preventDefault();

        const token = cookie.load('token');
        const table = $('.data-table-wrapper').find('table.table-thirteenth-month-pay-periods').DataTable();

        axios.delete(`${apiBaseUrl}/thirteenth-month-pay-periods/${payPeriodId}?token=${token}`)
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
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-id-card"></i> 13th Month Pay
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Card>
                                <Card.Header>New Pay Period</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmitNewPayPeriod}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>From:</Form.Label>
                                            <Form.Control type="month" name="from"></Form.Control>
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label>To:</Form.Label>
                                            <Form.Control type="month" name="to"></Form.Control>
                                            <div className="invalid-feedback"></div>
                                        </Form.Group>
                                        <hr />
                                        <Button type="submit" className="pull-right">Create</Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={9}>
                            <table className="table table-striped table-thirteenth-month-pay-periods" style={{ width: 100 + '%' }}>
                                <thead>
                                    <tr>
                                        <th scope="col">From</th>
                                        <th scope="col">To</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
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

export default ThirteenthMonthPayPeriods;
