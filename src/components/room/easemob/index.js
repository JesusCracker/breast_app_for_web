// import webrtc from "easemob-webrtc"
// import emedia from "easemob-emedia"
import websdk from "easemob-websdk"
import config from "./webim.config"

let WebIM = window.WebIM || websdk


WebIM.config = config;
WebIM.conn = new WebIM.connection({
    appKey: WebIM.config.appkey,
    isHttpDNS: WebIM.config.isHttpDNS,
    isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
    host: WebIM.config.Host,
    https: WebIM.config.https,
    url: WebIM.config.xmppURL,
    apiUrl: WebIM.config.apiURL,
    isAutoLogin: true,
    heartBeatWait: WebIM.config.heartBeatWait,
    autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
    autoReconnectInterval: WebIM.config.autoReconnectInterval,
    // isStropheLog: WebIM.config.isStropheLog,
    delivery: WebIM.config.delivery
})


// WebIM.conn.listen({
//     onOpened: function (message) {          //连接成功回调
//         // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
//         // 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
//         // 则无需调用conn.setPresence();     
//         WebIM.conn.joinChatRoom({
//             roomId: '94169386254337' // 聊天室id
//         });
//     },
//     onTextMessage: function (message) {
//         console.log(JSON.stringify(message))
//     },    //收到文本消息
//     onPictureMessage: function (message) { }, //收到图片消息
//     onAudioMessage: function (message) { },   //收到音频消息
//     onPresence: function (message) {
//         console.log('“广播”或“发布-订阅”消息' + message)
//     },       //处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
//     onError: function (message) {
//         console.log('失败:' + message)
//     },          //失败回调
//     onReceivedMessage: function (message) {
//         console.log(message)
//     },    //收到消息送达服务器回执
//     onDeliveredMessage: function (message) {
//         alert('b')
//     },   //收到消息送达客户端回执
//     onReadMessage: function (message) {
//         alert('c')
//     },        //收到消息已读回执
    
// });

// WebIM.WebRTC = webrtc
// WebIM.EMedia = emedia

export default WebIM