import React, {Component} from 'react';
import '../less/my.less';
import {Modal, PullToRefresh, Tag, Toast} from "antd-mobile";
import URLconfig from "../config/urlConfig";
import {withRouter} from "react-router-dom";
import axios from "axios";
import config from "../config/wxconfig";

const alert = Modal.alert;

class My extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tags: [],
            myOrders: [
                {title: '全 部', key: 't1', type: 0},
                {
                    title: '待付款',
                    key: 't2',
                    type: 2,
                    img: require('../images/mine_wait_pm_icon.png'),
                    location: 'myOrders'
                },
                {
                    title: '已付款',
                    key: 't3',
                    type: 1,
                    img: require('../images/mine_payment_icon.png'),
                    location: 'myOrders'
                },
                {
                    title: '已退款',
                    key: 't4',
                    type: 5,
                    img: require('../images/mine_refund_icon.png'),
                    location: 'myOrders'
                },
                {
                    title: '已取消',
                    key: 't5',
                    type: 3,
                    img: require('../images/ming_obolish_icon.png'),
                    location: 'myOrders'
                }],
            myTools: [
                {key: '问诊记录', val: require('../images/mytool_inquriy_icon.png'), location: 'myRecord'},
                {key: '电子处方', val: require('../images/mytool_elecrecipe_icon.png')},
                {key: '患者管理', val: require('../images/mytool_patient_mana_i.png'), location: 'sufferManage'},
                {key: '收货地址', val: require('../images/mytool_address_icon.png'), location: 'addrConfirm'},
                {key: '分享应用', val: require('../images/mytool_share_icon.png')},
                {key: '意见反馈', val: require('../images/mytool_feedback_icon.png')}
            ],
            nickname:'',
            headicon:'',
            aiweCode:0,
            isSignIn:1,
            enrollNum:0,
            collectionNum:0,
            watchNum:0,
            attentionNum:0,
            refreshing: false,
            down: true,
            height: document.documentElement.clientHeight,
        }
    }

    componentDidMount() {
        this.getUserInfo();

    }

    //写入报名，收藏，历史，关注数组
    pushInTag(enrollNum,collectionNum,watchNum,attentionNum){
        const {tags}=this.state;
        tags.push({name: '报名', value: enrollNum,location:'entryRecord'}, {name: '收藏', value: collectionNum,location:'myCollection'}, {name: '历史', value: watchNum,location:'myHistoryTrace'}, {name: '关注', value: attentionNum,location:'myFocus'})
        this.setState({
            tags:tags,
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
        Toast.fail(message, 2);
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };


    //获取用户信息
    getUserInfo=()=>{
        this.setState({
            tags:[],
        })
        let loginToken=localStorage.getItem('loginToken');
        axios({
            url: URLconfig.publicUrl + '/app/getUserByLoginToken.do',
            method: 'post',
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
                "loginToken": loginToken,
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
              /*  enrollNum 报名数
                collectionNum 收藏数
                watchNum历史数
                attentionNum关注数*/
                let data=response.data.data;
                this.setState({
                    nickname:data.nickname,
                    headicon:data.headicon,
                    aiweCode:data.aiweCode,
                    isSignIn:data.isSignIn,
                    enrollNum:data.enrollNum,
                    collectionNum:data.collectionNum,
                    watchNum:data.watchNum,
                    attentionNum:data.attentionNum,
                },()=>{
                    this.pushInTag(data.enrollNum,data.collectionNum,data.watchNum,data.attentionNum)
                })
            }
            else{
                // alert(response.data.message);
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    //显示标签
    showTags(tags) {
        return tags.length > 0 && tags.map((item, index) => {
            return <div className={'apart'} key={index} onClick={()=>{this.linkWhere(item.location)}}>
                <div className={'num'}>{item.value}</div>
                <div className={'name'}>{item.name}</div>
            </div>

        })
    }

    //跳转
    linkWhere = (location,key,type) => {
        if (location === '' || location === undefined || location === null) {
            Toast.info(`请登录app查看此功能`, 2, null, true);
        } else {
            if (location === 'myRecord') {
                this.props.history.push(`/myRecord`);
            } else if (location === 'sufferManage') {
                window.location.href = `${URLconfig.toWxHis}/old&new/sufferList.html?where=my`;
            } else if (location === 'addrConfirm') {
                window.location.href = `${URLconfig.toWxHis}/wxapp/address.html`;
            }
            else if(location==='myOrders'){
                this.props.history.push(`/myOrders/${key}/${type}`);
            }
            else if(location==='entryRecord'){
                this.props.history.push(`/entryRecord/`);
            }
            else if(location==='myCollection'){
                this.props.history.push(`/myCollection/`);
            }
            else if(location==='myHistoryTrace'){
                this.props.history.push(`/myHistoryTrace/`);
            }
            else if(location==='myFocus'){
                this.props.history.push(`/myFocus/`);
            }

        }
    };

    //我的工具
    myTools(tools) {
        return tools.length && tools.map((item, index) => {
            return (<div className={'one'} key={index} onClick={() => {
                this.linkWhere(item.location)
            }}>
                <img src={item.val} alt=""/>
                <div className={'name'}>{item.key}</div>
            </div>)
        })
    }

    //我的订单
    mapOrders = (myOrders) => {
        return myOrders.length && myOrders.map((item, index) => {
            return item.img && <div className={'one'} key={index} onClick={() => {
                this.linkWhere(item.location,item.key,item.type)
            }}>
                <img src={item.img} alt=""/>
                <div className={'name'}>{item.title}</div>
            </div>
        })
    }

    //签到
    signIn(){
        // status 1没有簽到 2已簽到
        axios({
            url: URLconfig.publicUrl + '/app/userSignin.do',
            method: 'post',

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
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            if (response.status === 200 && response.data.status === 1) {
                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
               Toast.success('签到成功',1,()=>{
                   this.getUserInfo();
               })
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }

    render() {
        const {tags, myTools, myOrders,nickname,headicon,aiweCode,isSignIn,enrollNum,collectionNum,watchNum,attentionNum} = this.state;

        return (
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
                        this.getUserInfo();
                        this.setState({refreshing: false});
                    }, 1000);
                }}
            >
            <div className={'my'}>
                <div className={'banner'}>
                    <img className={'bg'} src={require('../images/mine_bg.png')} alt=""/>
                    <img  className={'setNav'} src={require('../images/mine_set_icon.png')} alt="" onClick={()=>{
                        this.props.history.push({pathname: `/mySets/`,});
                    }}/>
                    <div className={'userInfo'}>
                        <img className={'head'} src={headicon&&headicon.indexOf('http') !== -1 ?headicon : config.publicStaticUrl+headicon} alt="" onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = require("../images/cover.png")
                        }}/>
                        <div className={'others'}>
                            <div className={'one'}>
                                <div className={'name'}>{nickname}</div>
                                <div className={'coin'}>爱币余额 {aiweCode}</div>
                            </div>
                            <div className={'qiandao'} onClick={()=>{this.signIn()}} >
                                <img src={require('../images/qd.png')} alt="" />
                                {isSignIn===1?<div className={'font'}>签到+5</div>:<div className={'font'}>已签到</div>}
                            </div>
                        </div>
                    </div>
                    <div className={'part'}>
                        {this.showTags(tags)}
                    </div>
                </div>
                <div className={'item11 special'}>
                    <div className={'title11'}>
                        我的订单
                    </div>
                    <div className={'inner11'}>
                        {this.mapOrders(myOrders)}
                    </div>
                </div>
                <div className={'item11 normal'}>
                    <div className={'title11'}>
                        我的工具
                    </div>
                    <div className={'inner11'}>
                        {this.myTools(myTools)}
                    </div>
                </div>
            </div>
            </PullToRefresh>
        );
    }
}

My.propTypes = {};

export default withRouter(My);
