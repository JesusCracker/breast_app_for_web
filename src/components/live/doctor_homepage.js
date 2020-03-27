import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Toast, Grid, NavBar, Icon, Flex, PullToRefresh, ListView } from 'antd-mobile';
import {Link} from "react-router-dom";

import axios from 'axios';
import qs from 'qs';

import config from "../../config/wxconfig";

import { createHashHistory } from 'history' //返回上一页这段代码
import DocumentTitle from 'react-document-title'

const history = createHashHistory(); //返回上一页这段代码
require('./style.less');

class doctor_homepage extends Component {
    constructor(props) {
        super(props)
        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1 , row2) => row1 !== row2 ,
        });
        this.page = 0;
        this.data = [];
        const { doctorId } = this.props.match.params;
        this.state = {
            doctorId: doctorId,
            loginToken: localStorage.loginToken,
            dataSource,
            useBodyScroll: false,
            refreshing: true,
            isLoading: true,
            hasMore: true,
            limit: 9,
            status: 1,
            height: document.documentElement.clientHeight,
            doctorData: JSON.parse(localStorage.doctorData),
            count: 0
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
        this.dataList = await this.getData();
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.dataList),
            height,
            refreshing: false,
            isLoading: false
        });
    }
    
    getData () {  //请求数据的方法
        let { limit, doctorId, loginToken, count } = this.state;
        this.page++;
        let page = this.page;
        return axios.post(config.publicUrl + 'drTxLive/liveListByDoctorId.do', qs.stringify({
            page,
            limit,
            doctorId: doctorId
        }),
        {
            headers: {
                loginToken: loginToken
            }
        }).then(res => {
            if(res.data.data.length > 0){
                if(count < 1){
                    this.setState({
                        hasMore: true,
                        count: res.data.dataTotal
                    });
                }else{
                    this.setState({
                        hasMore: true
                    });
                }
               
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
    gz_fun = () => {
        let { doctorData } = this.state,
        url = config.publicUrl + 'appglandular/glandularAttention.do';
        if(doctorData.attentionIds > 0){
            url = config.publicUrl + 'appglandular/cancelGlandularAttention.do'
        } 
        axios.get(url, {
            params: {
                attentionId: doctorData.doctorId,
                type: 2,
                userType: 1
            },
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                let msg = '';
                if(doctorData.attentionIds > 0){
                    doctorData.attentionIds = 0
                    doctorData.attentionNum--
                    msg = '取消关注成功'
                }else{
                    doctorData.attentionIds = 1
                    doctorData.attentionNum++
                    msg = '关注成功'
                }
                this.setState({doctorData})
                localStorage.doctorData = JSON.stringify(doctorData)
                Toast.info(msg, 1)
            }
        })
    }

    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    goLive(data){
        // data.pushURL = data.pushURL+'.m3u8';
        // localStorage.liveData = JSON.stringify(data);
        data.status === 30 ? this.props.history.push(`/live/${data.id}`) : this.props.history.push(`/liveLookBack/${data.id}`)
    }
    render() {
        let { dataSource, doctorData, count } = this.state;
        const docHeadicon = (headicon) => {
            if(headicon){
                return headicon.indexOf('http') === 0 ? headicon : config.publicStaticUrl + headicon
            }else{
                return require('../room/img/defu_img.png')
            }
        }
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                backgroundColor: '#F5F5F9',
                height: 8,
                borderTop: '1px solid #ECECED',
                borderBottom: '1px solid #ECECED',
                }}
            />
        );
        const row = (rowData, sectionID, rowID) => {
            return (
                    <div className="doc_live_item" key={rowID} onClick={() => this.goLive(rowData)}>
                        <img src={docHeadicon(rowData.coverPic)} alt="" />
                    </div>
            );
        };

        return (
            <DocumentTitle title="医生主页">
                <div className="doc_homePage">
                    <NavBar
                        mode="light"
                        icon={<Icon type="left" />}
                        onLeftClick={this.goBackPage}
                        >{doctorData.name}创作的直播({count})</NavBar>
                    <div className="doc_user_data_warp">
                            
                        <div className="doc_user_data">
                            <img src={docHeadicon(doctorData.headicon)} alt="" />
                            <div className="doc_user_txt">
                                <p>
                                    <span className="name">{doctorData.name}</span>
                                    <span className="zc">{doctorData.doctorTitle}</span>
                                    <span className="gz">{doctorData.attentionNum}人关注</span>
                                </p>
                                <p>
                                    <span>{doctorData.hospital}</span>
                                    <span>{doctorData.doctorDepartment}</span>
                                </p>
                                {
                                    doctorData.attentionIds > 0 ? <p className="gzBtn yes_gz" onClick={this.gz_fun} >已关注</p> : <p className="gzBtn" onClick={this.gz_fun} >+ 关注</p>
                                }
                                
                            </div>
                        </div>
                        
                        <div className="doc_live_list">
                            <ListView
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
                                pageSize={9}    //每次下拉之后显示的数据条数
                            />
                        </div>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default doctor_homepage;