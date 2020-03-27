import React, {Component} from 'react';
import '../less/orderDetail.less'
import HeaderNavBar from "./headerNavBar";
import ReactDOM from "react-dom";
import config from "../config/wxconfig";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import moment from "moment";
import {Modal, Toast} from 'antd-mobile';
import utils from "../utils/utils";
import DocumentTitle from "react-document-title";
const alert = Modal.alert;

class OrderDetail extends React.Component {
    constructor(props) {
        super(props);
        const {orderId,detailFrom} = this.props.match.params;
        this.state = {
            detailFrom:parseInt(detailFrom),
            orderId: parseInt(orderId),
            orderInfo: '',
            isRefund: false,
            abortOrder: false,
            trueOrderId:'',
            loading:true,
        };
    }

    componentDidMount() {
        const {orderId,detailFrom} = this.state;
        this.getOrderDetail(orderId,detailFrom);
        // this.mounted();
        setTimeout(() => {
            this.setState({
                loading: false,
            });
        }, 1000);

    }

    mounted() {
        // 要检索的字符串值没有出现，则该方法返回 -1。
        if (window.location.href.indexOf("?#") < 0) {
            window.location.href = window.location.href.replace("#", "?#");
        }
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };

    //异常提示
    failToast(message) {
        Toast.fail(message, 2000);
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


    //通过orderId获取订单详情
    //detailFrom:1从订单进来；2从问诊单进来
    getOrderDetail(orderId,detailFrom) {
        const fromDZ = '/order/appOrderDetail.do';
        const formWZD = 'order/appOrderQuestionnaireDetail.do';
        let targetAddr = '',params = '';
        if (detailFrom === 1) {
            targetAddr = fromDZ;
            params = {
                "id": orderId,
            }
        } else {
            targetAddr = formWZD;
            params = {
                "productId": orderId,
            }
        }

        axios({
            url: URLconfig.publicUrl + targetAddr,
            method: 'post',
            data:params,
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
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    orderInfo: response.data.data
                })
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //付款状态
    setPayStatus(payStatus) {
        // private Integer payStatus;// 订单支付状态： 1-支付成功 ；2 待支付 3：已取消 4:待退款 5:已退款
        if (payStatus === 1) {
            return <span className={'payed'}>已付款</span>
        }
        if (payStatus === 2) {
            return <span className={'notPay'}>待付款</span>
        }
        if (payStatus === 5 ) {
            return <span className={'cancel'}>已退款</span>
        }
        if(payStatus === 3){
            return <span className={'cancle'}>已取消</span>
        }
    }

    //付款方式
    getPayChannel(payChannel) {
        // private Integer payChannel;// 1 支付宝 2 微信
        if (payChannel === 1) {
            return '支付宝';
        } else {
            return '微信';
        }
    }

    //根据状态显示不同的按钮以及对应的方法
    showBtns(payStatus,orderType,educationStatus) {
        const {orderId,orderInfo,detailFrom} = this.state;
        // orderType订单类型：1：商城 2：互助 3：问答 4：问诊 5文章 6视频 7直播 8追问 100挂号
        // private Integer payStatus;// 订单支付状态： 1-支付成功 ；2 待支付 3：已取消 4:待退款 5:已退款
        if (payStatus === 1&&orderType===4&& educationStatus===20) {
            //只能type是问诊，且问诊未开诊
            return <div className={'btns'} onClick={() => this.refund(orderId,detailFrom)}>申请退款</div>
        }
        if (payStatus === 2) {
            return (<div>
                <div className={'btns orange'} onClick={()=>this.payNow(orderId,detailFrom)}>立即支付</div>
                {orderType===4?<div className={'btns blue'} onClick={()=>this.completeInfo(orderInfo.doctorId)}>完善信息</div>:''}
                <div className={'btns'} onClick={() => this.abortOrder(orderId,detailFrom)}>取消订单</div>
            </div>)
        }
        if (payStatus === 3) {
            return <div className={'btns'} onClick={()=>{this.continueToBuy(orderInfo.doctorId,orderInfo.orderType,orderInfo.productId)}}>继续购买</div>
        }
        if (payStatus === 5) {
            return <div className={'btns'} onClick={()=>{this.reOrder(orderInfo.doctorId,orderInfo.orderType,orderInfo.productId)}}>重新下单</div>
        }
    }

    //完善信息
    completeInfo(doctorId){
        this.props.history.push({pathname: `/inquiry/${doctorId}/`,});
    }

    //重新下单
    reOrder(doctorId,orderType,productId){
        let trueType='';
        // orderType订单类型：1：商城 2：互助 3：问答 4：问诊 5文章 6视频 7直播 8追问 100挂号
        if(orderType===4){
            //图文问诊时到医生主页
            this.props.history.push({pathname: `/doctorDetailedInformation/${doctorId}/0/0`,});
        }
        if(orderType===3||orderType===5||orderType===7||orderType===6){
            //这几个类型到对应的详情
            trueType=this.changeModuleTitleType(orderType);
            this.props.history.push({pathname: `/detailedInformation/${productId}/${trueType}/0/0`,});

        }
    }


    //立即购买
     payNow(orderId,detailFrom){
        this.toGetWXOrderInfo(orderId, localStorage.getItem('openid'),detailFrom);
    }


    async toGetWXOrderInfo(orderId, openid = localStorage.getItem('openid'),detailFrom) {
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
                'loginToken': localStorage.getItem('loginToken'),
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
                    this.callpay(appId, timestamp, noncestr, packageValue, paySign,orderId,detailFrom)
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    callpay(appId, timestamp, noncestr, packageValue, paySign,orderId,detailFrom) {
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

                    that.getOrderDetail(orderId,detailFrom);

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



    //改变页面的title&统一接口参数
    changeModuleTitleType(type) {
        let r='';
        //queryContentType  1 全部 2 直播 3 视频 4 图文 5 语音 6 精选好文 7 热门排行
        // 订单类型3：问答   5:文章  6 视频 7 直播
        if (type === 7) {
            r=2;
        }
        else if (type === 6) {
            r=3;
        }
        else if (type === 5) {
            r=4;
        }
        else if (type === 3) {
            r=5;
        }
        return r;
    }


    //继续购买
    continueToBuy(doctorId,orderType,productId){
        let trueType='';
        // orderType订单类型：1：商城 2：互助 3：问答 4：问诊 5文章 6视频 7直播 8追问 100挂号
        if(orderType===4){
            //图文问诊时到医生主页
            this.props.history.push({pathname: `/doctorDetailedInformation/${doctorId}/0/0`,});
        }
        if(orderType===3||orderType===5||orderType===7||orderType===6){
            //这几个类型到对应的详情
            trueType=this.changeModuleTitleType(orderType);
            this.props.history.push({pathname: `/detailedInformation/${productId}/${trueType}/0/0`,});

        }

    }

    //申请退款
    refund(orderId,detailFrom) {
        alert('订单详情', '您要申请该订单退款吗？', [
            {
                text: '是的',
                onPress: () =>
                    axios({
                        url: URLconfig.publicUrl + '/wx/orderRefund.do',
                        method: 'post',
                        data: {
                            "orderId": orderId,
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
                            'loginToken': localStorage.getItem('loginToken'),
                        }
                    }).then((response) => {
                        this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                        if (response.status === 200 && response.data.status === 1) {
                            this.setState({
                                isRefund: true
                            });
                            Toast.info('退款成功', 2, this.getOrderDetail(orderId,detailFrom));
                        }
                    })
                        .catch(function (error) {
                            alert(JSON.stringify(error));
                        })
            },
            {text: '让我想想', onPress: () => console.log('cancel')},
        ])
    }

    //取消订单
    abortOrder(orderId,detailFrom) {
        alert('订单详情', '您真的要取消该订单吗？', [
            {
                text: '是的',
                onPress: () =>
                    axios({
                        url: URLconfig.publicUrl + '/business/orderCancle.do',
                        method: 'post',
                        data: {
                            "orderId": orderId,
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
                            'loginToken': localStorage.getItem('loginToken'),
                        }
                    }).then((response) => {
                        this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                        if (response.status === 200 && response.data.status === 1) {
                            this.setState({
                                abortOrder: true
                            });
                            Toast.info('订单成功取消', 2, this.getOrderDetail(orderId,detailFrom));
                        }
                    })
                        .catch(function (error) {
                            alert(JSON.stringify(error));
                        })
            },
            {text: '让我想想', onPress: () => console.log('cancel')},
        ])
    }

    //title二级灰色显示
    showSecond(orderType,orderInfo){
        if(orderType===4){
            return `患者（${orderInfo.patName||''} ${orderInfo.patSex||''}，${orderInfo.patAge||''}岁）`;
        }
        else{
            return `${orderInfo.hospital}`
        }
    }

    //到对应详情
    toDetailInfo(orderInfo){
        if(orderInfo.orderType===4){
            //图文问诊时到医生主页
            this.props.history.push({pathname: `/doctorDetailedInformation/${orderInfo.doctorId}/0/0`,});
        }
        if(orderInfo.orderType===3||orderInfo.orderType===5||orderInfo.orderType===7||orderInfo.orderType===6){
            //这几个类型到对应的详情
            this.props.history.push({pathname: `/detailedInformation/${orderInfo.productId}/${this.changeModuleTitleType(orderInfo.orderType)}/0/0`,});

        }

    }

    render() {
        const {orderId, orderInfo} = this.state;
        if (this.state.loading === true) {
            return (

                <DocumentTitle title='订单详情'>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                    }}>
                        <img src={require("../images/loading.gif")} alt=""/>
                    </div>
                </DocumentTitle>
            )
        }

        return (
            {orderInfo} && <div className={'orderDetail'}>
                <HeaderNavBar title={'订单详情'} isLight={'navBarHeaderLight'}/>
                <div className={'one'}>
                    <div className={'first'}>
                        <div className={'icon'}>
                            <img src={orderInfo.orderPic&&orderInfo.orderPic.indexOf('http') !== -1 ?orderInfo.orderPic : config.publicStaticUrl+orderInfo.orderPic} alt="" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>

                        </div>
                        <div className={'others'} onClick={()=>{this.toDetailInfo(orderInfo)}}>
                            <div className={'left'}>
                                <div className={'title'}>【{utils.getOrderType(orderInfo.orderType)}】{orderInfo.orderName}</div>
                                <div className={'sufferInfo'}>{this.showSecond(orderInfo.orderType,orderInfo)}</div>
                                <div className={'price'}>￥{orderInfo.orderSum}</div>
                            </div>
                            <div className={'right'}>
                                <span style={{display:'block'}}>{this.setPayStatus(orderInfo.payStatus)}</span>
                                <span className={'number'}>x 1</span>
                            </div>
                        </div>
                    </div>
                    <div className={'second'}>
                        {this.showBtns(orderInfo.payStatus,orderInfo.orderType,orderInfo.educationStatus)}
                        {
                            orderInfo.orderType === 4 && orderInfo.payStatus === 1 ?
                            <div className="btns blue" onClick={
                                () => this.props.history.push(`/inquiry/wz/${orderInfo.patId}/${orderInfo.doctorId}/${orderInfo.productId}/${orderInfo.educationStatus}`)
                            }>继续问诊</div> : ''
                        }

                    </div>
                </div>
                <div className={'two'}>
                    <div className={'line slash'}>
                        <div className={'name totalTitle'}>合计</div>
                        <div className={'content price'}>￥{orderInfo.orderSum}</div>
                    </div>
                    <div className={'line'}>
                        <div className={'name'}>订单编号</div>
                        <div className={'content'}>{orderInfo.orderNo}</div>
                    </div>
                    <div className={'line'}>
                        <div className={'name'}>下单时间</div>
                        <div className={'content'}>{moment(orderInfo.createDate).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                    {(orderInfo.payStatus !== 2 && orderInfo.payStatus !== 3) && <div className={'line'}>
                        <div className={'name'}>付款方式</div>
                        <div className={'content'}>{this.getPayChannel(orderInfo.payChannel)}</div>
                    </div>}
                    {(orderInfo.payStatus !== 2 && orderInfo.payStatus !== 3) && <div className={'line'}>
                        <div className={'name'}>付款时间</div>
                        <div className={'content'}> {moment(orderInfo.payDate).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                    }
                    {(orderInfo.payStatus === 5) && <div className={'line'}>
                        <div className={'name'}>退款时间</div>
                        <div
                            className={'content'}> {orderInfo.refundDate && moment(orderInfo.refundDate).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>}
                    {(orderInfo.payStatus === 3) && <div className={'line'}>
                        <div className={'name'}>取消时间</div>
                        <div
                            className={'content'}> {orderInfo.cancelDate  && moment(orderInfo.cancelDate ).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>}
                </div>


            </div>
        );
    }
}

OrderDetail.propTypes = {};

export default OrderDetail;
