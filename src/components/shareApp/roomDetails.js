import React, { Component } from 'react';
import { Toast, Flex, Icon } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title';
import DownloadTips from './downloadTips';
import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'
import config from "../../config/wxconfig";
import QRcode from "./images/QRcode.png";
class roomDetails extends Component {
    constructor(props){
        super(props);

        let { id, type } = this.props.match.params;
        this.state = {
            id: id,
            type: parseInt(type),
            loading: false,
            data: '',
            loginToken: localStorage.getItem('loginToken')
        }
    }

    componentDidMount(){
        this.getData();

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
        axios.post(config.publicUrl + 'liveTelecast/liveTelecastDetail.do', qs.stringify({id: id}),
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

    fuckClick(){
        $('.downloadApp .btn').click()
    }

    render() {
        let { loading, data, type } = this.state;
        return (
            <DocumentTitle title="乳腺好大夫">
                <div className="wz_share_room">
                    { loading ? 
                        <div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={require("../../images/loading.gif")} alt="" />
                        </div>
                        : ''
                    }
                    {
                        data ? 
                    <div className="share_room">
                        <DownloadTips type={type}/>
                        <div className="share_room_top">
                            <img src={config.publicStaticUrl + data.coverPic} alt=""/>
                            <p className="share_room_bm">{data.enrollNum}人报名  </p>
                            <p className="share_room_title">{data.title}</p>
                            <p className="share_room_time">
                                <span>{moment(data.createDate).format('YYYY/MM/DD HH:mm dddd')}</span>
                                <span>{data.isgratis > 1 ? data.fee : '免费'}</span>
                            </p>
                        </div>

                        <div className="share_room_doctor">
                            <div className="share_room_doctor_left">
                                <div className="share_room_doctor_img">
                                    <img src={config.publicStaticUrl + data.headicon} alt=""/>
                                    <p>{data.doctorTitle}</p>
                                </div>
                                <div className="share_room_doctor_data">
                                    <p>
                                        <span>{data.name}</span>
                                        <span>{data.attentionNum}人关注</span>
                                    </p>
                                    <p>{data.hospital} {data.doctorDepartment}</p>
                                </div>
                            </div>

                            <div className="share_room_doctor_gz">
                                <span>关注</span>
                            </div>
                        </div>
                        <div className="share_room_jj">
                            <div className="share_room_jj_title">课程简介</div>
                            <div className="share_room_jj_txt">
                               { 
                                    data.contentList.map((item, index) => {
                                        return  <div key={index}>
                                                    {item.content}
                                                    {item.title}
                                                    <img src={item.image} alt=""/>
                                                </div>
                                    })
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

export default roomDetails;