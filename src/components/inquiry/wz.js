import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import moment from 'moment';
import DocumentTitle from 'react-document-title'
// import {Link} from 'react-router-dom'

import axios from 'axios'
import qs from 'qs'
import $ from 'jquery'

import config from "../../config/wxconfig";
import URLconfig from "../../config/urlConfig";
import imgUrl from './images'

import Recorder from 'recorder-core/recorder.mp3.min'
import { createHashHistory } from 'history' //返回上一页这段代码
import BenzAMRRecorder from 'benz-amr-recorder'
var amr = new BenzAMRRecorder();
const history = createHashHistory(); //返回上一页这段代码

var rec;
/**调用open打开录音请求好录音权限**/
var recOpen=function(success){
    rec=Recorder({
        type:"mp3",sampleRate:16000,bitRate:16 
    });
    rec.open(function(){
        success&&success();
    },function(msg,isUserNotAllow){
        console.log((isUserNotAllow?"UserNotAllow，":"")+"无法录音:"+msg);
    });
};
function recStart(){
    rec.start();
};

class wzbl extends Component {
    constructor(props) {
        super(props);

        let { patientId, doctorId, questionnaireId, type } = this.props.match.params;
        this.state = {
            wz_title: '等待接诊',
            type: type,
            patientId: patientId,
            questionnaireId: questionnaireId,
            doctorId: doctorId,
            loginToken: localStorage.getItem('loginToken'),
            headicon: '',
            typeList: [
                {
                    type: 20,
                    imgSrc: imgUrl.quxiaowenz,
                    txt: '取消问诊'
                },
                {
                    type: 20,
                    imgSrc: imgUrl.send_courseware,
                    txt: '补充资料'
                },
                {
                    type: 30,
                    imgSrc: imgUrl.shenqkaiyao,
                    txt: '申请开药',
                    num: 10
                },
                {
                    type: 30,
                    imgSrc: imgUrl.send_picture,
                    txt: '发送图片'
                },
                {
                    type: 30,
                    imgSrc: imgUrl.fsshipin,
                    txt: '发送视频'
                },
                {
                    type: 30,
                    imgSrc: imgUrl.txhuifu,
                    txt: '提醒回复',
                    num: 12
                },
                {
                    type: 40,
                    imgSrc: imgUrl.shenqkaiyao,
                    txt: '申请开药',
                    num: 10
                },
                {
                    type: 40,
                    imgSrc: imgUrl.goumaizw,
                    txt: '购买追问'
                },
                {
                    type: 40,
                    imgSrc: imgUrl.pjyisheng,
                    txt: '评价医生'
                },
                {
                    type: 40,
                    imgSrc: imgUrl.zaicizixun,
                    txt: '再次咨询'
                },
                {
                    type: 41,
                    imgSrc: imgUrl.pjyisheng,
                    txt: '评价医生'
                },
                {
                    type: 41,
                    imgSrc: imgUrl.zaicizixun,
                    txt: '再次咨询'
                }
            ],
            msgList: [],
            dsq1: '',
            dsq2: '',
            msgValue: '',
            loading: true,
            height: '',
            tjysList: [],
            wtf: false,
            wtfy: false,
            zwNum: 0,
            zwData: '',
            num: 1,
            djsTime: '',
            dsq3: ''
        }

        this.getOrderId = this.getOrderId.bind(this);
        this.getOrderId = this.getOrderId.bind(this);
    }
    componentDidMount() {
        this.getUserData();
        this.dialogueList();
        const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
			});
        }, 2000)
        if(parseInt(this.state.type) === 40){
            this.getZwNum();
        }else if(parseInt(this.state.type) === 30){
            this.questionnaireByPatiend();
        }
    }
    componentWillUnmount(){
        clearInterval(this.state.dsq1);
        clearInterval(this.state.dsq2)
        clearInterval(this.timer)
    }
    componentWillReceiveProps(nextProps) {
        let { type } = nextProps.match.params;
        this.setState({
            type: type
        })

        type = parseInt(type);
        if(type === 30){
            this.questionnaireByPatiend();
            let dsq2 = setInterval(() => {
                this.diaNewlogueList();
            }, 1000*2);
            this.setState({
                dsq2
            });
        }else if(type === 40){
            this.getZwNum();
            this.setState({
                wtf: false
            })
        }
    }

    questionnaireByPatiend(){
        let { loginToken, doctorId, patientId, questionnaireId } = this.state;
		axios.post(config.publicUrl + 'appinquiry/questionnaireByPatiend.do', qs.stringify({doctorId: doctorId, patientId: patientId, id: questionnaireId}),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
                    let asTime = res.data.data.startDate + 1000*60*60*24*2;
                    this.countFun(asTime)
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});
    }
    countFun = (end) => {
        let now_time = Date.parse(new Date());
        var remaining = end - now_time;
        this.timer = setInterval(() => {
            //防止出现负数
            if (remaining > 1000) {
                remaining -= 1000;
                
                let day = Math.floor((remaining / 1000 / 3600) / 24);
                let hour = Math.floor((remaining / 1000 / 3600) % 24);
                let minute = Math.floor((remaining / 1000 / 60) % 60);
                let second = Math.floor(remaining / 1000 % 60);
                
                hour = day > 0 ? hour + 24 : hour;
                hour = hour < 10 ? "0" + hour : hour;
                minute = minute < 10 ? "0" + minute : minute;
                second = second < 10 ? "0" + second : second;
                let djsTime = hour+':'+minute+':'+second;
                this.setState({
                    djsTime
                })
            } else {
                clearInterval(this.timer);
                this.closeQuestionnaire();
            }
        }, 1000);
    }
    closeQuestionnaire(){
        let { loginToken, questionnaireId } = this.state;
		axios.post(config.publicUrl + '/appinquiry/closeQuestionnaire.do', qs.stringify({questionnaireId: questionnaireId}),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then((res) => {
                if (res.status === 200 && res.data.status === 1) {
                    this.props.history.replace('./40')
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});
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
						headicon: headicon
                    })
                    localStorage.setItem('headicon', headicon);
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});
	}
    getZwNum(){
        let { questionnaireId, loginToken } = this.state;

        axios.post(config.publicUrl + 'appDrinquiry/currCloselyNum.do', qs.stringify({
                questionnaireId: questionnaireId,
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    this.setState({
                        zwNum: res.data.data
                    });
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
    recStop = () => {
        let { loginToken, questionnaireId } = this.state;
        let _this = this;
        rec.stop(function(blob,duration){
            console.log(blob,(window.URL).createObjectURL(blob),"时长:"+parseInt(duration/1000)+"s");
            rec.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
            rec=null;
    
            var form=new FormData();
            form.append("resourceUrl", blob); //和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
            form.append("voiceDuration", parseInt(duration/1000));
            form.append("id", questionnaireId);
            console.log(form.get('resourceUrl'))
            Toast.loading('Loading...');
            axios.post(config.publicUrl + 'appinquiry/sendVoice.do', form,
                {
                    headers: {
                        loginToken: loginToken,
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then(res => {
                    if (res.status === 200 && res.data.status === 1) {
                        Toast.hide();
                        _this.setState({
                            wtfy: false
                        })
                    } else {
                        Toast.info(res.data.message, 2);
                        _this.setState({
                            wtfy: false
                        })
                    }
                })
                .catch(err => {
                    Toast.info(err, 2);
                });

    
        },function(msg){
            console.log("录音失败:"+msg);
            rec.close();//可以通过stop方法的第3个参数来自动调用close
            rec=null;
        });
    }
    dialogueList() {
        let { patientId, questionnaireId, loginToken, type } = this.state;

        axios.post(config.publicUrl + 'appinquiry/dialogueList.do', qs.stringify({
                questionnaireId: questionnaireId,
                patientId: patientId,
                page: 1,
                limit: 100
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    type = parseInt(type);
                    
                    let data = {
                        msgList: res.data.data
                    }
                    if(type === 20){
                        let dsq1 = setInterval(() => {
                            this.questionnaireById();
                        }, 1000*2);
                        data.dsq1 = dsq1;
                        
                    }

                    let dsq2 = setInterval(() => {
                        this.diaNewlogueList();
                    }, 1000*2);
                    data.dsq2 = dsq2;

                    if(res.data.data[res.data.data.length-1].type === 18){
                        this.getTJYS(res.data.data[res.data.data.length-1].recomendDrIds);
                    }
                    this.setState(data);
                    setTimeout(() => {
                        this.setScrollTo();
                    }, 1000);
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    diaNewlogueList() {
        let { patientId, questionnaireId, loginToken, msgList, type } = this.state;

        axios.post(config.publicUrl + 'appinquiry/diaNewlogueList.do', qs.stringify({
                questionnaireId: questionnaireId,
                patientId: patientId,
                logueId: msgList[msgList.length-1].id
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    if(res.data.data.length > 0){
                        type = parseInt(type);
                        if(type === 40){
                            this.getZwNum();
                        }
                        if(res.data.data[0].type === 18){
                            this.getTJYS(res.data.data[0].recomendDrIds);
                        }else if(res.data.data[0].type === 17){
                            this.props.history.replace('./40');
                        }else if(res.data.data[res.data.data.length-1].type === 16){
                            this.setState({
                                zwNum: 0
                            })
                        }else if(res.data.data[0].type === 8 || res.data.data[0].type === 9){
                            this.setState({
                                zwNum: res.data.data[0].content
                            })
                        }
                        this.setState({
                            msgList: [...msgList, ...res.data.data]
                        })
                        setTimeout(() => {
                            this.setScrollTo();
                        }, 100);
                    }
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    questionnaireById() {
        let { patientId, questionnaireId, loginToken, dsq1 } = this.state;

        axios.post(config.publicUrl + 'appinquiry/questionnaireById.do', qs.stringify({
                id: questionnaireId,
                patientId: patientId
            }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                   if(res.data.data.status !== 20){
                       clearInterval(dsq1);
                       this.props.history.replace('./'+res.data.data.status);
                   }
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }

    handleChange = (e) => {
        this.setState({
            msgValue: e.target.value
        })
    }
    playAMR(e, url) {
        let _this = $(e.currentTarget);
        if(_this.hasClass('play')){
            _this.removeClass('play').addClass('pause');
            amr.playOrPauseOrResume();
        }else{
            $('.audio').removeClass('pause');
            _this.addClass('play');
			amr.stop();
            
            Toast.loading('语音加载中...');
			amr = new BenzAMRRecorder();
            axios
                .post(
                    config.publicUrl + 'ringletter/filetobase64.do',
                    qs.stringify({ filepath: url }),
                    { headers: { loginToken: localStorage.getItem('loginToken') } }
                )
                .then((res) => {
                    if (res.status === 200) {

                        amr.initWithUrl("data:;base64," + res.data).then(() => {
                            Toast.hide();
                            amr.play();
                        });

                        amr.onEnded(() => {
                            _this.removeClass('play');
                        })
                    }
                })
                .catch((err) => {
                    console.log('base64' + err);
                });
        }
    }
    sendAudio(e) {
        let _this = $(e.currentTarget);
        if(_this.hasClass('play')){
            this.setState({
                wtf: false
            })
            _this.removeClass('play');
            // this.recStop();
        }else{
            this.setState({
                wtf: true
            })
            _this.addClass('play');
            // recOpen(() => recStart());
        }     
    }
    sendMsg = num => {
        let { patientId, questionnaireId, loginToken, msgValue } = this.state;
        let postData = {
            questionnaireId: questionnaireId,
            patientId: patientId,
            type: num
        }
        if(num === 1){
            postData.content = msgValue;
            if(!msgValue.trim()){
                Toast.info('请输入要发送的内容', 2);
                return false;
            }
        }
        axios.post(config.publicUrl + 'appinquiry/sendText.do', qs.stringify(postData),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    if(num === 1) this.setState({msgValue: ''});
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    setScrollTo = () => {
        let _obj = document.querySelector('.wz_list');
        let _height = _obj.childNodes[0].offsetHeight + 135;
        if (_height > 135) {
            _obj.scrollTop = _height;
        }
	}
    supplement = () => {
        let { doctorId, patientId, questionnaireId, dsq1, dsq2 } = this.state;
        clearInterval(dsq1);
        clearInterval(dsq2);
        this.props.history.push(`../../../../supplement/${patientId}/${doctorId}/${questionnaireId}`);
    }
    blDetails = () => {
        let { questionnaireId, patientId, doctorId, dsq1, dsq2 } = this.state;
        clearInterval(dsq1);
        clearInterval(dsq2);
        this.props.history.push(`../../../blDetails/${patientId}/${doctorId}/${questionnaireId}/1`);
    }
    operation (item, index){
        let { doctorId, patientId, questionnaireId, dsq2 } = this.state;
        if(item.type === 20 && index === 0){
            clearInterval(dsq2)
            this.props.history.push(`/orderDetail/${questionnaireId}/2`);
        }else if(item.type === 20 && index === 1){
            this.supplement();
        }else if(item.type === 30){
            if(index === 2 || index === 5) this.sendMsg(item.num);
            if(index === 3) $('#upload_img').click();
            if(index === 4) $('#upload_sp').click();
        } else if (item.type === 40 || item.type === 41) {
            if(index === 6) this.sendMsg(item.num);
            if(index === 7) this.getZwData()
            if(index === 8 || index ===10){
                clearInterval(dsq2)
                this.props.history.push(`../../../../../evaluateDoctor/${doctorId}/${patientId}/${questionnaireId}`);
            } 
            if(index === 9 || index === 11){
                clearInterval(dsq2)
                this.props.history.push('../../../../'+doctorId);
            } 
        }
    }
    getZwData() {
        let { patientId, questionnaireId, loginToken } = this.state;
        let postData = {
            questionnaireId: questionnaireId,
            patientId: patientId
        }
       
        axios.post(config.publicUrl + 'appinquiry/doctorQuestioningAmout.do', qs.stringify(postData),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    this.setState({
                        zwData: res.data.data
                    })
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    gmZw(e, num){
        if(num === 1){
            this.submit(1);
        }else if(num === 2){
            this.submit(2);
        }else if(num === 3){
            this.submit(3);
        }else{
            this.setState({
                zwData: ''
            })
        }
    }
    upload_img () {
        let { loginToken, questionnaireId, patientId } = this.state;

        let file = document.getElementById("upload_img").files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);

        Toast.loading('图片上传中...');
        reader.onload = function(e){
            axios.post(config.publicUrl + 'appinquiry/sendImgList.do', [{
                questionnaireId: questionnaireId,
                patientId: patientId,
                resourceUrl: this.result
            }],
            {
                headers: {
                    loginToken: loginToken
                }
            })
            .then(res => {
                if (res.status === 200 && res.data.status === 1) {
                    Toast.hide();
                } else {
                    Toast.info(res.data.message, 2);
                }
            })
            .catch(err => {
                Toast.info(err, 2);
            });
        }  
        
    }
    upload_sp = () => {
        let { loginToken, questionnaireId } = this.state;

        var formFile = new FormData();
        formFile.append("videoUrl", document.getElementById("upload_sp").files[0]); //加入文件对象
        formFile.append("id", questionnaireId);
        
        Toast.loading('视频上传中...');
        axios.post(config.publicUrl + 'appinquiry/sendVideo.do', formFile,
			{
				headers: {
                    loginToken: loginToken,
                    "Content-Type": "multipart/form-data"
				}
			})
			.then(res => {
				if (res.status === 200 && res.data.status === 1) {
                    Toast.hide();
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch(err => {
				Toast.info(err, 2);
            });
    }
    getTitle =() =>{
        // 10 未支付
        // 20 待接诊
        // 30 已接诊
        // 40 已结束   追问 
        // 41 已关闭  追问完毕
        // 11 医生拒绝
        // 9 用户退款
        let { type, djsTime, zwNum } = this.state;
        type = parseInt(type);
        if(type === 11) return '已拒绝';
        if(type === 20) return '等待接诊';
        if(type === 30) {
            return djsTime
        }
        if(type === 40) {
            return `剩余${zwNum}次回复`
        } 
        if(type === 41) return '已关闭';
    }
    getTJYS = (recomendDrIds) => {
        let { loginToken, doctorId } = this.state;
        let postData = {};
        recomendDrIds ? postData.ids = recomendDrIds : postData.doctorId = doctorId;
        axios.post(config.publicUrl + 'appinquiry/getRecommendDoctor.do', qs.stringify(postData),
        {
            headers: {
                loginToken: loginToken
            }
        })
        .then(res => {
            if (res.status === 200 && res.data.status === 1) {
                this.setState({
                    tjysList: res.data.data
                })
            } else {
                Toast.info(res.data.message, 2)
            }
        })
        .catch(err => {
            Toast.info(err, 2);
        });
    }
    wtfym = () => {
        this.setState({
            wtfy: true
        })
        recOpen(() => recStart())
    }
    wtfymo = () => {
        this.setState({
            wtfy: false
        })
        rec.stop(function(blob,duration){
            rec.close()
        })
    }
    wsbl(e, ids) {
        let { dsq1, dsq2, patientId, doctorId, questionnaireId, type } = this.state;
        let _this = $(e.currentTarget);
        if(!_this.hasClass('wtfk')){
            _this.addClass('wtfk');
            clearInterval(dsq1);
            clearInterval(dsq2);
            this.props.history.push(`../../../../wsbl/${patientId}/${doctorId}/${questionnaireId}/${type}/${ids}`);
        }
    }
    cfDetails(type){
        let { dsq1, dsq2, patientId, doctorId, questionnaireId } = this.state;
        clearInterval(dsq1);
        clearInterval(dsq2);
        this.props.history.push(`../../../cfDetails/${patientId}/${doctorId}/${questionnaireId}/${type}`);
    }


    //通过id获取orderId
    async getOrderId(questionId, giveNum) {
        await axios({
            url: config.publicUrl + '/business/generateOrder.do',
            method: 'post',
            data: {
                "orderType": 8,
                "paySource": 3,
                "payMode": 2,
                "supplierId": this.state.patientId,
                "productId": questionId,
                "giveNum": giveNum
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
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
                this.setState({num: 1})
            });
    }



    async submit(giveNum) {
        if(this.state.num === 1){
            this.setState({num: 2})
            await this.getOrderId(this.state.questionnaireId, giveNum);
            if (this.state.orderId) {
                this.toGetWXOrderInfo(this.state.orderId, localStorage.getItem('openid'));
            }
        }
    }

    async toGetWXOrderInfo(orderId, openid = localStorage.getItem('openid')) {
        await axios({
            url: config.publicUrl + '/wx/payOrder.do',
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
                this.setState({num: 1})
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
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
                    // that.props.history.push(`./wz/${patientData.patiend_id}/${doctorId}/${questionId}/20`);

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
                        that.setState({num: 1, zwData: ''}) 
                } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
                    // message.info("支付取消");
                    alert('支付取消');
                    that.setState({num: 1})
                } else if (res.err_msg === "get_brand_wcpay_request:fail") {
                    // router.push('/results/check')
                    alert('支付失败');
                    that.setState({num: 1})
                } else {
                    // message.info(res.err_msg);
                    // return false;
                    alert(res.err_msg);
                    that.setState({num: 1})
                }
                // WeixinJSBridge.log(response.err_msg);
            });
        } else {
            alert("网络异常。");
            that.setState({num: 1})
            // return false;
        }
    }

    //登录页
    goSign = () => {
        window.location.href=URLconfig.toWxHis+'/old&new/sign.html'
    };

    //接口token失效时处理
    goSignWhenMissLoginToken = (status, message) => {
        if (status && message && status === 2 && message === '权限错误') {
            this.failToast(message);
            setTimeout(() => {
                this.goSign();
            }, 1000);
        }
    };
    
    
    render() {
        let { tjysList, type, typeList, headicon, msgList, msgValue, loading, wtf, wtfy, zwNum, zwData} = this.state;
        // 问诊交流类型 1:文字 2:图片 3视频 4药品 5 检验 6 检查 7开其他医嘱 8医生赠送追问 9用户自己购买追问 10:用户申请开药 
        // 11:语音 12:提醒回复 13医生推荐文章 14问诊时间 15个人名片16追问已用完17问诊结束 18医生不接单 19继续提问 20已更新病历 
        // 21 病历 22医生第一条 23 用户第一条
        return (
            <DocumentTitle title="在线问诊">
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
                            <p>
                                {msgList.length > 0 ? JSON.parse(msgList[2].content).doctorName : ''}医生
                                ( <span className={type === '20' ? 'ddjz' : type === '30' ? 'zzjz' : ''}>{this.getTitle()}</span> )
                            </p>
                        </div>
                    </div>
                    <input type="file" id="upload_sp" onChange={this.upload_sp} accept="video/*" className="hide"/>
                    <input type="file" id="upload_img" onChange={e => this.upload_img(e)} accept="image/*" className="hide"/>
                    <div className="wz_list">
                        <div>
                        {
                            msgList.map((item, index) => {
                                if(item.type === 1 || item.type === 17 || item.type === 22 || item.type === 24){
                                    return <div key={index}>
                                                <div className={`wz_item ${item.userType === 1 ? 'wz_user_msg' : 'wz_doc_msg'}`}>
                                                    <img src={item.userType === 1 ? headicon : config.publicStaticUrl + item.headicon} alt=""/>
                                                    <div className={item.userType === 1 ? 'wz_user_msg_con' : 'wz_doc_msg_con'}>
                                                        {item.content}
                                                    </div>
                                                </div>
                                                {
                                                    item.type === 17 ? <div className="zw">
                                                                            <div className="zw_img"><img src={imgUrl.quan} alt=""/> x 2 </div>
                                                                            <div className="systemMsg">平台已赠送您2次追问机会，可继续提问</div>
                                                                        </div> : ''
                                                }
                                                {
                                                    item.type === 24 ? <div className="wz_start">
                                                                        <div className="wz_start_title">问诊已{item.type === 17 ? '结束' : '开始'}</div>
                                                                            <p><img src={imgUrl.wz_bg_1} alt=""/>问诊期间，不限制对话次数</p>
                                                                            <p><img src={imgUrl.wz_bg_2} alt=""/>48小时后，问诊自动结束</p>
                                                                            <p><img src={imgUrl.wz_bg_3} alt=""/>医生给出明确建议后，可提前结束诊断</p>
                                                                        </div> : ''
                                                }
                                            </div>
                                } else if(item.type === 2) {
                                    return <div className={`wz_item ${item.userType === 1 ? 'wz_user_msg' : 'wz_doc_msg'}`} key={index}>
                                                <img src={item.userType === 1 ? headicon : config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className={item.userType === 1 ? 'wz_user_msg_con' : 'wz_doc_msg_con'}>
                                                    <img src={config.publicStaticUrl + item.resourceUrl} alt=""/>
                                                </div>
                                            </div>
                                } else if(item.type === 3) {
                                    return <div className={`wz_item ${item.userType === 1 ? 'wz_user_msg' : 'wz_doc_msg'}`} key={index}>
                                                <img src={item.userType === 1 ? headicon : config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className={item.userType === 1 ? 'wz_user_msg_con' : 'wz_doc_msg_con'}>
                                                    <video controls src={config.publicStaticUrl + item.videoUrl}></video>
                                                </div>
                                            </div>
                                } else if(item.type === 11) {
                                    return <div className={`wz_item ${item.userType === 1 ? 'wz_user_msg' : 'wz_doc_msg'}`} key={index}>
                                                <img src={item.userType === 1 ? headicon : config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className={item.userType === 1 ? 'wz_user_msg_con' : 'wz_doc_msg_con'}>
                                                    <p onClick={e => this.playAMR(e, item.resourceUrl)} className="audio"></p>
                                                    {/* <audio src={config.publicStaticUrl + item.resourceUrl} controls></audio> */}
                                                </div>
                                            </div>
                                } else if(item.type === 4 || item.type === 5 || item.type === 6 || item.type === 7){
                                  let a = JSON.parse(item.supplementJson);
                                   return <div className="wz_item wz_doc_msg wz_cf" key={index} onClick={e => this.cfDetails(item.type)}>
                                        <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                        <div className="wz_doc_msg_con wz_cf_con">
                                            <div className="wz_cf_con_title">
                                                <p>
                                                    <img src={headicon} alt=""/>
                                                    <span className="wz_cf_con_name">{a.patientName}</span>
                                                    <span className="wz_cf_con_age">{a.sex} {a.age}岁</span>
                                                </p>

                                                <span className="wz_cf_con_time">{moment(a.createDate).format("YYYY-MM-DD")}</span>
                                            </div>
                                            <div className="wz_cf_con_txt">
                                                <div> 
                                                    <span>临床诊断:</span>
                                                    <p>
                                                        {
                                                            a.illName.split(',').map((item,index)=>{
                                                                return <span className="wz_cf_lczd" key={index}>{item}</span>
                                                            })
                                                        }
                                                    </p>
                                                </div>
                                                {
                                                    item.type === 4 ? <div>
                                                        <span>药品名称:</span>
                                                        <p><span>{a.drugName}</span></p>
                                                    </div> : ''
                                                }
                                                
                                                {
                                                    item.type === 5 ? <div>
                                                        <span>检验项目:</span>
                                                        <p>
                                                            {
                                                                a.examineName ? a.examineName.trim().split(' ').map((item1, index1) => {
                                                                    return <span className="wz_cf_jyxm" key={index1}>{item1}</span>
                                                                }) : ''
                                                            }
                                                        </p>
                                                    </div> : ''
                                                }

                                                {
                                                    item.type === 6 ? <div>
                                                        <span>检查项目:</span>
                                                        <p>
                                                            {
                                                                a.inspectName.trim().split(' ').map((item1, index1) => {
                                                                    return <span className="wz_cf_jyxm" key={index1}>{item1}</span>
                                                                })
                                                            }
                                                        </p>
                                                    </div> : ''
                                                }
                                                
                                               
                                                {
                                                    item.type === 5 || item.type === 6 ? <div>
                                                        <span>{item.type === 5 ? '检验' : '检查'}建议:</span>
                                                        <p><span>{a.proposedBody}</span></p>
                                                    </div> : ''
                                                }
                                                {
                                                    item.type === 7 ? <div>
                                                        <span>建议内容:</span>
                                                        <p><span>{a.otherAdv}</span></p>
                                                    </div> : ''
                                                }
                                               
                                            </div>
                                        </div>
                                    </div>
                                } else if(item.type === 8 || item.type === 9 || item.type === 10 || item.type === 12 || item.type === 16) {
                                    if(item.type === 8 || item.type === 9){
                                        return <div className="zw" key={index}>
                                                    <div className="zw_img"><img src={imgUrl.quan} alt=""/> x {item.content} </div>
                                                    <div className="systemMsg">{item.type === 8 ? `医生赠送${item.content}次追问` : `购买${item.content}次追问`}</div>
                                                </div>
                                    }else{
                                        return <div className="systemMsg" key={index}>{item.content}</div>
                                    }
                                } 
                                // else if(item.type === 13 ) {
                                //     let fuck = JSON.parse(item.supplementJson);
                                //     // let fuckContent = JSON.parse(fuck.content);
                                //     return <div className="wz_item wz_doc_msg fuck" key={index}>
                                //                 <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                //                 <div className="wz_doc_msg_con">
                                //                     <div className="fuck_title">{fuck.title}</div>
                                //                     <div className="fuck_con">
                                //                     <div className="fuck_txt">{fuck.content}</div>
                                //                         {/* <div className="fuck_txt">{fuckContent[0].title+fuckContent[0].content}</div> */}
                                //                         <img src={config.publicStaticUrl + fuck.image1} alt=""/>
                                //                     </div>
                                //                 </div>
                                //             </div>
                                // } 
                                else if( item.type === 15 ) {
                                    let fuck = JSON.parse(item.supplementJson);
                                    return <div className="wz_item wz_doc_msg fuck" key={index}>
                                                <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className="wz_doc_msg_con" onClick={e => this.props.history.push(`/doctorDetailedInformation/${item.content}/0/0`)}>
                                                    <div className="fuck_title">{fuck.name}的个人名片</div>
                                                    <div className="fuck_con">
                                                        <div className="fuck_txt">{fuck.hospital}、{fuck.doctorDepartment}、{fuck.doctorTitle}</div>
                                                        <img src={config.publicStaticUrl + fuck.headicon} alt=""/>
                                                    </div>
                                                </div>
                                            </div>
                                } else if(item.type === 18 ) {
                                    
                                    return <div key={index}>
                                            <div className="wz_item wz_doc_msg" key={index}>
                                                <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className="wz_doc_msg_con">{item.content}</div>
                                            </div>
                                            <div className="tjys">
                                                <p className="tjys_title">平台为您推荐了以下医生</p>
                                                <div className="tjys_list">
                                                {
                                                    tjysList.map((item1, index1) => {
                                                        return  <div className="tjys_item" key={index1} onClick={() => this.props.history.push(`/doctorDetailedInformation/${item1.id}/0/0`)}>
                                                                    <span>{item.evaluateScore}</span>
                                                                    <img src={config.publicStaticUrl + item1.headicon} alt=""/>
                                                                    <p className="tjys_item_name">{item1.name}</p>
                                                                    <p className="tjys_item_zw">{item1.doctorTitle}</p>
                                                                </div>
                                                    })
                                                }
                                                </div>
                                            </div>
                                            <p className="tjys_lists">没有合适的？<span onClick={() => this.props.history.push("/diagnosisList")}>查找更多专家</span></p>
                                            </div>
                                } else if(item.type === 19 ) {
                                    return <div key={index}>
                                            <div className="wz_item wz_doc_msg" key={index}>
                                                <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                                <div className="wz_doc_msg_con">请您继续完善你的病历</div>
                                            </div>
                                            {
                                                item.readStatus === 1 ? <div className="wsbl wz_mb20">
                                                                            <p className="isOk">完善病历</p>
                                                                        </div>
                                                 :  <div className="wsbl wz_mb20" onClick={e => this.wsbl(e, item.content)}>
                                                        <p>完善病历</p>
                                                    </div>
                                            }
                                            
                                            </div>
                                } else if(item.type === 21) {
                                    let blList = JSON.parse(item.content);
                                    return <div className="wz_item wz_user_bl_msg" key={index} onClick={this.blDetails}>
                                                <img src={headicon} alt=""/>
                                                <div className="wz_user_bl_msg_con">
                                                    <p className="title">
                                                        <img src={imgUrl.bingliben} alt=""/>
                                                        {blList.patientName}的病历
                                                    </p>
                                                    <div className="wz_user_bl_msg_txt">
                                                        <p>疾病名称/症状：<span>{blList.beIllName}</span></p>
                                                    </div>
                                                    <div className="wz_user_bl_msg_txt">
                                                        <p className="wz_mr20">疾病部位：<span>{blList.beIllLocation}</span></p>
                                                        <p>患病时间：<span>{blList.beIllDate}</span></p>
                                                    </div>
                    
                                                    <div className="wz_user_bl_msg_footer">
                                                        {moment(blList.createDate).format("YYYY-MM-DD")}
                                                    </div>
                                                </div>
                                            </div>
                                    
                                } else if(item.type === 13 || item.type === 27 || item.type === 26 || item.type === 25) {
                                    let roomData = JSON.parse(item.supplementJson), _type;
                                    if(item.type === 27) _type = 2;
                                    if(item.type === 26) _type = 5;
                                    if(item.type === 25) _type = 3;
                                    if(item.type === 13) _type = 4;
                                    return <div className="wz_item wz_doc_msg" key={index}>
                                                <img src={headicon} alt=""/>
                                                <div className="wz_doc_msg_con wz_doc_msg_con_room" onClick={e => this.props.history.push(`/detailedInformation/${item.content}/${_type}/0/0`)}>
                                                    <img src={config.publicStaticUrl + roomData.image1} alt=""/>
                                                    <p>{roomData.title}</p>
                                                </div>
                                            </div>
                                    
                                }
                            })
                        }
                             
                        </div>
                    </div>



                    <div className="wz_footer">
                        {
                            parseInt(type) === 11 ? '' : 
                            <div className="aaa">
                            {
                                typeList.map( (item, index) => {
                                    return item.type === (zwNum > 0 ? 30 : parseInt(type)) ? <div onClick={() => this.operation(item, index) } className="aaa_item" key={index}>
                                        <img src={item.imgSrc} alt=""/>
                                        <p>{item.txt}</p>
                                    </div> : ''
                                    
                                })
                            }
                            </div>
                        }
                        {
                            parseInt(type) === 30 || zwNum > 0 ? <div className="bbb">
                                                {/* <img src={imgUrl.yuyin_defu} alt="" onClick={e => this.sendAudio(e)}/> */}
                                                <input type="text" placeholder="请输入" value={msgValue} onChange={this.handleChange} />
                                                {/* <img src={imgUrl.biaoqin_defu} alt=""/> */}
                                                <button onClick={() => this.sendMsg(1)} className="send">发送</button>
                                            </div>
                                        : <div className="bbb" style={{marginTop: type === '11' ? '48px' : '0'}}>
                                            {/* <img src={imgUrl.yuyin} alt=""/> */}
                                            <button className="no_send">禁止对话</button>
                                            {/* <img src={imgUrl.biaoqing} alt=""/> */}
                                            {/* <img src={imgUrl.liaotian_gengduo} alt=""/> */}
                                            <button className="stopSend">发送</button>
                                        </div>
                        }
                    </div>
                    {
                        wtf ? <div className="wtf">
                            {
                                wtfy ? <div className="wtfy">
                                            <img src={imgUrl.sent_icon} alt="" onClick={this.recStop}/>
                                            <p>点击发送</p>
                                            <div className="wtfym">
                                                <img src={imgUrl.cancel_icon} alt="" onClick={this.wtfymo} />
                                                <p>取消</p>
                                            </div>
                                        </div>
                                    : <div className="wtfy">
                                            <img src={imgUrl.record_icon} alt="" onClick={this.wtfym}/>
                                            <p>点击录音</p>
                                        </div>
                            }
                                
                            </div> : ''
                    }
                    {
                        zwData ? <div className="gmzw">
                                    <div className="gmzwList">
                                        <p className="zw_item zw_title">剩余{zwData.questioningNum}次购买机会</p>
                                        <p className="zw_item" onClick={e => this.gmZw(e, 1)}>购买1次追问（￥价值 {zwData.questioningOne}）</p>
                                        <p className="zw_item" onClick={e => this.gmZw(e, 2)}>购买2次追问（￥价值 {zwData.questioningTwo}）</p>
                                        <p className="zw_item" onClick={e => this.gmZw(e, 3)}>购买3次追问（￥价值 {zwData.questioningThree}）</p>
                                        <p onClick={e => this.gmZw(e, 4)}>取消</p>
                                    </div>
                                </div>
                            : ''
                    }
                    
                </div>

            </DocumentTitle>
        );
    }
}

export default wzbl;