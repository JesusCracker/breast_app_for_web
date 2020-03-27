import React, { Component } from 'react';

class TxtMsg extends Component {

    render() {
        let { data } = this.props;
        return (
            <span>{data}</span>
        );
    }
}

export default TxtMsg;