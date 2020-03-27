import React, {Component} from 'react';
import '../less/downloadTips.less'
import {Modal, Toast} from "antd-mobile";
import URLconfig from "../config/urlConfig";
import {changeModuleTitleType} from '../config/wxconfig';

const alert = Modal.alert;

class DownloadTips extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
        var u = navigator.userAgent, app = navigator.appVersion;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isAndroid) {
            //这个是安卓操作系统
            this.setState({
                os: 'android'
            })
        }
        if (isIOS) {
            //这个是ios操作系统
            this.setState({
                os: 'ios'
            })
        }

        const {contentType, id, whereIs, client} = this.props;
        //client 1用户端 2医生端
        this.setState({
            whereIs: whereIs,
            contentType: changeModuleTitleType(contentType),
            id: id,
            fromClient: parseInt(client)
        })
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

    goIOSAPP(os, client, whereIs) {
        const {contentType, id} = this.state;
        if (os === 'ios' && client === 2 && (whereIs === 'detailModule' || whereIs === 'roomModule' || whereIs === 'commentListModule')) {
            window.location = `${URLconfig.toWxHis}/openAPP/index.html#/detailedInformation/${id}/${contentType}/1/${client}`
        } else if (os === 'ios' && client === 2 && (whereIs === 'doctorDetailedInformation')) {
            window.location = `${URLconfig.toWxHis}/openAPP/index.html#/doctorDetailedInformation/${id}/1/${client}`
        }
    }

    changeTips(os, client) {
        if (os === 'ios' && client === 2) {
            return '稍等片刻，即将跳转...'
        } else {
            return '点击右上角选择浏览器打开'
        }
    }

    downloadAPP(client) {

        //client：1医生端 2.用户端
        const {contentType, id, whereIs, os} = this.state;

        var openTime = +new Date();
        let self = this;
        // 微信环境
        self.isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false;
        if (self.isWeiXin) {
            Toast.info(this.changeTips(os, client), 0.5, () => {
                this.goIOSAPP(os, client, whereIs)
            });
        }
        self.checkPhone();
        let agent = (navigator.userAgent || navigator.vendor || window.opera);
        if (agent != null) {
            let agentName = agent.toLowerCase();

            // Toast.info(agentName)
            if (self.isAndroid) {


                // alert(self.isWeiXin);
             /*   // 微信环境
                if (self.isWeiXin) {
                    self.downloadInWeixin = true;
                    window.location.hash = 'download';   // 改变hash，便于浏览器打开时直接下载安卓包
                    return
                }*/
                if (client === 1) {
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
                    if (whereIs === "doctorDetailedInformation") {
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
                } else if (client === 2) {
                    // 详情
                    if (whereIs === 'detailModule') {
                        window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                    }
                    if (whereIs === 'roomModule') {
                        window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                    }
                    if (whereIs === 'commentListModule') {
                        window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                    }
                    //医生主页
                    if (whereIs === "doctorDetailedInformation") {
                        window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                    }

                    // 安卓包用户端下载地址
                    let timer = setTimeout(function () {
                        if ((new Date()) - openTime < 2200) {//加了200ms基准误差
                            window.location.href = URLconfig.androidDownloadUrl
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
                if (client === 1) {

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
                    if (whereIs === "doctorDetailedInformation") {
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
                } else if (client === 2) {

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
                    if (whereIs === "doctorDetailedInformation") {
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

                }
            } else {
                Toast.fail('暂不支持，敬请期待~', 2000)

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


    renderInfo = (client) => {

        // 就按1医生 0,2用户哈
        if (client === 1 ) {
            return (<div className={'downloadApp'}>
                <img src={require("../images/doctorapp_logo.png")} alt=""/>
                <span className={'appName'}>乳腺好大夫（医生端）</span>
                <div className={'btn'} onClick={() => {
                    this.downloadAPP(1)
                }}>
                    <span>立即下载</span>
                </div>
            </div>)
        }
        if (client === 2|| client === 0) {
            return (<div className={'downloadApp'}>
                <img src={require("../images/userapp_logo.png")} alt=""/>
                <span className={'appName'}>乳腺好大夫</span>
                <div className={'btn'} onClick={() => {
                    this.downloadAPP(2)
                }}>
                    <span>立即下载</span>
                </div>
            </div>)
        }
    }


    render() {
        const {client} = this.props;
        return (
            <div>
                {this.renderInfo(parseInt(client))}
            </div>

        );

    }
}

DownloadTips.propTypes = {};

export default DownloadTips;
