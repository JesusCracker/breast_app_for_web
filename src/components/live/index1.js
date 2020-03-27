import React, { Component } from 'react';
import { TcPlayer } from 'tcplayer';
import config from '../../config/wxconfig';

import { Toast } from 'antd-mobile';
import axios from 'axios';
import qs from 'qs';
import { createHashHistory } from 'history' //返回上一页这段代码
const history = createHashHistory(); //返回上一页这段代码

class index1 extends Component {
    constructor(props){
        super(props)
        const { liveId } = this.props.match.params
        this.page1 = 1;
        this.page2 = 1;
        this.isLoading = true;
        this.isLoading1 = true;
        this.state = {
            isPlay: false,
            liveId: parseInt(liveId),
            value: '',
            liveData: [],
            headicon: '',
            nickname: '',
            plList: [],
            plList1: '',
            limit1: 10,
            limit2: 10,
            count: 0,
            replyRefer: '',
            replyUserId: '',
            replyUserType: '',
            parentId: '',
            isPL: false,
            isPL1: false
        }
    }
    async componentDidMount(){
        await this.getLiveData()
        await this.getUserData()

        document.addEventListener('click', e => {
            if((this.state.isPL || this.state.isPL1) && e.target === document.querySelector('.vcp-bigplay')){
                this.setState({isPL: false, isPL1: false})
            }
        })
        document.querySelector('.video_live_pl_list').addEventListener('scroll', e => {
            if(e.target.scrollHeight - e.target.scrollTop < 425 && this.isLoading){
                this.isLoading = false;
                this.page1++
                this.get_pl_list_fun()
            }
        })
        document.querySelector('.video_live_pl_list1').addEventListener('scroll', e => {
            if(e.target.scrollHeight - e.target.scrollTop < 425 && this.isLoading1){
                this.isLoading1 = false;
                this.page2++
                this.zk_pl_fun(2)
            }
        })
    }
    componentWillUnmount(){
        if(this.tcplayer) this.tcplayer.destroy()
    }
    goBackPage() {
		history.goBack(); //返回上一页这段代码
    }
    getLiveData(){
        let { liveId, isPlay } = this.state;
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
                    "mp4": res.data.data.video_url,
                    "poster": {"style":"default", "src": config.publicStaticUrl + res.data.data.coverPic},
                    // "autoplay": true,
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
                
                document.getElementById("id_test_video").addEventListener("click", () => {
                    isPlay = true
                    this.setState({isPlay})
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
    gz_fun = () => {
        let { liveData } = this.state;
        
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
                    msg = '取消关注成功'
                }else{
                    liveData.attentionIds = 1
                    liveData.fansNum++
                    msg = '关注成功'
                }
                this.setState({liveData})
                Toast.info(msg, 1)
            }
        })
    }
    get_pl_list_fun = num => {
        let { liveId, limit1, plList } = this.state;
        let url = config.publicUrl + 'appglandular/glandularArticleReplyList.do';
        axios.get(url, {
            params: {
                glandularArticleId: liveId,
                page: this.page1,
                limit: limit1,
                postType: 10
            },
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                if(res.data.data.length === limit1){
                    this.isLoading = true;
                }
                if(num){
                    plList = res.data.data
                }else{
                    plList = [...plList, ...res.data.data]
                }
                this.setState({
                    plList,
                    count: res.data.dataTotal,
                    isPL: true,
                    isPL1: false
                })
                console.log(this.state)
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }

    send_pl_fun = num => {
        let { liveId, value, replyRefer, replyUserId, replyUserType, parentId } = this.state;
        let url = config.publicUrl + 'appglandular/glandularArticleReply.do';
        let formData = new FormData()
        formData.append('glandularArticleId', liveId)
        formData.append('commentatorType', 1)
        formData.append('postType', 10)
        formData.append('content', value)
        console.log(replyRefer, replyUserId, replyUserType, parentId)
        if(replyRefer){
            formData.append('replyRefer', replyRefer)
            formData.append('replyUserId', replyUserId)
            formData.append('replyUserType', replyUserType)
            formData.append('parentId', parentId)
        }
        if(num === 2 && !replyRefer){
            let data = JSON.parse(localStorage.zkData);
            formData.append('replyRefer', data.userName)
            formData.append('replyUserId', data.userId)
            formData.append('replyUserType', data.commentatorType)
            formData.append('parentId', data.id)
        }
        axios.post(url, formData,
        {
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                Toast.info('评论成功', 1)
                document.body.scrollTop = document.documentElement.scrollTop = 0;
                this.setState({
                    value: '',
                    replyRefer: '',
                    replyUserId: '',
                    replyUserType: '',
                    parentId: '',
                })
                if(num === 1){
                    document.querySelector('#send_pl').setAttribute('placeholder', `请输入评论...`);
                    this.page1 = 1;
                    this.get_pl_list_fun(1)
                } 
                if(num === 2){
                    document.querySelector('#send_pl_hf').setAttribute('placeholder', `请输入评论...`);
                    this.page2 = 1;
                    this.zk_pl_fun(1)
                } 
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    hf_pl_fun = (item, num) => {
        let _obj,parentId;
        if(num === 1){
            _obj = document.querySelector('#send_pl_hf')
            parentId = JSON.parse(localStorage.zkData).id
        }else{
            _obj = document.querySelector('#send_pl')
            parentId = item.id
        }
        _obj.setAttribute('placeholder', `回复 ${item.userName}:`);
        _obj.focus();
        this.setState({
            replyRefer: item.userName,
            replyUserId: item.userId,
            replyUserType: item.commentatorType,
            parentId
        })
    }
    zk_pl_fun = (num, item) => {
        let { limit2, plList1 } = this.state;
        let url = config.publicUrl + 'appglandular/getReplyDetailById.do';
        let data;
        if(item){
            localStorage.zkData = JSON.stringify(item)
            data = item;
        }else{
            data = JSON.parse(localStorage.zkData);
        }
        axios.get(url, {
            params: {
                id: data.id,
                page: this.page2,
                limit: limit2,
                postType: 10,
                isExtend: 0
            },
            headers: {
                loginToken: localStorage.loginToken
            }
        }).then(res => {
            if(res.data.status === 1){
                if(res.data.data.childrenReplys.length === limit2){
                    this.isLoading1 = true;
                }

                if(num === 1){
                    plList1 = res.data.data
                }else{
                    if(plList1){
                        plList1.childrenReplys = [...plList1.childrenReplys, ...res.data.data.childrenReplys]
                    }else{
                        plList1 = res.data.data
                    }
                }
                this.setState({
                    isPL: false,
                    isPL1: true,
                    plList1
                })
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    play = () => {
        let { isPlay } = this.state;
        isPlay = this.tcplayer.playing() ? false : true
        this.setState({isPlay})
        this.tcplayer.togglePlay()
    }
    handleChange(e) {
        let value = e.target.value
        if(value.length === 0){
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            this.setState({
                value: ''
            })
        }else{
            this.setState({value})
        }
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
                    liveData.collectedNum--
                    msg = '取消收藏成功'
                }else{
                    liveData.collectedIds = 1
                    liveData.collectedNum++
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
            }else{
                Toast.info(res.data.message, 1)
            }
        })
    }
    render() {
        let { isPlay, liveData, value, plList, plList1, isPL, isPL1, count } = this.state
        const docHeadicon = (headicon) => {
            if(headicon){
                return headicon.indexOf('http') === 0 ? headicon : config.publicStaticUrl + headicon
            }else{
                return require('../room/img/defu_img.png')
            }
        }
        return (
            <div className="video_live">
                <div id="id_test_video"></div>

                <div className="video_live_top">
                    <div className="video_live_top_left">
                        <img src={docHeadicon(liveData.headicon)} alt="" />
                        <div className="video_live_top_left_con">
                            <p>{liveData.name}</p>
                            <p>{liveData.fansNum}粉丝</p>
                        </div>
                        <img src={ liveData.attentionIds > 0 ? require('./img/yes_gz.png') : require('./img/no_gz.png')} alt="" onClick={this.gz_fun} />
                    </div>
                    <div className="video_live_top_right">
                        {/* <div className="shuliang">999</div> */}
                        <img src={require('./img/close.png')} alt="" onClick={this.goBackPage} />
                    </div>
                </div>
                {
                    isPlay ? '' : <img className="bofang" src={require('./img/bofang_icon.png')} alt="" onClick={this.play} />
                }
                <div className="video_live_hk">
                    <img src={liveData.userIdDz > 0 ? require('./img/yiguanzhu_icon.png') : require('./img/dianzan_icon.png')} alt="" onClick={this.dz_fun} />
                    <p>{liveData.dzNum }</p>
                    <img src={require('./img/hk_pinglun_icon.png')} alt="" onClick={this.get_pl_list_fun} />
                    <p>{liveData.articleNum   }</p>
                    <img src={liveData.collectedIds > 0 ? require('./img/yishoucang_icon.png') : require('./img/shoucang_icon.png')} alt="" onClick={this.sc_fun} /> 
                    <p>{liveData.collectedNum }</p>
                    <img src={require('./img/fenxiang_icon.png')} alt="" />
                    <p>{liveData.forwardNum }</p>
                    <img src={require('./img/gengduo_icon.png')} alt="" onClick={() => this.props.history.push('/doctorHomePage/'+liveData.doctorId)} />
                </div>

                <div className={isPL ? 'video_live_pl abc' : "video_live_pl" }>
                    <div className="video_live_pl_title">
                        <span>评论（{count}）</span>
                        <img className="video_live_pl_close"  src={require('./img/zb_tc_guanbi_icon.png')} alt="" onClick={() => this.setState({isPL: false})} />
                    </div>

                    <div className="video_live_pl_list">
                        {
                            plList.map((item, index) => {
                                return  <div className="video_live_pl_item" key={index}>
                                            <div className="video_live_pl_item_parent">
                                                <img src={docHeadicon(item.headicon)} alt="" onClick={() => this.hf_pl_fun(item)} />
                                                <div className="video_live_pl_item_con">
                                                    <div>
                                                        <span className="video_live_pl_item_con_name">{item.userName}</span>
                                                        <span className="video_live_pl_item_con_time">{item.publishTime}</span>
                                                    </div>
                                                    <div className="video_live_pl_item_txt">
                                                        {item.content}
                                                        {
                                                            item.childrenNum > 0 ? <span className="video_live_pl_item_gd" onClick={() => this.zk_pl_fun(2, item)}>{item.childrenNum}回复</span> : ''
                                                        }
                                                    </div>
                                                </div>
                                                <div className="video_live_pl_item_dz">
                                                    {/* <img src={require('./img/pl_dz_icon.png')} alt="" />
                                                    <p>123.5W</p> */}
                                                </div>
                                            </div>
                                            <div className="video_live_pl_item_children">
                                                {
                                                    item.childrenReplys.slice(0, 3).map((item1, index1) => {
                                                        return  <div className="video_live_pl_item_children_item" key={index1}>
                                                                    <img src={docHeadicon(item1.headicon)} alt="" onClick={() => this.hf_pl_fun(item1)} />
                                                                    <div className="video_live_pl_item_con">
                                                                        <div>
                                                                            <span className="video_live_pl_item_con_name">{item1.userName}</span>
                                                                            <span className="video_live_pl_item_con_time">{item1.publishTime}</span>
                                                                        </div>
                                                                        <div className="video_live_pl_item_txt">
                                                                            回复:<span style={{'color': 'skyblue','margin': '0 5px'}}>{item.userName}</span>
                                                                            {item1.content}
                                                                        </div>
                                                                    </div>
                                                                    <div className="video_live_pl_item_dz">
                                                                        {/* <img src={require('./img/pl_dz_icon.png')} alt="" />
                                                                        <p>123.5W</p> */}
                                                                    </div>
                                                                </div>
                                                    })
                                                }
                                                {
                                                    item.childrenReplys.length > 3 ? <div className="video_live_pl_item_children_item">
                                                        <div className="video_live_pl_item_children_item_gd" onClick={() => this.zk_pl_fun(2, item)}>展开更多回复 <img src={require('./img/pl_zkhf_icon.png')} alt="" /></div>
                                                    </div>:''
                                                }
                                            </div>
                                        </div>
                            })
                        }

                    </div>

                    <div className="video_live_pl_send">
                        <input id="send_pl" type="text" placeholder="请输入评论..." value={value} onChange={e => this.handleChange(e)} />
                        <span onClick={() => this.send_pl_fun(1)}>发送</span>
                    </div>
                </div>

                <div className={isPL1 ? 'video_live_pl abc' : "video_live_pl" }>
                    <div className="video_live_pl_title aaa">
                        <img className="video_live_pl_close"  src={require('./img/back_uppage.png')} alt="" onClick={() => {
                            this.page1 = 1;
                            this.get_pl_list_fun()
                        }} />
                        <span>评论回复（{ plList1.childrenNum}）</span>
                        <img className="video_live_pl_close"  src={require('./img/zb_tc_guanbi_icon.png')} alt="" onClick={() => this.setState({isPL1: false})} />
                    </div>

                    <div className="video_live_pl_list video_live_pl_list1">
                        <div className="video_live_pl_item aaa">
                            <div className="video_live_pl_item_parent">
                                <img src={docHeadicon(plList1.headicon)} alt="" />
                                <div className="video_live_pl_item_con">
                                    <div>
                                        <span className="video_live_pl_item_con_name">{plList1.userName}</span>
                                        <span className="video_live_pl_item_con_time">{plList1.publishTime}</span>
                                    </div>
                                    <div className="video_live_pl_item_txt">
                                        {plList1.content}
                                    </div>
                                </div>
                                <div className="video_live_pl_item_dz">
                                    {/* <img src={require('./img/pl_dz_icon.png')} alt="" />
                                    <p>123.5W</p> */}
                                </div>
                            </div>
                        </div>
                        {
                            isPL1 ? plList1.childrenReplys.map((item, index) => {
                                return  <div className="video_live_pl_item" key={index}>
                                            <div className="video_live_pl_item_parent">
                                                <img src={docHeadicon(item.headicon)} alt="" onClick={() => this.hf_pl_fun(item, 1)} />
                                                <div className="video_live_pl_item_con">
                                                    <div>
                                                        <span className="video_live_pl_item_con_name">{item.userName}</span>
                                                        <span className="video_live_pl_item_con_time">{item.publishTime}</span>
                                                    </div>
                                                    <div className="video_live_pl_item_txt">
                                                        回复:<span style={{'color': 'skyblue','margin': '0 5px'}}>{item.replyUserName}</span>
                                                        {item.content}
                                                    </div>
                                                </div>
                                                <div className="video_live_pl_item_dz">
                                                    {/* <img src={require('./img/pl_dz_icon.png')} alt="" />
                                                    <p>123.5W</p> */}
                                                </div>
                                            </div>
                                        </div>
                            }):''
                        }
                    </div>

                    <div className="video_live_pl_send">
                        <input id="send_pl_hf" type="text" placeholder="请输入评论..." value={value} onChange={e => this.handleChange(e)} />
                        <span onClick={() => this.send_pl_fun(2)}>发送</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default index1;