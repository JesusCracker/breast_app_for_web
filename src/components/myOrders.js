import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import {Link} from "react-router-dom";
import '../less/polularScience.less'
import '../less/myOrders.less';
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import ToDiagnosisList from "./toDiagnosisList";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import HeaderNavBar from "./headerNavBar";
import utils from '../utils/utils'


class MyOrders extends Component {
    constructor(props) {
        super(props);
        const{menu,type}= this.props.match.params;
        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.pageNo = 0 //定义分页信息
        // this.keyWords='';
        this.state = {
            menu:menu||'t1',
            type:type||0,
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            useBodyScroll: false,
            hasMore: true,
            orderName: "",
            isContain: false,

            secondType: 1,
            hasCollected: false,

        };
    }

    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }


    async componentDidMount() {
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;

        this.rData = (await this.genData()).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });
        config.share2Friend('myOrdersModule', '', '', '我的订单', '欢迎来到乳腺好大夫');
    }

    async changeContent(content) {
        await this.setState({type: content.type});
        const {secondType} = this.state;
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true)).data;
        try {
            if (this.rData.length === 0) {
                this.setState({
                    isContain: false
                });
            }
        } catch (error) {
            alert(error);
            return false;
        }

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            refreshing: false,
            isLoading: false,
        });
    }


    async searchLiveList() {
        const {orderName} = this.state;
        const {type, secondType} = this.state
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true)).data;
        // console.dir(this.rData)
        if (this.rData.length === 0) {
            this.setState({
                isContain: false
            });
        }
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            refreshing: false,
            isLoading: false,
        });
    }


    onVirtualKeyboardConfirm = (e) => {
        const keycode = e.keyCode;
        //不想删代码
        if (keycode === 13 || !isNaN(keycode)) {
            e.preventDefault();
            this.searchLiveList();
            if (this.state.orderName === '') {
                Toast.info(`请输入查询的订单名称`, 2, null, true);
                return false;
            }

        }
    };

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


    genData = (isSearch) => {  //请求数据的方法
        const {orderName, type} = this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/order/appOrderList.do',
            method: 'post',
            data: {
                'page': this.pageNo,
                "limit": 5,
                'payStatus': type,
                'orderName': orderName,
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
            if (response.status === 200) {
                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                let result = response.data;
                if (result.status === 1) {
                    this.setState({
                        dataTotal: result.dataTotal,
                    });
                    if (result.dataTotal !== 0) {
                        this.setState({
                            hasMore: true
                        });
                        return result
                    } else {
                        this.setState({
                            hasMore: false
                        });
                        return result;
                    }
                } else {
                    // console.dir(result);
                    // alert(result.message);
                    return false;
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };


    onRefresh = async (event) => {
        const {type, secondType} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...((await this.genData(true)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

    onEndReached = async (event) => {
        const {type, secondType} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...this.rData, ...((await this.genData('')).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

    //判断payStatus状态
    setPayStatus(status) {
        // private Integer payStatus;// 订单支付状态： 1-支付成功 ；2 待支付 3：已取消 4:待退款 5:已退款
        if (status === 1) {
            return <span className={'payed'}>已付款</span>
        }
        if (status === 2) {
            return <span className={'notPayed'}>待付款</span>
        }
        if (status === 3) {
            return <span className={'cancel'}>已取消</span>
        }
        if (status === 5) {
            return <span className={'cancel'}>已退款</span>
        }
    }

    //订单详情
    toOrderDetail(orderId) {
        this.props.history.push({pathname: `/orderDetail/${orderId}/1`,});
    }

    render() {
        const {menu}=this.state;
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 10,
                }}
            />
        );

        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            //rivate Integer orderType;// 订单类型：1：商城 2：互助 3：问答 4：问诊 5文章 6视频 7直播 8追问 100挂号
            return (
                <div className={'oneOrder'}>
                    <div className={'firstLine'}>
                        <div className={'time'}>
                            {moment(rowData.createDate).format("YYYY-MM-DD HH:mm:ss")}
                        </div>
                        <div className={'payStatus'}>
                            {this.setPayStatus(rowData.payStatus)}
                        </div>
                    </div>
                    <div className={'secondLine'}>
                        <div className={'leftArea'}>
                            <img src={rowData.orderPic&&rowData.orderPic.indexOf('http') !== -1 ?rowData.orderPic : config.publicStaticUrl+rowData.orderPic} alt="" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
                        </div>
                        <div className={'rightArea'}>
                            <div className={'one'}>
                                <div
                                    className={'title'}>【{utils.getOrderType(rowData.orderType)}】{rowData.orderName}</div>
                                <div className={'sufferInfo'}>
                                    {rowData.orderType===4?<span>患者（{rowData.patName} {rowData.patSex}，{rowData.patAge}岁）</span>:rowData.hospital}
                                </div>
                            </div>
                            <div className={'number'}>
                                x{rowData.amount}
                            </div>
                        </div>
                    </div>
                    <div className={'thirdLine'}>
                        <div className={'price'}>
                            合计：￥{rowData.orderSum}
                            <span>（共{rowData.amount}件商品）</span>
                        </div>
                        <div className={'detailBtn'} onClick={() => this.toOrderDetail(rowData.id)}>
                            订单详情
                        </div>
                    </div>
                </div>

            );
        };

        function renderTabBar(props) {
            return (<Sticky>
                {({style}) => <div style={{...style, zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
            </Sticky>);
        }


        // 支付状态0：全部 1-支付成功 ；2 待支付 3：已取消  4:待退款 5:已退款
        const tabs = [
            {title: '全 部', key: 't1', type: 0},
            {title: '待付款', key: 't2', type: 2},
            {title: '已付款', key: 't3', type: 1},
            {title: '已退款', key: 't4', type: 5},
            {title: '已取消', key: 't5', type: 3},

        ];

        return (
            <ErrorBoundary>
                {/*<ToDiagnosisList/>*/}
                <DocumentTitle title='我的订单'>
                    <div className='livelisttitlebox myOrders' style={{background: 'rgba(238,242,249,1)'}}>
                        {/*<HeaderNavBar title={'我的订单'} isLight={'navBarHeaderLight'}/>*/}
                        <NavBar mode="dark" style={{
                            height: '110px',
                            color: 'rgba(255,255,255,1)',
                            fontSize: '18px',
                            backgroundColor: 'rgba(247,247,247,1)'
                        }}>

                            <div className={'setInputStyle'}>
                                {/*    <h2 style={{margin:'0',fontSize:'18px',fontWeight:'500',textAlign:'center',marginBottom:'15px'}}>专家直播列表</h2>*/}
                                <InputItem
                                    clear
                                    onChange={(value) => {
                                        this.setState({orderName: value})
                                    }}
                                    // onVirtualKeyboardConfirm={() => this.searchLiveList()}
                                    // onBlur={() => this.searchLiveList()}

                                    onKeyUp={this.onVirtualKeyboardConfirm}
                                    moneyKeyboardAlign="left"
                                    placeholder="请输入您要搜索的订单名称">

                                    <Icon style={{width: '22px', height: '22px'}} color={'rgba(165,165,165,1)'} key="2"
                                          type="search" size={"xxs"} onClick={() => this.searchLiveList()}/>
                                </InputItem>
                                <div className={"tabContainer"}>
                                    <WhiteSpace/>
                                    <StickyContainer>
                                        <Tabs
                                            tabBarBackgroundColor={'rgba(255,255,255,1)'}
                                            tabs={tabs}
                                            activeTab={this.state.index}
                                            initialPage={menu}
                                            renderTabBar={renderTabBar}
                                            onTabClick={(activeTab) => this.changeContent(activeTab)}
                                            tabBarInactiveTextColor={'rgba(157,157,157,1)'}
                                            tabBarActiveTextColor={'rgba(48,49,51,1)'}
                                            tabBarActiveBackgroundColor={'red'}
                                            tabBarUnderlineStyle={{
                                                border: '2px rgba(61,126,255,1) solid',
                                                width: '7%',
                                                marginLeft: '6.5%'
                                            }}
                                        >

                                        </Tabs>
                                    </StickyContainer>
                                    <WhiteSpace/>
                                </div>

                            </div>

                        </NavBar>

                        <ListView
                            renderSeparator={separator}
                            key={this.state.useBodyScroll ? '0' : '1'}
                            ref={el => this.lv = el}
                            dataSource={this.state.dataSource}
                            renderFooter={    //renderFooter就是下拉时候的loading效果，这里的内容随需求更改
                                () => (
                                    <div>
                                        <div>
                                            {this.state.hasMore ? '' :
                                                <div style={{dispaly: 'flex', textAlign: 'center'}}><img
                                                    src={noContentImg} style={{width: '100%'}}/><span>暂无内容</span>
                                                </div>}
                                        </div>
                                    </div>
                                )
                            }
                            renderRow={row}   //渲染上边写好的那个row
                            useBodyScroll={this.state.useBodyScroll}
                            style={this.state.useBodyScroll ? {} : {
                                height: this.state.height,
                                margin: '0px 0',
                            }}
                            pullToRefresh={<PullToRefresh
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh}
                            />}
                            onEndReachedThreshold={20}
                            onEndReached={this.onEndReached}
                            pageSize={5}    //每次下拉之后显示的数据条数
                        />
                    </div>

                </DocumentTitle>
            </ErrorBoundary>
        );
    }
}

export default MyOrders
