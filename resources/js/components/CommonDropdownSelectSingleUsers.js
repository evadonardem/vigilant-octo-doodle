import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import Select from 'react-select';

export default class CommonDropdownSelectSingleUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { filters } = self.props;

        let buildFilters = '';
        for (const prop in filters) {
            buildFilters += `&filters[${prop}]=${filters[prop]}`;
        }

        if (token) {
            axios.get(apiBaseUrl + '/biometric/users?token=' + token + buildFilters)
                .then((response) => {
                    const { data: users } = response.data;
                    const options = users.map((user) => { return { value: user.biometric_id, label: `${user.name}` } });
                    self.setState({ options });
                })
                .catch((error) => {
                    location.reload();
                });
        }
    }

    render() {
        const { label, name, handleChange, selectedUser, isMulti } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>{ label ? label : 'Select User:' }</Form.Label>
                {
                    options &&
                    <Select
                        name={name}
                        isClearable
                        isMulti={isMulti}
                        options={options}
                        value={selectedUser}
                        onChange={handleChange}/>
                }
            </Form.Group>
        );
    }
}
