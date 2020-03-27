import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title'

import axios from 'axios'
import qs from 'qs'
import BlItem from './blItem'

import config from "../../config/wxconfig";
import imgUrl from './images'

import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class blDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            type: false
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
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    change = () => {
        this.setState({
            type:!this.state.type
        })
    }
    setBlItem = () => {
        let { data } = this.state;
        let dataList = [
            {type: 4, title: '患病详细情况', txtArr: [data.beIllDetail], imgArr: [], txtArr1: [], imgArr1: []},
            {type: 99, title: '需要的帮助', txtArr: [data.otherHelp], imgArr: []},
            {type: 1, title: '就诊情况', txtArr: [], imgArr: []},
            {type: 3, title: '药物使用情况', txtArr: [], imgArr: []},
            {type: 14, title: '其他情况', txtArr: [], imgArr: []},
            // {type: 2, title: '医院就诊相关数据', txtArr: [], imgArr: []},
            // {type: 3, title: '药物相关照片', txtArr: [], imgArr: []},
            // {type: 5, title: '补充病历', txtArr: [], imgArr: []},
            // {type: 6, title: '就诊情况', txtArr: [], imgArr: []},
            // {type: 8, title: '检查情况', txtArr: [], imgArr: []},
            // {type: 9, title: '孕育情况', txtArr: [], imgArr: []},
            // {type: 10, title: '月经史', txtArr: [], imgArr: []},
            // {type: 11, title: '生育史', txtArr: [], imgArr: []},
            // {type: 12, title: '疾病史', txtArr: [], imgArr: []},
            // {type: 13, title: '过敏史', txtArr: [], imgArr: []}
        ];
        // if(data.isDrugs !== 2) dataList[7].txtArr.push({data.isDrugs});
        if(data.isExamine) dataList[4].txtArr.push({type: 8, txt: data.isExamine});
        if(data.isPregnant) dataList[4].txtArr.push({type: 9, txt: data.isPregnant});
        if(data.menstrualHistory) dataList[4].txtArr.push({type: 10, txt: data.menstrualHistory});
        if(data.childbearingHistory) dataList[4].txtArr.push({type: 11, txt: data.childbearingHistory});
        if(data.illHistory) dataList[4].txtArr.push({type: 12, txt: data.illHistory});
        if(data.allergyHistory) dataList[4].txtArr.push({type: 13, txt: data.allergyHistory});

        if(data.drugContent) dataList[3].txtArr.push(data.drugContent);

        let blList = dataList;
        dataList.forEach((item1, index) => {
            for(let item of data.suList){
                if(item1.type === item.type){
                    if(item.content) dataList[index].txtArr.push(item.content);
                    if(item.supplementImg) dataList[index].imgArr.push(item.supplementImg);
                    
                }else if(item.type === 2 && item1.type === 1){
                    dataList[index].imgArr.push(item.supplementImg);
                }if(item.type === 5 && item1.type === 4){
                    dataList[index].txtArr1.push(item.content);
                    dataList[index].imgArr1 = item.supplementImg.split(',');
                }
            }
            if(item1.txtArr.length < 1 && item1.imgArr.length < 1){
                blList = blList.filter(item => {
                    return item.type !== item1.type
                })
            }
        })
        return <BlItem data={blList} />
    }
    render() {
        let { data, type } = this.state;
        
        return (
            <DocumentTitle title="病历">

                <div className="wz">
                    <div className="wz_header">
                        <div className="wz_top">
                            <img src={imgUrl.back_home} alt="返回" onClick={this.goBackPage} />
                            <span> {data.patName}的病历</span>
                        </div>
                    </div>

                    <div className="wz_bl_list">
                        
                        <div className="wz_bl_item">
                            <div className="title">
                                {data.patName}({data.patSex} {data.patAge}岁)
                                <span>{moment(data.createDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                            </div>
                            <div className="wz_bl_user">
                                <div className="wz_bl_user_1">
                                    <p className="wz_bl_user_tips">疾病名称/症状</p>
                                    <p className="wz_bl_user_data">{data.beIllName}</p>
                                </div>
                                <div className="wz_bl_user_2">
                                    <div className="wz_bl_user_2_left">
                                        <p className="wz_bl_user_tips">患病部位</p>
                                        <p className="wz_bl_user_data">{data.beIllLocation}</p>
                                    </div>
                                    <div className="wz_bl_user_2_right">
                                        <p className="wz_bl_user_tips">患病时间</p>
                                        <p className="wz_bl_user_data">{data.beIllDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {
                            data ? this.setBlItem() : ''
                        }

                    </div>
                </div>

            </DocumentTitle>
        );
    }
}

export default blDetails;