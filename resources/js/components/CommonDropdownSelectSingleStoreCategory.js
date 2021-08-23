import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import CreatableSelect from 'react-select/creatable';

export default class CommonDropdownSelectSingleStoreCategory extends Component {
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
            axios.get(`${apiBaseUrl}/settings/store-categories?token=${token}`)
                .then((response) => {
                    const { data: categories } = response.data;
                    const options = categories.map((category) => { return { value: category.id, label: `${category.name}` } });
                    self.setState({ options });
                })
                .catch((error) => {
                    location.reload();
                });
        }
    }

    render() {
        const { label, name, handleChange, handleInputChange, selectedValue, isMulti, readOnly } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>{ label ? label : 'Category:' }</Form.Label>
                <CreatableSelect
                    name={name}
                    isClearable
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    value={selectedValue}
                    options={options}
                    isMulti={isMulti}                    
                    isDisabled={readOnly}/>
                <div className="invalid-feedback"></div>
            </Form.Group>
        );
    }
}
