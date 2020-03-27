import React, { Component } from 'react';
import { Toast, ImagePicker, DatePicker, List } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title'

import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'

import './style.css';
import config from "../../config/wxconfig";
import imgUrl from './images'

import { createHashHistory } from 'history'
import URLconfig from "../../config/urlConfig"; //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

let bodyData = {
    suList: []
};
class index extends Component {
    constructor(props) {
        super(props);
        const { patientId, doctorId, questionnaireId, type, ids } = this.props.match.params;
        let idArr = ids.split(',');
        this.state = {
            doctorId: doctorId,
            patientId: patientId,
            questionnaireId: questionnaireId,
            type: type,
            userHeadicon: localStorage.getItem('headicon'),
            loginToken: localStorage.getItem('loginToken'),
            patientData: '',
            patientName: '',
            docHeadicon: '',
            count: idArr[0] - 6,
            bodyData: '',
            wz_YY_list: [{
                text: '添加',
                ks: '',
                yy: ''
            }],
            doctorName: '',
            loading: true,
            
            isExamine: [{
                numberOfInspections: '',
                lastCheckTime: ''
            }],
            isPregnant: [{
                pregnancyMonth: '',
                dueDate: ''
            }],
            menstrualHistory: [{
                menarcheAge: '',
                menstruation: '',
                menstruationCycle: '',
                lastMenstrualDate: ''
            }],
            childbearingHistory: [{
                fulltimeProduction: '',
                numberOfPretermBirths: '',
                numberOfAbortions: '',
                numberOfChildren: ''
            }],
            allergyHistory: [{
                allergies: '',
                allergicSymptoms: '',
                allergyDegree: '轻微',
                text: '添加'
            }],
            wtArr: idArr
        }
    }
    componentDidMount() {
        this.getDocHeadicon();
        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
		}, 2000)
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
	}
    
    getDocHeadicon() {
        let { doctorId, loginToken } = this.state;

        axios.post(config.publicUrl + 'appinquiry/doctorDetailById.do', qs.stringify({
                doctorId: doctorId,
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    this.setState({
                        docHeadicon: res.data.data.headicon,
                        doctorName: res.data.data.name
                    })
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    handleChange = (e, type) => {
        bodyData[type] = e.target.value;
        this.setState({
            bodyData
        })
    }

    next(e, num, type){
        let _this = $(e.currentTarget);
        let { bodyData, isExamine, isPregnant, menstrualHistory, childbearingHistory, allergyHistory, files } = this.state;
        if(type === 1){
            if(!bodyData.drugContent || (bodyData.drugContent && !bodyData.drugContent.trim())){
                Toast.info('请填写当前使用药物', 2);
                return;
            }
            if(!files || files.length<1){
                Toast.info('请上传药物相关资料', 2);
                return;
            }
            for(let item of files){
                bodyData.suList.push({
                    type: 3,
                    supplementImg: item.url
                })
            }
            this.setState({bodyData});
        }else if(type === 2){
            for(let item of isExamine){
                if(!item.numberOfInspections || (item.numberOfInspections && !item.numberOfInspections.trim())){
                    Toast.info('请输入检查次数', 2);
                    return;
                }
                if(!item.lastCheckTime || (item.lastCheckTime && !item.lastCheckTime.trim())){
                    Toast.info('请选择上次检查时间', 2);
                    return;
                }
            }
        }else if(type === 3){
            for(let item of isPregnant){
                if(!item.pregnancyMonth || (item.pregnancyMonth && !item.pregnancyMonth.trim())){
                    Toast.info('请输入怀孕月份', 2);
                    return;
                }
                if(!item.dueDate || (item.dueDate && !item.dueDate.trim())){
                    Toast.info('请选择预产期时间', 2);
                    return;
                }
            }
        }else if(type === 4){
            for(let item of menstrualHistory){
                if(!item.menarcheAge || (item.menarcheAge && !item.menarcheAge.trim())){
                    Toast.info('请输入初潮年龄（岁）', 2);
                    return;
                }
                if(!item.menstruation || (item.menstruation && !item.menstruation.trim())){
                    Toast.info('请输入月经时间（天）', 2);
                    return;
                }
                if(!item.menstruationCycle || (item.menstruationCycle && !item.menstruationCycle.trim())){
                    Toast.info('请输入月经周期（天）', 2);
                    return;
                }
                if(!item.lastMenstrualDate || (item.lastMenstrualDate && !item.lastMenstrualDate.trim())){
                    Toast.info('请选择上次月经时间', 2);
                    return;
                }
            }
        }else if(type === 5){
            for(let item of childbearingHistory){
                if(!item.fulltimeProduction || (item.fulltimeProduction && !item.fulltimeProduction.trim())){
                    Toast.info('请输入足月产次数', 2);
                    return;
                }
                if(!item.numberOfPretermBirths || (item.numberOfPretermBirths && !item.numberOfPretermBirths.trim())){
                    Toast.info('请输入早产次数', 2);
                    return;
                }
                if(!item.numberOfAbortions || (item.numberOfAbortions && !item.numberOfAbortions.trim())){
                    Toast.info('请输入流产次数', 2);
                    return;
                }
                if(!item.numberOfChildren || (item.numberOfChildren && !item.numberOfChildren.trim())){
                    Toast.info('现存子女人数', 2);
                    return;
                }
            }
        }else if(type === 6){
            if(!bodyData.illHistory || (bodyData.illHistory && !bodyData.illHistory.trim())){
                Toast.info('请输入疾病史描述', 2);
                return;
            }
        }else if(type === 7){
            for(let item of allergyHistory){
                if(!item.allergies || (item.allergies && !item.allergies.trim())){
                    Toast.info('请输入过敏物品', 2);
                    return;
                }
                if(!item.allergicSymptoms || (item.allergicSymptoms && !item.allergicSymptoms.trim())){
                    Toast.info('请输入过敏症状', 2);
                    return;
                }
                if(!item.allergyDegree || (item.allergyDegree && !item.allergyDegree.trim())){
                    Toast.info('请选择过敏程度', 2);
                    return;
                }
            }
        }else{
            this.getData(e, type)
        }
        
        let abc = {
            count: num
        }
        if(type === 'patientId'){
            abc.patientName = _this.text();
        }
        
        _this.parents('.patient_list,.wz_1_con,.wz_why').find('div').eq(0).removeClass('wz_hide');
        this.setState(abc);
        // console.log(this.state.bodyData)

        if(type){
            this.setScrollTo()
        }
    }
    
    getData(e, type, isCheckbox) {
        let _this = $(e.currentTarget);
        _this.hasClass('active_1') ? _this.removeClass('active_1') : isCheckbox ? _this.addClass('active_1') : _this.addClass('active_1').siblings().removeClass('active_1');
        if(type){
            
            if(type === 'beIllName'){
                let beIllName = '';
                for(let v of _this.parent().find('span')){
                    beIllName += $(v).hasClass('active_1') ? beIllName.length > 1 ? ','+$(v).text() : $(v).text() : '';
                }
                bodyData[type] = beIllName;
            }else if(type === 'isDrugs' || type === 'isExamine' || type === 'isPregnant' || type === 'illHistorys' || type === 'gms'){
                bodyData[type] = _this.text() === '是' ? 1 : 2;
            }else if(type === 'patientId'){
                bodyData[type] = _this.attr('id');
            }else{
                bodyData[type] = _this.text();
            }
            this.setState({bodyData});

            if(type === 'isDrugs' || type === 'isExamine' || type === 'isPregnant' || type === 'illHistorys' || type === 'gms'){
                this.setScrollTo()
            }
        }
    }

    changeYY(e, type, num, index) {
        let { isExamine, isPregnant, menstrualHistory, childbearingHistory, allergyHistory } = this.state;
        if(num === 1){
            isExamine[0][type] = e.target.value;
            this.setState({isExamine})
        }else if(num === 2){
            isPregnant[0][type] = e.target.value
            this.setState({isPregnant})
        }else if(num === 3){
            menstrualHistory[0][type] = e.target.value
            this.setState({menstrualHistory})
        }else if(num === 4){
            childbearingHistory[0][type] = e.target.value
            this.setState({childbearingHistory})
        }else if(num === 5){
            allergyHistory[index][type] = e.target.value
            this.setState({allergyHistory})
        }
    }
    
    addYY(e, index) {
        let { allergyHistory } = this.state;
        index || index === 0 ?  allergyHistory.splice(index, 1) : allergyHistory = [{ text: '删除', allergies: '', allergicSymptoms: '', allergyDegree: '轻微'}, ...allergyHistory];
        this.setState({allergyHistory})
    }
    getABCD(type){
        let { bodyData } = this.state;
        let aaa = '', bbb = 0, ccc = 0, ddd = 0;
        for(let item of bodyData.suList){
            if(item.type === 1){
                aaa += item.content+','
            }else if(item.type === 2){
                bbb++
            }else if(item.type === 3){
                ccc++
            }else if(item.type === 4){
                ddd++
            }
        }
        if(type === 1) return aaa;
        if(type === 2) return bbb;
        if(type === 3) return ccc;
        if(type === 4) return ddd;
    }

    submit() {
        let { wtArr, bodyData, loginToken, patientId, doctorId, questionnaireId, type, isExamine, isPregnant, menstrualHistory, childbearingHistory, allergyHistory, illHistory } = this.state;
        let data = {};
        
        if(wtArr.includes('7')){
            if(bodyData.isDrugs === 1){
                data.isDrugs = bodyData.isDrugs;
                data.drugContent = bodyData.drugContent;
                data.suList = bodyData.suList;
            }else{
                data.isDrugs = 2;
            }
        }
        if(wtArr.includes('8')){
            if(bodyData.isExamine === 1){
                data.isExamine = {
                    numberOfInspections: isExamine[0].numberOfInspections,
                    lastCheckTime: isExamine[0].lastCheckTime
                }
            }else{
                data.isExamine = 1;
            }
        }
        if(wtArr.includes('9')){
            if(bodyData.isPregnant === 1){
                data.isPregnant = {
                    pregnancyMonth: isPregnant[0].pregnancyMonth,
                    dueDate: isPregnant[0].dueDate
                }
            }else{
                data.isPregnant = 1;
            }
        }
        if(wtArr.includes('12')){
            data.illHistory = bodyData.illHistory || 1;
        }
        if(wtArr.includes('10')){
            if(menstrualHistory[0].menarcheAge){
                data.menstrualHistory = menstrualHistory[0]
            }else{
                data.menstrualHistory = 1;
            }
        }
        if(wtArr.includes('11')){
            if(childbearingHistory[0].fulltimeProduction){
                data.childbearingHistory = childbearingHistory[0]
            }else{
                data.childbearingHistory = 1;
            }
        }
        if(wtArr.includes('13')){
            if(allergyHistory[0].allergies){
                data.allergyHistory = {
                    data: []
                }
                for(let v of allergyHistory){
                    data.allergyHistory.data.push({
                        allergicSymptoms: v.allergicSymptoms,
                        allergies: v.allergies,
                        allergyDegree: v.allergyDegree
                    })
                }
            }else{
                data.allergyHistory = 1;
            }
        }
        data.id = questionnaireId;
        console.log(data)
        axios.post(config.publicUrl + 'appinquiry/questionnaireUpdate.do', data,
        {headers: {loginToken: loginToken}})
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.props.history.push(`../../../../../wz/${patientId}/${doctorId}/${questionnaireId}/${type}`);
            } else {
                Toast.info(res.data.message, 2)
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
      
    }
    setScrollTo = () => {
        setTimeout(() => {
            let _obj = document.querySelector('.wz_con');
            let _height = _obj.childNodes[0].offsetHeight;
            _obj.scrollTop = _height;
        }, 10);
    }
    cancleMsg(e, count, type){
        let { bodyData, isExamine, isPregnant, menstrualHistory, childbearingHistory, allergyHistory, files } = this.state;
        let _this = $(e.currentTarget);
        _this.parents('.wz_cancle').prev().find('.active_1').removeClass('active_1');
        if(type !== 'menstrualHistory' && type !== 'childbearingHistory'){
            bodyData[type] = '';
        }
        if(type === 'isDrugs'){
            files = [];
            bodyData['drugContent'] = [];
            bodyData['suList'].forEach((item, index) => {
                if(item.type === 3){
                    return bodyData['suList'].splice(index , 1)
                }
            })
            bodyData['isExamine'] = '';
            isExamine = [{
                numberOfInspections: '',
                lastCheckTime: ''
            }]
        }else if(type === 'isExamine'){
            isExamine = [{
                numberOfInspections: '',
                lastCheckTime: ''
            }]
            bodyData['isPregnant'] = '';
            isPregnant = [{
                pregnancyMonth: '',
                dueDate: ''
            }]
        }else if(type === 'isPregnant'){
            isPregnant = [{
                pregnancyMonth: '',
                dueDate: ''
            }]
            menstrualHistory = [{
                menarcheAge: '',
                menstruation: '',
                menstruationCycle: '',
                lastMenstrualDate: ''
            }]
        }else if(type === 'menstrualHistory'){
            menstrualHistory = [{
                menarcheAge: '',
                menstruation: '',
                menstruationCycle: '',
                lastMenstrualDate: ''
            }]

            childbearingHistory = [{
                fulltimeProduction: '',
                numberOfPretermBirths: '',
                numberOfAbortions: '',
                numberOfChildren: ''
            }]
        }else if(type === 'childbearingHistory'){
            childbearingHistory = [{
                fulltimeProduction: '',
                numberOfPretermBirths: '',
                numberOfAbortions: '',
                numberOfChildren: ''
            }]
            bodyData['illHistory'] = '';
            bodyData['illHistorys'] = '';
        }else if(type === 'illHistorys'){
            bodyData['illHistory'] = '';
            bodyData['gms'] = '';
            allergyHistory = [{
                allergies: '',
                allergicSymptoms: '',
                allergyDegree: '轻微',
                text: '添加'
            }]
        }else if(type === 'gms'){
            allergyHistory = [{
                allergies: '',
                allergicSymptoms: '',
                allergyDegree: '轻微',
                text: '添加'
            }]
        }
        this.setState({
            count,
            bodyData,
            isExamine,
            isPregnant,
            menstrualHistory,
            childbearingHistory,
            allergyHistory,
            files
        })
    }
    render() {
        let { loading,docHeadicon, userHeadicon, count, isExamine, isPregnant, menstrualHistory, childbearingHistory,allergyHistory, bodyData, doctorName, files, wtArr } = this.state;
        docHeadicon = docHeadicon.includes('http') ? docHeadicon : config.publicStaticUrl + docHeadicon;
        let gmsTXT = '';
        allergyHistory.map((item, index) => {
            gmsTXT += `${item.allergies}(${item.allergyDegree+item.allergicSymptoms})、`;
        })
        
        return (
            <DocumentTitle title='完善病历'>
                <div className="wz_wrap">
                { loading ? 
                    <div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={require("../../images/loading.gif")} alt="" />
                    </div>
                    : ''
                }
                    <div className="wz_header">
                        <div className="wz_top">
                            <img src={imgUrl.back_home} alt="返回" onClick={this.goBackPage} />
                            <span>完善病历</span>
                        </div>
                    </div>

                    <div className="wz_con wz_con_wsbl">
                        <div className="ayu">
                            <div className="wz_1">
                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con"> 您好，我是{doctorName}医生，请您完善病历！</div>
                                </div>
                            </div>

                            {
                                count > 0 && wtArr.includes('7') ?   <div className="wz_cancle">
                                                                        <div className="wz_2">
                                                                            <div className="wz_doc_msg wz_item">
                                                                                <img src={docHeadicon} alt="" />
                                                                                <div className="wz_doc_msg_con">请问当前是否有使用的药物？</div>
                                                                            </div>

                                                                            <div className="wz_1_con">
                                                                                {
                                                                                     bodyData.isDrugs > 0 ? <div className="wz_none"></div> : ''
                                                                                }
                                                                                
                                                                                <div className="wz_1_item" onClick={e => this.next(e, 1, 'isDrugs')}>是</div>
                                                                                <div className="wz_1_item" onClick={e => this.next(e, wtArr[wtArr.indexOf('7')+1] ? wtArr[wtArr.indexOf('7')+1]-6 : 8, 'isDrugs')}>否</div>
                                                                            </div>
                                                                        </div>
                            
                                {
                                    bodyData.isDrugs === 1 && wtArr.includes('7') ?    <div className="wz_3">
                                                                    <div className="wz_why">
                                                                        <div className="wz_hide wz_none"></div>
                                                                        <div className="wz_title">当前使用的药物</div>
                                                                        <div className="wz_why_list wz_mb20">
                                                                        <textarea placeholder="请描述药物名称、用法、剂量等信息" value={bodyData.drugContent} onChange={e => this.handleChange(e, 'drugContent')}></textarea>
                                                                        </div>
                                                                        <div className="wz_title">药物相关资料（处方/药盒/说明书等）</div>
                                                                        <div className="wz_why_list">
                                                                            <ImagePicker files={files} onChange={files => this.setState({files})}/>
                                                                        </div>

                                                                        <div className="wz_why_footer">
                                                                            <span onClick={e => this.next(e, wtArr[wtArr.indexOf('7')+1] ? wtArr[wtArr.indexOf('7')+1]-6 : 8, 1)}>填好了</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            : ''
                                }
                                </div>
                                            : ''
                            }

                            {
                                count > 1 && wtArr.includes('7') ? <div className="wz_4 wz_cancle">
                                                                    <div className="wz_user_msg wz_item">
                                                                        <img src={userHeadicon} alt="" />
                                                                        <div className="wz_user_msg_con">
                                                                            {
                                                                                bodyData.isDrugs === 1 ? `已治疗：当前使用药物${bodyData.drugContent}, 已上传药物相关资料${this.getABCD(3)}份` : '当前未使用药品'
                                                                            }
                                                                        </div>
                                                                        <span className="wz_ch1" onClick={e => this.cancleMsg(e, 1, 'isDrugs')}>撤回</span>
                                                                    </div>
                                                                </div>
                                                                : ''
                            }

                            {
                                count > 1 && wtArr.includes('8') ?   <div className="wz_cancle">
                                                <div className="wz_4">
                                                    <div className="wz_doc_msg wz_item">
                                                        <img src={docHeadicon} alt="" />
                                                        <div className="wz_doc_msg_con">请问是否进行过乳腺检查？</div>
                                                    </div>

                                                    <div className="wz_1_con">
                                                        {
                                                            bodyData.isExamine > 0 ? <div className="wz_none"></div> : ''
                                                        }
                                                        <div className="wz_1_item" onClick={e => this.next(e, 2, 'isExamine')}>是</div>
                                                        <div className="wz_1_item" onClick={e => this.next(e, wtArr[wtArr.indexOf('8')+1] ? wtArr[wtArr.indexOf('8')+1]-6 : 8, 'isExamine')}>否</div>
                                                    </div>
                                                </div>
                            
                                {
                                    bodyData.isExamine === 1 && wtArr.includes('8') ?  <div className="wz_5">
                                                                    <div className="wz_why">
                                                                        <div className="wz_hide wz_none"></div>
                                                                        <div className="wz_title">检查次数及检查时间</div>
                                                                        <div className="wz_why_list wz_mb20">
                                                                        {
                                                                                isExamine.map((item, index) => {
                                                                                return <div key={index} className="abcd">
                                                                                            <input type="number" placeholder="输入检查次数" value={item.numberOfInspections} onChange={e => this.changeYY(e, 'numberOfInspections', 1)} />
                                                                                            <DatePicker
                                                                                                mode="date"
                                                                                                value={this.state.date}
                                                                                                onChange={date => {
                                                                                                    isExamine[0].lastCheckTime = moment(date).format('YYYY-MM-DD');
                                                                                                    this.setState({ isExamine })
                                                                                                    }}
                                                                                                >
                                                                                                <input type="text" readOnly placeholder="选择上次检查时间" value={item.lastCheckTime} onChange={e => this.changeYY(e, 'lastCheckTime', 1)} />
                                                                                            </DatePicker>
                                                                                        </div>
                                                                                })
                                                                            } 
                                                                        </div>

                                                                        <div className="wz_why_footer">
                                                                            <span onClick={e => this.next(e, wtArr[wtArr.indexOf('8')+1] ? wtArr[wtArr.indexOf('8')+1]-6 : 8, 2)}>填好了</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            :   ''
                                }
                                </div>: ''
                            }

                            {
                                count > 2 && wtArr.includes('8') ? <div className="wz_6 wz_cancle">
                                                <div className="wz_user_msg wz_item">
                                                    <img src={userHeadicon} alt="" />
                                                    <div className="wz_user_msg_con">
                                                        {
                                                            bodyData.isExamine === 1 ? `已检查${isExamine[0].numberOfInspections}次，上次检查时间${isExamine[0].lastCheckTime}` : '未检查'
                                                        }
                                                    </div>
                                                    <span className="wz_ch1" onClick={e => this.cancleMsg(e, 2, 'isExamine')}>撤回</span>
                                                </div>
                                                </div>
                                                : ''
                            }
                            
                            {
                                count > 2 && wtArr.includes('9') ?   <div className="wz_cancle">
                                            <div className="wz_6">
                                                <div className="wz_doc_msg wz_item">
                                                    <img src={docHeadicon} alt="" />
                                                    <div className="wz_doc_msg_con">请问当前是否怀孕？</div>
                                                </div>

                                                <div className="wz_1_con">
                                                    {
                                                        bodyData.isPregnant > 0 ? <div className="wz_none"></div> : ''
                                                    }
                                                    <div className="wz_1_item" onClick={e => this.next(e, 3, 'isPregnant')}>是</div>
                                                    <div className="wz_1_item" onClick={e => this.next(e, wtArr[wtArr.indexOf('9')+1] ? wtArr[wtArr.indexOf('9')+1]-6 : 8, 'isPregnant')}>否</div>
                                                </div>
                                            </div>
                            
                                {
                                    bodyData.isPregnant === 1 && wtArr.includes('9') ? <div className="wz_7">
                                                                    <div className="wz_why">
                                                                        <div className="wz_hide wz_none"></div>
                                                                        <div className="wz_title">怀孕时间及预产期</div>
                                                                        <div className="wz_why_list wz_mb20">
                                                                            {
                                                                                isPregnant.map((item, index) => {
                                                                                    return <div key={index} className="abcd">
                                                                                        <input type="number" className="yy" placeholder="输入怀孕月份" value={item.pregnancyMonth} onChange={e => this.changeYY(e, 'pregnancyMonth', 2)} />
                                                                                        
                                                                                        <DatePicker
                                                                                            mode="date"
                                                                                            value={this.state.date1}
                                                                                            onChange={date => {
                                                                                                isPregnant[0].dueDate = moment(date).format('YYYY-MM-DD');
                                                                                                this.setState({ isPregnant })
                                                                                                }}
                                                                                            >
                                                                                            <input type="text" readOnly className="ks" placeholder="选择预产期时间" value={item.dueDate} onChange={e => this.changeYY(e, 'dueDate', 2)} />
                                                                                        </DatePicker>
                                                                                    </div>
                                                                                })
                                                                            }
                                                                        </div>

                                                                        <div className="wz_why_footer">
                                                                            <span onClick={e => this.next(e, wtArr[wtArr.indexOf('9')+1] ? wtArr[wtArr.indexOf('9')+1]-6 : 8, 3)}>填好了</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            : ''
                                }
                                </div>: ''
                            }


                            {
                                count > 3 && wtArr.includes('9') ? <div className="wz_8 wz_cancle">
                                                                    <div className="wz_user_msg wz_item">
                                                                        <img src={userHeadicon} alt="" />
                                                                        <div className="wz_user_msg_con">
                                                                            {
                                                                                bodyData.isPregnant === 1 ? `已怀孕${isPregnant[0].pregnancyMonth}个月，预产期${isPregnant[0].dueDate}` : '未怀孕'
                                                                            }
                                                                            
                                                                        </div>
                                                                        <span className="wz_ch1" onClick={e => this.cancleMsg(e, 3, 'isPregnant')}>撤回</span>
                                                                    </div>
                                                                    </div>
                                                                : ''
                            }

                            
                            {
                                count > 3 && wtArr.includes('10') ? <div className="wz_8 wz_cancle">
                                                <div className="wz_doc_msg wz_item">
                                                    <img src={docHeadicon} alt="" />
                                                    <div className="wz_doc_msg_con">请描述月经史？</div>
                                                </div>
                                                
                                                <div className="wz_why">
                                                    {
                                                        count > 4 ? <div className="wz_none"></div> : ''
                                                    }
                                                    <div className="wz_title">月经史描述</div>
                                                    <div className="wz_why_list wz_mb20">
                                                        {
                                                            menstrualHistory.map((item, index) => {
                                                                return <div key={index} className="abcde">
                                                                    <p>
                                                                        <input type="number" placeholder="输入初潮年龄（岁）" value={item.menarcheAge} onChange={e => this.changeYY(e, 'menarcheAge', 3)} />
                                                                        <input type="number" placeholder="输入月经时间（天）" value={item.menstruation} onChange={e => this.changeYY(e, 'menstruation', 3)} />
                                                                    </p>
                                                                    <p>
                                                                        <input type="number" placeholder="输入月经周期（天）" value={item.menstruationCycle} onChange={e => this.changeYY(e, 'menstruationCycle', 3)} />
                                                                        <DatePicker
                                                                            mode="date"
                                                                            value={this.state.date2}
                                                                            onChange={date => {
                                                                                menstrualHistory[0].lastMenstrualDate = moment(date).format('YYYY-MM-DD');
                                                                                this.setState({ menstrualHistory })
                                                                            }}
                                                                            >
                                                                            <input readOnly type="text" placeholder="选择上次月经时间" value={item.lastMenstrualDate} onChange={e => this.changeYY(e, 'lastMenstrualDate', 3)} />
                                                                        </DatePicker>
                                                                    </p>
                                                                </div>
                                                            })
                                                        }
                                                    
                                                    </div>

                                                    <div className="wz_why_footer">
                                                        <span onClick={e => this.next(e, wtArr[wtArr.indexOf('10')+1] ? wtArr[wtArr.indexOf('10')+1]-6 : 8, 4)}>填好了</span>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        : ''
                            }
                            
                            {
                                count > 4 && wtArr.includes('10') ? <div className="wz_9 wz_cancle">
                                                                <div className="wz_user_msg wz_item">
                                                                    <img src={userHeadicon} alt="" />
                                                                    <div className="wz_user_msg_con">
                                                                        初潮{menstrualHistory[0].menarcheAge}岁，
                                                                        经期{menstrualHistory[0].menstruation}天，
                                                                        周期{menstrualHistory[0].menstruationCycle}天，
                                                                        上次月经时间{menstrualHistory[0].lastMenstrualDate}
                                                                    </div>
                                                                    <span className="wz_ch1" onClick={e => this.cancleMsg(e, 4, 'menstrualHistory')}>撤回</span>
                                                                </div>
                                                                </div>
                                                                : ''
                            }

                            {
                                count > 4 && wtArr.includes('11') ? <div className="wz_9">
                                                <div className="wz_doc_msg wz_item">
                                                    <img src={docHeadicon} alt="" />
                                                    <div className="wz_doc_msg_con">请描述生育史？</div>
                                                </div>
                                                
                                                <div className="wz_why">
                                                    {
                                                        count > 5 ? <div className="wz_none"></div> : ''
                                                    }
                                                    <div className="wz_title">生育史描述</div>
                                                    <div className="wz_why_list wz_mb20">
                                                        {
                                                            childbearingHistory.map((item, index) => {
                                                                return <div key={index} className="abcde">
                                                                    <p>
                                                                        <input type="number" placeholder="足月产次数" value={item.fulltimeProduction} onChange={e => this.changeYY(e, 'fulltimeProduction', 4)} />
                                                                        <input type="number" placeholder="早产次数" value={item.numberOfPretermBirths} onChange={e => this.changeYY(e, 'numberOfPretermBirths', 4)} />
                                                                    </p>
                                                                    <p>
                                                                        <input type="number" placeholder="流产次数" value={item.numberOfAbortions} onChange={e => this.changeYY(e, 'numberOfAbortions', 4)} />
                                                                        <input type="number" placeholder="现存子女人数" value={item.numberOfChildren} onChange={e => this.changeYY(e, 'numberOfChildren', 4)} />
                                                                    </p>
                                                                </div>
                                                            })
                                                        }
                                                
                                                    </div>

                                                    <div className="wz_why_footer">
                                                        <span onClick={e => this.next(e, wtArr[wtArr.indexOf('11')+1] ? wtArr[wtArr.indexOf('11')+1]-6 : 8, 5)}>填好了</span>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            :''
                            }
                            
                            {
                                count > 5 && wtArr.includes('11') ? <div className="wz_10 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        足月产{childbearingHistory[0].fulltimeProduction}次，
                                        早产{childbearingHistory[0].numberOfPretermBirths}次，
                                        流产{childbearingHistory[0].numberOfAbortions}次，
                                        现存子女{childbearingHistory[0].numberOfChildren}人
                                    </div>
                                    <span className="wz_ch1" onClick={e => this.cancleMsg(e, 5, 'childbearingHistory')}>撤回</span>
                                </div>
                                </div>
                                : ''
                            }


                            {
                                count > 5 && wtArr.includes('12') ? <div className="wz_cancle">
                                            <div className="wz_10">
                                                <div className="wz_doc_msg wz_item">
                                                    <img src={docHeadicon} alt="" />
                                                    <div className="wz_doc_msg_con">是否有重要疾病史？</div>
                                                </div>
                                                
                                                <div className="wz_1_con">
                                                    {
                                                        bodyData.illHistorys > 0 ? <div className="wz_none"></div> : ''
                                                    }
                                                    
                                                    <div className="wz_1_item" onClick={e => this.next(e, 6, 'illHistorys')}>是</div>
                                                    <div className="wz_1_item" onClick={e => this.next(e, wtArr[wtArr.indexOf('12')+1] ? wtArr[wtArr.indexOf('12')+1]-6 : 8, 'illHistorys')}>否</div>
                                                </div>
                                                
                                                
                                            </div>

                                {
                                    bodyData.illHistorys === 1 && wtArr.includes('12') ? <div className="wz_6">
                                                    <div className="wz_why">
                                                        <div className="wz_hide wz_none"></div>
                                                        <div className="wz_title">疾病史描述</div>
                                                        <div className="wz_why_list wz_mb20">
                                                            <textarea placeholder="请描述疾病史" value={bodyData.illHistory} onChange={e => this.handleChange(e, 'illHistory')}></textarea>
                                                        </div>

                                                        <div className="wz_why_footer">
                                                            <span onClick={e => this.next(e, wtArr[wtArr.indexOf('12')+1] ? wtArr[wtArr.indexOf('12')+1]-6 : 8, 6)}>填好了</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            : ''
                                }
                                </div>:''
                            }

                            
                            {
                                count > 6 && wtArr.includes('12') ? <div className="wz_11 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">{bodyData.illHistorys === 1 ? bodyData.illHistory : '无重要疾病史'}</div>
                                    <span className="wz_ch1" onClick={e => this.cancleMsg(e, 6, 'illHistorys')}>撤回</span>
                                </div>
                                </div>
                                :''
                            }

                            {
                                count > 6 && wtArr.includes('13') ? <div className="wz_cancle">
                                            <div className="wz_11">
                                                <div className="wz_doc_msg wz_item">
                                                    <img src={docHeadicon} alt="" />
                                                    <div className="wz_doc_msg_con">是否有过敏史？</div>
                                                </div>
                                                
                                                <div className="wz_1_con">
                                                    {
                                                        bodyData.gms > 0 ? <div className="wz_none"></div> : ''
                                                    }
                                                    <div className="wz_1_item" onClick={e => this.next(e, 7, 'gms')}>是</div>
                                                    <div className="wz_1_item" onClick={e => this.next(e, wtArr[wtArr.indexOf('13')+1] ? wtArr[wtArr.indexOf('13')+1]-6 : 8, 'gms')}>否</div>
                                                </div>

                                                
                                            </div>

                                {
                                    bodyData.gms === 1 && wtArr.includes('13') ? <div className="wz_6">
                                                    <div className="wz_why">
                                                        <div className="wz_hide wz_none"></div>
                                                        <div className="wz_title">过敏史描述</div>
                                                        <div className="wz_why_list wz_mb20">
                                                                {
                                                                    allergyHistory.map((item, index) => {
                                                                        return <div key={index} className="abcdef">
                                                                            <input type="text" className="yy" value={item.allergies} onChange={e => this.changeYY(e, 'allergies', 5, index)} placeholder="过敏物品" />
                                                                            <input type="text" className="ks" value={item.allergicSymptoms} onChange={e => this.changeYY(e, 'allergicSymptoms', 5, index)} placeholder="过敏症状" />
                                                                            <select value={item.allergyDegree} onChange={e => this.changeYY(e, 'allergyDegree', 5, index)}>
                                                                                <option value="轻微">轻微</option>
                                                                                <option value="一般">一般</option>
                                                                                <option value="严重">严重</option>
                                                                            </select>
                                                                            <span className={item.text === '添加' ? 'add' : 'remove'} onClick={e => item.text === '添加' ? this.addYY(e) : this.addYY(e, index)}>{item.text}</span>
                                                                        </div>
                                                                    })
                                                                }
                                                            </div>

                                                        <div className="wz_why_footer">
                                                            <span onClick={e => this.next(e, wtArr[wtArr.indexOf('13')+1] ? wtArr[wtArr.indexOf('13')+1]-6 : 8, 7)}>填好了</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            : ''
                                }
                                </div>: ''
                            }
                            
                            {
                                count > 7 && wtArr.includes('13') ? <div className="wz_11 wz_cancle">
                                                <div className="wz_user_msg wz_item">
                                                    <img src={userHeadicon} alt="" />
                                                    <div className="wz_user_msg_con">{bodyData.gms === 1 ? gmsTXT : '无过敏史'}</div>
                                                    <span className="wz_ch1" onClick={e => this.cancleMsg(e, 7, 'gms')}>撤回</span>
                                                </div>
                                            </div>
                                        : ''
                            }

                            {
                                count > 7 ? <div className="wz_11"><button onClick={()=>this.submit()}>提交</button></div> : ''
                            }
                        
                       </div>     
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default index;