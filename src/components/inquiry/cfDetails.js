import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title'

import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'
import config from "../../config/wxconfig";
import imgUrl from './images'

import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class cfDetails extends Component {
    constructor(props) {
        super(props);

        let { patientId, type, questionnaireId } = this.props.match.params;
        this.state = {
            data: '',
            patData: '',
            type: type,
            patientId: patientId,
            questionnaireId: questionnaireId,
            loading: true
        }
    }
    componentDidMount() {
        this.getData();
        this.getPatData();

        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
        }, 2000)
    }
    getData() {
        let { patientId, type, questionnaireId } = this.state;
        type = parseInt(type);
        let url = config.publicUrl + 'appinquiry/';
        if(type === 4) url += 'questionnaireDurg.do';
        if(type === 5) url += 'questionnaireExamineProject.do';
        if(type === 6) url += 'questionnaireInspectProject.do';
        if(type === 7) url += 'questionnaireOtherAdvice.do';
        axios.post(url, qs.stringify({
            questionnaireId: questionnaireId,
            patientId: patientId,
        }),
        {
            headers: {
                loginToken: localStorage.getItem('loginToken')
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                res.data.data.aaa = res.data.data.suList
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

    getPatData() {
        let { patientId } = this.state;
        
        axios.get(config.publicUrl + 'register/findHisPatientById.do', {params: {id: patientId},
            headers: {
                loginToken: localStorage.getItem('loginToken')
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.setState({
                    patData: res.data.data
                })
            } else {
                Toast.info(res.data.message, 2)
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    isType(type){
        type = parseInt(type);
        if(type === 4) return '处方笺';
        if(type === 5) return '检验单';
        if(type === 6) return '检查单';
        if(type === 7) return '其他医嘱';
    }

    render() {
        let { data, type, patData, loading } = this.state;
        return (
            <DocumentTitle title={this.isType(type)}>
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
                            <span>我的{this.isType(type)}</span>
                        </div>
                    </div>

                    <div className="wz_cf_list">
                        <div className="wz_cf_title">{this.isType(type)}</div>
                        <div className="cf_userData">
                            <span>{patData.name}</span>
                            <span>{patData.sex}</span>
                            <span>{patData.age}岁</span>
                            <span>{patData.province}{patData.city}</span>
                        </div>
                        <div className="cf_gma">
                            <span>过敏史</span>
                            <p> ： { data.allergyHistory ? JSON.parse(data.allergyHistory).data.map((d, i) => {
                                return <span key={i}>{d.allergies}({d.allergyDegree+d.allergicSymptoms})</span>
                            }): '无' }</p>
                        </div>
                        <div className="cf_lczd">
                            <span>临床诊断</span>
                            <p> ： 
                                {
                                    data ? data.diagnosisEntity.map((item, index) => {
                                        return <span key={index}>{item.name} </span>
                                    }):''
                                }
                            </p>
                        </div>
                        
                        <div className="cf_data">
                            {7 !== parseInt(type) ? <p className="cf_data_title">RP</p>:''}
                            {
                                data && parseInt(type) === 4? data.drugEntity.map((item, index) => {
                                    return  <div key={index} className="cf_data1">
                                                <div className="cf_ypmc">
                                                    <span>{index+1}</span>
                                                    <div>
                                                        <p>
                                                            {item.common_name + ' ' + item.specification}
                                                        </p>
                                                        <p className="cf_ypyf">
                                                        用法：{item.usages},{item.medication_frequency},
                                                                {item.single_dose}/{item.single_dose_unit},
                                                                {item.days}天,{item.number+item.packing_unit}
                                                                {','+item.explains}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                }): ''
                            }

                            {
                                data && 5 === parseInt(type)? data.drugEntity.map((item, index) => {
                                    return  <div key={index} className="cf_data1">
                                                <div className="cf_ypmc">
                                                    <span>{index+1}</span>
                                                    <div>
                                                        <p>
                                                            {item.examineName} 1次
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                }): ''
                            }
                            {
                                data && 6 === parseInt(type)? data.inspectEntity.map((item, index) => {
                                    return  <div key={index} className="cf_data1">
                                                <div className="cf_ypmc">
                                                    <span>{index+1}</span>
                                                    <div>
                                                        <p>
                                                            {item.inspectName} 1次
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                }): ''
                            }

                            {
                                4 !== parseInt(type) ? <div className={7 === parseInt(type) ? 'cf_qtjy1' : 'cf_qtjy'}>
                                    <p>
                                        <span>其他建议：</span>
                                        {
                                            data && 5 === parseInt(type) ? data.drugEntity[0].proposedBody+'，'+data.drugEntity[0].otherBody : ''
                                        }
                                        {
                                            data && 6 === parseInt(type) ? data.inspectEntity[0].proposedBody+'，'+data.inspectEntity[0].otherBody : ''
                                        }
                                        {
                                            data && 7 === parseInt(type) ? data.otherAdviceEntity[0].content : ''
                                        }
                                    </p>
                                </div> : ''
                            }
                            
                        </div>
                        <div className="cf_footer">
                            <span>医生：{data.name}</span>
                            <span>日期：{moment(data.createDate).format("YYYY.MM.DD")}</span>
                        </div>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default cfDetails;