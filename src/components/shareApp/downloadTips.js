import React, {Component} from 'react';
import '../../less/downloadTips.less'
import {Modal,Toast, Icon} from "antd-mobile";
import URLconfig from "../../config/urlConfig";
import {changeModuleTitleType} from '../../config/wxconfig';
import './style.css'
const alert = Modal.alert;

class DownloadTips extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
        const {contentType,id,whereIs, type}=this.props;
        this.setState({
            whereIs:whereIs,
            contentType:changeModuleTitleType(contentType),
            id:id,
            type: type,
            tck: false
        })
    }

    /* 判断用户手机为安卓还是iphone */
    checkPhone () {
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

    downloadAPP(num){
        const {contentType,id,whereIs}=this.state;
        this.setState({tck: false})
        let self = this;
        // 微信环境
        self.isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false;
        if(self.isWeiXin){
            alert('提示', `点击右上角选择浏览器打开`, [
                // { text: '拒绝', onPress: () => console.log('cancel') },
                { text: '好的', onPress: () => console.log('ok') ,maskClosable:false},
            ]);
            return;
        }
        self.checkPhone();
        let agent = (navigator.userAgent || navigator.vendor || window.opera);
        if (agent != null) {
            let agentName = agent.toLowerCase();
            // Toast.info(agentName)

            if (self.isAndroid) {
                // 微信环境
                if (self.isWeiXin) {
                    self.downloadInWeixin = true;
                    window.location.hash = 'download';   // 改变hash，便于浏览器打开时直接下载安卓包
                    return
                }
                if(whereIs==='detailModule'){
                    window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                }
                if(whereIs==='roomModule'){
                    window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                }
                if(whereIs==='commentListModule'){
                    window.location = `aiwe://android?contentType=${contentType}&id=${id}`;
                }

                // 安卓包下载地址
                setTimeout(function(){

                    window.location.href = num === 1 ? URLconfig.doctorAndroidDownloadUrl : URLconfig.androidDownloadUrl
                }, 600);

            } else if (self.isIOS) {
                // 微信环境
                if (self.isWeiXin) {
                    self.downloadInWeixin = true;
                    window.location.hash = 'download';    // 改变hash，便于浏览器打开时直接跳转AppStore
                    return
                }

                //试图打开
                if(whereIs==='detailModule'){
                    window.location = `AIWE://contentType=${contentType}&id=${id}`;
                }
                if(whereIs==='roomModule'){
                    window.location = `AIWE://contentType=${contentType}&id=${id}`;
                }
                if(whereIs==='commentListModule'){
                    window.location = `AIWE://contentType=${contentType}&id=${id}`;
                }
                // 苹果商店链接地址
                setTimeout(function(){
                    window.location.href = num === 1 ? URLconfig.doctorIosAppstoreUrl : URLconfig.iosAppstoreUrl;
                    }, 100);

            } else {
                Toast.fail('暂不支持，敬请期待~',2000)

            }
            
        }

    }

    identityHash () {
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
              Toast.fail('暂不支持，敬请期待~',2000)
            }
        }
    }


    render() {
        console.dir(this.state);
        return (
            <div>
                <div className={'downloadApp'}>
                    <img src={this.state.type === 1 ? require("./images/doctorapp_logo.png") : require("./images/userapp_logo.png")} alt=""/>
                    <span className={'appName'}>乳腺好大夫</span>
                    <div className={'btn'} onClick={e => this.setState({tck: true})}>
                        <span>立即下载</span>
                    </div>
                </div>

                {
                    this.state.tck ? <div>
                    <div className="fuck_mtk"></div>
                    <div className="fuck_tck">
                        <p className="fuck_tck_title">
                            <span>下载选择</span>
                            <Icon type="cross" onClick={e => this.setState({tck: false})} />
                        </p>
                        <div className="fuck_tck_list">
                            <div className="fuck_tck_item">
                                <div className="fuck_tck_item_left">
                                    <img src={require("./images/userapp_logo.png")} alt=""/>
                                    <p>乳腺好大夫  用户版</p>
                                </div>
                                <div className="fuck_tck_item_right" onClick={e => this.downloadAPP(2)}>
                                    <span>点击下载</span>
                                </div>
                            </div>
                            <div className="fuck_tck_item">
                                <div className="fuck_tck_item_left">
                                    <img src={require("./images/doctorapp_logo.png")} alt=""/>
                                    <p>乳腺好大夫  医生版</p>
                                </div>
                                <div className="fuck_tck_item_right"  onClick={e => this.downloadAPP(1)}>
                                    <span>点击下载</span>
                                </div>
                            </div>
                        </div>
                    </div></div>: ''
                }
                
                
            </div>
        );
    }
}

DownloadTips.propTypes = {};

export default DownloadTips;