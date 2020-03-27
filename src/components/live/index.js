import React, { Component } from 'react';
import { TcPlayer } from 'tcplayer';
import TIM from 'tim-js-sdk';
import tim from './im';
import config from '../../config/wxconfig';
import $ from 'jquery';
import { Toast, Switch  } from 'antd-mobile';
import axios from 'axios';
import qs from 'qs';
import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class index extends Component {
    constructor(props){
        super(props)
        const { liveId } = this.props.match.params
        this.state = {
            loading: true,
            value: '',
            isSend: false,
            checked: false,
            isDM: true,
            msgList: [],
            liveId,
            liveData: [],
            headicon: '',
            nickname: '',
            liwuList: '',
            groupList: [],
            isGroupList: false,
            doctorData: '',
            isDoctor: false
        }
    }
    async componentDidMount(){
        const hei = this.state.height;
        await this.getLiveData()
        await this.getUserData()
        if(localStorage.liveUserSig){
            await this.loginIM(1)
        }else{
            await this.login()
            tim.on(TIM.EVENT.SDK_READY, this.setData);
        } 
        
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.getMsg);
        document.addEventListener('click', e => {
            if((this.state.liwuList || this.state.isDoctor || this.state.isGroupList) && e.target === document.querySelector('.vcp-bigplay')){
                this.setState({liwuList: '', isDoctor: false, isGroupList: false})
            }
        })
    }
    componentWillUnmount(){
        if(this.tcplayer) this.tcplayer.destroy()
        tim.quitGroup(this.state.liveData.channel_id)
        this.systenSMG('3')
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }

    getLiveData(){
        let { liveId } = this.state;
        let url = config.publicUrl + 'txLive/txLiveDeatil.do';
        axios.post(url, qs.stringify({liveId}),
        { headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                this.setState({
                    liveData: res.data.data
                })
                this.tcplayer = new TcPlayer("id_test_video", {
                    "m3u8": res.data.data.pushURL+'.m3u8',
                    "poster": {"style":"default", "src": config.publicStaticUrl + res.data.data.coverPic},
                    "live": true,
                    "autoplay": true,
                    "x5_type": 'h5',
                    "x5_player": true,
                    "x5_fullscreen": "true",
                    "systemFullscreen": true,
                    "controls": "none",
                    "wording": {
                        2032: "请求视频失败，请检查网络",
                        2048: "请求m3u8文件失败，可能是网络错误或者跨域问题"
                    },
                    "width": "100%",
                    "height": "100%",
                });
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    getUserData() {
		axios.post(config.publicUrl + 'app/getUserByLoginToken.do', {},
			{
				headers: {
					loginToken: localStorage.loginToken
				}
			})
			.then((res) => {
				if (res.status === 200 && res.data.status === 1) {
                    let headicon = '';
                    if(res.data.data.headicon){
                        headicon = headicon.indexOf('http') === 0 ? res.data.data.headicon : config.publicStaticUrl + res.data.data.headicon
                    }else{
                        headicon = require('../room/img/defu_img.png')
                    }
					this.setState({
						headicon,
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
    setData = event => {
        let _this = this;
        console.log('收到离线消息和会话列表同步完毕通知'+JSON.stringify(event))
        let promises = tim.updateMyProfile({
            nick: this.state.nickname,
            avatar: this.state.headicon
        });
        promises.then(function(imResponse) {
            console.log('更新资料成功' + JSON.stringify(imResponse.data)); // 更新资料成功
            _this.addGroup();
        }).catch(function(imError) {
            console.warn('updateMyProfile error:', imError); // 更新资料失败的相关信息
        });
    }
    login(){
        let url = config.publicUrl + 'wx/findTxUserDetail.do';
        axios.post(url, {},
        { headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                localStorage.liveUserSig = res.data.data.userSig;
                localStorage.liveTxUserId = res.data.data.liveTxUserId;
                this.loginIM()
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    getMsg = (event) => {
        let [a, b] = event.data;
        console.log(a, b)
        if(a.from === "@TIM#SYSTEM"){
            let [c, d] = a._elements;
            let zbType = c.content.operationType;
            let msgObj = {};
            if((zbType === 1 || zbType === 2) && b){
                // [c, d] = b._elements;
                // let dataObj = JSON.parse(c.content.data);
                // let _this = this;
                // msgObj.type = 1
                // msgObj.name = dataObj.data.userName
                // msgObj.headicon = dataObj.userAvatar
                // msgObj.txt = dataObj.data.cmd === '2' ? '加入直播' : '退出直播'
                // let promises = tim.getGroupMemberList({ groupID: _this.state.liveData.channel_id, count: 99, offset:0 }); // 从0开始拉取30个群成员
                // promises.then(function(imResponse) {
                //     let groupList = imResponse.data.memberList;
                //     groupList.forEach((item, index) => {
                //         if( _this.state.liveData.liveTxUserId === item.userID){
                //             groupList[index] = groupList[0];
                //             groupList[0] = item;
                //         }
                //     })
                //     _this.setState({groupList,msgList: [..._this.state.msgList, msgObj]})
                //     console.log(groupList)
                // }).catch(function(imError) {
                //  console.warn('getGroupMemberList error:', imError);
                // });

            }else if(zbType === 5){
                Toast.info('直播已结束，谢谢观看',2);
                this.goBackPage()
            }
        }else{
            let [c, d] = a._elements;
            let dataObj = JSON.parse(c.content.data);
            let msgObj = {};
            console.log(dataObj)
            if(dataObj.cmd === 'notifyPusherChange'){
                let _this = this;
                msgObj.type = 1
                msgObj.name = a.nick
                msgObj.txt = '退出直播'
                let promises = tim.getGroupMemberList({ groupID: _this.state.liveData.channel_id, count: 99, offset:0 }); // 从0开始拉取30个群成员
                promises.then(function(imResponse) {
                    let groupList = imResponse.data.memberList;
                    groupList.forEach((item, index) => {
                        if( _this.state.liveData.liveTxUserId === item.userID){
                            groupList[index] = groupList[0];
                            groupList[0] = item;
                        }
                    })
                    _this.setState({groupList})
                }).catch(function(imError) {
                 console.warn('getGroupMemberList error:', imError);
                });
            }else{
                if(dataObj.data.cmd === '1' || dataObj.data.cmd === '5'){
                    msgObj.name = dataObj.data.userName
                    msgObj.headicon = dataObj.data.userAvatar
    
                    if(d){
                        msgObj.txt = d.content.text
                    }else{
                        msgObj.txt = dataObj.data.msg
                    }

                    if(dataObj.data.cmd === '5'){
                        let headicon = msgObj.headicon.indexOf('http') === 0 ? msgObj.headicon : config.publicStaticUrl + msgObj.headicon
                        this.setDM(headicon, msgObj.name, msgObj.txt)
                    }
                    
                }else if(dataObj.data.cmd === '2' || dataObj.data.cmd === '3'){
                    let _this = this;
                    msgObj.type = 1
                    msgObj.name = dataObj.data.userName
                    msgObj.headicon = dataObj.userAvatar
                    msgObj.txt = dataObj.data.cmd === '2' ? '加入直播' : '退出直播'
                    let promises = tim.getGroupMemberList({ groupID: _this.state.liveData.channel_id, count: 99, offset:0 }); // 从0开始拉取30个群成员
                    promises.then(function(imResponse) {
                        let groupList = imResponse.data.memberList;
                        groupList.forEach((item, index) => {
                            if( _this.state.liveData.liveTxUserId === item.userID){
                                groupList[index] = groupList[0];
                                groupList[0] = item;
                            }
                        })
                        _this.setState({groupList})
                    }).catch(function(imError) {
                     console.warn('getGroupMemberList error:', imError);
                    });
                }
            }

            setTimeout(() => {
                document.querySelector('.msg_list').scrollTop = document.querySelector('.msg_list').childNodes[0].offsetHeight;
            }, 500)
            this.setState({
                msgList: [...this.state.msgList, msgObj]
            })
        }
    }
    setDM = (headicon, name, txt) => {
        let _height = $('#id_test_video').outerHeight(true) - 400
        let str = `
            <div class="live_dm" style="top: ${Math.floor(Math.random()*_height)+100 +'px'};">
                <img src="${headicon}" alt="" />
                <div class="live_dm_con">
                    <p class="live_dm_name">${name}</p>
                    <p class="live_dm_msg">${txt}</p>
                </div>
            </div>
        `
       $('#id_test_video').append(str);
       $("#id_test_video .live_dm").animate({left: -$("#id_test_video .live_dm:last-child").width()+'px'}, 8000, 'linear', function() {
           $(this).remove()
       });
    }
    loginIM = num => {
        let _this = this;
        let promise = tim.login({userID: localStorage.liveTxUserId, userSig: localStorage.liveUserSig});
        promise.then(function(imResponse) {
            console.log('登陆成功', imResponse)
            if(num) _this.addGroup()
        }).catch(function(imError) {
            Toast.info('加入直播失败', 1)
            _this.goBackPage()
            console.warn('login error:', imError); // 登录失败的相关信息
        });
    }
    addGroup(){
        let { liveData } = this.state;
        let _this = this;
        let promise = tim.joinGroup({ groupID: liveData.channel_id, type: TIM.TYPES.GRP_AVCHATROOM });
        promise.then(function(imResponse) {
            if(imResponse.data.status === TIM.TYPES.JOIN_STATUS_SUCCESS){
                _this.systenSMG('2')

                let promises = tim.getGroupMemberList({ groupID: liveData.channel_id, count: 99, offset:0 }); // 从0开始拉取30个群成员
                promises.then(function(imResponse) {
                    let groupList = imResponse.data.memberList;
                    groupList.forEach((item, index) => {
                        if(liveData.liveTxUserId === item.userID){
                            groupList[index] = groupList[0];
                            groupList[0] = item;
                        }
                    })
                    _this.setState({groupList})
                    console.log(groupList)
                     _this.setState({
                        loading: false
                    });
                }).catch(function(imError) {
                 console.warn('getGroupMemberList error:', imError);
                });
            } console.log('加群成功:'+ JSON.stringify(imResponse.data));
        }).catch(function(imError){
            console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
        });
    }
    systenSMG = cmd => {
        let { liveData, headicon, nickname } = this.state;
        let message = tim.createCustomMessage({
            to: liveData.channel_id,
            conversationType: TIM.TYPES.CONV_GROUP,
            payload: {
                data: JSON.stringify({
                    data: {
                        cmd,
                        userName: nickname,
                        userAvatar: headicon
                    },
                    cmd: 'CustomCmdMsg'
                })
            }
        });
        let promise = tim.sendMessage(message);
        promise.then(function(imResponse) {
            if(cmd === '3') tim.logout()
        }).catch(function(imError) {
            console.warn('sendMessage error:', imError);
        });
    }
    send =()=>{
        let { liveData, checked, value, headicon, nickname } = this.state;
        let _this = this;
        if(!value || (value && !value.trim())){
            Toast.info('请输入要发送的内容',1)
            return false;
        }
        let message = tim.createCustomMessage({
                to: liveData.channel_id,
                conversationType: TIM.TYPES.CONV_GROUP,
                payload: {
                    data: JSON.stringify({
                        data: {
                            cmd: checked ? '5' : '1',
                            msg: value,
                            userName: nickname,
                            userAvatar: headicon
                        },
                        cmd: 'CustomCmdMsg'
                    })
                }
            });
        let msgList = {
            name: '我',
            headicon,
            txt: value
        }
        
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        this.setState({
            isSend: false,
            value: ''
        })
        // 2. 发送消息
        let promise = tim.sendMessage(message);
        promise.then(function(imResponse) {
            if(checked) _this.setDM(msgList.headicon, msgList.name, msgList.txt)
            // 发送成功
            _this.setState({msgList: [..._this.state.msgList, msgList]})
            setTimeout(() => {
                document.querySelector('.msg_list').scrollTop = document.querySelector('.msg_list').childNodes[0].offsetHeight;
            }, 500)
        }).catch(function(imError) {
            // 发送失败
            console.warn('sendMessage error:', imError);
        });
    }
    gz_fun = () => {
        let { liveData, doctorData } = this.state;
        let url = config.publicUrl + 'appglandular/glandularAttention.do';
        if(liveData.attentionIds > 0){
            url = config.publicUrl + 'appglandular/cancelGlandularAttention.do'
        } 
        axios.get(url, {
            params: {
                attentionId: liveData.doctorId,
                type: 2,
                userType: 1
            },
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                let msg = '';
                if(liveData.attentionIds > 0){
                    liveData.attentionIds = 0
                    liveData.fansNum--
                    if(doctorData) doctorData.fansNum--
                    msg = '取消关注成功'
                }else{
                    liveData.attentionIds = 1
                    liveData.fansNum++
                    if(doctorData) doctorData.fansNum++
                    msg = '关注成功'
                }
                this.setState({liveData,doctorData})
                Toast.info(msg, 1)
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    sc_fun = () => {
        let { liveData } = this.state;
        let url = config.publicUrl + 'upload/saveCollection.do';
        if(liveData.collectedIds > 0){
            url = config.publicUrl + 'upload/cancelCollection.do'
        } 
        axios.post(url, qs.stringify({
            collectionType: 10,
            collectedId: liveData.id,
            userType: 1
        }),{
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                let msg = '';
                if(liveData.collectedIds > 0){
                    liveData.collectedIds = 0
                    msg = '取消收藏成功'
                }else{
                    liveData.collectedIds = 1
                    msg = '收藏成功'
                }
                this.setState({liveData})
                Toast.info(msg, 1)
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    dz_fun = () => {
        let { liveData } = this.state;
        if(liveData.userIdDz > 0){
            return;
        }
        let url = config.publicUrl + 'appEducation/educationDz.do';
        axios.post(url, {
            type: 10,
            educationId: liveData.id,
            drOrUser: 1
        },{
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                let msg = '点赞成功';
                liveData.userIdDz = 1
                liveData.dzNum = res.data.data;
                this.setState({liveData})
                Toast.info(msg, 1)
                setTimeout(()=>{
                    liveData.userIdDz = 2
                    this.setState({liveData})
                }, 1000)
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    get_liwu_fun = () => {
        let url = config.publicUrl + 'txLive/userLiveGift.do';
        axios.post(url, qs.stringify({
           page: 1,
           limit: 10
        }),{
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                this.setState({
                    liwuList: res.data.data
                })
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    fs_liwu_fun(e, giftId, txLiveId) {
        e.preventDefault()
        let url = config.publicUrl + 'txLive/giveGift.do';
        axios.post(url, qs.stringify({
            giftId,
            txLiveId
        }),{
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                Toast.info('礼物已赠送', 1)
                this.get_liwu_fun()
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    get_doctor_fun = () => {
        let url = config.publicUrl + 'drTxLive/myTxLiveDetail.do';
        axios.post(url, qs.stringify({
            doctorId: this.state.liveData.doctorId
        })).then(res => {
            if(res.data.status === 1){
               this.setState({
                   doctorData: res.data.data,
                   isDoctor: true
               })
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    set_tck = num => {
        let isGroupList = false,
            isDoctor = false,
            liwuList = '';
            if(num === 1) this.get_doctor_fun()
            if(num === 2) isGroupList = true
            if(num === 3) this.get_liwu_fun()
            this.setState({
                isGroupList,
                isDoctor,
                liwuList
            })
        
    }

    handleClick = () => {
        this.setState({isSend: true})
        setTimeout(() => {
            document.querySelector('#msgTXT').focus()
        }, 500);
    };
    handleChange(e) {
        let value = e.target.value
        if(value.length === 0){
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            this.setState({
                isSend: false,
                value: ''
            })
        }else{
            this.setState({value})
        }
    }
    render() {
        let { value, liveData, isSend, isDM, msgList, liveId, liwuList, groupList, isGroupList, isDoctor, doctorData } = this.state;
        const docHeadicon = (headicon) => {
            if(headicon){
                return headicon.indexOf('http') === 0 ? headicon : config.publicStaticUrl + headicon
            }else{
                return require('../room/img/defu_img.png')
            }
        }
        return (
            <div className="video_live">
                { this.state.loading ? 
                    <div style={{ position: 'fixed', zIndex: 9999, background: '#E5ECF7', top: '-45px', left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={require("../../images/loading.gif")} alt="" />
                    </div>
                    : ''
                }
                <div id="id_test_video"></div>

                <div className="video_live_top">
                    <div className="video_live_top_left">
                        <img src={docHeadicon(liveData.headicon)} alt="" onClick={() => this.set_tck(1)} />
                        <div className="video_live_top_left_con">
                            <p>{liveData.name}</p>
                            <p>{liveData.fansNum}粉丝</p>
                        </div>
                        <img src={ liveData.attentionIds > 0 ? require('./img/yes_gz.png') : require('./img/no_gz.png')} alt="" onClick={this.gz_fun} />
                    </div>
                    <div className="video_live_top_right">
                        {
                            groupList.slice(1, 5).map((item, index) => {
                                return <img src={docHeadicon(item.avatar)} alt="" key={index} />
                            })
                        }
                        <div className="shuliang" onClick={() => this.set_tck(2)} >{groupList.length -1 }</div>
                        <img src={require('./img/close.png')} alt="" onClick={this.goBackPage} />
                    </div>
                </div>

                {
                    isSend ? <div className="video_live_bottom_send">
                                <Switch
                                    checked={this.state.checked}
                                    onChange={() => this.setState({checked: !this.state.checked})}
                                /> 
                                <input type="text" id="msgTXT" value={value} onChange={e => this.handleChange(e)}  placeholder="和大家说点什么吧"  />
                                <span onClick={this.send}>发送</span>
                            </div>
                            :
                            <div className="video_live_bottom">
                                <input type="text" placeholder="说点什么..." onClick={this.handleClick }/>
                                <img src={require('./img/liwu.png')} alt="" id="liwu" onClick={() => this.set_tck(3)} />
                                <img src={require('./img/fenxiang_icon.png')} alt="" />
                                <img src={ liveData.collectedIds > 0 ? require('./img/yishoucang_icon.png') : require('./img/shoucang_icon.png')} alt="" onClick={this.sc_fun} /> 
                                <div id="dz_icon" >
                                    <span className={liveData.userIdDz === 1 ? 'fadeIn' : 'fadeOut'}>{liveData.dzNum || 0}</span>
                                    <img src={ liveData.userIdDz > 0 ? require('./img/yiguanzhu_icon.png') : require('./img/dianzan_icon.png')} alt="" onClick={this.dz_fun} />
                                </div>
                                <img src={ isDM ? require('./img/danmu_icon.png') : require('./img/gb_danmu_icon.png') } alt="" onClick={() => this.setState({isDM: !this.state.isDM})} />
                            </div>
                }

                {
                    isDM ?  <div className="msg_list">
                                <div>
                                {
                                    msgList.map((item, index) => {
                                        if(item.type === 1){
                                            return  <p className="system_msg" key={index}>通知 {item.name}{item.txt}</p>
                                        }else{
                                            return  <p key={index}>
                                                        <span className="msg_name">{item.name}</span>
                                                        <span className="msg_txt">{item.txt}</span>
                                                    </p>
                                        }
                                    })
                                }
                                </div>
                            </div>
                             : ''
                }

                {
                    liwuList ?  <div className="liwu">
                                    <div className="liwu_title">
                                        <div className="liwu_title_con">
                                            <span className="active">我的礼品盒</span>
                                            <span>礼品商城</span>
                                        </div>
                                        <img src={require('./img/zb_tc_guanbi_icon.png')} alt="" onClick={() => this.setState({liwuList: ''})} />
                                    </div>
                                    <div className="liwu_con_list">
                                        {
                                            liwuList.map((item, index) => {
                                                return  <div className="liwu_item" key={index} onClick={e => this.fs_liwu_fun(e, item.giftId, liveId)}>
                                                            <span className="liwu_num">{item.giftNum}</span>
                                                            <img className="liwu_src" src={config.publicStaticUrl + item.giftImg} alt="" />
                                                            <p>{item.liveGiftName}</p>
                                                        </div>
                                            })
                                        }
                                        
                                    </div>
                                </div>
                            :''
                }

                {
                    isGroupList ?  <div className="groupList">
                                    <div className="groupList_title">
                                        <span>全部观众 （{groupList.length-1}）</span>
                                        <img src={require('./img/zb_tc_guanbi_icon.png')} alt="" onClick={() => this.setState({isGroupList: false})} />
                                    </div>
                                    <div className="groupList_list">
                                        {
                                            groupList.map((item, index) => {
                                                return  <div className="groupList_item" key={index} onClick={e => this.fs_liwu_fun(e, item.giftId, liveId)}>
                                                            <div>
                                                                <img className="liwu_src" src={docHeadicon(item.avatar)} alt="" />
                                                                <span className="liwu_num">{item.nick}</span>
                                                            </div>
                                                            <p>{index === 0 ? '主播' : '观众'}</p>
                                                        </div>
                                            })
                                        }
                                        
                                    </div>
                                </div>
                            :''
                }

                {
                    isDoctor ?  <div className="group_doctor">
                                    <div className="group_doctor_title">
                                        <img src={docHeadicon(doctorData.headicon)} alt="" className="group_doctor_headerIcon" /> 
                                        <img className="group_doctor_close"  src={require('./img/zb_tc_guanbi_icon.png')} alt="" onClick={() => this.setState({isDoctor: false})} />
                                    </div>
                                    <div className="group_doctor_name">{doctorData.name}</div>
                                    <div className="group_doctor_sc">{doctorData.goodAt  }</div>
                                    <div className="group_doctor_con">
                                        <div className="group_doctor_item">
                                            <p className="group_doctor_num">{doctorData.fansNum}</p>
                                            <p className="group_doctor_txt">粉丝</p>
                                        </div>
                                        <div className="group_doctor_item">
                                            <p className="group_doctor_num">{doctorData.attentionNum}</p>
                                            <p className="group_doctor_txt">关注</p>
                                        </div>
                                        <div className="group_doctor_item">
                                            <p className="group_doctor_num">{doctorData.dzNum}</p>
                                            <p className="group_doctor_txt">点赞</p>
                                        </div>
                                        <div className="group_doctor_item">
                                            <p className="group_doctor_num">{doctorData.rewardNum}</p>
                                            <p className="group_doctor_txt">打赏</p>
                                        </div>
                                    </div>
                                    <div className="group_doctor_bottom">
                                        <div className="group_doctor_bottom_gz" onClick={this.gz_fun}>{ liveData.attentionIds > 0 ? '已关注' : '关注'}</div>
                                        <div className="group_doctor_bottom_home" onClick={() => this.props.history.push('/doctorHomePage/'+liveData.doctorId)}>主页</div>
                                    </div>
                                </div>
                            :''
                }

                {/* <div className="live_dm">
                    <img src=" " alt="" />
                    <div className="live_dm_con">
                        <p className="live_dm_name">名字asdasadas</p>
                        <p className="live_dm_msg">内容</p>
                    </div>
                </div> */}
                
            </div>
        );
    }
}

export default index;