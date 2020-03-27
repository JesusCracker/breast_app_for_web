import React , { Component } from 'react';
import axios from 'axios'
import URLconfig from "../config/urlConfig";
import { Modal } from 'antd-mobile';

const alert = Modal.alert;

const showAlert = (title , msg) => {
    const alertInstance = alert('' , msg , [
        // { text: 'Cancel', onPress: () => console.log('cancel'), style: 'default' },
        {text: 'OK' , onPress: () => console.log('ok'),style: 'default'} ,
    ]);
    setTimeout(() => {
        // 可以调用close方法以在外部close
        alertInstance.close();
    } , 50000);
};

/*const App = () => (
    <WingBlank size="lg">
        <Button onClick={showAlert}>customized buttons</Button>
    </WingBlank>
);*/



//获取截取字符串的name
const getUrlParam = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

var code = getUrlParam('code');
// alert('code----',code);


const getIDs = (code) => {
    axios({
        url: URLconfig.publicUrl + '/wx/getWxUser.do' ,
        method: 'post' ,
        data: {
            "code": code ,
            "type": 1
        } ,
        transformRequest: [ function (data) {
            let ret = ''
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        } ] ,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {

        if (response.status === 200 && response.data.status === 1) {
            // alert('openid:'+response.data.data.openid);
            localStorage.setItem('openid' , response.data.data.openid);
            localStorage.setItem('unionid' , response.data.data.unionid);
            config.openid = localStorage.getItem('openid');
            config.unionid = localStorage.getItem('unionid');

            getEase();
            if (response.data.data.loginToken === null || response.data.data.loginToken.length === 0) {
                window.location.href = URLconfig.toWxHis+'/old&new/sign.html';

            } else {
                // localStorage.removeItem('loginToken');
                // alert(response.data.data.loginToken);

                localStorage.setItem('loginToken' , response.data.data.loginToken);
                config.loginToken = localStorage.getItem('loginToken');
                // alert(localStorage.getItem('loginToken'))
            }
        } else {
            // showAlert('',response.data.message);
        }
    })
        .catch(function (error) {
            // alert(JSON.stringify(error));
        });

};


const getEase = () => {
    if (localStorage.getItem('openid') || localStorage.getItem('unionid')) {

        axios({
            url: URLconfig.publicUrl + '/wx/getLoginToken.do' ,
            method: 'post' ,
            data: {
                "openid": localStorage.getItem('openid') ,
                "unionid": localStorage.getItem('unionid') ,
            } ,
            transformRequest: [ function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            } ] ,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            if (response.status === 200 && response.data.status === 1) {
                // localStorage.removeItem('ringUser');
                // localStorage.removeItem('loginToken');
                localStorage.setItem('ringUser' , response.data.data.ringUser);
                localStorage.setItem('loginToken' , response.data.data.loginToken);
                localStorage.setItem('userId',response.data.data.userId);

                config.ringUser = localStorage.getItem('ringUser');
                config.loginToken = localStorage.getItem('loginToken');
                config.userId= localStorage.getItem('userId');
            }

        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }
}

if (code) {
    getIDs(code);

    // alert('loginToken:'+config.loginToken);
    // alert('loginToken1:'+localStorage.getItem('loginToken'));

}

const wxurl = window.location.href;


//改变页面的title&统一接口参数
export const changeModuleTitleType=(type)=>{
    let shareType=0;
    //queryContentType  1 全部 2 直播 3 视频 4 图文 5 语音 6 精选好文 7 热门排行
    // 订单类型3：问答   5:文章  6 视频 7 直播
    if (type === 7) {
        shareType=2;
    }
    else if (type === 6) {
        shareType=3;
    }
    else if (type === 5) {
        shareType=4;
    }
    else if (type === 3) {
        shareType=5;
    }
    else{
        shareType=type;
    }
    return shareType;
};

// showAlert('xxx',scanCodePage);

const share2Friend = (whereIs='here',shareType=0,liveID='',title='乳腺好大夫',desc='您的乳腺守护专家',thumbnail='') => {
    shareType=changeModuleTitleType(shareType);

    axios({
        url: URLconfig.publicUrl + '/wx/jsSdkWithoutCode.do' ,
        method: 'post' ,
        data: {
            "url": wxurl ,
        } ,
        transformRequest: [ function (data) {

            let ret = '';
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        } ] ,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {

        if (response.status === 200) {
            const scanCodePage=`${URLconfig.toWxHis}/pages/index.html#/attentionPage?whereIs=${whereIs}&shareType=${shareType}&liveID=${liveID}&isShare=1`;
            // showAlert('',scanCodePage);

            window.wx.config({
                debug: false , // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: response.data.appId , // 必填，公众号的唯一标识
                timestamp: response.data.timestamp , // 必填，生成签名的时间戳
                nonceStr: response.data.noncestr , // 必填，生成签名的随机串
                signature: response.data.signature ,// 必填，签名
                jsApiList: [  // 所有要调用的 API 都要加到这个列表中
                    /*分享到朋友圈,分享给朋友,分享到QQ*/
                    "onMenuShareTimeline" , "onMenuShareAppMessage" , "onMenuShareQQ"
                ] // 必填，需要使用的JS接口列表
            });
            window.wx.ready(function () {

                // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                const imgurl = thumbnail?thumbnail:URLconfig.toWxHis+'/pages/shareIcon.png';
              /*  const title = '苏逢锡诊所';
                const desc = '您的乳腺守护专家';
*/
                window.wx.onMenuShareTimeline({
                    title: title , // 分享标题
                    desc: desc , // 分享描述
                    link: scanCodePage , // 分享链接
                    imgUrl: imgurl , // 分享图标
                    success: function () {
                        // alert('分享成功');
                        // 用户确认分享后执行的回调函数
                        // return false;
                    } ,
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                        // alert('分享取消');
                        // return false;
                    }
                });
                window.wx.onMenuShareAppMessage({
                    title: title , // 分享标题
                    desc: desc , // 分享描述
                    link: scanCodePage, // 分享链接
                    imgUrl: imgurl , // 分享图标
                    type: '' , // 分享类型,music、video或link，不填默认为link
                    dataUrl: '' , // 如果type是music或video，则要提供数据链接，默认为空
                    success: function (res) {
                        // alert('分享成功');
                        // alert(JSON.stringify(res));
                        // 用户确认分享后执行的回调函数
                        // return false;
                    } ,
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                        // alert('分享取消');
                        // return false;
                    },
                    fail: function (res) {
                        alert(JSON.stringify(res));
                    }
                });
                window.wx.onMenuShareQQ({
                    title: title , // 分享标题
                    desc: desc , // 分享描述
                    link: scanCodePage , // 分享链接
                    imgUrl: imgurl , // 分享图标
                    success: function () {
                        // alert('分享成功');
                        // 用户确认分享后执行的回调函数
                        // return false;
                    } ,
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                        // alert('分享取消');
                        // return false;
                    }
                });

            });
            // console.dir();
        }

    })
        .catch(function (error) {
            alert(JSON.stringify(error));
        });

}

// share2Friend(0);


//config4OfficialServices
/*
const config = {

    publicUrl: 'http://aiplat.aisono.cn/aiplat/' ,

    publicStaticUrl: 'https://aihis.aisono.cn/platfile/' ,

    share2Friend
}
*/

//config4TestServices
const config = {

    publicUrl: 'http://www.aisono.cn/aiplat/' ,

    publicStaticUrl: 'https://www.aisono.cn/platfile/' ,

    share2Friend

};



export default config
