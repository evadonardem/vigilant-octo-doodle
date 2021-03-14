import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import Select from 'react-select';

export default class CommonDropdownSelectSingleItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;

        if (token) {
            axios.get(apiBaseUrl + '/settings/items?token=' + token)
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
        const { label, name, handleChange, selectedItem, isMulti } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>{ label ? label : 'Item:' }</Form.Label>
                {
                    options &&
                    <Select
                        name={name}
                        isClearable
                        isMulti={isMulti}
                        options={options}
                        value={selectedItem}
                        onChange={handleChange}/>
                }
            </Form.Group>
        );
    }
}
