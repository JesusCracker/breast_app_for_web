import React, { Component } from 'react';
import { Toast, ImagePicker } from 'antd-mobile';
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

var bodyData = {
    suList: []
};
class index extends Component {

    constructor(props) {
        super(props);
        const { doctorId } = this.props.match.params;
        this.state = {
			// loginToken: '38ef3372c1174f75880b8ceddadd20ba',
			// doctorId: 302,
            doctorId: doctorId,
            loginToken: localStorage.getItem('loginToken'),
            userHeadicon: '',
            patientData: '',
            patientName: '',
            docHeadicon: '',
            count: 0,
            count1: 0,
            bodyData: ' ',
            wz_YY_list: [{
                text: '添加',
                ks: '',
                yy: ''
            }],
            doctorName: '',
            loading: true,
            num: 1,
            abcdef: false
        }
    }
    componentDidMount() {
        bodyData = {
            suList: []
        };
        this.getUserData();
        this.getDocHeadicon();
        this.getPatConsultationList();
        this.mounted();
        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
			if(this.props.location.search.split('?')[1]) $(".defaultClick").click();
		}, 2000)
    }
    mounted() {
        // 要检索的字符串值没有出现，则该方法返回 -1。
        if (window.location.href.indexOf("?#") < 0) {
            window.location.href = window.location.href.replace("#", "?#");
        }
    }



    getUserData() {
		let { loginToken } = this.state;
		axios.post(config.publicUrl + 'app/getUserByLoginToken.do', {},
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
                    let headicon = res.data.data.headicon;
                    headicon = headicon ? (headicon.includes('http') ? headicon : config.publicStaticUrl + headicon) : require('../room/img/defu_img.png');
					this.setState({
						userHeadicon: headicon
					})
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});
	}
    goBackPage() {
		history.goBack(); //返回上一页这段代码
	}

    getPatConsultationList() {
        let { loginToken } = this.state;

        axios.post(config.publicUrl + 'register/patConsultationList.do', qs.stringify({
                page: 1,
                limit: 1
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
                this.goSignWhenMissLoginToken(res.data.status, res.data.message);

				if (res.status === 200 && res.data.status === 1) {
                    this.setState({
                        patientData: res.data.data[0]
                    })
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
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
        let { bodyData, wz_YY_list, files, files1, files2, doctorId } = this.state;
        if(type === 1){
            if(!bodyData.beIllDate){
                Toast.info('请选择患病时间', 2);
                return;
            }
            if(!bodyData.beIllLocation){
                Toast.info('请选择患病部位', 2);
                return;
            }
            if(!bodyData.beIllName){
                Toast.info('请选择患病名称/症状', 2);
                return;
            }
            if(!bodyData.beIllDetail || !bodyData.beIllDetail.trim()){
                Toast.info('请填写患病详情情况', 2);
                return;
            }
        }else if(type === 2){
            for(let item of wz_YY_list){
                if(!item.yy.trim()){
                    Toast.info('请填写医院名称', 2);
                    return;
                }
                if(!item.ks.trim()){
                    Toast.info('请填写科室名称', 2);
                    return;
                }
                bodyData.suList.push({
                    type: 1,
                    content: item.yy+','+item.ks
                })
            }
            if(!files || files.length<1){
                Toast.info('请上传就诊相关资料', 2);
                return;
            }
            for(let item of files){
                bodyData.suList.push({
                    type: 2,
                    supplementImg: item.url
                })
            }
            this.setState({bodyData});
        }else if(type === 3){
            if(!bodyData.drugContent || !bodyData.drugContent.trim()){
                Toast.info('请填写当前使用药物', 2);
                return;
            }
            if(!files1 || files1.length<1){
                Toast.info('请上传药物相关资料', 2);
                return;
            }
            for(let item of files1){
                bodyData.suList.push({
                    type: 3,
                    supplementImg: item.url
                })
            }
            this.setState({bodyData});
        }else if(type === 4){
            if(!files2 || files2.length<1){
                Toast.info('请上传病情相关资料', 2);
                return;
            }
            for(let item of files2){
                bodyData.suList.push({
                    type: 4,
                    supplementImg: item.url
                })
            }
            this.setState({bodyData});
        }else if(type === 5){
            if(!bodyData.otherHelp || !bodyData.otherHelp.trim()){
                Toast.info('请填写需要医生提供的帮助', 2);
                return;
            }
            bodyData.doctorId = doctorId;
            this.setState({bodyData});
        }else{
            this.getData(e, type)
        }

        let abc = {
            count: num
        }
        if(type === 'patientId'){
            abc.patientName = _this.text();
        }

        // _this.parents('.patient_list,.wz_1_con,.wz_why').find('div').eq(0).removeClass('wz_hide');
        if((type === 5 && bodyData.isBreastCancerProblem === 1) || (type === 2 && bodyData.isBreastCancerProblem === 1) || (type === 'isSeekMedical'&& bodyData.isBreastCancerProblem === 1)){
            if(type === 2){
                bodyData.isSeekMedical = 4;
                this.setState({bodyData,count1: 1});
            }else if(type === 5){
                this.setState({count1: 2});
            }
        }else{
            this.setState(abc);
        }

        console.log(this.state.bodyData)

        if(type){
            this.setScrollTo()
        }
    }
    getData(e, type, isCheckbox) {
        let _this = $(e.currentTarget);
        _this.hasClass('active_1') ? _this.removeClass('active_1') : isCheckbox ? _this.addClass('active_1') : _this.addClass('active_1').siblings().removeClass('active_1');
        if(type){

            if(type === 'beIllDate' || type === 'beIllLocation'){
                bodyData[type] = _this.hasClass('active_1') ? _this.text() : '';
            }else if(type === 'beIllName'){
                let beIllName = '';
                for(let v of _this.parent().find('span')){
                    beIllName += $(v).hasClass('active_1') ? beIllName.length > 1 ? ','+$(v).text() : $(v).text() : '';
                }
                bodyData[type] = _this.hasClass('active_1') ? beIllName : '';
            }else if(type === 'isBeill' || type === 'isBreastCancerProblem' || type === 'isSeekMedical' || type === 'isDrugs' || type === 'isDrugImg'){
                if(type === 'isSeekMedical' && _this.text() === '否' && bodyData.isBreastCancerProblem === 1){
                    bodyData[type] = 3;
                }else{
                    bodyData[type] = _this.text() === '是' ? 1 : 2;
                }
            }else if(type === 'patientId'){
                bodyData[type] = _this.attr('id');
            }else{
                bodyData[type] = _this.text();
            }
            this.setState({bodyData});
            if(type === 'isBeill' || type === 'isBreastCancerProblem' || type === 'isSeekMedical' || type === 'isDrugs' || type === 'isDrugImg'){
                this.setScrollTo()
            }
        }
    }
    changeYY(e, index, type) {
        let { wz_YY_list } = this.state;
        type === 1 ? wz_YY_list[index].yy = e.target.value : wz_YY_list[index].ks = e.target.value;
        this.setState({wz_YY_list})
    }
    setScrollTo = () => {
        setTimeout(() => {
            let _obj = document.querySelector('.wz_con');
            let _height = _obj.childNodes[0].offsetHeight;
            _obj.scrollTop = _height;
        }, 10);
	}
    addYY(e, index) {
        let { wz_YY_list } = this.state;
        index || index === 0 ?  wz_YY_list.splice(index, 1) : wz_YY_list = [{ text: '删除', yy: '', ks: ''}, ...wz_YY_list];
        this.setState({wz_YY_list})
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

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };

    //异常提示
    failToast(message) {
        Toast.fail(message, 2000);
    }
    //接口token失效时处理
    goSignWhenMissLoginToken = (status, message) => {
        if (status && message && status === 2 && message === '权限错误') {
            this.failToast(message);
            setTimeout(() => {
                this.goSign();
            }, 1000);
        }
    };

    //生成问诊单
    async getQuestionId(){
        let { bodyData, loginToken, patientData, doctorId } = this.state;
        await axios.post(config.publicUrl + 'appinquiry/questionnaire.do', bodyData,
            {headers: {loginToken: loginToken}})
            .then(res => {
                if (res.status === 200 && res.data.status === 1) {
                    // this.props.history.push(`./wz/${patientData.patiend_id}/${doctorId}/${res.data.data}/20`);
                   this.setState({
                       questionId:res.data.data,
                   })

                } else {
                    Toast.info(res.data.message, 2)
                    Toast.hide();
                    this.setState({num: 1})
                }
            })
            .catch(err => {
                Toast.info(err, 2);
                Toast.hide();
                this.setState({num: 1})
            });
    }


    //通过id获取orderId
    async getOrderId(questionId, supplierId) {
        await axios({
            url: URLconfig.publicUrl + '/business/generateOrder.do',
            method: 'post',
            data: {
                "orderType": 4,
                "paySource": 3,
                "payMode": 2,
                "productId": questionId,
                "supplierId": supplierId
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                if (response.data.data) {
                    this.setState({
                        orderId: response.data.data,
                    });

                }
            } else {
                alert(response.data.message);
                this.setState({num: 1})
                Toast.hide();
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
                Toast.hide();
                this.setState({num: 1})
            });
    }



    async submit() {
        if(this.state.num === 1){
            Toast.loading('Loading...', 0);
            this.setState({num: 2})
            await this.getQuestionId();
            if(this.state.questionId){
                await this.getOrderId(this.state.questionId, this.state.patientData.patiend_id);
            }
            if (this.state.orderId) {
                this.toGetWXOrderInfo(this.state.orderId, localStorage.getItem('openid'));
            }
        }
    }

    async toGetWXOrderInfo(orderId, openid = localStorage.getItem('openid')) {
        await axios({
            url: URLconfig.publicUrl + '/wx/payOrder.do',
            method: 'post',
            data: {
                "orderId": orderId,
                "openid": openid,
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let appId = response.data.data.appId;
                let timestamp = response.data.data.timestamp;
                let noncestr = response.data.data.noncestr;
                let packageValue = response.data.data.packageValue;
                let paySign = response.data.data.paySign;
                if (appId && timestamp && noncestr && packageValue && paySign) {
                      this.callpay(appId, timestamp, noncestr, packageValue, paySign)
                }

            }else{
                Toast.hide();
                this.setState({num: 1})
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
                Toast.hide();
                this.setState({num: 1})
            });
    }

     callpay(appId, timestamp, noncestr, packageValue, paySign) {
        let { bodyData, loginToken, patientData, doctorId,questionId } = this.state;
         const that = this;
        if (packageValue.length > 30 && appId.length > 10) {
              window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
                "appId": appId,
                "timeStamp": timestamp,
                "nonceStr": noncestr,
                "package": packageValue,
                "signType": "MD5",
                "paySign": paySign
            }, function (res) {
                if (res.err_msg === "get_brand_wcpay_request:ok") {
                    Toast.hide();
                    that.props.history.replace(`./wz/${patientData.patiend_id}/${doctorId}/${questionId}/20`);

                   /* that.setState({
                        'modal1': false,
                    });*/

                    // router.push('/results/check');
                    // window.location.reload();
                    /*    if (_this.state.status === 20) {

                            window.location.reload();
                        } else {
                            _this.gotozhibo(id);
                        }*/
                } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
                    // message.info("支付取消");
                    alert('支付取消');
                    Toast.hide();
                    that.setState({num: 1})
                } else if (res.err_msg === "get_brand_wcpay_request:fail") {
                    // router.push('/results/check')
                    alert('支付失败');
                    Toast.hide();
                    that.setState({num: 1})
                } else {
                    // message.info(res.err_msg);
                    // return false;
                    alert(res.err_msg);
                    Toast.hide();
                    that.setState({num: 1})
                }
                // WeixinJSBridge.log(response.err_msg);
            });
        } else {
            alert("网络异常。");
            Toast.hide();
            that.setState({num: 1})
            // return false;
        }
    }



    chooseSuffer(){
        window.location.href = `${URLconfig.toWxHis}/old&new/sufferList.html?doctorId=${this.state.doctorId}`;
    }

    cancleMsg(e, count, type){
        let { bodyData, wz_YY_list, files, files1, files2, count1 } = this.state;
        let _this = $(e.currentTarget);
        _this.parents('.wz_cancle').prev().find('.active_1').removeClass('active_1');
        bodyData[type] = '';
        console.log(bodyData)
        if(type === 'isBreastCancerProblem' || type === 'isBeill'){
            bodyData['beIllDate'] = '';
            bodyData['beIllLocation'] = '';
            bodyData['beIllName'] = '';
            bodyData['beIllDetail'] = '';
        }else if(type === 'beIllDetail'){
            bodyData['beIllDate'] = '';
            bodyData['beIllLocation'] = '';
            bodyData['beIllName'] = '';
            bodyData['isSeekMedical'] = '';

            bodyData['suList'] = [];
            wz_YY_list = [{
                text: '添加',
                ks: '',
                yy: ''
            }];
            files = [];
        }else if(type === 'isSeekMedical'){
            bodyData['suList'] = [];
            wz_YY_list = [{
                text: '添加',
                ks: '',
                yy: ''
            }];
            files = [];
            files1 = [];
            bodyData['drugContent'] = [];
            bodyData['otherHelp'] = '';
            count1 = 0;
        }else if(type === 'isDrugs'){
            files1 = [];
            bodyData['drugContent'] = [];
            bodyData['suList'].forEach((item, index) => {
                if(item.type === 3 || item.type === 4){
                    console.log(bodyData)
                    return bodyData['suList'].splice(index , 1)
                }
            })

            files2 = [];
        }else if(type === 'isDrugImg'){
            files2 = [];
            bodyData['suList'].forEach((item, index) => {
                if(item.type === 4){
                    console.log(bodyData)
                    return bodyData['suList'].splice(index , 1)
                }
            })
            bodyData['otherHelp'] = '';
        }else{
            if(bodyData.isBreastCancerProblem === 1){
                count1 = 1;
                count = 3;
            }
        }
        this.setState({
            count,
            count1,
            bodyData,
            wz_YY_list,
            files,
            files1,
            files2
        })
    }

    render() {
        let { loading,docHeadicon, userHeadicon, count, count1, bodyData, patientData,doctorName, patientName, files, files1, files2, wz_YY_list } = this.state;
        docHeadicon = docHeadicon.includes('http') ? docHeadicon : config.publicStaticUrl + docHeadicon;

        return (
            <DocumentTitle title='诊前问答'>
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
                            <span>诊前问答</span>
                        </div>
                        <div className="wz_tips">
                            <img src={imgUrl.wenzhen_tips} alt="提示" />
                            <span>系统提示：急重症患者不适合在线问诊，请立即前往 医院就诊。</span>
                        </div>
                    </div>

                    <div className="wz_con">
                        <div className="ayu">
                        <div className="wz_1">
                            <div className="wz_doc_msg wz_item">
                                <img src={docHeadicon} alt="" />
                                <div className="wz_doc_msg_con"> 您好，我是{doctorName}医生，很高兴为您服务</div>
                            </div>
                            <div className="wz_doc_msg wz_item">
                                <img src={docHeadicon} alt="" />
                                <div className="wz_doc_msg_con">请选择就诊患者是哪位？</div>
                            </div>

                            <div className="choice_patient">
                                <div className="wz_title">
                                    <p>
                                        选择就诊患者
                                    </p>
                                    <span>患者选择后无法修改，请谨慎选择</span>
                                </div>

                                <div className="patient_list">
                                    {
                                        count > 0 ? <div className="wz_none"></div> : ''
                                    }

                                    {!patientData&&<div className={'patient_item1'}></div>}
                                   { patientData&& <div className="patient_item defaultClick" onClick={e => this.next(e, 1, 'patientId')} id={patientData.patiend_id}>{patientData.name} {patientData.sex} {patientData.age}</div>}
                                    <div className="patient_item" onClick={()=>this.chooseSuffer()}>+ 选择患者</div>
                                </div>
                            </div>
                        </div>

                        {
                            count > 0 ? <div className="wz_2 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">{patientName}</div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 0)}>撤回</span>
                                </div>
                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问是否患乳腺癌？</div>
                                </div>

                                <div className="wz_1_con">
                                    {
                                        bodyData.isBeill > 0 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_1_item" onClick={e => this.next(e, 2, 'isBeill')}>是</div>
                                    <div className="wz_1_item" onClick={e => this.next(e, 2, 'isBeill')}>否</div>
                                </div>
                            </div>
                            : ''
                        }

                        {
                            bodyData.isBeill === 1 ? <div className="wz_3 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">已患乳腺癌</div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 1, 'isBeill')}>撤回</span>
                                </div>
                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问本次咨询是否与乳腺癌相关？</div>
                                </div>
                                <div className="wz_1_con">
                                    {
                                        bodyData.isBreastCancerProblem > 0 ? <div className="wz_none"></div> : ''
                                    }

                                    <div className="wz_1_item" onClick={e => this.getData(e, 'isBreastCancerProblem')}>是</div>
                                    <div className="wz_1_item" onClick={e => this.next(e, 2, 'isBreastCancerProblem')}>否</div>
                                </div>
                            </div>
                            : ''
                        }
                        {
                            bodyData.isBeill === 2 || bodyData.isBreastCancerProblem === 2 ? <div className="wz_3 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        {
                                            bodyData.isBeill === 2 ? '未患乳腺癌' : '与乳腺癌无关'
                                        }
                                    </div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 1, bodyData.isBeill === 2 ? 'isBeill' : 'isBreastCancerProblem')}>撤回</span>
                                </div>
                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请描述本次咨询的疾病名称或症状？</div>
                                </div>

                                <div className="wz_why">
                                    {
                                        count > 2 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">患病多久了</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1周</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1月</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>半年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>5年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>5年以上</span>
                                    </div>
                                    <div className="wz_title">患病部位在哪里</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>左侧乳腺</span>
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>右侧乳腺</span>
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>双侧乳腺</span>
                                    </div>
                                    <div className="wz_title">疾病名称/症状（多选）</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺增生</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺囊肿</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺结节</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳头溢液</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺纤维腺瘤</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺炎（哺乳期）</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>乳腺炎（非哺乳期）</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>整形矫正</span>
                                        <span onClick={e => this.getData(e, 'beIllName', true)}>其他</span>
                                    </div>
                                    <div className="wz_title">患病详细情况</div>
                                    <div className="wz_why_list">
                                        <textarea placeholder="请详细描述病情" value={bodyData.beIllDetail} onChange={e => this.handleChange(e, 'beIllDetail')}></textarea>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 3, 1)}>填好了</span>
                                    </div>
                                </div>
                            </div>
                            :''
                        }

                        {
                            bodyData.isBreastCancerProblem === 1 ? <div className="wz_3 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">与乳腺癌相关</div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 1, 'isBreastCancerProblem')}>撤回</span>
                                </div>
                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请描述本次咨询的疾病名称或症状？</div>
                                </div>

                                <div className="wz_why">
                                    {
                                        count > 2 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">患病多久了</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1周</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1月</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>半年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>1年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>5年</span>
                                        <span onClick={e => this.getData(e, 'beIllDate')}>5年以上</span>
                                    </div>
                                    <div className="wz_title">患病部位在哪里</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>左侧乳腺</span>
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>右侧乳腺</span>
                                        <span onClick={e => this.getData(e, 'beIllLocation')}>双侧乳腺</span>
                                    </div>
                                    <div className="wz_title">疾病名称/症状</div>
                                    <div className="wz_why_list">
                                        <span onClick={e => this.getData(e, 'beIllName')}>乳腺癌术后化疗</span>
                                        <span onClick={e => this.getData(e, 'beIllName')}>乳腺癌术后复查</span>
                                        <span onClick={e => this.getData(e, 'beIllName')}>乳腺癌术后复发</span>
                                        <span onClick={e => this.getData(e, 'beIllName')}>其他</span>
                                    </div>
                                    <div className="wz_title">患病详细情况</div>
                                    <div className="wz_why_list">
                                        <textarea placeholder="请详细描述病情" value={bodyData.beIllDetail} onChange={e => this.handleChange(e, 'beIllDetail')}></textarea>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 3, 1)}>填好了</span>
                                    </div>
                                </div>
                            </div>
                            : ''
                        }

                        {
                            count > 2 ? <div className="wz_cancle">
                                <div className="wz_4">
                                    <div className="wz_user_msg wz_item">
                                        <img src={userHeadicon} alt="" />
                                        <div className="wz_user_msg_con">{bodyData.beIllLocation} , {bodyData.beIllName} ，已患病{bodyData.beIllDate} , {bodyData.beIllDetail}</div>
                                        <span className="wz_ch" onClick={e => this.cancleMsg(e, 2, 'beIllDetail')}>撤回</span>
                                    </div>
                                    <div className="wz_doc_msg wz_item">
                                        <img src={docHeadicon} alt="" />
                                        <div className="wz_doc_msg_con">请问是否到医院就诊过？</div>
                                    </div>

                                    <div className="wz_1_con">
                                        {
                                            bodyData.isSeekMedical > 0 ? <div className="wz_none"></div> : ''
                                        }
                                        <div className="wz_1_item" onClick={e => this.next(e, 4, 'isSeekMedical')}>是</div>
                                        <div className="wz_1_item" onClick={e => this.next(e, bodyData.isBreastCancerProblem === 1 ? 4 : 5, 'isSeekMedical')}>否</div>
                                    </div>

                                </div>

                            {
                                bodyData.isSeekMedical === 1 || bodyData.isSeekMedical === 4 ? <div className="wz_5 wz_cancle">
                                    <div className="wz_why">
                                        {
                                            count > 4 || count1 > 0 ? <div className=" wz_none"></div> : ''
                                        }

                                        <div className="wz_title">就诊医院及科室</div>
                                        <div className="wz_why_list wz_mb20">
                                            {
                                                wz_YY_list.map((item, index) => {
                                                    return <p key={index}>
                                                        <input type="text" placeholder="医院" className="yy" value={item.yy} onChange={e => this.changeYY(e, index, 1)} />
                                                        <input type="text" placeholder="科室" className="ks" value={item.ks} onChange={e => this.changeYY(e, index, 2)} />
                                                        <span className={item.text === '添加' ? 'add' : 'remove'} onClick={e => item.text === '添加' ? this.addYY(e) : this.addYY(e, index)}>{item.text}</span>
                                                    </p>
                                                })
                                            }
                                        </div>
                                        <div className="wz_title">就诊相关资料（病历/化验单/检查片子/报告等）</div>
                                        <div className="wz_why_list">
                                            {/* <div className="addImg"></div> */}
                                            <ImagePicker multiple={true} files={files} onChange={files => this.setState({files})}/>
                                        </div>

                                        <div className="wz_why_footer">
                                            <span onClick={e => this.next(e, 5, 2)}>填好了</span>
                                        </div>
                                    </div>
                                </div>
                                : ''
                            }
                            </div>
                            : ''
                        }

                        {
                            count > 4 ? <div className="wz_cancle">
                        <div className="wz_6">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        {
                                            bodyData.isSeekMedical === 1 ? `已就诊：${this.getABCD(1)} 已上传就诊相关资料${this.getABCD(2)}份` : '未到医院就诊'
                                        }
                                    </div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 3, 'isSeekMedical')}>撤回</span>
                                </div>

                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问当前是否有使用的药物？</div>
                                </div>

                                <div className="wz_1_con">
                                    {
                                        count > 5 ? <div className="wz_none"></div> : ''
                                    }

                                    <div className="wz_1_item" onClick={e => this.next(e, 6, 'isDrugs')}>是</div>
                                    <div className="wz_1_item" onClick={e => this.next(e, 7, 'isDrugs')}>否</div>
                                </div>

                            </div>

                        {
                            bodyData.isDrugs === 1 ? <div className="wz_7 wz_cancle">
                                <div className="wz_why">
                                    {
                                        count > 6 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">当前使用的药物</div>
                                    <div className="wz_why_list wz_mb20">
                                    <textarea placeholder="请描述药物名称、用法、剂量等信息" value={bodyData.drugContent} onChange={e => this.handleChange(e, 'drugContent')}></textarea>
                                    </div>
                                    <div className="wz_title">药物相关资料（处方/药盒/说明书等）</div>
                                    <div className="wz_why_list">
                                        {/* <div className="addImg"></div> */}
                                        <ImagePicker multiple={true} files={files1} onChange={files1 => this.setState({files1})}/>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 7, 3)}>填好了</span>
                                    </div>
                                </div>
                            </div>
                            : ''
                        }
                        </div>
                            : ''
                        }
                        {
                            count > 6 ? <div className="wz_cancle">
                        <div className="wz_8">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        {
                                            bodyData.isDrugs === 1 ? `已治疗：当前使用药物${bodyData.drugContent}, 已上传药物相关资料${this.getABCD(3)}份` : '当前未使用药品'
                                        }
                                    </div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 5, 'isDrugs')}>撤回</span>
                                </div>

                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问是否有反应病情的照片？</div>
                                </div>

                                <div className="wz_1_con">
                                    {
                                        count > 7 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_1_item" onClick={e => this.next(e, 8, 'isDrugImg')}>是</div>
                                    <div className="wz_1_item" onClick={e => this.next(e, 9, 'isDrugImg')}>否</div>
                                </div>

                            </div>

                        {
                            bodyData.isDrugImg === 1 ? <div className="wz_9 wz_cancle">
                                <div className="wz_why">
                                    {
                                        count > 8 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">病情相关照片</div>
                                    <div className="wz_why_list">
                                        {/* <div className="addImg"></div> */}
                                        <ImagePicker multiple={true} files={files2} onChange={files2 => this.setState({files2})}/>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 9, 4)}>填好了</span>
                                    </div>
                                </div>
                            </div>
                            : ''
                        }
                        </div>
                            : ''
                        }
                        {
                            count > 8 ? <div className="wz_10 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        {
                                            bodyData.isDrugImg === 1 ? `已上传相关病情照片${this.getABCD(4)}张` : '没有反应病情的照片'
                                        }

                                    </div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 7, 'isDrugImg')}>撤回</span>
                                </div>


                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问需要我为您提供哪方面的帮助？</div>
                                </div>

                                <div className="wz_why">
                                    {
                                        count > 9 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">需要医生提供的帮助</div>
                                    <div className="wz_why_list wz_mb20">
                                    <textarea placeholder="请描述就诊目的" value={bodyData.otherHelp} onChange={e => this.handleChange(e, 'otherHelp')}></textarea>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 10, 5)}>填好了</span>
                                    </div>
                                </div>

                            </div>
                            : ''
                        }

                        {
                            bodyData.isBreastCancerProblem === 1 && (bodyData.isSeekMedical === 3||bodyData.isSeekMedical === 4) ? <div className="wz_10 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">
                                        {
                                            bodyData.isSeekMedical === 4 ? `已就诊：${this.getABCD(1)} 已上传就诊相关资料${this.getABCD(2)}份` : '未到医院就诊'
                                        }

                                    </div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 3, 'isSeekMedical')}>撤回</span>
                                </div>


                                <div className="wz_doc_msg wz_item">
                                    <img src={docHeadicon} alt="" />
                                    <div className="wz_doc_msg_con">请问需要我为您提供哪方面的帮助？</div>
                                </div>

                                <div className="wz_why">
                                    {
                                        count > 9 || count1 > 1 ? <div className="wz_none"></div> : ''
                                    }
                                    <div className="wz_title">需要医生提供的帮助</div>
                                    <div className="wz_why_list wz_mb20">
                                    <textarea placeholder="请描述就诊目的" value={bodyData.otherHelp} onChange={e => this.handleChange(e, 'otherHelp')}></textarea>
                                    </div>

                                    <div className="wz_why_footer">
                                        <span onClick={e => this.next(e, 10, 5)}>填好了</span>
                                    </div>
                                </div>

                            </div>
                            : ''
                        }

                        {
                            count > 9 || count1 > 1 ? <div className="wz_11 wz_cancle">
                                <div className="wz_user_msg wz_item">
                                    <img src={userHeadicon} alt="" />
                                    <div className="wz_user_msg_con">{bodyData.otherHelp}</div>
                                    <span className="wz_ch" onClick={e => this.cancleMsg(e, 9, 'otherHelp')}>撤回</span>
                                </div>
                                <p className="wz_mb20">系统提示：感谢您的配合，如需进一步咨询，请先完成支付</p>
                                <button onClick={()=>this.submit()}>开始问诊</button>
                            </div>
                            : ''
                        }



                    </div>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default index;
