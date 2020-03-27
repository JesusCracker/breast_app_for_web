function getUrl() {
	var apiUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//a1-hsb.easemob.com'
	var xmppUrl = '//im-api.easemob.com/ws'
	if (window.location.href.indexOf('webim-h5.easemob.com') !== -1) {
		apiUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//a1.easemob.com'
		xmppUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//im-api-v2.easemob.com/ws'
	} else if (window.location.href.indexOf('webim-hsb-ly.easemob.com') !== -1) {
		apiUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//a1-hsb.easemob.com'
		xmppUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//im-api-v2-hsb.easemob.com/ws'
	} else if (window.location.href.indexOf('localhost') !== -1) {
		apiUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//a1.easemob.com'
		xmppUrl = (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//im-api-v2.easemob.com/ws'
	}
	return {
		apiUrl: apiUrl,
		xmppUrl: xmppUrl
	}
}

var config = {
	xmppURL: getUrl().xmppUrl, //(window.location.protocol === "https:" ? "https:" : "http:") + "//im-api-v2-hsb.easemob.com/ws",
	apiURL: getUrl().apiUrl, //(window.location.protocol === "https:" ? "https:" : "http:") + "//a1-hsb.easemob.com",

	appkey: '1110190710085049#aiwe', //环信测试环境的appkey
	// appkey:'1110190710085049#breastdoctor', //环信正式环境的appkey

	https: false,                            // 是否使用https
	isHttpDNS: true,                         //防止DNS劫持从服务端获取XMPPUrl、restUrl
	isMultiLoginSessions: false,              // 是否开启多页面同步收消息，注意，需要先联系商务开通此功能
	isAutoLogin: true,                        // 自动出席，（如设置为false，则表示离线，无法收消息，需要在登录成功后手动调用conn.setPresence()才可以收消息）
	isDebug: true,                           // 打开调试，会自动打印log，在控制台的console中查看log
	autoReconnectNumMax: 2,                   // 断线重连最大次数
	autoReconnectInterval: 2,                 // 断线重连时间间隔
	heartBeatWait: 4500,                       // 使用webrtc（视频聊天）时发送心跳包的时间间隔，单位ms
	delivery: true,                           // 是否发送已读回执
}
export default config