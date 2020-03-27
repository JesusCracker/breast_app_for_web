import React, { Component } from 'react';
import { Toast, Grid, NavBar, Icon } from 'antd-mobile';
import {Link} from "react-router-dom";

import axios from 'axios';
import qs from 'qs';

import config from "../../config/wxconfig";

import { createHashHistory } from 'history' //返回上一页这段代码
import DocumentTitle from 'react-document-title'
import moment from 'moment';

const history = createHashHistory(); //返回上一页这段代码
require('./style.less');
class notice_details extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }
    async componentDidMount(){
        let data = await this.getData();
        localStorage.doctorData = JSON.stringify(data)
        this.setState({data})
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    getData(){
        return axios.post(config.publicUrl + 'txLive/liveNoticeDetail.do', qs.stringify({
            id: this.props.match.params.id
        }),{
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            return res.data.data
        }).catch(err => {
            console.log('公告详情获取失败，' + err)
        })
    }
    gz_fun = () => {
        let { data } = this.state,
        url = config.publicUrl + 'appglandular/glandularAttention.do';
        if(data.attentionIds > 0){
            url = config.publicUrl + 'appglandular/cancelGlandularAttention.do'
        } 
        axios.get(url, {
            params: {
                attentionId: data.doctorId,
                type: 2,
                userType: 1
            },
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                let msg = '';
                if(data.attentionIds > 0){
                    data.attentionIds = 0
                    data.attentionNum--
                    msg = '取消关注成功'
                }else{
                    data.attentionIds = 1
                    data.attentionNum++
                    msg = '关注成功'
                }
                this.setState({data})
                localStorage.doctorData = JSON.stringify(data)
                Toast.info(msg, 1)
            }
        })
    }

    render() {
        let {data}=this.state;
        const docHeadicon = (headicon) => {
            if(headicon){
                return headicon.indexOf('http') === 0 ? headicon : config.publicStaticUrl + headicon
            }else{
                return require('../room/img/defu_img.png')
            }
        }
        return (
             <DocumentTitle title="直播公告">
                <div className="notice_details">
                    <NavBar
                        mode="light"
                        icon={<Icon type="left" />}
                        onLeftClick={this.goBackPage}
                        >直播公告</NavBar>
                    <div className="notice_details_con">
                        <div className="top">
                            <p className="title">{data.title}</p>
                            <p>
                                <span className="time">{moment(data.startingTime).format('YYYY/MM/DD hh:mm(ddd)')}</span>
                                {
                                    data.isgratis === 2 ? <span className="money">¥ {data.amout}</span> : <span className="mianfei">免费</span>
                                }
                            </p>
                        </div>
                        <div className="middle">
                            <div className="docUser">
                                <div className="imgWarp">
                                    <img src={docHeadicon(data.headicon)} alt="" />
                                    <p alt={data.doctorTitle}>{data.doctorTitle}</p>
                                </div>
                                <div className="docUser_data">
                                    <p>
                                        <span className="name">{data.name}</span>
                                        <span>{data.attentionNum}人关注</span>
                                    </p>
                                    <p>
                                        <span>{data.hospital}</span>
                                        <span>{data.doctorDepartment}</span>
                                    </p>
                                </div>
                            </div>
                            {
                                data.attentionIds > 0 ? <div className="gz" onClick={this.gz_fun}>已关注</div> : <div className="no_gz" onClick={this.gz_fun} >未关注</div>
                            }
                            
                        </div>
                        <div className="zbjj">
                            <p className="title">直播简介</p>
                            <div className="zbjj_con">
                                {
                                    data.summary ? <img src={config.publicStaticUrl + data.summary} alt="" /> : <p className="no_summary">暂无直播简介</p>
                                }
                                
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <Link to={"/doctorHomePage/"+data.doctorId}>主播全部作品</Link>
                    </div>

                </div>
            </DocumentTitle>
        );
    }
}

export default notice_details;