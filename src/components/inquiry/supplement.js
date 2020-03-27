import React, { Component } from 'react';
import { Toast, ImagePicker } from 'antd-mobile';
import DocumentTitle from 'react-document-title'

import axios from 'axios'
import qs from 'qs'

import './style.css';
import config from "../../config/wxconfig";
import imgUrl from './images'

import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class supplement extends Component {
    constructor(props) {
        super(props);
        const { patientId, doctorId, questionnaireId } = this.props.match.params;
        this.state = {
            patientId: patientId,
            doctorId: doctorId,
            questionnaireId: questionnaireId,
            loginToken: localStorage.getItem('loginToken'),
            files: [],
            content: '',
        }
    }
    componentDidMount() {
        this.getData();
    }
    getData() {
        let { patientId, doctorId, questionnaireId } = this.props.match.params;
        axios.post(config.publicUrl + 'appinquiry/questionnaireByPatiend.do', qs.stringify({
            id: questionnaireId,
            patientId: patientId,
            doctorId: doctorId
        }),
        {
            headers: {
                loginToken: localStorage.getItem('loginToken')
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                let suList = res.data.data.suList;
                if(suList){
                    suList.forEach((item, index) => {
                    if(item.type === 5 ){
                        let content = item.content;
                        let supplementArr = item.supplementImg.split(',');
                        let files = [];
                        if(supplementArr){
                             supplementArr.forEach((item1, index1) => {
                                files.push({
                                    url: config.publicStaticUrl + item1,
                                    url1: item1
                                })
                            })
                        }
                        this.setState({
                            content,
                            files
                        })
                    }
                })
            }
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
    handleChange(e) {
        this.setState({
            content: e.target.value
        })
    }
    submit = () => {
        let { questionnaireId, files, content, loginToken } = this.state;
        if(!content.trim()){
            Toast.info('请填写病情描述', 2);
            return;
        }
        if(files.length < 1){
            Toast.info('请上传相关图片', 2);
            return;
        }
        let urlArr = [];
        for(let item of files){
            let url = item.url.includes('http') ? item.url1 : item.url
            urlArr.push(url);
        }
        Toast.loading('上传中...');
        axios.post(config.publicUrl + 'appinquiry/furtherInformation.do', {
        // axios.post('http://192.168.2.114/aiplat/appinquiry/furtherInformation.do', qs.stringify({
            diagnosisAnswerId: questionnaireId,
            content: content,
            images: urlArr
        },
        {
            headers: {
                loginToken: loginToken,
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.goBackPage();
            } else {
                Toast.info(res.data.message, 2, () => {
                    Toast.hide();
                })
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
    }
    render() {
        let { files, content } = this.state;
        return (
            <DocumentTitle title='问诊'>
                <div className="wz_wrap">
                    <div className="wz_header">
                        <div className="wz_top">
                            <img src={imgUrl.back_home} alt="返回" onClick={this.goBackPage} />
                            <span>补充资料</span>
                        </div>
                    </div>

                    <div className="wz_supplement">
                        <div className="wz_supplement_txt">
                            <p className="title">病情描述</p>
                            <textarea placeholder="请输入需要补充的内容，不少于5个字" value={content} onChange={e => this.handleChange(e)}></textarea>
                        </div>
                        <div className="wz_supplement_img">
                            <p className="title">相关图片</p>
                            <p className="tips">注意：请不要重复上传相同图片</p>
                            <ImagePicker files={files} onChange={files => this.setState({files})} selectable={files.length > 4 ? false : true}/>
                        </div>
                    </div>


                    <div className="wz_supplement_footer">
                        <span onClick={this.submit}>提交</span>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default supplement;