import React from 'react';
import {Modal} from 'antd-mobile';
import collect_icon from '../images/collect_icon.png';
import collect_has_icon from '../images/collect_has_icon.png';
import DocumentTitle from 'react-document-title';
import '../css/share.css';

const alert = Modal.alert;


class shareUserSide extends React.Component {
    constructor(props) { //构造函数
        super(props);
        this.state = {
            loading: true,
            iswx: false,
            downloadtitle: '你已安装乳腺好大夫APP',
            downloadlink: 'https://itunes.apple.com/cn/app/id1440139885?mt=8',
            // downloadlink:'apps.apple.com/cn/app/乳腺好大夫/id1440139885',
            downloadtext: '下载乳腺好大夫APP',
        }
    }

    //判断是不是在微信
    is_weixin() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) === "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    //判断手机类型
    get_phonetype() {
        let equipmentType = "";
        let agent = navigator.userAgent.toLowerCase();
        let android = agent.indexOf("android");
        let linux = agent.indexOf("linux");
        let iphone = agent.indexOf("iphone");
        let ipad = agent.indexOf("ipad");
        if (android !== -1 || linux !== -1) {
            equipmentType = "android";
        }
        if (iphone !== -1 || ipad !== -1) {
            equipmentType = "ios";
        }
        return equipmentType;
    }

    //请求数据
    getData() {

        let _this = this;
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;//安卓终端
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

        let self = this;
        // 微信环境
        self.isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false;
        if (self.isWeiXin && isIOS && !isAndroid) {

        } else if (self.isWeiXin && !isIOS && isAndroid) {
            _this.setState({
                iswx: true,
            });

            if (isAndroid) {
                _this.setState({
                    downloadlink: 'https://aihis.aisono.cn/platfile/appApK/app-user.apk',
                });
            } else if (isIOS) {
                _this.setState({
                    downloadlink: 'https://itunes.apple.com/cn/app/id1440139885?mt=8',
                });
            }

        } else {//非微信浏览器

            _this.setState({
                iswx: false,
            });

            if (isIOS) {
                try {
                    window.location = "five://"; //由ios提供
                    setTimeout(function () {
                        _this.setState({
                            downloadlink: 'https://itunes.apple.com/cn/app/id1440139885?mt=8',
                            // downloadlink: 'apps.apple.com/cn/app/乳腺好大夫/id1440139885',
                        });

                    }, 1000);
                } catch (e) {
                }

                // var loadDateTime = new Date();
                // window.setTimeout(function() {
                // 	var timeOutDateTime = new Date();
                // 	if (timeOutDateTime - loadDateTime < 5000) {
                // 		_this.setState({
                // 			downloadlink: 'https://apps.apple.com/cn/app/乳腺好大夫/id1440139885',
                // 		});

                // 	} else {
                // 		window.close();
                // 	}
                // },2000);
                // window.location = "five://"; //由ios提供
            } else if (isAndroid) {
                try {
                    window.location = 'five://'; //由android提供
                    setTimeout(function () {
                        _this.setState({
                            downloadlink: 'https://aihis.aisono.cn/platfile/appApK/app-user.apk',
                        });

                    }, 1000);
                } catch (e) {
                }
            }
        }

    }

    //跳转下载
    downloadto() {
        window.open(this.state.downloadlink);
    }

    //返回
    backto_page() {
        window.history.back(-1);
    }

    componentDidMount() {

        setTimeout(() => {
            this.setState({
                loading: false,
            });
        }, 2000)
        this.getData()
    }

    onError() {
        // this.setState({

        // })
    }


    render() {
        // alert(this.state.loading)
        if (this.state.loading === true) {
            return (

                <DocumentTitle title='乳腺好大夫简介'>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                    }}>
                        <img src={require("../images/loading.gif")} alt="loading"/>
                    </div>
                </DocumentTitle>
            )
        } else {
            return (
                <DocumentTitle title='乳腺好大夫简介'>
                    <div style={{width: '100%', height: '100%', backgroundColor: '#ffffff', position: 'relative'}}>

                        <div className="openiswx" style={this.state.iswx ? {
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            background: 'url(' + require("../images/iswxshare_bg.png") + ') no-repeat',
                            backgroundSize: '100% auto',
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            zIndex: '999'
                        } : {display: "none"}}>
                            <p className="openiswx_text" style={{
                                display: 'none',
                                width: '100%',
                                height: '30px',
                                position: 'absolute',
                                top: '2%',
                                left: '0px'
                            }}>{this.state.downloadtitle}</p>
                            <a className="openiswx_btn"
                               style={{position: 'absolute', bottom: '5%', left: '0px', display: 'none'}}
                               onClick={this.downloadto.bind(this)}
                            >{this.state.downloadtext}</a>
                            <div style={{
                                display: 'block',
                                width: '100%',
                                height: '6.22%',
                                backgroundColor: '#ffffff',
                                position: 'absolute',
                                top: '0',
                                left: '0px'
                            }}/>
                        </div>

                        <div className='sharepage_top'
                             style={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'space-between',
                                 width: '100%',
                                 height: '60px',
                                 padding: '0 20px',
                                 position: 'absolute',
                                 top: '0',
                                 left: '0',
                                 backgroundColor: 'rgba(255, 255, 255, 0.8)'
                             }}
                        >
                            <div className="sharepage_top_logobox"
                                 style={{
                                     flex: 1,
                                     height: '100%',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'flex-start'
                                 }}
                            >
                                <img src={require("../images/userapp_logo.png")} alt="logo"
                                     style={{display: 'block', width: '46px', height: '46px'}}/>

                                <div className="sharepage_top_logotext"
                                     style={{
                                         flex: 1,
                                         display: 'flex',
                                         alignItems: 'center',
                                         justifyContent: 'flex-start',
                                         flexWrap: 'wrap',
                                         paddingLeft: '10px'
                                     }}
                                >
                                    <p className="sharepage_top_logotext1"
                                       style={{
                                           width: '100%',
                                           lineHeight: '28px',
                                           fontSize: '18px',
                                           color: '#333333',
                                           fontWeight: 'bolder',
                                           overflow: 'hidden'
                                       }}
                                    >乳腺好大夫</p>
                                    <p
                                        style={{
                                            width: '100%',
                                            lineHeight: '20px',
                                            fontSize: '12px',
                                            color: '#333333',
                                            overflow: 'hidden'
                                        }}
                                        className="sharepage_top_logotext2">您身边的乳腺智能管理专家</p>
                                </div>

                            </div>

                            <div className="sharepage_top_btn"
                                 style={{
                                     width: '80px',
                                     height: '100%',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'flex-end'
                                 }}
                            >
                                <a
                                    style={{
                                        display: 'flex',
                                        width: '76px',
                                        height: '32px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#529EFF',
                                        fontSize: '14px',
                                        borderRadius: '16px',
                                        border: '1px solid #529EFF'
                                    }}
                                    onClick={this.downloadto.bind(this)}
                                >立即下载</a>
                            </div>


                        </div>
                        <div className='sharepage_bgimgbox'
                             style={{
                                 width: '100%',
                                 height: '100%',
                                 display: 'flex',
                                 alignItems: 'flex-start',
                                 justifyContent: 'center',
                                 backgroundColor: '#ffffff',
                                 overflow: 'hidden'
                             }}
                        >
                            <img src={require("../images/usershare_bg.png")} alt="img"
                                 style={{display: 'block', width: '100%', height: 'auto'}}/>
                        </div>
                        <div className='sharepage_bottom'
                             style={{
                                 width: '100%',
                                 height: 'auto',
                                 padding: '10px',
                                 paddingBottom: '30px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 flexWrap: 'wrap',
                                 position: 'absolute',
                                 bottom: '0',
                                 left: '0',
                                 backgroundColor: '#ffffff'
                             }}
                        >
                            <p className='sharepage_bottom_text1'
                               style={{
                                   width: '100%',
                                   lineHeight: '28px',
                                   textAlign: 'center',
                                   fontSize: '15px',
                                   fontWeight: 'bold',
                                   color: 'rgba(51, 51, 51, 1)',
                                   marginBottom: '10px',
                                   overflow: 'hidden'
                               }}
                            >
                                扫码关注微信公众号
                            </p>
                            <img src={require("../images/shareScanCode.jpg")} alt="code"
                                 style={{display: 'block', width: '90px', height: '90px'}}/>
                            <p className='sharepage_bottom_text2'
                               style={{
                                   width: '100%',
                                   lineHeight: '28px',
                                   textAlign: 'center',
                                   fontSize: '14px',
                                   color: 'rgba(51, 51, 51, 1)',
                                   marginTop: '10px',
                                   overflow: 'hidden'
                               }}
                            >
                                乳腺好大夫 & 最懂你的乳腺健康管理专家
                            </p>
                        </div>

                    </div>
                </DocumentTitle>


            );
        }
    }
}

export default shareUserSide;
