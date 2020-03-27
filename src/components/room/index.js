import React, { Component } from 'react';
import { Toast, NoticeBar } from 'antd-mobile';

import moment from 'moment';
import axios from 'axios';
import qs from 'qs';
import WebIM from './easemob';

import config from "../../config/wxconfig";

import imgUrl from "./img";
import './style/index.css';
import WxImageViewer from 'react-wx-images-viewer';
import AudioMsg from './AudioMsg';


import { createHashHistory } from 'history' //返回上一页这段代码
import DocumentTitle from 'react-document-title'
import DownloadTips from "../downloadTips";
const history = createHashHistory(); //返回上一页这段代码

class index extends Component {
	constructor(props) {


		super(props);
		const { id } = this.props.match.params;

		this.state = {
			// loginToken: '38ef3372c1174f75880b8ceddadd20ba',
			// userId: '300',
			// user: 'user_300_1569207272190',
			user: localStorage.getItem('ringUser'),
			loginToken: localStorage.getItem('loginToken'),
			userId: localStorage.getItem('userId'),
			id: id,
			data: '',
			nickname: '',
			headicon: '',
			masterMsgList: [],
			userMsgList: [],
			danmu: true,
			taplun: false,
			send: false,
			value: '',
			loading: true,
			height: '',
			notice: '',
			tips: '',
			seeImg: '',
			liveDzNum: 0,
			imags: [],
			index: 0,
			isOpen: false,
			dsq1: '',
			dsq2: ''
		};
	}

	componentDidMount() {
		// document.addEventListener("visibilitychange", function() {
		// 	if(document.hidden || document.visibilityState == 'hidden'){
		// 		this.setState({loading: true})
		// 	}else{
		// 		window.location.reload()
		// 	}
		// });
		this.login();
		this.setState({
			isShare:parseInt(this.props.match.params.isShare),
		});
		this.getUserData();
		// if(!this.state.headicon || !this.state.nickname){
		// 	window.location.href=URLconfig.toWxHis+`/old&new/sign.html?from=detailedInformation&id=${id}&queryContentType=2&isShare=${parseInt(this.props.match.params.isShare)}`
		// }
		this.getData();
		this.getNotice();
		this.getTips();
		this.getDzNum();
		let dsq1 = setInterval(() => {
			this.getTips();
			this.getDzNum();
		}, 1000 * 60)

		
		const hei = this.state.height;
		setTimeout(() => {
			this.setState({
				loading: false,
				height: hei,
				dsq1
			});
		}, 2000)

	}
	componentWillUnmount() {
		clearInterval(this.state.dsq1);
		clearTimeout(this.state.dsq2);
		WebIM.conn.close();
	}
	goBackPage() {
		history.goBack(); //返回上一页这段代码
	}

	//设置分享的缩略图
	_setThumbnail(coverPic){
		let imgUrl='';
		if(coverPic){
			imgUrl=config.publicStaticUrl + coverPic;
		}
		return imgUrl;
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
					this.setState({
						headicon: res.data.data.headicon,
						nickname: res.data.data.nickname
					})
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});


	}
	getData() {
		let { id, loginToken, data, masterMsgList } = this.state;
		axios.post(config.publicUrl + 'liveTelecast/liveTelecastDetail.do', qs.stringify({ id: id }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					let	dsq2 = '';
					if(res.data.data.status !== 40){
						dsq2 = setTimeout(() => {
							this.getData();
						}, 1000*1);
					}
					if(res.data.data.status !== 20 && masterMsgList.length < 1){
						this.getMsgList(1);
					}
					if(data.length < 1){
						this.getMsgList(2);
					}
					this.setState({
						data: res.data.data,
						dsq2
					});
					
					config.share2Friend('roomModule',2,id,'欢迎进入直播间',this.state.data.title,this._setThumbnail(this.state.data.coverPic));
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取详情失败：' + err);
			});


	}
	getNotice() {
		axios.get(config.publicUrl + 'public/liveNotice.json')
			.then((res) => {
				if (res.status === 200) {
					this.setState({
						notice: res.data.title
					})
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取课堂公告失败：' + err);
			});
	}
	getTips() {
		let { id, loginToken } = this.state;
		axios.post(config.publicUrl + 'liveTelecast/adminMes.do', qs.stringify({ liveId: id, userType: 1 }),
			{
				headers: {
					loginToken: loginToken
				}
			})
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					if (res.data.data.length > 0) {
						this.setState({
							tips: res.data.data[0].content
						})
						setTimeout(() => {
							this.setState({
								tips: ''
							})
						}, 1000 * 10);
					}
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取后台消息失败：' + err);
			});
	}
	getDzNum() {
		let { id } = this.state;
		axios.post(config.publicUrl + 'drLiveTelecast/liveDzNum.do',  qs.stringify({ liveId: id}))
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					this.setState({
						liveDzNum: res.data.data
					})
				} else {
					Toast.info(res.data.message, 2)
				}
			})
			.catch((err) => {
				console.log('获取后台消息失败：' + err);
			});
	}
	login = () => {
		WebIM.conn.open({
			apiUrl: WebIM.config.apiURL,
			user: this.state.user,
			pwd: '123456',
			appKey: WebIM.config.appkey
		});
		WebIM.conn.listen({
			onOpened: () => {
				//连接成功回调
				WebIM.conn.joinChatRoom({
					roomId: this.state.data.chatRoomId // 聊天室id
				});
			},
			onOnline: function () {
				Toast.info('网络连接成功', 2);
				WebIM.conn.open({
					apiUrl: WebIM.config.apiURL,
					user: this.state.user,
					pwd: '123456',
					appKey: WebIM.config.appkey
				});
			},                  //本机网络连接成功
    		onOffline: function () {Toast.info('网络异常', 2);WebIM.conn.close();},                 //本机网络掉线
			onError: function (message) {
				// 失败的回调
				console.log('失败:' + JSON.stringify(message));
			},
			onTextMessage: data => {
				console.log('文字消息' + JSON.stringify(data))
				let msg = {
					msgType: 'txt',
					msg: data.data,
					headicon: data.ext.headicon,
					name: data.ext.nickname,
					from: data.from,
					createDate: parseInt(data.time),
					ext: JSON.stringify(data.ext)
				}
				this.setMsgList(msg);

			}, //收到文本消息
			onPictureMessage: data => {
				console.log('图片消息' + JSON.stringify(data))
				let msg = {
					fileUrl: data.url,
					msgType: 'img',
					headicon: data.ext.headicon,
					name: data.ext.nickname,
					index: this.state.imags.length
				}
				let imags = this.state.imags;
				imags.push(data.url);
				this.setState({
					imags
				})
				this.setMsgList(msg)
			}, //收到图片消息
			onAudioMessage: data => {
				console.log('语音消息' + JSON.stringify(data))
				var options = {
					url: data.url
				};
				let msg = {
					id: data.id,
					sx: true,
					type: true,
					audioLength: data.length,
					fileUrl: data.url,
					msgType: 'audio',
					headicon: data.ext.headicon,
					name: data.ext.nickname
				}
				
				this.setMsgList(msg);
				options.onFileDownloadComplete = response => {

				};

				options.onFileDownloadError = function () {
					//音频下载失败 
				};

				//通知服务器将音频转为mp3
				options.headers = {
					'Accept': 'audio/mp3'
				};

				WebIM.utils.download.call(WebIM.conn, options);
			},
			onReceivedMessage: () => {

			}

		});
	};
	setMsgList = datas => {
		let { userMsgList, masterMsgList } = this.state;
		if (datas.msgType === 'txt' && ((masterMsgList.length > 0 && masterMsgList[0].fromUser !== datas.from) || masterMsgList.length < 1)) {
			this.setState({
				userMsgList: [datas, ...userMsgList]
			})
		} else {
			this.setState({
				masterMsgList: [...masterMsgList, datas]
			})
			this.setRoomAc();
			this.setScrollTo();
		}
	}
	getMsgList = userType => {
		let { id, loginToken } = this.state;

		axios
			.post(
				config.publicUrl + 'liveTelecast/liveTelecastMess.do',
				qs.stringify({
					liveId: id,
					userType: userType,
					page: 1,
					limit: 10
				}), {
				headers: {
					loginToken: loginToken
				}
			}
			)
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					if (userType === 1) {
						let imags = [];
						for(let v of res.data.data){
							if(v.msgType === 'img'){
								v.index = imags.length;
								let imgSrc =  v.fileUrl&&v.fileUrl.indexOf('http') !== -1 ? v.fileUrl : config.publicStaticUrl + v.fileUrl;
								imags.push(imgSrc)
							}
						}
						let roomAC = JSON.parse(localStorage.getItem(`roomAC${this.state.id}`)),masterMsgListArr;
						masterMsgListArr = roomAC ? [...roomAC, ...res.data.data.slice(roomAC.length, res.data.data.length)] : res.data.data;
						localStorage.setItem(`roomAC${this.state.id}`, JSON.stringify(masterMsgListArr));
						this.setState({
							docID: res.data.data.length > 0 ? res.data.data[0].fromUser : '',
							masterMsgList: masterMsgListArr,
							imags
						});

						this.setScrollTo();
					} else {
						this.setState({
							userMsgList: res.data.data
						});
					}

				} else {
					Toast.info(res.data.message, 2);

				}
			})
			.catch((err) => {
				console.log('历史消息' + err);
			});
	};
	setScrollTo = num => {
		let _obj = document.querySelector('.list');
		if (num === 1) {
			_obj.scrollTop = 0;
			return false;
		}
		let _height = _obj.childNodes[0].offsetHeight + 135;
		if (_height > 135) {
			_obj.scrollTop = _height;
		}
	}
	danmu = () => {
		this.setState({
			danmu: !this.state.danmu
		})
	}
	taolun = () => {
		let { taolun } = this.state;
		this.setState({
			taolun: !taolun
		})

		// if(!taolun){
		// 	setTimeout(function(){
		// 		let _obj = document.querySelector('.e_con');
		// 		let _height = _obj.childNodes[0].offsetHeight;
		// 		if(_height > 0){
		// 			_obj.scrollTo(0, 0);
		// 		}
		// 	}, 200)
		// }
	}
	dianzan = () => {
		let { id, loginToken, data, liveDzNum } = this.state;

		axios
			.post(
				config.publicUrl + 'liveTelecast/liveUserDz.do',
				qs.stringify({
					liveId: id
				}), {
				headers: {
					loginToken: loginToken
				}
			}
			)
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					Toast.info('点赞成功', 1);
					data.userIdDz = 1;
					++liveDzNum;
					this.setState({
						data: data,
						liveDzNum: liveDzNum
					})
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch((err) => {
				console.log('互动历史消息' + err);
			});
	}
	guanzhu = () => {
		let { loginToken, data } = this.state;
		let url = config.publicUrl;
		if(data.attentionIds > 0){
			url += 'appglandular/cancelGlandularAttention.do';
		}else{
			url += 'appglandular/glandularAttention.do';
		}
		axios
			.post(
				url,
				qs.stringify({
					attentionId: data.doctorId,
					type: 2,
					userType: 1
				}), {
				headers: {
					loginToken: loginToken
				}
			}
			)
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
					if(data.attentionIds > 0){
						Toast.info( '取消关注成功', 1);
						data.attentionIds = 0;
					}else{
						Toast.info('关注成功', 1);
						data.attentionIds = 1;
					}
					this.setState({
						data: data
					})
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch((err) => {
				console.log('互动历史消息' + err);
			});
	}
	playAudio = item => {
		console.log(item)
	}
	setRoomAc =()=>{
		localStorage.setItem(`roomAC${this.state.id}`, JSON.stringify(this.state.masterMsgList));
	}
	isMsg = item => {
		if (item.msgType === 'audio') {
			return <AudioMsg data={item} setRoomAc={this.setRoomAc}/>;
			// return (
			// 	<p className="item_con audio" onClick={this.playAudio.bind(this, item)}>
			// 		<img className="audio_img" src={imgUrl.play} alt="" />
			// 		<span className="bft">
			// 			<span className="play hide"></span>
			// 		</span>
			// 	</p>
			// );
		} else if (item.msgType === 'img') {
			let imgSrc =  item.fileUrl&&item.fileUrl.indexOf('http') !== -1 ? item.fileUrl : config.publicStaticUrl + item.fileUrl;
			return (
				<p className="item_con img">
					{/* <img src={imgSrc} alt="" onClick={this.seeImg.bind(this, imgSrc)} /> */}
					<img src={imgSrc} alt="" onClick={this.openViewer.bind(this, item.index)} />
					
					{/* <Zmage src={imgSrc} alt="" /> */}
				</p>
			)
		} else if (item.msgType === 'txt') {
			if(item.ext ? JSON.parse(item.ext).to_name : false){
				return 	<div className="item_con text to_text">
							<p>回复:<span>{JSON.parse(item.ext).to_name}</span>  {JSON.parse(item.ext).to_message}</p>
							<p>{item.msg}</p>
						</div>
			}else{
				return <p className="item_con text">{item.msg}</p>
			}
		}
	}
	seeImg = data => {
		this.setState({ seeImg: data })
	}
	cancel_img = () => {
		this.setState({ seeImg: '' })
	}
	inputChange = e => {
		const value = e.target.value;
		if(value.length<1){
			this.setState({
				value: value,
				send: false
			})
			document.body.scrollTop = document.documentElement.scrollTop = 0;
		}else{
			this.setState({
				value: value,
				send: true
			})
		}
		
	}
	send = () => {
		const { value, data, nickname, headicon, ringUser, userMsgList, id, loginToken, userId } = this.state;
		axios
			.post(
				config.publicUrl + 'liveTelecast/userLiveStatus.do',
				qs.stringify({
					liveId: id,
					userId: userId
				}), {
				headers: {
					loginToken: loginToken
				}
			}
			)
			.then((res) => {
				document.body.scrollTop = document.documentElement.scrollTop = 0;
				if (res.status === 200 && res.data.status === 1) {
					if (res.data.data.accountStatus === 1 && res.data.data.suspendDiscuss === 1) {

						if (!value.trim()) {
							Toast.info('请输入要发送的内容', 1);
							return;
						}
						var msg = new WebIM.message('txt', WebIM.conn.getUniqueId()); // 创建文本消息
						var option = {
							msg: value,          // 消息内容
							to: data.chatRoomId,               // 接收消息对象(聊天室id)
							roomType: true,                  // 群聊类型，true时为聊天室，false时为群组
							ext: {
								nickname: nickname,
								headicon: headicon
							},                         // 扩展消息
							success: () => {
								let datas = {
									msgType: 'txt',
									msg: value,
									name: nickname,
									ringUser: ringUser,
									headicon: headicon,
									createDate: new Date()
								}
								this.setState({
									userMsgList: [datas, ...userMsgList]
								})
								

								// let _obj = document.querySelector('.e_con');
								// let _height = _obj.childNodes[0].offsetHeight;
								// _obj.scrollTo(0, _height);
								console.log('send room text success');
							},                               // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
							fail: function () {
								console.log('failed');
							}                                // 对失败的相关定义，sdk会将消息id登记到日志进行备份处理
						};
						msg.set(option);
						msg.setGroup('groupchat');           // 群聊类型
						WebIM.conn.send(msg.body);

					} else if(res.data.data.accountStatus !== 1) {
						Toast.info(`您的账号已被${res.data.data.accountStatus === 2 ? '禁言' : '冻结'}`, 2);
					} else if(res.data.data.suspendDiscuss !== 1) {
						Toast.info('已暂停讨论', 2);
					} else {
						Toast.info(res.data.message, 2);
					}
					this.cancleType();
				} else {
					Toast.info(res.data.message, 2);
				}
			})
			.catch((err) => {
				Toast.info('网络异常', 2);
				console.log('互动历史消息' + err);
			});
	}
	sendType = () => {
		this.setState({
			send: true
		})
	}
	cancleType = () => {
		this.setState({
			value: "",
			send: false
		})
		document.body.scrollTop = document.documentElement.scrollTop = 0;
	}
	
	tipsClose = () => {
		this.setState({
			tips: ''
		})
	}
	noticeClose = () => {
		this.setState({
			notice: ''
		})
	}

	onClose = () => {
		this.setState({
			isOpen: false
		})
	}

	openViewer(indexs) {
		this.setState({
			indexs,
			isOpen: true
		})
	}
	reload = () => {
		localStorage.removeItem(`roomAC${this.state.id}`)
		window.location.reload();
	}
	render() {

		let { isOpen, indexs, imags, data, danmu, taolun, userMsgList, masterMsgList, value, send, notice, tips, seeImg, liveDzNum,isShare} = this.state;
		let danmuList = userMsgList.length < 3 ? userMsgList : userMsgList.slice(0, 3).reverse();


			return (
				<DocumentTitle title='直播间' >

					<div className="content" >
						{isShare===1?<DownloadTips whereIs={'roomModule'} contentType={7} id={this.props.match.params.id}/>:''}
						{ this.state.loading ? 
							<div style={{ position: 'fixed', zIndex: 11, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<img src={require("../../images/loading.gif")} alt="" />
							</div>
							: ''
						}

						<header>

							<div>
								<img src={imgUrl.back} alt="返回" onClick={this.goBackPage} />
								<NoticeBar marqueeProps={{ loop: true, style: { padding: '0 7.5px' } }} icon={null} >{data.title}</NoticeBar>
								{/* <span>{data.title}</span> */}
							</div>
							{/*<img src={imgUrl.share} alt="分享" onClick={this.fengxiang} />*/}
						</header>


						<div className="list">
							<div>
								{
									notice ? <div className="notice">
										<p className="notice_title">
											<img src={imgUrl.close_notice} alt="" onClick={this.noticeClose} />
											课堂公告
												</p>
										<div className="notice_con">
											{notice}
										</div>
									</div> : ''
								}

								{masterMsgList.map((item, index) => {
									return (
										<div key={index} className="item">
											<img src={item.headicon ? (item.headicon.includes('http') ? item.headicon : config.publicStaticUrl + item.headicon) : imgUrl.follow_true} alt="" />
											<div className="item_user">
												<p className="name">{item.name}</p>
												{this.isMsg(item)}
											</div>
										</div>
									)
								})}
							</div>
						</div>


						<footer id="xb">
							<div className={send ? 'footer2' : 'footer1'}>
								{
									data.status === 40 ? <div className="roomStop">
										<button onClick={() => this.props.history.push(`/doctorDetailedInformation/${this.state.data.doctorId}/0/0`)}>在线咨询</button>
										<button onClick={this.reload}>清理缓存</button>
										</div> : <input type="text" value={value} onChange={this.inputChange}  placeholder="请输入…"  />
								}
								{
									send ? <button onClick={this.send}>发送</button> : <div className="footerType">

										<img src={danmu ? imgUrl.dm_open_true : imgUrl.dm_open_false} alt="弹幕" onClick={this.danmu} />
										<img src={taolun ? imgUrl.taolun_true : imgUrl.taolun_false} alt="讨论" onClick={this.taolun} />
										<img src={data.userIdDz > 0 ? imgUrl.dz_icon_true : imgUrl.dz_icon_false} alt="点赞" onClick={this.dianzan} />
										<span>{liveDzNum}</span>
									</div>
								}

							</div>
							{/* <div className={send ? 'footer2' : 'hide'}>
								<input type="text" className="a_input" placeholder="请输入…" value={value} onChange={this.inputChange} />
								<button onClick={this.send}>发送</button>
							</div> */}
						</footer>

						<div className="a">
							<img className="img1" src={data.headicon ? (data.headicon.includes('http')?data.headicon:config.publicStaticUrl + data.headicon) : imgUrl.default_head} alt="" />
							<img className="img2" src={data.attentionIds > 0 ? imgUrl.follow_true : imgUrl.follow_false} alt="" onClick={this.guanzhu} />
						</div>
						<div className={danmu ? 'b' : 'b hide'} onClick={this.taolun}>
							{danmuList.map((item, index) => {
								return (
									<div key={index} className="b_item">{item.msg}</div>
								);
							})}

						</div>
						<div className="c">
							<img src={imgUrl.up} alt="向上" onClick={this.setScrollTo.bind(this, 1)} />
							<img src={imgUrl.down} alt="向下" onClick={this.setScrollTo} />
						</div>

						{tips ? <img className="d_img" src={imgUrl.close_qtx} alt="" onClick={this.tipsClose} /> : ''}
						{
							tips ? <NoticeBar className="d" marqueeProps={{ loop: true, leading: 500}} icon={null} >
								{tips}
							</NoticeBar> : ''
						}

						{/* {
							seeImg ? <div className="seeImg" onClick={this.cancel_img}>
								<img src={seeImg} alt="" />
							</div> : ''
						} */}

						{
							seeImg ? <div className="seeImg" onTouchStart={this.imgZoomStart} onTouchEnd={this.imgZoomEnd}>
								<img src={seeImg} alt="" />
							</div> : ''
						}

						<div className={taolun ? 'e' : 'hide'}>
							<p className="e_title">
								<span>评论({userMsgList.length})</span>
								<img src={imgUrl.close} alt="" onClick={this.taolun}/>
							</p>
							<div className="e_con">
								<div className="e_con_list">
									{userMsgList.length > 0 ? userMsgList.map((item, index) => {
										return (
											<div className="e_item" key={index}>
												<img src={item.headicon ? (item.headicon.indexOf('http') !== -1 ? item.headicon : config.publicStaticUrl + item.headicon) : require('./img/defu_img.png')} alt="" />
												<div className="e_text">
													<p className="e_text_name">
														<span>{item.name}</span>
														<span>{moment(item.createDate).format("YYYY-MM-DD HH:mm:ss")}</span>
													</p>
													<div className="e_text_con">
														{item.msg}
													</div>
												</div>
											</div>									
										)
									}) : ''}
								</div>
							</div>
						</div>
						{
							isOpen ? <WxImageViewer onClose={this.onClose} urls={imags} index={indexs} /> : ""
						}
					</div>
				</DocumentTitle>

			);
	}
}

export default index;
