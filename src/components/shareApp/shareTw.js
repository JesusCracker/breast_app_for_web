import React, { Component } from 'react';
import { Toast, Flex, Icon } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title';
import DownloadTips from "./downloadTips";
import axios from 'axios';
import qs from 'qs';
import $ from 'jquery'
import config from "../../config/wxconfig";
import './style.css';
import QRcode from './images/QRcode.png'

class shareTw extends Component {
    constructor(props){
        super(props);
        const { id, type } = this.props.match.params;
        this.state = {
            loading: false,
            id: id,
            type: parseInt(type),
            data: '',
            list: [],
            loginToken: localStorage.getItem('loginToken')
        }
    }

    componentDidMount(){
        this.getData();
        this.getData1();
        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
        }, 2000)
    }

    getData(){
        let { id, loginToken } = this.state;
        axios.post(config.publicUrl + 'appglandular/publishEducation.do', qs.stringify({educationId: id, type: 5}),
        {
            headers: {
                loginToken: loginToken
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.setState({
                    data: res.data.data
                })
            } else {
                Toast.info(res.data.message, 2)
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
    }

    getData1(){
        let { id, loginToken } = this.state;
        axios.post(config.publicUrl + 'appEducation/query.do', {
            page: 1,
            limit: 4,
            queryType: 7,
            queryContentType: 7,
            drOrUser: 1,
            educationType: 1,
        },
        {
            headers: {
                loginToken: loginToken
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.setState({
                    list: res.data.data
                })
            } else {
                Toast.info(res.data.message, 2)
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
    }
    fuckClick(){
        $('.downloadApp .btn').click()
    }
    render() {
        let { loading, data, list, type } = this.state;
        return (
            <DocumentTitle title="文章详情">
                <div className="wz_share_doctor">
                    { loading ? 
                        <div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={require("../../images/loading.gif")} alt="" />
                        </div>
                        : ''
                    }
                    {
                        data ?  <div className="wz_share_tw">
                                    <DownloadTips type={type} />
                                    <div className="wz_share_tw_wrap">
                                        <p className="wz_share_tw_title">{data.title}</p>
                                        <p className="wz_share_tw_time">
                                            <span>乳腺好大夫</span>
                                            <span>{moment(data.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </p>
                                        <div className="wz_share_tw_con">
                                            {
                                                data.content.map((item, index) => {
                                                    if(item.image){
                                                        return <img src={item.image} alt="" key={index} />
                                                    }else if(item.content){
                                                        return <div dangerouslySetInnerHTML={{ __html:item.content }} key={index} ></div>
                                                    }
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="wz_share_tw_tj">
                                        <div className="wz_share_tw_tj_title">相关推荐</div>
                                        <div className="wz_share_tw_tj_list">
                                            {
                                                list ? list.map((item, index) => {
                                                    return  <div className="wz_share_tw_tj_item" key={index}>
                                                                <div className="wz_share_tw_tj_item_img">
                                                                    <img src={config.publicStaticUrl + (item.image1 ? item.image1 : item.coverPic)} alt=""/>
                                                                    <p>{item.enrollNum}人报名</p>
                                                                </div>
                                                                <div className="wz_share_tw_tj_item_con">
                                                                    <p className="wz_share_tw_tj_item_con_title">{item.title}</p>
                                                                    <p className="wz_share_tw_tj_item_con_time">{item.time}</p>
                                                                    <p className="wz_share_tw_tj_item_con_type">
                                                                        {
                                                                            item.isgratis > 1 ? <span className="money">¥ {item.amout}</span> : <span>免费</span>
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div> 
                                                }): ''
                                            }
                                            
                                        </div>
                                    </div>

                                    <div className="tips">
                                        <div className="tips_btn" onClick={ this.fuckClick }>下载乳腺好大夫 APP</div>
                                        <p className="tips_title">扫码关注微信公众号</p>
                                        <img src={QRcode} alt="" />
                                        <p className="tips_txt">乳腺好大夫 & 最懂你的乳腺健康管理专家</p>
                                    </div>
                                </div> : ''
                    }
                </div>
            </DocumentTitle>
        );
    }
}

export default shareTw;