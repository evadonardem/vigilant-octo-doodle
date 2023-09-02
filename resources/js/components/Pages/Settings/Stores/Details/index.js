import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import { v4 as uuidv4 } from 'uuid';
import { Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'
import CommonDropdownSelectSingleStoreCategory from '../../../../CommonDropdownSelectSingleStoreCategory';
import CommonDropdownSelectSingleStoreLocation from '../../../../CommonDropdownSelectSingleStoreLocation';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStore } from '../../../../../state/settings/store';
import Directory from '../../../../Generic/Directory';
import StorePromodisers from '../../../../Settings/StorePromodisers';
import StoreItemsPricing from '../../../../Settings/StoreItemsPricing';

const END_POINT = `${apiBaseUrl}/settings/stores`;

const StoreDetails = () => {
    const dispatch = useDispatch();
    const token = cookie.load('token');
    const store = useSelector((state) => state.store);
    const params = useParams();
    const { storeId } = params;

    const [tags, setTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [updateStoreDetails, setUpdateStoreDetails] = useState(false);
    const [cancelledUpdateStoreDetails, setCancelledUpdateStoreDetails] = useState(false);

    const BREADCRUMB_ITEMS = [
        {
            icon: 'fa-dashboard',
            label: '',
            link: '#/dashboard',
        },
        {
            icon: '',
            label: 'Settings',
            link: '#/settings',
        },
        {
            icon: '',
            label: 'Stores',
            link: '#/settings/stores',
        },
        {
            icon: '',
            label: '{storeCode}',
        },
    ];

    let currentCategory = null;
    let currentLocation = null;
    let breadcrumbItems = BREADCRUMB_ITEMS;
    if (!store.isLoading) {
        currentCategory = store.category ? {
            value: store.category.id,
            label: store.category.name,
        } : null;
        currentLocation = store.location ? {
            value: store.location.id,
            label: store.location.name,
        } : null;

        breadcrumbItems = breadcrumbItems.map((item) => {
            item.label = item.label.replace('{storeCode}', store.code);
            return item;
        });
    }

    const handleToggleUpdateDetails = () => {
        setCancelledUpdateStoreDetails(false);
        setUpdateStoreDetails(true);

        setSelectedCategory(currentCategory);
        setSelectedLocation(currentLocation);
        setTags(store.tags ?? []);
    };

    const handleCancelUpdateDetails = () => {
        setCancelledUpdateStoreDetails(true);
        setUpdateStoreDetails(false);
    };

    const handleSubmitUpdateDetails = async (e) => {
        e.preventDefault();
        const form = $(e.target);
        const data = {
            code: $('[name="code"]', form).val(),
            name: $('[name="name"]', form).val(),
            category: selectedCategory,
            location: selectedLocation,
            address_line: $('[name="address_line"]', form).val(),
            tags: tags,
        };

        try {
            await axios.patch(`${END_POINT}/${store.id}?token=${token}`, data);
            setUpdateStoreDetails(false);
            dispatch(getStore(store.id));
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

    const handleStoreCategoryChange = (e) => {
        setSelectedCategory(e);
    };

    const handleStoreLocationChange = (e) => {
        setSelectedLocation(e);
    };

    const handleChangeTags = (tags) => {
        const updatedTags = tags.map((tag) => tag.toUpperCase());
        setTags(updatedTags);
    };

    useEffect(() => {
        dispatch(getStore(storeId));
    }, []);

    return <>
        {!store.isLoading && <Directory items={BREADCRUMB_ITEMS}/>}
        {!store.isLoading && <Form
            key={cancelledUpdateStoreDetails ? uuidv4() : store.id}
            onSubmit={handleSubmitUpdateDetails}>
            <Card className='my-4'>
                <Card.Header>General Details</Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-2">
                            <Form.Group className='field mb-2'>
                                <Form.Label>Code:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    defaultValue={store.code}
                                    readOnly={!updateStoreDetails}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group className='field mb-2'>
                                <Form.Label>Name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    defaultValue={store.name}
                                    readOnly={!updateStoreDetails}></Form.Control>
                                <div className="invalid-feedback"></div>
                            </Form.Group>
                        </div>
                        <div className="col-md-3 field">
                            <CommonDropdownSelectSingleStoreCategory
                                name='category'
                                readOnly={!updateStoreDetails}
                                handleChange={handleStoreCategoryChange}
                                selectedValue={updateStoreDetails ? selectedCategory : currentCategory} />
                        </div>
                        <div className="col-md-3 field">
                            <CommonDropdownSelectSingleStoreLocation
                                name='location'
                                readOnly={!updateStoreDetails}
                                handleChange={handleStoreLocationChange}
                                selectedValue={updateStoreDetails ? selectedLocation : currentLocation} />
                        </div>
                    </div>
                    <Form.Group className='field mb-2'>
                        <Form.Label>Address:</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_line"
                            defaultValue={store.address_line}
                            readOnly={!updateStoreDetails}></Form.Control>
                        <div className="invalid-feedback"></div>
                    </Form.Group>
                    <Form.Group className='field mb-2'>
                        <Form.Label>Tags:</Form.Label>
                        <TagsInput
                            value={updateStoreDetails ? tags : store.tags ?? []}
                            onChange={handleChangeTags}
                            onlyUnique
                            disabled={!updateStoreDetails} />
                        <div className="invalid-feedback"></div>
                    </Form.Group>
                </Card.Body>
                <Card.Footer>
                    {updateStoreDetails
                        ? <ButtonGroup className="pull-right">
                            <Button
                                type="submit"
                                variant="primary">Save</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCancelUpdateDetails}>Cancel</Button>
                        </ButtonGroup>
                        : <Button
                            type="button"
                            className="pull-right"
                            onClick={handleToggleUpdateDetails}>Update Details</Button>}
                </Card.Footer>
            </Card>
        </Form>}

        {!store.isLoading && <Row>
            <Col md={6}>
                <StorePromodisers storeId={store.id}/>
            </Col>
            <Col md={6}>
                <StoreItemsPricing storeId={store.id}/>
            </Col>
        </Row>}
    </>;
}

export default StoreDetails;
