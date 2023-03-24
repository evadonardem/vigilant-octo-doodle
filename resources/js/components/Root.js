import React, { Component } from 'react';
import Menu from './Menu';

export default class Root extends Component {
    render() {
        return (
            <Menu signedInUser={this.props.signedInUser}/>
        );
    }
}
