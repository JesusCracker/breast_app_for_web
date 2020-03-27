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
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";

import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";
const alert = Modal.alert;

class entryRecord extends Component {
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
            cancleStatus:false,
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
        config.share2Friend('others', '', '', '乳腺好大夫', '乳腺好大夫');
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

        return fetch(config.publicUrl + `app/liveEnrollList.do?page=${this.pageNo}&limit=5&status=${type}`,
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
                /*
                                if(result.message==='登录后查看'){
                                    alert(result.message);

                                }*/


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
        Toast.fail(message, 2);
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };


    //等待删除
    waitingAxiosUpdate = (cancleStatus, type = 'notExist', message = 'loading...') => {
        if (cancleStatus === true && type === 'exist') {
            Toast.loading(message, 2);
        }
        if (cancleStatus === false && type === 'noExist') {
            Toast.success(message, 2);
        }
    };

    //删除报名课程
    deleteCourse(id) {
        alert('报名课程', '您要删除该报名课程吗？', [
            {
                text: '是的',
                onPress: () =>
                {
                   this.setState({
                       cancleStatus:true,
                   },()=>{
                       if (id) {
                           this.waitingAxiosUpdate(this.state.cancleStatus,'exist','删除中，请等待...')
                           axios({
                               url: URLconfig.publicUrl + '/app/deleteEnrollLive.do',
                               method: 'post',
                               data: {
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
                                   'loginToken': localStorage.getItem('loginToken'),
                               }
                           }).then((response) => {
                               this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                               if (response.status === 200 && response.data.status === 1) {
                                   this.setState({
                                       cancleStatus:false,
                                   },()=>{
                                       this.waitingAxiosUpdate(this.state.cancleStatus,'noExist','删除成功')
                                       this.changeContent(this.state.type)
                                   })
                               }
                           })
                               .catch(function (error) {
                                   alert(JSON.stringify(error));
                               });
                       }
                   })
                }
            },
            {text: '让我想想', onPress: () => console.log('cancel')},
        ])

    }


    render() {
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: 'rgb(238, 242, 249)',
                    height: 8,
                 /*   borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',*/
                }}
            />
        );

        const showTagStatus = (status, queryContentType, startingTime) => {
            //只有queryContentType为直播的时候才有对应的状态显示
            // 直播状态 7：审核不通过8:关闭直播 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束',
// 其余状态：0-待审核；1-审核通过；2-审核关闭；3-审核不通过; 4:已删除',
            let timestamp = (new Date()).getTime();
            /*  if (startingTime && status === 20 && timestamp <= startingTime) {
                  return <div className={'ready'}>
                      {moment(startingTime).endOf('minute ').fromNow()+'开始，请耐心等待'}
                  </div>;
              }*/
            if (queryContentType === 2) {
                switch (status) {
                    case 20:
                        if (timestamp <= startingTime && moment(startingTime).endOf('minute ').fromNow().indexOf('分钟') !== -1) {
                            return <div className={'setImageTagsBGCWaiting'}>
                                <img src={require("../images/decatate_enroll_icon.png")} alt=""
                                     style={{width: '18px', paddingRight: '1px'}}/>
                                <span style={{
                                    fontSize: '14px',
                                    padding: '0 2px'
                                }}>{moment(startingTime).endOf('minute ').fromNow() + '开播'}</span>
                            </div>;
                        } else {
                            return <div className={'setImageTagsBGCWaiting'}>
                                <img src={require("../images/decatate_enroll_icon.png")} alt=""
                                     style={{width: '18px', paddingRight: '1px'}}/>
                                <span style={{fontSize: '14px', padding: '0 2px'}}>即将开播</span>
                            </div>;
                        }
                    case 30:
                        return <div className={'setImageTagsBGCLiving'}>
                            <img src={require("../images/palying.gif")} alt=""/>
                        </div>;
                    case 40:
                        return <div className={'setImageTagsBGCDone'}>
                            <span style={{fontSize: '14px', padding: '0 5px'}}>已结束</span>
                        </div>;
                    case 7:
                        return <div className={'setImageTagsBGCDone'}>
                            <span style={{fontSize: '14px', padding: '0 5px'}}>未通过</span>
                        </div>;
                    case 8:
                        return <div className={'setImageTagsBGCDone'}>
                            <span style={{fontSize: '14px', padding: '0 5px'}}>已关闭</span>
                        </div>;
                    case 9:
                        return <div className={'setImageTagsBGCDone'}>
                            <span style={{fontSize: '14px', padding: '0 5px'}}>未通过</span>
                        </div>;
                    default:
                        return [...status]
                }
            }
        };


        const changeQueryContentType = (rowData) => {

            // 查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音
            return <img className={'setImage'}
                        src={rowData.coverPic ? (config.publicStaticUrl + rowData.coverPic.replace(" ", "")) : require("../images/cover.png")}
                        alt=""
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = require("../images/cover.png")
                        }}/>
        };


        //展示报名人数or观看人数or阅读人数or收听人数，
        // 付费的 取enrollNum 不付费的取readingCount
        // rowData.queryContentType,rowData.readingCount,rowData.payCount,rowData.status,rowData.isgratis
        // queryContentType查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音
        const showHowManyPeople = (...args) => {
            let queryContentType = args[0];
            let readingCount = args[1];
            let enrollNum = args[2];
            let status = args[3];
            let isgratis = args[4];
            const _isPay = (isgratis, readingCount, enrollNum) => {

                if (queryContentType === 2 && status === 20) {
                    return enrollNum;
                } else {
                    return readingCount;
                }
            };
            if (status === 20) {
                return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人报名</div>;
            } else {
                return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人观看</div>;
            }

        };

        const isReportedOrDone = (status, startingTime, isdelete) => {
            // 是否删除：1未删除 2已删除
            /*等待开播,即将开播,已结束,已开播,已失效
            // * private int status;// 状态：7：审核不通过 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束*/

            if (isdelete === 1) {
                if (status === 20 && moment(startingTime).endOf('minute ').fromNow().indexOf('分钟') === -1) {
                    return <p className={'setDoneReportStyle'}>等待开播</p>
                } else if (status === 20 && moment(startingTime).endOf('minute ').fromNow().indexOf('分钟') !== -1) {
                    return <p className={'setDoneReportStyle'}>即将开播</p>
                } else if (status === 30) {
                    return <p className={'setDoneStyle'}>已开播</p>
                } else if (status === 40) {
                    return <p className={'setDoneStyle'}>已结束</p>
                }
            } else {
                return <p className={'setDoneStyle'}>已失效</p>
            }
        };

        const getTimeRemain = (status, startingTime) => {
            // private int status;// 状态：7：审核不通过 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束
            //startTime 时间戳
            // startingTime=1571217481854
            let timestamp = (new Date()).getTime();
            if (startingTime && status === 20 && timestamp <= startingTime && moment(startingTime).endOf('minute ').fromNow().indexOf('分钟') === -1) {
                return <div className={'ready'}>
                    {moment(startingTime).endOf('minute ').fromNow() + '开始，请耐心等待'}
                </div>;
            } else if (startingTime && status === 20 && timestamp <= startingTime && moment(startingTime).endOf('minute ').fromNow().indexOf('分钟') !== -1) {
                return <div className={'ready'}>
                    {moment(startingTime).endOf('minute ').fromNow() + '开始，请进入课堂'}
                </div>;
            } else if (startingTime && status === 30) {
                return <div className={'done'}>
                    {`已开始${Math.abs(moment(startingTime).diff(moment(), 'minute'))}分钟`}
                </div>
            } else if (startingTime && status === 40) {
                return <div className={'done'}>
                    已结束，可回看课程
                </div>
            }
        };


        const isFocusList = (rowData, sectionID, rowID) => {

            return (
                <div key={rowID} style={{padding: '0 16px', borderBottom: '1px solid #eee',background:'#ffffff',
                    boxShadow: '0px 7px 12px 0px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    width: "95%",
                    marginLeft: "2.5%",
                    height: 'auto',
                   }}>
                    <div style={{
                        padding: '15px 0', position: 'relative',
                        display: 'flex', background: '#FFFFFF'
                    }}>
                        <div className={'setListImageArea'}>

                            {showTagStatus(rowData.status, 2, rowData.startingTime)}
                            {changeQueryContentType(rowData)}
                            {showHowManyPeople(rowData.queryContentType, rowData.readingCount, rowData.enrollNum, rowData.status, rowData.isgratis)}
                        </div>

                        <div style={{flex: '1'}} className={'setListRightArea setsl'}>

                            <div><span className={'setListRightAreaTitle'}>{rowData.title}</span></div>

                            {/*{rowData.queryType === 1 ? '' : beforeRelease(rowData.queryType, rowData.queryContentType, rowData.createDate, rowData.duration)}*/}

                            <div>{getTimeRemain(rowData.status, rowData.startingTime)}</div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                lineHeight: '15px',
                                marginTop: '5px'
                            }}>
                                <div style={{display: 'flex', width: "100%", marginTop: '10px'}}>
                                    {isReportedOrDone(rowData.status, rowData.startingTime, rowData.isdelete)}
                                </div>
                                {rowData.isdelete===2?<div className={'supportArea'}>
                                    <Button disabled size={'small'} style={{background:'rgba(165,165,165,1)',
                                        borderRadius:'3px', opacity:'0.5',color:'#fff'}}>删除</Button>
                                </div>:''}

                            </div>
                        </div>
                        <div style={{borderBottom: '1px solid #eee', padding: '5px 0'}}>
                        </div>
                    </div>
                </div>
            )
        };


        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            return (
                <SwipeAction
                    style={{backgroundColor: 'gray'}}
                    autoClose
                    right={[
                        /*    {
                                text: '取消',
                                onPress: () => console.log('cancel'),
                                style: {backgroundColor: '#ddd', color: 'white'},
                            },*/
                        {
                            text: '删 除',
                            onPress: () => {
                                this.deleteCourse(rowData.id)
                            },
                            style: {
                                backgroundColor: 'rgba(255,116,73,1)', color: 'white', fontSize: '16px',
                                fontFamily: 'PingFangSC-Medium,PingFang SC', fontWeight: '500', width: '80px'
                            },
                        },
                    ]}
                    onOpen={() => console.log('global open')}
                    onClose={() => console.log('global close')}
                >
                    <Link to={{
                        pathname: `/detailedInformation/${rowData.id}/2/0/0`
                    }}>
                        <div style={{backgroundColor: 'rgb(238, 242, 249)'}}>
                            {isFocusList(rowData, sectionID, rowID)}
                        </div>
                    </Link>
                </SwipeAction>
            );
        };

        function renderTabBar(props) {
            return (<Sticky>
                {({style}) => <div style={{...style, zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
            </Sticky>);
        }


        // 状态：0 全部  20-待直播；30：直播中 40：已结束
        const tabs = [
            {title: '全部', key: 't1', type: 0},
            {title: '直播中', key: 't2', type: 30},
            {title: '报名中', key: 't3', type: 20},
            {title: '已结束', key: 't4', type: 40},
        ];


        return (
            <ErrorBoundary>
                {/*<DocumentTitle title='科普列表'>*/}
                    <div className='livelisttitlebox entryRecord' style={{background: 'rgba(238,242,249,1)'}}>

                        <HeaderNavBar title={'报名课程'} isLight={'navBarHeaderLight'} noIcon={true}/>
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
                                        border: '1px #6793F3 solid',
                                        width: '15.5%',
                                        marginLeft: '5%'
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

export default entryRecord
