import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import cookie from 'react-cookies';
import Select from 'react-select';

export default class CommonDropdownSelectSingleOvertimeRateTypes extends Component {
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
            axios.get(apiBaseUrl + '/settings/overtime-rate-types?token=' + token, {})
                .then((response) => {
                    const { data: overtimeRates } = response.data;
                    const options = overtimeRates.map((overtimeRate) => { return { value: overtimeRate.id, label: overtimeRate.title } });
                    self.setState({ options });
                })
                .catch((error) => {
                    location.reload();
                });
        }
    }

    render() {
        const { name, isDisabled, selectedRole, handleChange, errorMessage } = this.props;
        const { options } = this.state;

        return (
            <Form.Group>
                <Form.Label>Select Overtime Rate Type:</Form.Label>
                {
                    options &&
                    <Select
                        name={name}
                        isDisabled={isDisabled}
                        isClearable
                        options={options}
                        value={selectedRole}
                        onChange={handleChange}/>
                }
                <div className="invalid-feedback d-block">
                    { errorMessage && errorMessage }
                </div>
            </Form.Group>
        );
    }
}
