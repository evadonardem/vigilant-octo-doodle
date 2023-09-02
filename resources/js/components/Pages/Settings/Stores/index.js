import { Accordion, Button, ButtonGroup, Card, Form, Offcanvas } from 'react-bootstrap';
import CommonDropdownSelectSingleStoreCategory from '../../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../../CommonDropdownSelectSingleStoreLocation';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import Directory from '../../../Generic/Directory';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllStoreCategories } from '../../../../state/storeCategories';
import StoresList from '../../../Settings/StoresList';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Settings',
        link: '#/settings'
    },
    {
        icon: '',
        label: 'Stores'
    },
];

const Stores = () => {
    const dispatch = useDispatch();
    const {
        categories,
    } = useSelector((state) => state.storeCategories);

    const token = cookie.load('token');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [expandedAccordion, setExpandedAccordion] = useState(0);
    const [showAddStore, setShowAddStore] = useState(false);

    const handleSubmitNewStore = async (e) => {
        e.preventDefault();
        const form = $(e.target);
        const data = {
            code: $('[name="code"]', form).val(),
            name: $('[name="name"]', form).val(),
            category: selectedCategory,
            location: selectedLocation,
            address_line: $('[name="address_line"]', form).val(),
        };

        const actionEndPoint = `${apiBaseUrl}/settings/stores?token=${token}`;

        try {
            await axios.post(actionEndPoint, data);
            setSelectedCategory(null);
            setSelectedLocation(null);
            setShowAddStore(false);
            setExpandedAccordion(null);
            dispatch(fetchAllStoreCategories());
            $('.form-control', form).removeClass('is-invalid');
            form[0].reset();

        } catch (e) {
            const { errors } = e.response.data;
            console.log(errors)
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

    const handleStoreCategoryChange = (e) => {
        setSelectedCategory(e);
    };

    const handleStoreLocationChange = (e) => {
        setSelectedLocation(e);
    };

    const handleClickAccordionItem = (e) => {
        setExpandedAccordion(e);
    };

    useEffect(() => {
        dispatch(fetchAllStoreCategories());
    }, []);

    return <>
        <Directory items={BREADCRUMB_ITEMS} />
        <Card className="my-4">
            <Card.Header as="h5">
                <i className="fa fa-shopping-basket"></i> Stores
            </Card.Header>
            <Card.Body>
                <Accordion defaultActiveKey="0" activeKey={expandedAccordion} onSelect={handleClickAccordionItem}>
                    {categories.length && categories.map((category, i) => <Accordion.Item key={i} eventKey={i}>
                        <Accordion.Header>{category.name}</Accordion.Header>
                        <Accordion.Body>
                            {expandedAccordion === i &&
                                <StoresList categoryId={category.id} />}
                        </Accordion.Body>
                    </Accordion.Item>)}
                </Accordion>
            </Card.Body>
            <Card.Footer>
                <ButtonGroup className='pull-right'>
                    <Button onClick={() => setShowAddStore(true)}>Add New Store</Button>
                </ButtonGroup>
            </Card.Footer>
        </Card>
        <Offcanvas
            show={showAddStore}
            onHide={() => setShowAddStore(false)}
            placement='end'>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title><i className='fa fa-shopping-cart' /> Add New Store</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSubmitNewStore}>
                    <Card>
                        <Card.Body>
                            <Form.Group className='field'>
                                <Form.Label>Code:</Form.Label>
                                <Form.Control type="text" name="code"></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                            <Form.Group className='field'>
                                <Form.Label>Name:</Form.Label>
                                <Form.Control type="text" name="name"></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                            <CommonDropdownSelectSingleStoreCategory
                                name='category'
                                handleChange={handleStoreCategoryChange}
                                selectedValue={selectedCategory} />
                            <CommonDropdownSelectSingleStoreLocation
                                name='location'
                                handleChange={handleStoreLocationChange}
                                selectedValue={selectedLocation} />
                            <Form.Group className='field'>
                                <Form.Label>Address:</Form.Label>
                                <Form.Control as="textarea" name="address_line"></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer>
                            <Button type="submit" className='pull-right'>Submit</Button>
                        </Card.Footer>
                    </Card>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    </>;
};

export default Stores;
