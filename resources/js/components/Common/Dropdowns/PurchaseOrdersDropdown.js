import axios from "axios";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import cookie from "react-cookies";
import ReactSelect from "react-select";

const ENDPOINT = `${apiBaseUrl}/dropdown/purchase-orders`;

const PurchaseOrdersDropdown = ({
    categoryId,
    handleChange,
    isMulti,
    label,
    purchaseOrderStatusId,
    readOnly,
    selectedItem,
    storeId,
} = props) => {
    const token = cookie.load('token');

    const [options, setOptions] = useState(null);

    const init = async (filterPurchaseOrderStatusId, filterStoreId, filterCategoryId) => {
        let filters = [];
        if (filterPurchaseOrderStatusId) {
            filters.push(`filters[purchase_order_status_id]=${filterPurchaseOrderStatusId}`);
        }
        if (filterStoreId) {
            filters.push(`filters[store_id]=${filterStoreId}`);
        }
        if (!isNaN(filterCategoryId)) {
            filters.push(`filters[category_id]=${filterCategoryId}`);
        }
        filters = filters.join('&');
        const response = await axios.get(`${ENDPOINT}?token=${token}${filters ? `&${filters}` : ''}`);
        const { data: options } = response.data;
        setOptions(options);
    };

    useEffect(() => {
        init(purchaseOrderStatusId, storeId, categoryId);
    }, [purchaseOrderStatusId, storeId, categoryId]);

    return <>
        <Form.Group className='mb-2 field'>
            <Form.Label>{label ? label : 'Purchase Orders:'}</Form.Label>
            {
                options &&
                <ReactSelect
                    isClearable
                    isMulti={isMulti}
                    options={options}
                    value={selectedItem}
                    onChange={handleChange}
                    isDisabled={readOnly} />
            }
        </Form.Group>
    </>;
};

export default PurchaseOrdersDropdown;
