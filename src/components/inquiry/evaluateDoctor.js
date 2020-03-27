import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import DocumentTitle from 'react-document-title'

import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'

import config from "../../config/wxconfig";
import imgUrl from './images'
import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class evaluateDoctor extends Component {
    constructor(props) {
        super(props);

        let { doctorId, patientId, questionnaireId } = this.props.match.params;
        this.state = {
            loading: false,
            doctorId: doctorId,
            patientId: patientId,
            questionnaireId: questionnaireId,
            doctorData: {},
            loginToken: localStorage.getItem('loginToken'),
            headicon: localStorage.getItem('headicon'),
            aList: ['认真','耐心','热情','描述清晰','建议有效','诊断准确'],
            bList: ['非常慢','较慢','一般','较快','非常快'],
            cList: ['非常差','较差','一般','较好','非常好'],
            dList: ['拒绝推荐','考虑','一般','推荐','强烈推荐'],
            eList: [1,2,3,4,5],
            subjectiveImpression: '',
            description: '',
            serviceEvaluate: '',
            recoverySpeed: '',
            serviceTtitude: '',
            inquiryQuality: '',
            serviceType: 1,
        }
    }
    componentDidMount() {
        this.getDoctorData();
        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
		}, 2000)
    }
    getDoctorData() {
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
                        doctorData: res.data.data
                    })
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    submit = () => {
        let { doctorId, patientId, questionnaireId, loginToken, subjectiveImpression, description, serviceEvaluate, recoverySpeed, serviceTtitude, inquiryQuality } = this.state;
        if(!subjectiveImpression){
            Toast.info('请选择医生评价！！！', 2);
            return;
        } 
        if(!description){
            Toast.info('请填写医生评价！！！', 2);
            return;
        } 
        if(!recoverySpeed){
            Toast.info('请选择回复速度！！！', 2);
            return;
        } 
        if(!inquiryQuality){
            Toast.info('请选择问诊质量！！！', 2);
            return;
        } 
        if(!serviceTtitude){
            Toast.info('请选择推荐意向！！！', 2);
            return;
        } 
        if(!serviceEvaluate){
            Toast.info('请选择总体评价！！！', 2);
            return;
        } 
        axios.post(config.publicUrl + 'appglandular/saveDocappraise.do', 
            {
                docId: doctorId,
                patId: patientId,
                serviceType: 1,
                subjectiveImpression: subjectiveImpression,
                description: description,
                serviceEvaluate: serviceEvaluate,
                recoverySpeed: recoverySpeed,
                serviceTtitude: serviceTtitude,
                inquiryQuality: inquiryQuality,
                serviceOderId: questionnaireId
            },
			{
				headers: {
                    loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    Toast.info(res.data.message, 2)
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }

    handleChange = e => {
        this.setState({
            description: e.target.value.trim()
        })
    }
    setSelect(e, num, num2) {
        let _this = $(e.target);
        if(num === 1){
            _this.hasClass('active') ? _this.removeClass('active') : _this.addClass('active');
            let subjectiveImpression = '', lang = 0;
            $('.pj_yspj_item span').map((index, item)=> {
                if($(item).hasClass('active')){
                    subjectiveImpression += lang === 0 ? $(item).text() : ','+$(item).text();
                    lang++;
                }
                return item
            })
            this.setState({
                subjectiveImpression: subjectiveImpression
            })
        }else{
            _this.addClass('active').siblings().removeClass('active');
            if(num === 2){
                this.setState({
                    recoverySpeed: num2
                })
            }else if(num === 3){
                this.setState({
                    inquiryQuality: num2
                })
            }else{
                this.setState({
                    serviceTtitude: num2
                })
            }
        }
    }
    setScore(e, num) {
        let _this = $(e.target);
        _this.addClass('active').siblings().removeClass('active');
        _this.prevAll().addClass('active');
        this.setState({
            serviceEvaluate: num*2
        })
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    render() {
        let { loading, description, doctorData, aList, bList, cList, dList, eList } = this.state;
        return (
            <DocumentTitle title="评价医生">

                <div className="wz">
                { loading ? 
                    <div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={require("../../images/loading.gif")} alt="" />
                    </div>
                    : ''
                }
                    <div className="wz_header">
                        <div className="wz_top">
                            <img src={imgUrl.back_home} alt="返回" onClick={this.goBackPage} />
                            <p>医生服务评价</p>
                        </div>
                    </div>

                    <div className="doc_con">
                        <div className="doc_img">
                            <img src={config.publicStaticUrl + doctorData.headicon} alt=""/>
                            <p className="doc_bg">{doctorData.teachingTitle}</p>
                        </div>
                        <div className="doc_txt">
                            <p className="doc_name">{doctorData.name} {doctorData.doctorTitle}</p>
                            <p className="doc_ks">{doctorData.hospital}  {doctorData.doctorDepartment}</p>
                            <p className="doc_sc">擅长: {doctorData.goodAt}</p>
                        </div>
                    </div>

                    <div className="pj_yspj">
                        <p className="pj_title">医生评价</p>
                        <div className="pj_yspj_item">
                        {
                            aList.map( (item, index) => {
                            return <span key={index} onClick={e => this.setSelect(e, 1)}>{item}</span>
                            })
                        }
                        </div>

                        <textarea placeholder="请输入您对医生的评价，不少于10个字" value={description} onChange={e => this.handleChange(e)}></textarea>
                    </div>

                    <div className="pj_yspj">
                        <p className="pj_title">服务评价</p>
                        <div className="fwpj">
                            <p>
                            回复速度
                            {
                                bList.map( (item, index) => {
                                return <span key={index} onClick={e => this.setSelect(e, 2, index)}>{item}</span>
                                })
                            }
                            </p>
                            <p>
                            问诊质量
                            {
                                cList.map( (item, index) => {
                                return <span key={index} onClick={e => this.setSelect(e, 3, index)}>{item}</span>
                                })
                            }
                            </p>
                            <p>
                            推荐意向
                            {
                                dList.map( (item, index) => {
                                return <span key={index} onClick={e => this.setSelect(e, 4, index)}>{item}</span>
                                })
                            }
                            </p>
                        </div>
                        <div className="pj_ztpj">
                        总体评价 
                            {
                                eList.map(index => {
                                    return <span key={index} onClick={e => this.setScore(e, index)}></span>
                                })
                            }
                        </div>

                    </div>
                    
                    <footer className="pj_tj" onClick={this.submit}>
                        提交
                    </footer>
                </div>

            </DocumentTitle>
        );
    }
}

export default evaluateDoctor;