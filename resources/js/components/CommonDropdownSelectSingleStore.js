import { isNaN } from 'lodash';
import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import Select from 'react-select';

export default class CommonDropdownSelectSingleStore extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { categoryId: category_id } = self.props;

        if (token) {
            axios.get(apiBaseUrl + '/settings/stores?all=1' +
            (category_id !== undefined ? ('&category_id=' + category_id) : '') + '&token=' + token)
                .then((response) => {
                    const { data: items } = response.data;
                    const options = items.map((item) => { return { value: item.id, label: `${item.code} - ${item.name}` } });
                    self.setState({ options });
                })
                .catch((error) => {
                    location.reload();
                });
        }
    }

    render() {
        const { label, name, handleChange, selectedItem, isMulti, readOnly } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>{ label ? label : 'Store:' }</Form.Label>
                {
                    options &&
                    <Select
                        name={name}
                        isClearable
                        isMulti={isMulti}
                        options={options}
                        value={selectedItem}
                        onChange={handleChange}
                        isDisabled={readOnly}/>
                }
            </Form.Group>
        );
    }
}
