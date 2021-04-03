import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import CreatableSelect from 'react-select/creatable';

export default class CommonDropdownSelectSingleExpenseCode extends Component {
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
            axios.get(apiBaseUrl + '/purchase-order-expense-types?token=' + token)
                .then((response) => {
                    const { data: items } = response.data;
                    const options = items.map((item) => { return { value: item.name, label: `${item.name}` } });
                    self.setState({ options });
                })
                .catch((error) => {
                    location.reload();
                });
        }
    }

    render() {
        const { label, name, handleChange, handleInputChange } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>{ label ? label : 'Expense Code:' }</Form.Label>
                <CreatableSelect
                    name={name}
                    isClearable
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    options={options}/>
            </Form.Group>
        );
    }
}
