import React, { Component } from 'react';
import { Toast, Flex, Icon } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title'
import DownloadTips from "./downloadTips";
import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'
import config from "../../config/wxconfig";
import './style.css';
import img_0 from "./images/0.png";
import img_1 from "./images/1.png";
import img_2 from "./images/2.png";
import img_main from "./images/main.png";
import tuwenwenz from "./images/tuwenwenz.png";
import yueduwenzhang from "./images/yueduwenzhang.png";
import guankanzhibo from "./images/guankanzhibo.png";

class doctor extends Component {

    constructor(props){
        super(props);
        const { doctorId, type } = this.props.match.params;
        this.state = {
            loading: false,
            type: parseInt(type),
            doctorId: doctorId,
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
        let { doctorId, loginToken } = this.state;
        axios.post(config.publicUrl + 'appinquiry/doctorDetailById.do', qs.stringify({doctorId: doctorId}),
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
                <div className="wz_share_doctor">
                    { loading ? 
                        <div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={require("../../images/loading.gif")} alt="" />
                        </div>
                        : ''
                    }
                    {
                        data ? 
                    <div className="share_doctor">
                    <DownloadTips type={type} />
                        <img src={img_main} alt="" width="100%" />
                        <div className="share_doctor_user">
                            <div className="share_doctor_user_data">
                                <div className="share_doctor_user_img">
                                    <img src={config.publicStaticUrl + data.headicon} alt=""/>
                                    <p>{data.teachingTitle}</p>
                                </div>
                                <div className="share_doctor_user_text">
                                    <p>
                                        <span className="share_doctor_user_xm">{data.name}</span>
                                        <span className="share_doctor_user_zc">{data.doctorTitle}</span>
                                    </p>
                                    <p className="share_doctor_user_yy">
                                        <span>{data.hospital}</span>
                                        <span>{data.doctorDepartment}</span>
                                    </p>
                                    <p className="share_doctor_user_pj">
                                        {
                                            data.subjectiveImpression ? data.subjectiveImpression.split(',').map((item, index) => {
                                                if(index < 2){
                                                    return <span key={index}>{item}</span>
                                                }
                                            }) : ''
                                        }
                                    </p>
                                    <p className="share_doctor_user_pf">
                                        {
                                            parseInt(data.serviceEvaluate/2) > 0 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 1 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 2 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 3 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 4 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {data.serviceEvaluate}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="share_doctor_user_num">
                            <Flex>
                                <Flex.Item>
                                    <p>{data.dzNum}</p>
                                    <p>获赞</p>   
                                </Flex.Item>
                                <Flex.Item>
                                    <p>{data.fansNum  }</p>
                                    <p>粉丝</p>
                                </Flex.Item>
                                <Flex.Item>
                                    <p>{data.attentionNum }</p>
                                    <p>关注</p>
                                </Flex.Item>
                            </Flex>
                        </div>

                        <div className="share_doctor_list">
                            <Flex>
                                <Flex.Item>
                                    <p>
                                        <img src={tuwenwenz} alt=""/>
                                        <span>图文问诊</span>
                                    </p>
                                    <Icon type="right" />
                                </Flex.Item>
                            </Flex>
                            <Flex>
                                <Flex.Item>
                                <p>
                                    <img src={guankanzhibo} alt=""/>
                                    <span>观看直播</span></p>
                                    <Icon type="right" />
                                </Flex.Item>
                            </Flex>
                            <Flex>
                                <Flex.Item><p>
                                    <img src={yueduwenzhang} alt=""/>
                                    <span>阅读文章</span></p>
                                    <Icon type="right" />
                                </Flex.Item>
                            </Flex>
                        </div>

                        <div className="share_doctor_conter">
                            <p className="share_doctor_conter_title">专业擅长</p>
                            <div className="share_doctor_conter_txt" dangerouslySetInnerHTML={{ __html:data.goodAt }}></div>
                            <p className="share_doctor_conter_title">执业经历</p>
                            <div className="share_doctor_conter_txt" dangerouslySetInnerHTML={{ __html:data.introduction }}></div>
                            <p className="share_doctor_conter_title">患者评价（{data.commentNum}）</p>
                            <div className="share_doctor_conter_txt share_doctor_conter_pj">
                                <p className="share_doctor_user_pj">
                                    {
                                        data.subjectiveImpression ? data.subjectiveImpression.split(',').map((item, index) => {
                                            if(index < 2){
                                                return <span key={index} className={index === 0 ? 'marR10' : ''}>{item}</span>
                                            }
                                        }) : ''
                                    }
                                   
                                </p>
                                <p className="share_doctor_user_pf">
                                        {
                                            parseInt(data.serviceEvaluate/2) > 0 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 1 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 2 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 3 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                        {
                                            parseInt(data.serviceEvaluate/2) > 4 ? <img src={img_2} alt=""/> : <img src={img_0} alt=""/>
                                        }
                                    <span className="marR10">{data.serviceEvaluate}</span>
                                    <span>查看全部 </span>
                                    <Icon type="right" />
                                </p>
                            </div>
                        </div>


                        <div className="share_doctor_footer">
                            <div className="share_doctor_footer_txt" onClick={ this.fuckClick }>向医生提问</div>
                        </div>
                    </div> : '' }
                </div>
            </DocumentTitle>
        );
    }
}

export default doctor;