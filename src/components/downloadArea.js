import React, {Component} from 'react';
import '../less/downloadArea.less'
import {Modal, Toast, Button, Icon} from "antd-mobile";
import URLconfig from "../config/urlConfig";
import {changeModuleTitleType} from '../config/wxconfig';

const alert = Modal.alert;

class DownloadArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal1: false,
            modal2: false,
            os:'',
        };


    }


    componentDidMount() {
        var u = navigator.userAgent, app = navigator.appVersion;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isAndroid) {
            //这个是安卓操作系统
            this.setState({
                os:'android'
            })
        }
        if (isIOS) {
            //这个是ios操作系统
            // console.log('这个是ios操作系统')
            this.setState({
                os:'ios'
            })
        }
        const {contentType, id, whereIs} = this.props;
        this.setState({
            whereIs: whereIs,
            contentType: changeModuleTitleType(contentType),
            id: id,
        });
        // this.spacialMethod();
        // this.goIOSAPP(client,this.state.os)
        // this.juggleBroswer();
    }

    /*spacialMethod(){
        alert('提示', `点击右上角选择浏览器打开`, [
            // { text: '拒绝', onPress: () => console.log('cancel') },
            {text: '好的', onPress: () => {}, maskClosable: false},
        ]);
        return;
    }*/

    juggleBroswer(){
        // localStorage.removeItem('clientType')
        let clientType=localStorage.getItem('clientType');
        var u = navigator.userAgent, app = navigator.appVersion;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        let issafariBrowser = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        let self = this;
        self.isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false;
        // alert(self.isWeiXin===false&&issafariBrowser&&isIOS&&clientType&&parseInt(clientType)===2)


        if(self.isWeiXin===false&&issafariBrowser&&isIOS&&clientType&&parseInt(clientType)===2){

            localStorage.removeItem('clientType')

            window.location='http://aisono.cn/wxHis/openAPP/index.html#/'
        }
    }

    /* 判断用户手机为安卓还是iphone */
    checkPhone() {
        let self = this;
        let agent = (navigator.userAgent || navigator.vendor || window.opera);
        if (agent != null) {
            let agentName = agent.toLowerCase();
            if (/android/i.test(agentName)) {
                self.isAndroid = true;
            } else if (/iphone/i.test(agentName)) {
                self.isIOS = true;
            }
        }
    }


    showModal = key => (e) => {
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            [key]: true,
        });
    }
    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    goIOSAPP(os,client,whereIs){
        const {contentType, id} = this.state;
        if(os==='ios'&&client===2&&(whereIs==='detailModule'||whereIs==='roomModule'||whereIs==='commentListModule')){
            window.location=`${URLconfig.toWxHis}/openAPP/index.html#/detailedInformation/${id}/${contentType}/1`
        }
        else if(os==='ios'&&client===2&&(whereIs==='doctorDetailedInformation')){
            window.location=`${URLconfig.toWxHis}/openAPP/index.html#/doctorDetailedInformation/${id}/1`
        }
    }

    changeTips(os,client){
        if(os==='ios'&&client===2){
            return '稍等片刻，即将跳转...'
        }
        else{
            return '点击右上角选择浏览器打开'
        }
    }


    downloadAPP(client) {
        //client：1医生端 2.用户端
        const {contentType, id, whereIs,os} = this.state;
        let self = this;
        // 微信环境
        self.isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false;
        if (self.isWeiXin) {
            Toast.info(this.changeTips(os,client), 0.5, () => {
                this.goIOSAPP(os,client,whereIs)
            });

        }

        self.checkPhone();
        let agent = (navigator.userAgent || navigator.vendor || window.opera);
        if (client) {
            var openTime = +new Date();
            if (agent != null) {
                let agentName = agent.toLowerCase();
                // Toast.info(agentName)

                if (self.isAndroid) {
                    /*// 微信环境
                    if (self.isWeiXin) {
                        self.downloadInWeixin = true;
                        window.location.hash = 'download';   // 改变hash，便于浏览器打开时直接下载安卓包
                        return
                    }*/
                    // 安卓包下载地址
                    if (client === 2) {
                        //详情分享
                        if (whereIs === 'detailModule') {
                            window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'roomModule') {
                            window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'commentListModule') {
                            window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                        }
                        //医生主页分享
                        if(whereIs==="doctorDetailedInformation"){
                            window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                        }

                        let timer = setTimeout(function () {
                            if ((new Date()) - openTime < 2200) {//加了200ms基准误差
                                window.location.href = URLconfig.androidDownloadUrl
                            }
                            if ((new Date()) - openTime > 2200) {
                                clearTimeout(timer);
                            }
                        }, 2000);
                    } else {
                        //详情分享
                        if (whereIs === 'detailModule') {
                            window.location = `aiwedoc://android?contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'roomModule') {
                            window.location = `aiwedoc://android?contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'commentListModule') {
                            window.location = `aiwedoc://android?contentType=${contentType}&id=${id}`;
                        }
                        //医生主页分享
                        if(whereIs==="doctorDetailedInformation"){
                            window.location = `aiwedoc://android?contentType=${contentType}&id=${id}`;
                        }

                        let timer = setTimeout(function () {
                            if ((new Date()) - openTime < 2200) {//加了200ms基准误差
                                window.location.href = URLconfig.doctorAndroidDownloadUrl
                            }
                            if ((new Date()) - openTime > 2200) {
                                clearTimeout(timer);
                            }
                        }, 2000);
                    }

                } else if (self.isIOS) {
                    // 微信环境
                    if (self.isWeiXin) {
                        self.downloadInWeixin = true;
                        window.location.hash = 'download';    // 改变hash，便于浏览器打开时直接跳转AppStore
                        return
                    }


                    // 苹果商店链接地址
                    if (client === 2) {
                        //试图打开
                        //详情分享
                        if (whereIs === 'detailModule') {
                            window.location = `AIWE://contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'roomModule') {
                            window.location = `AIWE://contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'commentListModule') {
                            window.location = `AIWE://contentType=${contentType}&id=${id}`;
                        }
                        //医生主页分享
                        if(whereIs==="doctorDetailedInformation"){
                            window.location = `AIWE://contentType=${contentType}&id=${id}`;
                        }

                        let timer = setTimeout(function () {
                            if ((new Date()) - openTime < 2200) {//加了200ms基准误差
                                window.location.href = URLconfig.iosAppstoreUrl;
                            }
                            if ((new Date()) - openTime > 2200) {
                                clearTimeout(timer);
                            }
                        }, 2000);
                    } else {
                        //试图打开
                        //详情分享
                        if (whereIs === 'detailModule') {
                            window.location = `AIWEDoctor://contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'roomModule') {
                            window.location = `AIWEDoctor://contentType=${contentType}&id=${id}`;
                        }
                        if (whereIs === 'commentListModule') {
                            window.location = `AIWEDoctor://contentType=${contentType}&id=${id}`;
                        }
                        //医生主页分享
                        if(whereIs==="doctorDetailedInformation"){
                            window.location = `AIWEDoctor://contentType=${contentType}&id=${id}`;
                        }

                        let timer = setTimeout(function () {
                            if ((new Date()) - openTime < 2200) {//加了200ms基准误差
                                window.location.href = URLconfig.doctorIosAppstoreUrl;
                            }
                            if ((new Date()) - openTime > 2200) {
                                clearTimeout(timer);
                            }
                        }, 2000);
                    }
                } else {
                    Toast.fail('暂不支持，敬请期待~', 2000)

                }
            }
        }

    }

    identityHash() {
        let self = this;
        if (window.location.hash.includes('download')) {
            window.location.hash = '';   //  还原hash为空
            self.checkPhone();
            if (self.isAndroid) {
                // 安卓，弹出包下载页面
                window.location.href = URLconfig.androidDownloadUrl;
            } else if (self.isIOS) {
                // ios，直接跳转Appstore
                window.location.href = URLconfig.iosAppstoreUrl;
            } else {
                Toast.fail('暂不支持，敬请期待~', 2000)
            }
        }
    }

    chooseApp() {

    }


    render() {
        return (

            <div className={'downloadArea'}>
                <div className={'fifthPart'}>
                    <Modal
                        visible={this.state.modal1}
                        transparent
                        maskClosable={true}
                        onClose={this.onClose('modal1')}
                        title={<div className={'modalTitle'}>
                            下载选择
                            <span onClick={this.onClose('modal1')}>×</span>
                        </div>}

                        // footer={[{ text: 'Ok', onPress: () => { console.log('ok'); this.onClose('modal1')(); } }]}
                        // wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                        // afterClose={() => { alert('afterClose'); }}
                    >
                        <div style={{height: 'auto', overflow: 'scroll', width: '400px'}}>
                            <div className={'client setTop setSlash setBottom'}>
                                <img src={require('../images/userapp_logo.png')} alt=""/>
                                <div className={'name'}>乳腺好大夫用户版</div>
                                <div className={'downLoad'} onClick={() => {
                                    this.downloadAPP(2)
                                }}>点击下载
                                </div>
                            </div>
                            <div className={'client setTop'}>
                                <img src={require('../images/doctorapp_logo.png')} alt=""/>
                                <div className={'name'}>乳腺好大夫医生版</div>
                                <div className={'downLoad'} onClick={() => {
                                    this.downloadAPP(1)
                                }}>点击下载
                                </div>
                            </div>
                        </div>
                    </Modal>

                    {/*<div className={'downloadBtn'}  onClick={()=>{this.downloadAPP()}}>下载乳腺好大夫 APP</div>*/}
                    <div className={'downloadBtn'} onClick={this.showModal('modal1')}>下载乳腺好大夫 APP</div>

                    {this.chooseApp()}
                    <div className={'tips'}>
                        <span>扫码关注微信公众号</span>
                    </div>
                    <div className={'QRcode1'}>
                        <img src={require('../images/shareScanCode.jpg')} alt=""/>
                    </div>
                    <div className={'last'}>
                        <span>乳腺好大夫 & 最懂你的乳腺健康管理专家</span>
                    </div>
                </div>
            </div>
        );
    }
}

DownloadArea.propTypes = {};

export default DownloadArea;
