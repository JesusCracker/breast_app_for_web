import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {
    Icon,
    InputItem,
    NavBar,
    PullToRefresh,
    ListView,
    Tabs,
    WhiteSpace,
    Toast,
    SwipeAction,
    List,
    Button, Modal
} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import {Link} from "react-router-dom";
import '../less/polularScience.less'
import '../less/entryRecord.less';
import '../less/myRecord.less';
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";

import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";

const alert = Modal.alert;

class myRecord extends Component {
    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.pageNo = 0 //定义分页信息
        // this.keyWords='';
        this.state = {
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            useBodyScroll: false,
            hasMore: true,
            keyWords: "",
            isContain: false,
            type: 0,
            secondType: 1,
            hasCollected: false,
            lastDate: '暂无问诊记录',

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
        this.getLastDate();
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;

        this.rData = (await this.genData()).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });
        config.share2Friend('others', '', '', '乳腺好大夫', '乳腺好大夫');
    }


    //获取最后一次的问诊时间
    getLastDate() {
        axios({
            url: URLconfig.publicUrl + '/appinquiry/lastQuestionnaireDate.do',
            method: 'post',

            transformRequest: [function (data) {
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                loginToken: localStorage.getItem('loginToken'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);

            if (response.status === 200 && response.data.status === 1) {
                response.data.data&&this.setState({
                    lastDate: moment(response.data.data.createDate).format("YYYY-MM-DD")
                })


            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    async changeContent(content) {
        this.setState({type: content});
        const {secondType} = this.state;
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, content, secondType)).data;
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

    genData = (isSearch, type = 0) => {  //请求数据的方法
        //第一个type是第一层navbar的type  第二个type是第二层navbar的type；
        // console.dir(this.state.type);

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        return fetch(config.publicUrl + `/appinquiry/userQuestionnaire.do?page=${this.pageNo}&limit=5&status=${type}`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'loginToken': localStorage.getItem('loginToken'),
                },

            })
            .then(response => response.json())
            .then((result) => {
                this.goSignWhenMissLoginToken(result.status, result.message);
                // console.dir(result);
                if (result.status === 1) {
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
                    alert(result.message);
                    return false;
                }

            })
            .catch(function (error) {
                console.log('request failed', error)
            })
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
        this.rData = [...((await this.genData(true, type)).data)];  //每次下拉之后将新数据装填过来
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
        this.rData = [...this.rData, ...((await this.genData('', type)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

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
        this.props.history.push({pathname: `/loginIn`,});
    };

    //显示问诊状态
    showStatus(status) {
        // 问诊状态   0 全部 20：待咨询 30：咨询中  40 已结束 41:已关闭  11 已拒绝
        if (status) {
            if (status === 20) {
                return <div className={'waiting'}>待咨询</div>
            } else if (status === 30) {
                return <div className={'processing'}>咨询中</div>
            } else if (status === 40) {
                return <div className={'done'}>已结束</div>
            } else if (status === 11) {
                return <div className={'done'}>已拒绝</div>
            } else if (status === 41) {
                return <div className={'done'}>已关闭</div>
            }
        }
    }


    render() {
        const {type, lastDate} = this.state;


        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: 'rgb(238, 242, 249)',
                    height: 10,
                    /*   borderTop: '1px solid #ECECED',
                       borderBottom: '1px solid #ECECED',*/
                }}
            />
        );


        const isFocusList = (rowData, sectionID, rowID) => {

            return (
                <div key={rowID} style={{
                    padding: '20px 16px', borderBottom: '1px solid #eee', background: '#ffffff',
                    boxShadow: '0px 7px 12px 0px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    width: "95%",
                    marginLeft: "2.5%",
                    height: 'auto',
                }}>
                    <div className={'line'}>
                        <div className={'left'}>
                            <img
                                src={rowData.docHeadicon && rowData.docHeadicon.indexOf('http') !== -1 ? rowData.docHeadicon : config.publicStaticUrl + rowData.docHeadicon}
                                alt="" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
                        </div>
                        <div className={'right'}>
                            <div className={'first'}>
                                <div className={'docName'}>
                                    {rowData.docName}
                                </div>
                                <div className={'type'}>
                                    图文问诊
                                </div>
                                <div className={'date'}>
                                    {moment(rowData.createDate).format("YYYY-MM-DD")}
                                </div>
                            </div>
                            <div className={'second'}>
                                <div className={'hospital'}>
                                    {rowData.hospital}
                                </div>
                                <div className={'department'}>
                                    {rowData.doctorDepartment}
                                </div>
                            </div>
                            <div className={'third'}>
                                <div className={'sufferInfo'}>
                                    <p>患者:{rowData.patName}</p>
                                    <p>{rowData.patSex}</p>
                                    <p>{rowData.patAge}岁</p>
                                </div>
                                {this.showStatus(rowData.status)}
                            </div>
                        </div>
                    </div>
                </div>
            )
        };


        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            return (
                <Link to={{
                    pathname: `/inquiry/wz/${rowData.patientId}/${rowData.doctorId}/${rowData.id}/${rowData.status}`
                }}>
                    <div style={{backgroundColor: 'rgb(238, 242, 249)'}}>
                        {isFocusList(rowData, sectionID, rowID)}
                    </div>
                </Link>
            );
        };

        function renderTabBar(props) {
            return (<Sticky>
                {({style}) => <div style={{...style, zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
            </Sticky>);
        }


        // 0全部 11：拒绝 （用户拒绝 + 医生拒绝 ）  20：已支付（未开始问诊） 30：问诊中 40：问诊结束  41:问诊关闭
        const tabs = [
            {title: '全部', key: 't1', type: 0},
            {title: '待咨询', key: 't2', type: 20},
            {title: '咨询中', key: 't3', type: 30},
            {title: '已结束', key: 't4', type: 40},
            {title: '已关闭', key: 't5', type: 41},
            {title: '已拒绝', key: 't6', type: 11},
        ];


        return (
            <ErrorBoundary>
                {/*<DocumentTitle title='科普列表'>*/}
                <div className='livelisttitlebox entryRecord myRecord' style={{background: 'rgba(238,242,249,1)'}}>
                    <HeaderNavBar title={'我的问诊记录'} isLight={'navBarHeaderLight'} noIcon={true}/>
                    {type === 0 ? <div className={'totalCourseNum'}>
                        上次咨询时间：{lastDate}
                    </div> : ''}
                    <div className={'tabBar'}>
                        <WhiteSpace/>
                        <StickyContainer>
                            <Tabs
                                tabBarTextStyle={{
                                    fontSize: '15.5px',
                                    fontFamily: 'PingFangSC-Semibold,PingFang SC',
                                    color: 'rgba(103,147,243,1)',
                                }}
                                tabBarBackgroundColor={'#FFFFFF'}
                                tabs={tabs}
                                activeTab={this.state.index}
                                initialPage={'t1'}
                                renderTabBar={renderTabBar}
                                onTabClick={(activeTab) => this.changeContent(activeTab.type)}
                                tabBarInactiveTextColor={'#333333'}
                                tabBarActiveTextColor={'#6793F3'}
                                tabBarActiveBackgroundColor={'red'}
                                tabBarUnderlineStyle={{
                                    border: '2px #6793F3 solid',
                                    width: '5%',
                                    marginLeft: '7.5%'
                                }}
                            >

                            </Tabs>
                        </StickyContainer>
                        <WhiteSpace/>
                    </div>


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

                {/*</DocumentTitle>*/}
            </ErrorBoundary>
        );
    }
}

export default myRecord
