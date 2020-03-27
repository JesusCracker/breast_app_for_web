import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Toast,NavBar, Icon, Tabs, WhiteSpace, ListView, PullToRefresh } from 'antd-mobile';
import { StickyContainer, Sticky } from 'react-sticky';
import {Link} from "react-router-dom";

import moment from 'moment';
import axios from 'axios';
import qs from 'qs';

import config from "../../config/wxconfig";

import { createHashHistory } from 'history' //返回上一页这段代码
import DocumentTitle from 'react-document-title'

const history = createHashHistory(); //返回上一页这段代码
require('./style.less');

class notice_list extends Component {
    constructor(props){
        super(props)
        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1 , row2) => row1 !== row2 ,
        });
        this.page = 0;
        this.state = {
            dataSource,
            useBodyScroll: false,
            refreshing: true,
            isLoading: true,
            hasMore: true,
            limit: 6,
            status: 1,
            height: document.documentElement.clientHeight,
        }
    }
    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }
    
    async componentDidMount() {
        const height = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;
        this.dataList = await this.getData()
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.dataList),
            height,
            refreshing: false,
            isLoading: false
        });
	}

    goBackPage() {
		history.goBack(); //返回上一页这段代码
	} 

    getData (status = 1) {  //请求数据的方法
        let { limit } = this.state;
        this.page++;
        let page = this.page;
        return axios.post(config.publicUrl + 'drTxLive/telecastNoticeList.do', qs.stringify({
                page,
                limit,
                status
        // return axios.post(config.publicUrl + 'drLiveAdmin/doctorList.do', qs.stringify({
        //         page,
        //         limit,
        //         status: 2,
        //         timeType:1
        })).then(res => {
            if(res.data.data > 0){
                this.setState({
                    hasMore: true
                });
            }else{
                this.setState({
                    hasMore: false
                });
            }
            return res.data.data
        }).catch(err => {
            console.log('数据请求错误：' + err)
        })
    }

    async changeStatus(status) {
        this.setState({status});
        this.page = 0; //定义分页信息
        this.dataList = await this.getData(status);

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.dataList) ,
            refreshing: false,
            isLoading: false
        });

    }

     onRefresh = async () => {
        const {status} = this.state;
        this.page = 0;
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }  
        this.setState({isLoading: true});
        this.dataList = [ ...(await this.getData(status)) ];  
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.dataList),
            isLoading: false
        });
    };

    onEndReached = async () => {
        const {status} = this.state;
       
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }  
        this.setState({isLoading: true});
        this.dataList = [ ...this.dataList , ...(await this.getData(status)) ]; 
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.dataList),
            isLoading: false
        });
    };
    isStatus(status){
        if(status === 1) return <img className="imgs_1" src={require('./img/1.gif')} alt="" /> 
        if(status === 2) return <img className="imgs_2" src={require('./img/2.png')} alt="" /> 
        if(status === 3) return <img className="imgs_3" src={require('./img/3.png')} alt="" /> 
    }
    render() {
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                // backgroundColor: '#F5F5F9',
                // height: 8,
                // borderTop: '1px solid #ECECED',
                // borderBottom: '1px solid #ECECED',
                }}
            />
        );
        const row = (rowData, sectionID, rowID) => {
            return (
                <Link to={"noticeDetails/"+rowData.id}>
                    <div key={rowID} className="items">
                        <div className="left">
                            <p className="title">{rowData.title}</p>
                            <p className="time">直播时间：{moment(rowData.createDate).format('MM月DD日 HH:mm')}</p>
                        </div>
                        <div className="img">
                            {this.isStatus(rowData.status)}
                            <img className="imgs" src={config.publicStaticUrl + rowData.coverPic} alt="" />
                        </div>
                    </div>
                </Link>
            );
        };

        function renderTabBar(props) {
            return (<Sticky>
                        {({ style }) => <div style={{ ...style, zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
                    </Sticky>);
        }
        const tabs = [
            { title: '即将开播', key: 't1', status: 1 },
            { title: '等待开播', key: 't2', status: 2 },
            { title: '历史直播', key: 't3', status: 3 },
        ];
        
        
        return (
            <DocumentTitle title="直播公告">
                <div className="notice_list">
                    <NavBar
                        mode="light"
                        icon={<Icon type="left" />}
                        onLeftClick={this.goBackPage}
                        >直播公告</NavBar>
                    
                    <div>
                        <WhiteSpace />
                        <StickyContainer>
                        <Tabs tabs={tabs}
                            initialPage={'t1'}
                            onTabClick={data => this.changeStatus(data.status)}
                            renderTabBar={renderTabBar}
                            tabBarActiveTextColor="#fff"
                            tabBarInactiveTextColor="rgba(250,250,250,.6)"
                            tabBarTextStyle={{
                                fontSize: '15px',
                                lineHeight: '21px'
                            }}
                        >
                        </Tabs>
                        </StickyContainer>
                        <WhiteSpace />
                    </div>

                    <ListView
                        className="lists"
                        renderSeparator={separator}
                        key={this.state.useBodyScroll ? '0' : '1'}
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}
                        renderRow={row}   //渲染上边写好的那个row
                        useBodyScroll={this.state.useBodyScroll}
                        style={this.state.useBodyScroll ? {} : {
                            height: this.state.height ,
                            margin: '0px 0' ,
                        }}
                        pullToRefresh={<PullToRefresh
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                        />}
                        onEndReachedThreshold={20}
                        onEndReached={this.onEndReached}
                        pageSize={6}    //每次下拉之后显示的数据条数
                    />
                </div>
            </DocumentTitle>
        );
    }
}

export default notice_list;