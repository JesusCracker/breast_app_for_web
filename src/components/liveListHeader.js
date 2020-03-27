import { NavBar , Icon , InputItem , Toast , WhiteSpace } from 'antd-mobile';
import React , { Component } from 'react';
import ListContainer from "./liveList";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getUserLiveList } from '../actions'
import '../css/liveListHeader.css'


class LiveListHeader extends Component {
    render() {
        const {getUserLiveList} = this.props;

        return (
            <div>

                <NavBar
                    mode="dark"
                    rightContent={[
                        <Icon key="0" type="search" style={{marginRight: '16px'}} onClick={() => getUserLiveList(this.state.keyWords)}/> ,
                    ]}>
                    <div>

                        <InputItem
                            clear
                            onChange={(value) => {
                                this.setState({keyWords: value})
                            }}
                            onVirtualKeyboardConfirm={() => getUserLiveList(this.state.keyWords)}
                            placeholder="请输入您要搜索的内容">

                            <Icon color={'#eee'} key="2" type="search"/>
                        </InputItem>
                    </div>
                </NavBar>
                <ListContainer/>
            </div>
        );
    }
}

/*
const mapStateToProps = (state) => {
    return {
        keyWords: state
    }
}
*/

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({getUserLiveList} , dispatch);
}

export default connect(null , mapDispatchToProps)(LiveListHeader);



