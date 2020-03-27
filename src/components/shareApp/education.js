import React, {Component} from 'react';
import HeaderNavBar from '../../components/headerNavBar';
import axios from 'axios';
import moment from "moment";
import {Button, WingBlank, Modal, PullToRefresh, Popover, InputItem, Toast} from 'antd-mobile';
import Audios from "../audios";
import "video-react/dist/video-react.css";
import {Player} from 'video-react';
import DownloadTips from "./downloadTips";
import $ from "jquery";
import '../../less/detailedInformation.less';
import URLconfig from "../../config/urlConfig";
import config from "../../config/wxconfig";
import DocumentTitle from "react-document-title";

import './style.css'
import QRcode from './images/QRcode.png';
const alert = Modal.alert;


function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

class DetailedInformation extends React.Component {
    constructor(props) {
        super(props);
        const {id} = this.props.match.params;

        this.state = {
            refreshing: false,
            down: true,
            height: document.documentElement.clientHeight,
            data: [],
            contentType: '',
            pageTitle: '各类详情',
            id: id,
            status: 0,
            coverPic: '',
            enrollNum: 0,
            onlineNum: 0,
            title: '',
            isgratis: 0,
            fee: 0,
            startingTime: 0,
            createDate: '',
            headicon: '',
            name: '',
            hospital: '',
            doctorDepartment: '',
            summary: '',
            contents: '',
            doctorTitle: '',
            carefullyChosen: '',
            recommendStatus: '',
            liveStatus: '',
            isWatch: '',
            attentionIds: '',
            doctorId: '',
            collectedIds: '',
            type: '',
            image1: '',
            image: '',
            viewCount: 0,
            userId: 0,
            duration: '',
            amout: '',
            readingCount: 0,
            dzNum: 0,
            collectNum: 0,
            audios: '',
            isPlaying: false,
            audiosIsClick: false,
            synopsis: '',
            contentList: '',
            isSpread: false,
            content: '',
            replyNum: 0,
            path: "",
            ispay: '',
            modal1: false,
            orderId: '',
            isPayedClick: true,
            audiosFree: true,
            isDz: false,
            isEnroll: '',
            liveOrderId: '',
            commentsList: [],
            loading: true,
            keyWords: '',
            replyRefer: '',
            glandularArticleId: '',
            commentatorType: '',
            postType: '',
            replyUserId: '',
            replyUserType: '',
            parentId: '',
            focus: false,

        };

    }

    Ajax = (contentType, id) => {
        const liveRequestAddr = '/liveTelecast/liveTelecastDetail.do';
        const otherRequestAddr = '/appglandular/publishEducation.do';
        let targetAddr = '', params = '';
        if (contentType === 7) {
            targetAddr = liveRequestAddr;
            params = {
                "id": id,
            }
        } else {
            targetAddr = otherRequestAddr;
            params = {
                type: contentType,
                educationId: id,
            }
        }
        axios({
            url: URLconfig.publicUrl + targetAddr,
            method: 'post',
            data: params,
            transformRequest: [function (data) {
                let ret = '';
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let res = response.data.data;
                console.dir(res);

                if (res) {
                    this.setState({
                        status: res.status,
                        coverPic: res.coverPic&&(config.publicStaticUrl + res.coverPic || ''),
                        enrollNum: res.enrollNum,
                        onlineNum: res.onlineNum,
                        title: res.title,
                        isgratis: res.isgratis,
                        fee: res.fee,
                        startingTime: res.startingTime,
                        createDate: res.createDate,
                        //兼容qq登录时候获取的头像
                        headicon: res.headicon&&res.headicon.indexOf('http') !== -1 ? res.headicon : config.publicStaticUrl + res.headicon,
                        name: res.name,
                        hospital: res.hospital,
                        doctorDepartment: res.doctorDepartment,
                        summary: res.summary,
                        contents: res.contents,
                        doctorTitle: res.doctorTitle,
                        attentionNum: res.attentionNum,
                        carefullyChosen: res.carefullyChosen,
                        recommendStatus: res.recommendStatus,
                        liveStatus: res.liveStatus,
                        isWatch: res.isWatch,
                        attentionIds: res.attentionIds,
                        doctorId: res.doctorId,
                        collectedIds: res.collectedIds,
                        type: res.type,
                        image1: res.image1,
                        image: res.image,
                        viewCount: res.viewCount,
                        userId: res.userId,
                        duration: res.duration,
                        amout: res.amout,
                        readingCount: res.readingCount,
                        dzNum: res.dzNum,
                        collectNum: res.collectNum,
                        audios: config.publicStaticUrl + res.path || '',
                        synopsis: res.synopsis,
                        contentList: res.contentList,
                        content: res.content,
                        replyNum: res.replyNum,
                        path: res.path,
                        ispay: res.ispay,
                        audiosIsClick: false,
                        isDz: res.isDz,
                        isEnroll: res.isEnroll,
                    });
                    // console.dir(this.state);


                    this._updateAudiosFreeStatus(this.state.isgratis, this.state.amout, this.state.ispay);
                    this._setLivingStatus(this.state.status);
                    this._setInnerContent(this.state.synopsis, this.state.contentList, this.state.content);
                    this._isPayed(this.state.isgratis, this.state.ispay);
                    config.share2Friend('detailModule',contentType,this.props.match.params.id,this.state.title,this._setInnerContent(this.state.synopsis,this.state.contentList, this.state.content,1),this._setThumbnail(this.state.coverPic,this.state.image1,this.state.image));

                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };

    getDetails(contentType) {
        //请求详情数据
        // contentType已经修正，订单类型3：问答   5:文章  6 视频 7 直播
        const {id} = this.state;
        this.Ajax(contentType, id);
    }


    componentWillMount() {

        const {queryContentType,isShare} = this.props.match.params;
        this.setState({
            isShare:parseInt(isShare),
        });
    /*    if(parseInt(isShare)===1){

                alert('提示', '请使用外部浏览器下载', [
                    // { text: '拒绝', onPress: () => console.log('cancel') },
                    { text: '好的', onPress: () => console.log('ok') },
                ])
        }
*/
        this.changeModuleTitleType(parseInt(queryContentType));

    }

    renderAudios(audios) {
        //渲染过程
        return <Audios parent={this} src={this.state.audios} id={this.state.id} isPlaying={this.state.isPlaying}
                       audiosIsClick={this.state.audiosIsClick}/>
    }


    componentWillUnmount() {
        this.mounted = false
    }

    componentDidMount() {

        const {contentType} = this.state;
        this.getDetails(contentType);
        const hei = this.state.height;
        this.mounted = true;
        if (this.mounted === true) {

        }
        setTimeout(() => {
            this.setState({
                loading: false,
                height: hei,
            });
        }, 1000);
    }


    //获取audios控件的播放状态
    getAudiosState(isPlaying, audiosIsClick) {
        this.setState({
            isPlaying: isPlaying,
            audiosIsClick: audiosIsClick,
        })
    }


    //接口token失效时处理
    goSignWhenMissLoginToken = (status, message) => {
        if (status && message && status === 2 && message === '权限错误') {
            this.failToast(message);
            setTimeout(() => {
                this.goSign();
            }, 1000);
        }
    };

    //异常提示
    failToast(message) {
        Toast.fail(message, 2000);
    }

    //登录页
    goSign = () => {
        window.location.href = 'http://www.aisono.cn/wxHis/old&new/sign.html';
    };

    //关注等待axios状态更新
    waitingAxiosUpdate = (focusState, type = 'notExist', message = 'loading...') => {
        if (focusState === false && type === 'exist') {
            Toast.loading(message, 1);
        }
        if (focusState === true && type === 'exist') {
            Toast.success(message, 1);
        }
        if (focusState === true && type === 'noExist') {
            Toast.loading(message, 1);
        }
        if (focusState === false && type === 'noExist') {
            Toast.success(message, 1);
        }
    };

    payFocus = (userID) => {
        const {attentionNum, focus} = this.state;
        this.waitingAxiosUpdate(focus, 'exist', '关注中...');
        axios({
            url: URLconfig.publicUrl + `/appglandular/glandularAttention.do?attentionId=${userID}&type=2&userType=1`,
            method: 'get',

            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let res = response.data.data;
                if (response.data.status === 1) {
                    this.setState({
                        attentionIds: res.attentionId,
                        attentionNum: attentionNum + 1,
                        focus: true,
                    });
                    this.waitingAxiosUpdate(this.state.focus, 'exist', '关注成功');
                }
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };


    unfollow = (userID) => {
        //取关
        const {attentionNum, focus} = this.state;
        this.waitingAxiosUpdate(focus, 'noExist', '取关中...');
        axios({
            url: URLconfig.publicUrl + `/appglandular/cancelGlandularAttention.do?attentionId=${userID}&type=2&userType=1`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                if (response.data.status === 1) {
                    this.setState({
                        attentionIds: 0,
                        attentionNum: attentionNum - 1,
                        focus: false,
                    })
                    this.waitingAxiosUpdate(this.state.focus, 'noExist', '取关成功');
                }
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };


    //改变是否关注状态
    changeFocus = (contentType, attentionIds, docId, userId) => {
        if (attentionIds <= 0) {
            //未关注
            if (docId) {
                this.payFocus(docId);
            }
            if (userId) {
                this.payFocus(userId);
            }
        }
        if (attentionIds > 0) {
            //取消关注
            if (docId) {
                this.unfollow(docId);
            }
            if (userId) {
                this.unfollow(userId);
            }
        }

    };


    _withoutLivingAndPayed = (contentType, isgratis, ispay) => {
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        // contentType 3：问答   5:文章  6 视频 7 直播
        if (contentType === 3 || contentType === 5 || contentType === 6) {
            if (ispay === 1 && isgratis === 2) {
                return 'notPay';
            }
            if ((ispay === 2 && (isgratis === 1 || isgratis === 2)) || (ispay === 1 && isgratis === 1)) {
                return 'evenFreeAndPayed';
            }
            if (isgratis === 1) {
                return 'free';
            }

        }
    };

    _isCollected = (collectionId) => {
        if (collectionId <= 0) {
            return <div>
                <img src={require("../../images/sele_uncele_icon.png")} alt=""/>
                <span>收 藏</span>
            </div>
        } else {
            return (
                <div>
                    <img src={require("../../images/sele_cele_icon.png")} alt=""/>
                    <span>取消收藏</span>
                </div>
            )
        }
    };


    _isSupportHeart = (dzNum, isDz) => {
        if (isDz) {
            return (
                <div className={'box1'}>
                    <img src={require('../../images/xiangq_red.png')} alt=""/>
                    <span>{dzNum}</span>
                </div>
            )
        } else {
            return (
                <div className={'box1'}>
                    <img src={require('../../images/xiangq_dianzan.png')} alt=""/>
                    <span>{dzNum}</span>
                </div>
            )
        }
    };


    //收藏状态
    _setCollection = (collectionId, contentType, isgratis, ispay) => {
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        // contentType 3：问答   5:文章  6 视频 7 直播
        if (contentType === 7) {
            return this._isCollected(collectionId);
        } else {
            if (this._withoutLivingAndPayed(contentType, isgratis, ispay) === 'notPay') {
                return this._isCollected(collectionId)
            }
        }
    };

    //当免费或已经给钱后进入详情的收藏样式
    _setCollectionWhenPayed = (collectionId, collectNum) => {
        if (collectionId <= 0) {
            return (
                <div className={'box1'}>
                    <img src={require('../../images/sele_uncele_icon.png')} alt=""/>
                    <span>{collectNum}</span>
                </div>
            )
        } else {
            return (
                <div className={'box1'}>
                    <img src={require('../../images/shoucang_.png')} alt=""/>
                    <span>{collectNum}</span>
                </div>
            )
        }


    };

    //收藏
    isCollected = (collectedIds, collectionType, collectNum) => {
        let {id} = this.state;
        if (collectedIds <= 0) {
            //收藏
            axios({
                url: URLconfig.publicUrl + '/upload/saveCollection.do',
                method: 'post',
                data: {
                    "collectedId": id,
                    "collectionType": collectionType,
                    "userType": 1,
                },
                transformRequest: [function (data) {
                    let ret = ''
                    for (let it in data) {
                        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                    }
                    return ret
                }],
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json, text/plain, */*',
                }
            }).then((response) => {
                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                if (response.status === 200 && response.data.status === 1) {
                    if (response.data.status === 1) {
                        this.setState({
                            collectedIds: 1,
                            collectNum: collectNum + 1,
                        });
                        Toast.success('收藏成功', 1);
                    }
                }
            })
                .catch(function (error) {
                    alert(JSON.stringify(error));
                });
        } else {
            //取消收藏
            axios({
                url: URLconfig.publicUrl + '/upload/cancelCollection.do',
                method: 'post',
                data: {
                    "collectedId": id,
                    "collectionType": collectionType,
                    "userType": 1,
                },
                transformRequest: [function (data) {

                    let ret = ''
                    for (let it in data) {
                        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                    }
                    return ret
                }],
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json, text/plain, */*',
                }
            }).then((response) => {
                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                if (response.status === 200 && response.data.status === 1) {
                    if (response.data.status === 1) {
                        this.setState({
                            collectedIds: 0,
                            collectNum: collectNum - 1,
                        })
                    }
                }
            })
                .catch(function (error) {
                    alert(JSON.stringify(error));
                });
        }
    };


    //点赞
    supportHeart = (collectionType, dzNum) => {
        let {id} = this.state;
        axios({
            url: URLconfig.publicUrl + '/appEducation/educationDz.do',
            method: 'post',
            data: {
                "educationId": id,
                "type": collectionType,
                "drOrUser": 1,
            },
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    isDz: true,
                    dzNum: dzNum + 1,
                });
                Toast.success('点赞成功', 1);
            }
            if (response.status === 200 && response.data.status === 2) {
                Toast.info(response.data.message);
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };


    //距离开始时间1小时的提示状态
    _beforeOneHour2Start = (startTimeStamp) => {
        //获取当前时间作对比
        //   let ti=1575432923000;
        let releaseDate = moment(startTimeStamp);
        let currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
        const diff = releaseDate.diff(currentDate);
        const diffDuration = moment.duration(diff);
        let diffMonths = diffDuration.months();
        let diffDays = diffDuration.days();
        let diffHours = diffDuration.hours();
        let diffMin = diffDuration.minutes();
        let diffSec = diffDuration.seconds();
        if (diffMonths === 0 && diffDays === 0 && diffHours === 0 && diffMin > 0 && diffMin < 60) {
            return diffMin;
        } else {
            return 0;
        }
    };

    goLivingRoom(getReportOrder = false, id, isEnroll) {
        // console.dir(id);
        if (getReportOrder) {
            this.registerNow(id, isEnroll)
        }
        this.enterLivingRoom(id);
        this.props.history.push({pathname: `/room/${id}/0`,});
    }

    //报名状态
    _showReportStatus = (contentType, status, liveStatus, startingTime, isgratis, fee, ispay, isEnroll) => {
        // contentType 订单类型3：问答   5:文章  6 视频 7 直播
        // 当前时间小于startingTime时等待若差值小于60min是参与讨论
        // status 状态：10-待审核；20-待直播；30：直播中 40：已结束
        //liveStatus 0 未报名 1：报名成功(支付成功) 2待支付(已经报名) 3取消(退款)
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付(除开直播详情)

        if (contentType === 7) {

            //报名中
            // (new Date()).getTime() < startingTime

            if (status && liveStatus === 2 && isgratis === 2) {
                return <div className={'buyReportNow'} onClick={() => {
                    this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                }}>立即购买(仅需￥{fee})</div>
            }

            if (status === 20 && (liveStatus === 0 || liveStatus === 3 || liveStatus === 2)) {
                if (isgratis === 2) {
                    return <div className={'buyReportNow'} onClick={() => {
                        this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                    }}>立即购买(仅需￥{fee})</div>
                } else {
                    if(parseInt((startingTime - (new Date()).getTime()) / 1000 / 60) < 60){
                        return <div className={'reportNow'} onClick={() => {
                            this.goLivingRoom(true, this.state.id, isEnroll)
                        }}>参与讨论</div>
                    }
                    else {
                        return <div className={'reportNow'} onClick={() => {
                            this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                        }}>立即报名</div>
                    }
                }
            }

            if (status === 20 && (liveStatus === 1 || liveStatus === 2) && (parseInt((startingTime - (new Date()).getTime()) / 1000 / 60) > 60)) {
                return <div className={'waitingReport'}>等待开课</div>
            }

            if (status === 20 && (liveStatus === 2 || liveStatus === 0) && isgratis === 1 && (parseInt((startingTime - (new Date()).getTime()) / 1000 / 60) < 60)) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom(true, this.state.id, isEnroll)
                }}>参与讨论</div>
            }

            if (status === 20 && (liveStatus === 1 && isgratis) && (parseInt((startingTime - (new Date()).getTime()) / 1000 / 60) < 60)) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom('', this.state.id, isEnroll)
                }}>参与讨论</div>
            }


            //直播中
            // isgratis 1:免费 2:不免费
            // ispay是否支付 1未支付 2 已支付(除开直播详情)
            //liveStatus 0 未报名 1：报名成功(支付成功) 2待支付() 3取消(退款)
            if (status === 30 && (liveStatus === 1 || liveStatus === 2)) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom('', this.state.id, isEnroll)
                }}>进入课堂</div>
            }

            if (status === 30 && (liveStatus === 0 || liveStatus === 3) && isgratis === 2) {
                return <div className={'buyReportNow'} onClick={() => {
                    this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                }}>立即购买(仅需￥{fee})</div>
            }
            if (status === 30 && (liveStatus === 0 || liveStatus === 3) && isgratis === 1) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom(true, this.state.id, isEnroll)
                }}>进入课堂</div>
            }
            //已结束
            //liveStatus 0 未报名 1：报名成功(支付成功) 2待支付 3取消(退款)
            // isgratis 1:免费 2:不免费
            if (status === 40 && liveStatus === 2 && isgratis === 1) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom(true, this.state.id, isEnroll)
                }}>回顾课程</div>
            }

            if (status === 40 && liveStatus === 2 && isgratis === 2) {
                return <div className={'buyReportNow'} onClick={() => {
                    this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                }}>立即购买(仅需￥{fee})</div>
            }

            if (status === 40 && liveStatus === 1 && isgratis) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom('', this.state.id, isEnroll)
                }}>回顾课程</div>
            }

            if (status === 40 && (liveStatus === 0 || liveStatus === 3) && isgratis === 2) {
                return <div className={'buyReportNow'} onClick={() => {
                    this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                }}>立即购买(仅需￥{fee})</div>
            }

            if (status === 40 && (liveStatus === 0 || liveStatus === 3) && isgratis === 1) {
                return <div className={'reportNow'} onClick={() => {
                    this.goLivingRoom(true, this.state.id, isEnroll)
                }}>回顾课程</div>
            }

        }

        if (this._withoutLivingAndPayed(contentType, isgratis, ispay) === 'notPay') {
            return <div className={'buyReportNow'} onClick={() => {
                this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
            }}>立即购买</div>
        }
    };

    //已观看，未观看，已报名状态显示
    _showLivingStatus = (contentType, liveStatus, isgratis, fee, isWatch, status, amout) => {
        //status 状态：10-待审核；20-待直播；30：直播中 40：已结束
        //liveStatus 0 未报名 1：报名成功(支付成功) 2待支付(已经报名) 3取消(退款)
        // isWatch大于0为已观看
        // contentType 订单类型3：问答   5:文章  6 视频 7 直播
        // isgratis 1:免费 2:不免费
        if (contentType === 7) {
            if (status === 20 && liveStatus === 1 && isgratis) {
                return (<p className={'setDoneReportStyle'}>已报名</p>)
            }
            if (status === 20 && (liveStatus === 0 || liveStatus === 3) && isgratis) {
                if (isgratis === 1) {
                    return <div className={'setFreeStyle'}>免费</div>;
                } else {
                    return <div className={'setPriceStyle setSingleRow'}>￥{fee}</div>;
                }
            }
            if (status === 20 && liveStatus === 2 && isgratis) {
                return (<p className={'setDoneReportStyle'}>已报名</p>)
            }

            /*    if ((status === 30 || status === 40) && isWatch > 0 && (liveStatus === 1 || liveStatus === 2)) {
                    return (<p className={'setDoneStyle'}>已观看</p>)
                }
    */

            if ((status === 40 || status === 30) && isWatch <= 0) {
                return (<p className={'setDoneStyle'}>未观看</p>)
            }

            if ((status === 40 || status === 30) && isWatch > 0) {
                return (<p className={'setDoneStyle'}>已观看</p>)
            }

            /*   if ((status === 30 || status === 40) && isWatch <= 0 && (liveStatus === 0 || liveStatus === 3)) {
                   if (isgratis === 1) {

                       return <div className={'setFreeStyle'}>免费</div>;
                   } else {
                       return <div className={'setPriceStyle setSingleRow'}>￥{fee}</div>;
                   }
               }
   */

            if ((status === 30 || status === 40) && isWatch <= 0 && (liveStatus === 1 || liveStatus === 2)) {
                return (<p className={'setDoneStyle'}>未观看</p>)
            }


        }
        if (contentType === 3 || contentType === 5 || contentType === 6) {
            if (isgratis === 1) {
                return <div className={'setFreeStyle'}>免费</div>;
            } else {
                return <div className={'setPriceStyle setSingleRow'}>￥{amout}</div>;
            }
        }
    };

    //改变页面的title&统一接口参数
    changeModuleTitleType(type) {
        //queryContentType  1 全部 2 直播 3 视频 4 图文 5 语音 6 精选好文 7 热门排行
        // 订单类型3：问答   5:文章  6 视频 7 直播
        if (type === 2) {
            this.setState({
                contentType: 7,
                pageTitle: '直播详情',
            });

        }
        if (type === 3) {
            this.setState({
                contentType: 6,
                pageTitle: '视频详情',
            })
        }
        if (type === 4) {
            this.setState({
                contentType: 5,
                pageTitle: '文章详情',
            });

        }
        if (type === 5) {
            this.setState({
                contentType: 3,
                pageTitle: '语音详情',
            })
        }
    }

    showCountWithoutLiving(contentType, readingCount, dzNum, collectNum) {
        if (contentType !== 7) {
            return (
                <div className={'thirdContentArea'}>
                    <div className={'tlbsb'}>
                        <img src={require('../../images/un_scan_icon.png')} alt=""/>
                        <span>浏览({readingCount < 99 && readingCount >= 0 ? readingCount : '99+'})</span>
                    </div>
                    <div className={'tlbsb'}>
                        <img src={require('../../images/un_press_good_icon.png')} alt=""/>
                        <span>点赞({dzNum >= 0 && dzNum < 99 ? dzNum : '99+'})</span>
                    </div>
                    <div className={'tlbsb'}>
                        <img src={require('../../images/un_cele_num_icon.png')} alt=""/>
                        <span>收藏({collectNum >= 0 && collectNum < 99 ? collectNum : '99+'})</span>
                    </div>
                </div>
            )
        }
    }

    _audiosDuration = (contentType, duration) => {
        // 3：问答   5:文章  6 视频 7 直播
        if ((contentType === 6 || contentType === 3) && duration) {
            let d = moment.duration(parseInt(duration * 1000));
            let hours = Math.floor(d.asHours());
            let mins = Math.floor(d.asMinutes()) - hours * 60;
            let sec = Math.floor(d.asSeconds()) - hours * 3600 - mins * 60;
            let str = '';
            if (hours) {
                str += `${hours}小时`;
            } else {
                str += `0小时`;
            }
            if (mins) {
                str += `${mins}分钟`;
            } else {
                str += `0分钟`;
            }
            if (sec) {
                str += `${sec}秒`;
            } else {
                str += '0秒'
            }
            return str
        }
    };

    //展示静态页面
    showArea(contentType, duration, isPlaying, audiosIsClick) {
        // 3：问答   5:文章  6 视频 7 直播
        if (audiosIsClick && contentType === 6) {
            return '';
        }
        if (audiosIsClick && contentType === 3) {
            return <div className={'isPlaying fixedBottom'}>{this.renderAudios()}</div>
        } else {
            return <div className={'duration fixedBottom'}>{this._audiosDuration(contentType, duration)}</div>
        }
    }


    //光盘旋转
    isRoundDisk(isPlaying) {
        if (isPlaying) {
            return (
                <div>
                    <img className={'disk diskRoundRotation '} src={require("../../images/voice_yp_img.png")} alt=""/>
                    <img className={'pointer play '} src={require("../../images/voice_play_img.png")} alt=""/>
                </div>
            )
        } else {
            return (
                <div>
                    <img className={'disk  diskRoundRotationStop'} src={require("../../images/voice_yp_img.png")} alt=""/>
                    <img className={'pointer  pause'} src={require("../../images/voice_play_img.png")} alt=""/>
                </div>
            )
        }
    }

    //简介，课程简介，none
    showResume(contentType) {
        // 3：问答   5:文章  6 视频 7 直播
        if (contentType === 3 || contentType === 6) {
            return '简介'
        }
        if (contentType === 7) {
            return '课程简介'
        }
        if (contentType === 5) {
            return '内容'
        }
    }

    //展示简介、课程简介
    getContentInner(contentType, innerContent, isSpread) {
        if (innerContent) {
            return (<div
                className={` ${this.state.isSpread === true || contentType === 7 ? "contentResumeOpen" : "contentResume"}`}>
                { // 对map 循环出来的每个属性插入标签元素
                    innerContent.map((inner, index) => {
                        return (
                            <div className={'showDetailResume'} key={index}>
                                {inner.content}
                                {inner.title}
                                <img src={inner.image} alt=""/>
                            </div>
                        )
                    })
                }
            </div>)

        }
    }


    getArticleDetail(contentType, isSpread) {
        const {id} = this.state;
        // 获取文章详情detail
        axios({
            url: URLconfig.publicUrl + `/appglandular/getAllContent.do?id=${id}`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let content = response.data.data.content;
                this.setState({
                    innerContent: content,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //展开完整介绍
    showAll(contentType, isgratis, ispay) {
        //判断内容是否应该展开
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        const {isSpread} = this.state;
        /* if (isSpread) {
            this.setState({
                isSpread: false,
            });
        } else {
            this.setState({
                isSpread: true,
            });
        }*/
        if (contentType === 5) {
            //文章
            if (isgratis === 2 && ispay === 2) {
                //不免费&已经支付
                this.getArticleDetail(contentType, isSpread);
                if (isSpread) {
                    this.setState({
                        isSpread: false,
                    });
                } else {
                    this.setState({
                        isSpread: true,
                    });
                }
            }
            if (isgratis === 1) {
                //免费
                this.getArticleDetail(contentType, isSpread);
                if (isSpread) {
                    this.setState({
                        isSpread: false,
                    });
                } else {
                    this.setState({
                        isSpread: true,
                    });
                }
            }

            if (isgratis === 2 && ispay === 1) {
                //不免费&未支付
                this.setState({
                    'modal1': true,
                    isSpread: false,
                });
            }
        } else {
            if (isSpread) {
                this.setState({
                    isSpread: false,
                });
            } else {
                this.setState({
                    isSpread: true,
                });
            }
        }
    }

    showCollepsTitle(contentType) {
        if (this.state.isSpread) {
            return <div className={`clickToShow`}>
                <span>折叠{this.showResume(contentType)}</span>
            </div>
        } else {
            return <div className={`clickToShow`}>
                <span>点击查看完整{this.showResume(contentType)}</span>
            </div>
        }
    }

    play() {
        this.setState({
            audiosIsClick: true,
        })
    }


    showModal = key => (e) => {
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
            [key]: true,
        });
    };

    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    };

    onWrapTouchStart = (e) => {
        // fix touch to scroll background page on iOS
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
    };


    //提示支付的弹框
    alertToPay(fee) {
        return this.showModal('modal1');
    }

    //设置开播状态
    _setLivingStatus(state) {
        //开播前
        if (state === 20) {
            this.setState({
                isEnroll: 1,
            })
        }
        //开播后
        if (state === 30 || state === 40) {
            this.setState({
                isEnroll: 2,
            })
        }
    }

    //设置分享的缩略图
    _setThumbnail(coverPic,image1,image){
        let imgUrl='';
        if(image1){
            imgUrl=config.publicStaticUrl + image1;
        }
        if(image){
            imgUrl=config.publicStaticUrl + image;
        }
        if(coverPic){
            imgUrl=coverPic;
        }
        return imgUrl;
    }




    //获取wx分享内容
    //设置详情内容
    _setInnerContent(synopsis, contentList, content,isWxDesc) {
        let inner = synopsis || contentList || content;
        this.setState({
            innerContent: inner
        });
        if(isWxDesc){
            return (inner[1].content&&inner[1].content)||(inner[0].content&&inner[0].content)||(inner[2].content&&inner[2].content)
        }
    }

    //更新语音收费状态
    _updateAudiosFreeStatus(isgratis, amout, ispay) {
        // isgratis;  1:免费  2:不免费'
        // ispay是否支付 1未支付 2 已支付
        if (isgratis === 2 && ispay === 1) {
            this.setState({
                audiosFree: false,
            });
        }
        if ((isgratis === 1 && (ispay === 1 || ispay === 2)) || (isgratis === 2 && ispay === 2)) {
            this.setState({
                audiosFree: true,
            })
        }
    }

    //语音提示收费
    audiosAlertToPay = (key, audiosIsClick, audiosFree, ispay, isgratis) => (e) => {
        // ispay是否支付 1未支付 2 已支付
        // isgratis 1:免费 2:不免费
        e.preventDefault(); // 修复 Android 上点击穿透
        if (ispay === 1 && isgratis === 2) {
            // this.setState({
            //     [key]: true,
            //     audiosIsClick: false,
            // });
            $('.downloadApp .btn').click()
        }
        if ((ispay === 2 && isgratis === 2) || ((ispay === 1 || ispay === 2) && isgratis === 1)) {
            this.setState({
                [key]: false,
                audiosIsClick: true,
            });
        }
    };


    showAlertWhenDidNotPay(isgratis, amout, ispay, image, audios) {
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        if (ispay === 1 && isgratis === 2) {
            return <div onClick={this.alertToPay(amout)}>
                <img className={'setImage'} src={config.publicStaticUrl + image} alt="" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = require("../../images/cover.png")
                }}/>
                <img className={'videoMarker'} src={require("../../images/video_play_icon.png")} alt=""/>
            </div>
        } else {
            return <div className={"videoPlayer"} style={{position: 'relative'}} onClick={() => this.play()}>
                <Player
                    playsInline
                    poster={config.publicStaticUrl + image}
                    ref={player => {
                        this.player = player;
                    }}
                    src={audios}
                    videoId="video-1"
                >
                </Player>
            </div>
        }
    }

    //直播报名
    async registerNow(id, isEnroll, isgratis, contentType) {
        await axios({
            url: URLconfig.publicUrl + '/liveTelecast/liveEnroll.do',
            method: 'post',
            data: {
                "isEnroll": isEnroll,
                "liveId": id,
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                if (response.data.data) {
                    if (isgratis === 2) {
                        this.setState({
                            liveOrderId: response.data.data,
                            // orderId: response.data.data,
                        });
                    }
                    if (isgratis === 1) {
                        Toast.success('报名成功', 1);
                        this.getDetails(contentType);
                    }

                }
            } else {
                alert(response.data.message);
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //进入直播
    async enterLivingRoom(id) {
        await axios({
            url: URLconfig.publicUrl + '/liveTelecast/enterlive.do',
            method: 'post',
            data: {
                "id": id,
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);

            if (response.status === 200 && response.data.status === 1) {

            } else {
                alert(response.data.message);
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    //通过id获取orderId
    async getOrderId(id, contentType) {
        await axios({
            url: URLconfig.publicUrl + '/business/generateOrder.do',
            method: 'post',
            data: {
                "orderType": contentType,
                "paySource": 3,
                "payMode": 2,
                "productId": id,
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                if (response.data.data) {
                    this.setState({
                        orderId: response.data.data,
                    });

                }
            } else {
                alert(response.data.message);
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    async BuyItNow(id, contentType, isEnroll, isgratis) {
        this.setState({isPayedClick: false});   //将isClick 变成false，将不会执行处理事件
        const that = this;  // 为定时器中的setState绑定this
        setTimeout(function () {       // 设置延迟事件，1秒后将执行

            that.setState({isPayedClick: true})   // 将isClick设置为true

        }, 1000);

        const {isPayedClick} = this.state;
        if (isPayedClick) {
            if (contentType === 7) {
                await this.registerNow(id, isEnroll, isgratis, contentType);
                if (this.state.liveOrderId) {
                    await this.getOrderId(this.state.liveOrderId, contentType);
                }
                if (this.state.orderId) {
                    this.toGetWXOrderInfo(this.state.orderId, localStorage.getItem('openid'), contentType);
                }
            } else {
                await this.getOrderId(id, contentType);
                if (this.state.orderId) {
                    this.toGetWXOrderInfo(this.state.orderId, localStorage.getItem('openid'), contentType);
                }
            }
        }
    }


    async toGetWXOrderInfo(orderId, openid = localStorage.getItem('openid'), contentType) {
        await axios({
            url: URLconfig.publicUrl + '/wx/payOrder.do',
            method: 'post',
            data: {
                "orderId": orderId,
                "openid": openid,
            },
            transformRequest: [function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let appId = response.data.data.appId;
                let timestamp = response.data.data.timestamp;
                let noncestr = response.data.data.noncestr;
                let packageValue = response.data.data.packageValue;
                let paySign = response.data.data.paySign;
                if (appId && timestamp && noncestr && packageValue && paySign) {
                    this.callpay(appId, timestamp, noncestr, packageValue, paySign, contentType)
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    callpay(appId, timestamp, noncestr, packageValue, paySign, contentType) {
        let that = this;
        if (packageValue.length > 30 && appId.length > 10) {
            window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
                "appId": appId,
                "timeStamp": timestamp,
                "nonceStr": noncestr,
                "package": packageValue,
                "signType": "MD5",
                "paySign": paySign
            }, function (res) {
                if (res.err_msg === "get_brand_wcpay_request:ok") {
                    that.setState({
                        'modal1': false,
                    });

                    // router.push('/results/check');
                    // window.location.reload();
                    /*    if (_this.state.status === 20) {

                            window.location.reload();
                        } else {
                            _this.gotozhibo(id);
                        }*/
                    that.getDetails(contentType);

                } else if (res.err_msg === "get_brand_wcpay_request:cancel") {
                    // message.info("支付取消");
                    alert('支付取消');

                } else if (res.err_msg === "get_brand_wcpay_request:fail") {
                    // router.push('/results/check')
                    alert('支付失败');

                } else {
                    // message.info(res.err_msg);
                    // return false;
                    alert(res.err_msg);
                }
                // WeixinJSBridge.log(response.err_msg);
            });
        } else {
            alert("网络异常。");
            // return false;
        }
    }


    //不同类型评论下面bar功能不一样
    diffContentTypeArea(collectedIds, type, contentType, status, liveStatus, startingTime, isgratis, fee, ispay, collectNum, dzNum, isDz, isEnroll) {
        // 3：问答   5:文章  6 视频 7 直播
        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        if (contentType === 7) {
            return <div className={'buttonArea'}>
                <Button style={{border: 'none', borderRadius: '0px'}} className={'collect'}
                        onClick={() => this.isCollected(collectedIds, type, collectNum)}>
                    {this._setCollection(collectedIds, contentType, isgratis, ispay)}
                </Button>
                <Button className={'reportArea'}>
                    {this._showReportStatus(contentType, status, liveStatus, startingTime, isgratis, fee, ispay, isEnroll)}
                </Button>
            </div>
        } else {
            if ((isgratis === 1) || (isgratis === 2 && ispay === 2)) {
                return <div className={'buttonArea'}>
                    <div className={'commentsBox'}>
                        <InputItem
                            ref={el => this.inputRef = el}
                            placeholder="请输入评论"
                            // onKeyUp={this.onVirtualKeyboardConfirm}
                            onChange={(value) => {
                                this.setState({keyWords: value})
                            }}
                            onBlur={this.inputBlurHandle}
                        />
                        <Button className={'sendCommentBtn'} onClick={this.onVirtualKeyboardConfirm}>发送</Button>
                    </div>
                    <div className={'clickBox'}>
                        <div className={'box1 setBox1Margin'}
                             onClick={() => this.isCollected(collectedIds, type, collectNum)}>
                            {this._setCollectionWhenPayed(collectedIds, collectNum)}
                        </div>
                        <div className={'box1'} onClick={() => this.supportHeart(type, dzNum)}>
                            {this._isSupportHeart(dzNum, isDz)}
                        </div>
                    </div>

                </div>
            }

            if (isgratis === 2) {
                return <div className={'buttonArea'}>
                    <Button style={{border: 'none', borderRadius: '0px'}} className={'collect'}
                            onClick={() => this.isCollected(collectedIds, type, collectNum)}>
                        {this._setCollection(collectedIds, contentType, isgratis, ispay)}
                    </Button>
                    <Button className={'reportArea'}>
                        {this._showReportStatus(contentType, status, liveStatus, startingTime, isgratis, fee, ispay, isEnroll)}
                    </Button>
                </div>
            }

        }
    }


    //是否购买或者免费观看收听
    _isPayed(isgratis, ispay) {
        const {id, contentType} = this.state;


        // isgratis 1:免费 2:不免费
        // ispay是否支付 1未支付 2 已支付
        if (isgratis === 1 || (ispay === 2 && isgratis === 2) || contentType === 7) {
            this.setState({
                beComments: 'yes',
            });
            this.getComments(this.state.contentType, id);
        } else {
            this.setState({
                beComments: 'no'
            })
        }
    }

    //获取评论列表
    async getComments(contentType, commentId) {
        await axios({
            url: URLconfig.publicUrl + `/appglandular/glandularArticleReplyList.do?postType=${contentType}&glandularArticleId=${commentId}&page=1&limit=999`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                let res = response.data.data;
                this.setState({
                    commentsList: res,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }

    replyOrComment(replyUserName, content, userName, doctorId, replyUserId, replyUserType) {

        if (replyUserName) {
            return <div>
                回复：<span
                style={{color: '#6793F3'}}>{userName}{doctorId === replyUserId && replyUserType === 2 ? '（楼主）' : ''}</span>
                <span> {content}</span>
            </div>
        } else {
            return content;
        }
    }

    async sendComments() {
        //这里的keyWords就是评论内容
        // name===replyRefer 引用的用户昵称
        // glandularArticleId 主贴的id
        // content 内容
        // commentatorType 1:用户评论 2医生评论
        // postType 帖子类型 3：语音 5文章 6视频
        // replyUserId 被回复人Id
        // replyUserType 被回复人类型 1 用户 2 医生
        // parentId 每组首条评论id

        const {id, contentType, keyWords, replyRefer, glandularArticleId, commentatorType, postType, replyUserId, replyUserType, parentId} = this.state;
        //默认参数值是第一次评论的时候

        axios({
            url: URLconfig.publicUrl + `/appglandular/comment.do`,
            method: 'post',
            data: {
                "content": keyWords,
                "glandularArticleId": glandularArticleId || id,
                "replyRefer": replyRefer,
                'commentatorType': 1,
                'postType': postType || contentType,
                'replyUserId': replyUserId,
                'replyUserType': replyUserType,
                'parentId': parentId,
            },
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            console.dir(response);
            // this.goSignWhenMissLoginToken(response.data.status,response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.getDetails(contentType);
                this.inputRef.setState({
                    value: ``,
                    placeholder: `回复${replyRefer}:`
                });
            }
            if (response.status === 200 && response.data.status === 2) {
                Toast.fail(response.data.message);

                /*   this.inputRef.setState({
                       value: ``,
                       placeholder: `回复${replyRefer}:`
                   });*/
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    //发送评论
    onVirtualKeyboardConfirm = (e) => {
        const keycode = e.keyCode;
        const {keyWords} = this.state;

        if (keyWords === '') {
            Toast.info(`请输入评论内容`, 2, null, true);
            return false;
        } else {
            this.sendComments();
        }
        /*  if (keycode === 13 && !isNaN(keycode)) {
              e.preventDefault(); //安卓上点击穿透


          }*/
    };

    //键盘收起&修复键盘所占区域高度
    inputBlurHandle = () => {
        window.scroll(0, 0);
    };


    replyClass(name = '', glandularArticleId, commentatorType, postType, replyUserId = '', replyUserType = '', parentId = '') {
        // name===replyRefer 引用的用户昵称
        // glandularArticleId 主贴的id
        // content 内容
        // commentatorType 1:用户评论 2医生评论
        // postType 帖子类型 3：语音 5文章 6视频
        // replyUserId 被回复人Id
        // replyUserType 被回复人类型 1 用户 2 医生
        // parentId 每组首条评论id
        this.inputRef.focus();
        this.setState({
            'replyRefer': name,
            'glandularArticleId': glandularArticleId,
            'commentatorType': commentatorType,
            'postType': postType,
            'replyUserId': replyUserId,
            'replyUserType': commentatorType,
            'parentId': parentId,
        });

        this.inputRef.setState({
            placeholder: `回复${name}:`
        });
        setTimeout(() => {
            // console.dir(this);

        }, 0)

    }

    isLZ = (type) => {
        if(type==='firstClass'){
            return <span className={'lzTag'}>楼主</span>
        }
        if(type==='secondClass'){
            return <span className={'lz'}>楼主</span>
        }
    };


    //跳转到评论列表
    toCommentList = (postType, id,isExtend) => {
        const {collectNum, dzNum, isDz, collectedIds} = this.state;
        this.props.history.push({pathname: `/commentList/${postType}/${id}/${collectNum}/${dzNum}/${isDz}/${collectedIds}/${isExtend}`,});

    };


    //获取评论
    setComments(commentsList) {
        // console.dir(commentsList);
        let isExtend=0;
        if (commentsList.length) {
            return commentsList.map((item, key) => {
                return (<div key={key} className={'onePieceOfComment'}>
                    <div className={'firstClass'}>
                        <div className={'commentsAll'}>
                            <div className={'commentsHeader'}>
                                <div className={'commentsName'}>
                                    <img src={config.publicStaticUrl + item.headicon} alt=""/>
                                    <span className={'name'}>{item.userName || item.name}</span>
                                    {/*<span className={'lz'}>楼主</span>*/}
                                    {item.doctorId === item.userId && item.commentatorType === 2 ? this.isLZ('firstClass') : ''}
                                </div>
                                <div className={'commentsTime'}>{item.publishTime}</div>
                            </div>
                            <div className={'commentsInner'}>{item.content}
                                <span className={'commentsInnerResponseNum'}>{item.childrenNum} 回复</span>
                            </div>
                        </div>
                    </div>
                    <div className={'threeList'}>
                        {
                            item.childrenReplys.map((item1, key1) =>
                                <div key={key1} className={'secondClass'}>
                                    <div className={'commentsAll'}>
                                        <div className={'commentsHeader'}>
                                            <div className={'commentsName'}>
                                                <img src={config.publicStaticUrl + item1.headicon} alt=""/>
                                                <span className={'name'}>{item1.userName || item1.name}</span>
                                                {item1.doctorId === item1.userId && item1.commentatorType === 2 ? this.isLZ('secondClass') : ''}

                                            </div>
                                            <div className={'commentsTime'}>{item1.publishTime}</div>
                                        </div>
                                        <div className={'commentsInner'}>
                                            {this.replyOrComment(item1.replyUserName, item1.content, item1.replyUserName, item1.doctorId, item1.replyUserId, item1.replyUserType)}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                </div>)

            })
        }
    }
    fuckClick(){
        $('.downloadApp .btn').click()
    }
    render() {


        if (this.state.loading === true) {
            return (

                <DocumentTitle title='科普详情'>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                    }}>
                        <img src={require("../../images/loading.gif")} alt=""/>
                    </div>
                </DocumentTitle>
            )
        }

        const {pageTitle, status, coverPic, enrollNum, onlineNum, title, fee, isgratis, startingTime, createDate, headicon, doctorTitle, name, hospital, doctorDepartment, attentionNum, carefullyChosen, recommendStatus, liveStatus, isWatch, attentionIds, doctorId, collectedIds, type, contentType, image1, image, viewCount, userId, duration, amout, readingCount, dzNum, collectNum, audios, isPlaying, audiosIsClick, innerContent, replyNum, path, ispay, audiosFree, isDz, isEnroll, isSpread, commentsList,isShare} = this.state;


        //关注状态时的状态（直播中30，报名中20）新样式
        const _newFocusStatus = (status, startTimeStamp) => {

            if (status === 20 && this._beforeOneHour2Start(startTimeStamp)) {
                return <div className={'focusStatus focusStatusReport'}>
                    <img src={require("../../images/decatate_enroll_icon.png")} alt=""/>
                    <span>{this._beforeOneHour2Start(startTimeStamp)}分钟后开始</span>
                </div>;
            }

            if (status === 20) {
                return <div className={'focusStatus focusStatusReport'}>
                    <img src={require("../../images/decatate_enroll_icon.png")} alt=""/>
                    <span>报名中</span>
                </div>;
            }
            if (status === 30) {
                return <div className={'focusStatus focusStatusLiving'}><img src={require("../../images/palying.gif")}
                                                                             alt=""/><span>直播中</span></div>;
            }
            if (status === 40) {
                return <div className={'focusStatus focusStatusDone'}><span>已结束</span></div>;
            }
        };


        //转时间格式
        const _changeTimeFormat = (timeStamp, format = 'YYYY/MM/DD HH:mm (dddd)') => {
            return moment(timeStamp).format(format);
        };


        //展示报名，在线，观看人数
        const _showPeopleNumber = (...args) => {
            // 订单类型3：问答   5:文章  6 视频 7 直播
            // status 状态：10-待审核；20-待直播；30：直播中 40：已结束
            //观看数直播里面是enrollNum  其他是viewCount
            let contentType = args[0], status = args[1], enrollNum = args[2], onlineNum = args[3], viewCount = args[4],
                audiosIsClick = args[5], startingTime = args[6];

            // 状态：10-待审核；20-待直播；30：直播中 40：已结束
            if (contentType === 7 && status === 20 && (parseInt((startingTime - (new Date()).getTime()) / 1000 / 60) < 60)) {
                return (<div className={'reportNumber'}>{onlineNum}人在线</div>)
            }
            if (contentType === 7 && status === 20) {
                return (<div className={'reportNumber'}>{enrollNum}人报名</div>)
            }
            if (contentType === 7 && status === 30) {
                return (<div className={'reportNumber'}>{onlineNum}人在线</div>)
            }
            if (contentType === 7 && status === 40) {
                return (<div className={'reportNumber'}>{enrollNum}人观看</div>)
            }
            if (contentType === 5) {
                return (<div className={'reportNumber fixedBottom'}>{viewCount}人阅读</div>)
            }
            if (contentType === 6 && audiosIsClick === false) {
                return (<div className={'reportNumber fixedBottom'}>{viewCount}人观看</div>)
            }
            if (contentType === 3) {
                return (<div className={'reportNumber fixedBottom'}>{viewCount}人收听</div>)
            }
            if (contentType === 6 && audiosIsClick) {
                return ''
                // return( <div className={'reportNumber fixedBottom'} style={{display:'none'}}></div>)
            }
        };

        //是否精选or推荐tags
        const _isEliteOrRecommendation = (elite, recommendation, audiosIsClick) => {
            // 推荐状态 0 不推荐 1 推荐
            // 是否精选 0 普通 1 精选
            if (elite === 1 && recommendation === 0 && !audiosIsClick) {
                return <div className={'eliteTags'}>精华</div>
            }
            if (recommendation === 1 && elite === 0 && !audiosIsClick) {
                return <div className={'recommendTags'}>推荐</div>
            }
            if (elite && recommendation && !audiosIsClick) {
                return (
                    <div>
                        <div className={'eliteTags'}>精华</div>
                        <div className={'recommendTags'}>推荐</div>
                    </div>
                )
            }
        };

        const _setAttention = (attentionIds) => {
            if (attentionIds > 0) {
                return <div className={'attentioned setSingleRow'}>已关注</div>
            } else {
                return <div className={'attention setSingleRow'}>未关注</div>
            }
        };


        const showHospitalDetail = (
            <Popover mask
                     overlayClassName="fortest"
                     overlayStyle={{color: 'currentColor', padding: '1px'}}
                     visible={this.state.visible}
                     overlay={hospital}
                     align={{
                         overflow: {adjustY: 1, adjustX: 1},
                         offset: [0, 0],
                     }}
                     onVisibleChange={this.handleVisibleChange}
                     onSelect={this.onSelect}
            >
                <div>
                    <div className={'hospitalAddress'}>{hospital}</div>
                </div>
            </Popover>
        );

        const showDepartmentDetail = (
            <Popover mask
                     overlayClassName="fortest"
                     overlayStyle={{color: 'currentColor', padding: '1px'}}
                     visible={this.state.visible}
                     overlay={doctorDepartment}
                     align={{
                         overflow: {adjustY: 1, adjustX: 1},
                         offset: [0, 0],
                     }}
                     onVisibleChange={this.handleVisibleChange}
                     onSelect={this.onSelect}
            >
                <div>
                    <div className={'doctorDepartment'}>{doctorDepartment}</div>
                </div>
            </Popover>
        );

        const showImageCover = (contentType, isPlaying) => {
            // 3：问答   5:文章  6 视频 7 直播
            // const {isgratis, amout, ispay}=this.state;

            if (contentType === 7) {
                return <img src={coverPic} alt="" className={'coverPic'} onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = require("../../images/cover.png")
                }}/>
            }

            if (contentType === 3) {
                /* if (coverPic === '' || coverPic === config.publicStaticUrl + 'undefined') {
                     return <div className={'setImage isAudios'}
                                 onClick={this.audiosAlertToPay('modal1', true, audiosFree, ispay, isgratis)}>
                         {this.isRoundDisk(isPlaying)}
                     </div>
                 } else {
                     return <div onClick={this.audiosAlertToPay('modal1', true, audiosFree, ispay, isgratis)}>
                         <img src={coverPic} alt="" className={'coverPic'}/>
                     </div>
                 }*/
                return <div className={'setImage isAudios'}
                            onClick={this.audiosAlertToPay('modal1', true, audiosFree, ispay, isgratis)}>
                    {this.isRoundDisk(isPlaying)}
                </div>
            }
            if (contentType === 5) {
                if (image1 === null || image1 === '' || image1 === "data:image/jpeg;base64," || image1 === undefined) {
                    return <img className={'setImage'} src={require("../../images/cbcs_companion.png")} alt=""/>;
                } else {
                    return <img className={'setImage'} src={config.publicStaticUrl + image1} alt="" onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require("../../images/cbcs_companion.png")
                    }}/>;
                }
            }
            if (contentType === 6) {
                return this.showAlertWhenDidNotPay(isgratis, amout, ispay, image, audios)
            }


        };


        /**************************************************************************/

        return (

            <div className={'setDetailedInformation'}>
                {/* <HeaderNavBar title={pageTitle}/> */}
                <DownloadTips whereIs={'detailModule'} contentType={contentType} id={this.props.match.params.id} type={this.state.isShare}/>

                <PullToRefresh
                    damping={50}
                    ref={el => this.ptr = el}
                    style={{
                        height: this.state.height - 45,
                        overflow: 'auto',
                    }}
                    distanceToRefresh={30}
                    indicator={this.state.down ? {} : {deactivate: '上拉可以刷新'}}
                    direction={this.state.down ? 'down' : 'up'}
                    refreshing={this.state.refreshing}
                    onRefresh={() => {
                        this.setState({refreshing: true});
                        setTimeout(() => {
                            this.getDetails(contentType);
                            this.setState({refreshing: false});
                        }, 1000);
                    }}
                >
                    <div>

                        <WingBlank>
                            <Modal
                                visible={this.state.modal1}
                                transparent
                                maskClosable={true}
                                onClose={this.onClose('modal1')}
                                // title="Title"
                                /*   footer={[{
                                       text: 'Ok', onPress: () => {
                                           console.log('ok');
                                           this.onClose('modal1')();
                                       }
                                   }]}*/
                                wrapProps={{onTouchStart: this.onWrapTouchStart}}
                                afterClose={() => {
                                    // alert('afterClose');
                                    this.getDetails(contentType);
                                }}
                            >
                                <div className={'modalContent'}>
                                    <img src={require('../../images/docorate_img.png')} alt=""/>
                                    <div className={'modalPrice'}>仅需￥{amout}，点击下方立即购买</div>
                                    <Button className={"buyNow"} onClick={() => {
                                        this.BuyItNow(this.state.id, contentType, isEnroll, isgratis)
                                    }}>立即购买</Button>
                                </div>
                            </Modal>
                        </WingBlank>

                        <div className={'coverImageArea'}>
                            {_newFocusStatus(status, startingTime)}
                            {_showPeopleNumber(contentType, status, enrollNum, onlineNum, viewCount, audiosIsClick, startingTime)}
                            {this.showArea(contentType, duration, isPlaying, audiosIsClick)}
                            {_isEliteOrRecommendation(carefullyChosen, recommendStatus, audiosIsClick)}

                            {showImageCover(contentType, isPlaying)}
                        </div>

                        <div className={'titleContent'}>
                            <div className={'contentTitle'}>{title}</div>
                            <div className={'secondContentTitle'}>
                                {_changeTimeFormat(startingTime || createDate)}
                                {this._showLivingStatus(contentType, liveStatus, isgratis, fee, isWatch, status, amout)}
                            </div>
                            {this.showCountWithoutLiving(contentType, readingCount, dzNum, collectNum)}
                        </div>

                        <div className={'secondPart'}>
                            <div className={'leftArea'}>
                                <img className={'headIcon'} src={headicon} alt="" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = require("../../images/doctor_defu.png")
                                }}/>
                                <div className={'headIconTitle setSingleRow'}>{doctorTitle}</div>
                            </div>

                            <div className={'rightArea'}>
                                <div className={'docName setSingleRow'}>{name} <span>{attentionNum}人关注</span></div>
                                <div className={'location'}>
                                    {showHospitalDetail}
                                    {showDepartmentDetail}
                                </div>
                            </div>
                            <div className={'focusArea'}>
                                <div >
                                    {_setAttention(attentionIds)}
                                </div>
                            </div>
                        </div>

                        <div className={'thirdPart'}>
                            <div className={'classResume'}>{this.showResume(contentType)}</div>
                        </div>

                        <div className={'overFlowInner'}>
                            <div className={'thirdPartContent'}>
                                {this.getContentInner(contentType, innerContent, isSpread)}
                            </div>

                            <div
                                className={`resumeDrawBack ${this.state.contentType === 7 ? "resumeDrawBackHidden" : ""}`}
                                onClick={() => this.showAll(contentType, isgratis, ispay)}>
                                {this.showCollepsTitle(contentType)}
                            </div>
                        </div>

                        <div className={`${this.state.contentType !== 7 ? "forthPart fixedForthPartBottom" : ""}`}>
                            {contentType !== 7 ? <div className={'comments'}>评论({replyNum})</div> : ''}
                        </div>

                        <div className={`${this.state.beComments === 'yes' ? "forthPart fixedForthPartTop" : ""}`}>

                            {this.state.beComments && this.state.beComments === 'yes' ? this.setComments(commentsList) : ''}
                        </div>
                        
                        {
                            replyNum === 0 ? <div className="no_pl">
                                    暂时没有评论，来做第一只吃螃蟹的人吧！
                            </div> : ''
                        }
                        

                        <div className="tips">
                            <div className="tips_btn" onClick={ this.fuckClick }>下载乳腺好大夫 APP</div>
                            <p className="tips_title">扫码关注微信公众号</p>
                            <img src={QRcode} alt="" />
                            <p className="tips_txt">乳腺好大夫 & 最懂你的乳腺健康管理专家</p>
                        </div>


                    </div>
                </PullToRefresh>

            </div>
        );


    }
}

DetailedInformation.propTypes = {};

export default DetailedInformation;