import React, {Component} from 'react';
import noContentImg from "../images/no_content.png";

class NoContent extends Component {
    render() {
        const {inner}=this.props;
        return (
            <div style={{dispaly: 'flex', textAlign: 'center'}}><img
                src={noContentImg} style={{width: '100%'}}/><span>{inner}</span>
            </div>
        );
    }
}

export default NoContent;