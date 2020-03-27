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
import '../less/myCollection.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";

import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import SearchBox from "./searchBox";
import {changeModuleTitleType} from '../config/wxconfig';

const alert = Modal.alert;

class myCollection extends Component {
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
            hasCollected: false,
            title: '',
            cancleStatus: false,

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
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, content)).data;
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
        //第一个type是第一层navbar的typ

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        return fetch(config.publicUrl + `app/myCollectionList.do?page=${this.pageNo}&limit=5&queryContentType=${type}&title=${this.state.title}`,
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
        const {type} = this.state;
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
        const {type} = this.state;
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

    //等待取消收藏
    waitingAxiosUpdate = (cancleStatus, type = 'notExist', message = 'loading...') => {
        if (cancleStatus === true && type === 'exist') {
            Toast.loading(message, 2);
        }
        if (cancleStatus === false && type === 'noExist') {
            Toast.success(message, 2);
        }
    };

    //取消收藏
    abolish(id, queryContentType) {
        alert('我的收藏', '您要取消该收藏吗？', [
            {
                text: '是的',
                onPress: () => {
                    this.setState({
                        cancleStatus: true,
                    }, () => {
                        if (id) {
                            this.waitingAxiosUpdate(this.state.cancleStatus, 'exist', '取消中，请稍等...')
                            //取消收藏
                            axios({
                                url: URLconfig.publicUrl + '/upload/cancelCollection.do',
                                method: 'post',
                                data: {
                                    "collectedId": id,
                                    "collectionType": queryContentType,
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
                                    'loginToken': localStorage.getItem('loginToken'),
                                }
                            }).then((response) => {
                                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                                if (response.status === 200 && response.data.status === 1) {
                                    if (response.data.status === 1) {
                                        /*reload data*/
                                        this.setState({
                                            cancleStatus: false,
                                        }, () => {
                                            this.waitingAxiosUpdate(this.state.cancleStatus, 'noExist', '取消成功');
                                            this.changeContent(this.state.type)
                                        })

                                    }
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

    onChange = (value) => {
        this.setState({title: value});

    };

    clear = () => {
        this.setState({title: ''}, () => {
            this.changeContent(this.state.type);
        });

    };

    getData = (val) => {
        this.setState({title: val}, () => {
            this.changeContent(this.state.type);
        });
    };

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

            // int status状态  （queryContentType（3,5,6）   状态：0-待审核；1-审核通过；3-审核不通过     ；  queryContentType=7 状态：7：审核不通过 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束）


            //只有queryContentType为直播的时候才有对应的状态显示
            // 直播状态 7：审核不通过8:关闭直播 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束',
// 其余状态：0-待审核；1-审核通过；2-审核关闭；3-审核不通过; 4:已删除',
            let timestamp = (new Date()).getTime();
            /*  if (startingTime && status === 20 && timestamp <= startingTime) {
                  return <div className={'ready'}>
                      {moment(startingTime).endOf('minute ').fromNow()+'开始，请耐心等待'}
                  </div>;
              }*/
            if (queryContentType === 7) {
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
                            <span style={{fontSize: '14px', padding: '0 5px'}}>取消直播</span>
                        </div>;
                    default:
                        return [...status]
                }
            }
        };


        //图文
        const isGetImageTextPic = (rowData) => {
            //第三个判断是专为数据异常处理的
            if (rowData.image === null || rowData.image === '' || rowData.image === undefined || rowData.image === "data:image/jpeg;base64,") {
                return <img className={'setImage'} src={require("../images/cover.png")} alt=""/>;
            } else {
                return <img className={'setImage'} src={config.publicStaticUrl + rowData.image} alt=""/>;
            }
        };

        //语音
        const setAudiosPic = (rowData) => {
            if (rowData.image) {
                return <img className={'setImage'} src={config.publicStaticUrl + rowData.image} alt=""/>
            } else {
                return <div className={'setImage isAudios'}>
                    <img className={'disk'} src={require("../images/voice_yp_img.png")} alt=""/>
                    <img className={'pointer'} src={require("../images/voice_play_img.png")} alt=""/>
                </div>;
            }
        };


        const changeQueryContentType = (rowData) => {
            switch (rowData.queryContentType) {
                // int queryContentType  7 直播  6 视频  5 问诊  3音频
                case 7:
                    return <img className={'setImage'}
                                src={rowData.image ? (config.publicStaticUrl + rowData.image.replace(" ", "")) : require("../images/cover.png")}
                                alt=""
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = require("../images/cover.png")
                                }}/>
                case 6:
                    return <div style={{position: 'relative'}}>
                        <img className={'setImage'} src={config.publicStaticUrl + rowData.image} alt=""/>
                        <img className={'videoMarker'} src={require("../images/video_play_icon.png")} alt=""/>
                    </div>;
                case 5:
                    return isGetImageTextPic(rowData);

                case 3:
                    return setAudiosPic(rowData);

                default:
                    return [...rowData]
            }

            /*  // 查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音
              return <img className={'setImage'}
                          src={rowData.image ? (config.publicStaticUrl + rowData.image.replace(" ", "")) : require("../images/cover.png")}
                          alt=""
                          onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = require("../images/cover.png")
                          }}/>*/
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

        const isReportedOrDone = (queryContentType, payStatus, isView, isgratis, amount, isdelete) => {
            // int payStatus 1:已支付   其他值都未支付
            // int queryContentType  7 直播  6 视频  5 图文  3音频
            // private int isgratis;// 1:免费 2:不免费
            // int isView ;大于0则观看
            if (isdelete === 1) {
                if (queryContentType === 3) {
                    if (isgratis === 2 && isView > 0) {
                        return <p className={'setDoneStyle'}>已收听</p>
                    }
                    if ((isgratis === 2 && payStatus !== 1 && isView <= 0)) {
                        return <p className={'setPriceStyle'}>{'￥' + amount}</p>
                    }
                    if (isgratis === 1 && isView > 0) {
                        return <p className={'setDoneStyle'}>已收听</p>
                    }
                    if (isgratis === 1 && isView <= 0) {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                }
                if (queryContentType === 7 || queryContentType === 6) {
                    if (isgratis === 2 && isView > 0) {
                        return <p className={'setDoneStyle'}>已观看</p>
                    }
                    if (isgratis === 2 && isView <= 0) {
                        return <p className={'setPriceStyle'}>{'￥' + amount}</p>
                    }
                    if (isgratis === 1 && isView <= 0) {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                    if (isgratis === 1 && isView > 0) {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                }
                if (queryContentType === 5) {
                    if (isgratis === 2 && isView > 0) {
                        return <p className={'setDoneStyle'}>已阅读</p>
                    }
                    if (isgratis === 2 && isView <= 0) {
                        return <p className={'setPriceStyle'}>{'￥' + amount}</p>
                    }
                    if (isgratis === 1 && isView <= 0) {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                    if (isgratis === 1 && isView > 0) {
                        return <p className={'setDoneStyle'}>已阅读</p>
                    }
                }
            } else {
                if (payStatus === 1 && isgratis === 2) {
                    return <p className={'setPriceStyle'}>{'￥' + amount}</p>
                } else {
                    return <p className={'setDoneStyle'}>已失效</p>
                }
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

        //将字符串时长换算时分秒时间
        const toSeconds = (duration) => {
            //秒
            if (duration) {
                let d = moment.duration(parseInt(duration * 1000));
                let hours = Math.floor(d.asHours());
                let mins = Math.floor(d.asMinutes()) - hours * 60;
                let sec = Math.floor(d.asSeconds()) - hours * 3600 - mins * 60;
                // console.log("hours:" + hours + " mins:" + mins + " sec:" + sec);
                let str = '';
                if (hours) {
                    str += `${hours}小时`;
                }
                if (mins) {
                    str += `${mins}分钟`;
                }
                if (sec) {
                    str += `${sec}秒`;
                }
                return <span style={{color: "#6793F3"}}>{str}</span>;
            }
        };

        //多少时间前发布,且若为视频的时候要显示视频时长
        const beforeRelease = (queryType, queryContentType, createDate, duration) => {
            // let timestamp = (new Date()).getTime();
            if (createDate && queryContentType) {
                //未超过一年显示
                let beforeDate = moment(createDate).endOf('minute ').fromNow();

                let before1YearTimestamp = moment().subtract(1, "years").valueOf();
                let timeDiff = Math.abs(createDate - before1YearTimestamp);
                let diffDay = timeDiff / (24 * 60 * 60 * 1000);

                if (diffDay > 365) {
                    if ((queryContentType === 3 || queryContentType === 5) && duration) {
                        return <div style={{display: "flex"}}>
                            <span style={{marginRight: '10px'}}
                                  className={'timeRemaining '}>时长{toSeconds(duration)}</span>
                            <span className={'timeRemaining'}>{moment().format("YYYY年MM月DD日") + '发布'}</span>
                        </div>
                    } else {
                        return <div>
                            <span className={'timeRemaining'}>{moment().format("YYYY年MM月DD日") + '发布'}</span>
                        </div>
                    }

                } else {
                    if ((queryContentType === 3 || queryContentType === 5) && duration) {
                        return <div style={{display: "flex"}}>
                            <span style={{marginRight: '10px'}}
                                  className={'timeRemaining'}>时长{toSeconds(duration)}</span>
                            <span className={'timeRemaining'}>{beforeDate + '发布'}</span>
                        </div>
                    } else {
                        return <div>
                            <span className={'timeRemaining'}>{beforeDate + '发布'}</span>
                        </div>
                    }
                }
            }
        };
        //当前用户是否收藏
        const _isCollected = (collectionId) => {
            if (collectionId === null || collectionId === undefined || collectionId <= 0) {
                return <img src={require("../images/sele_uncele_icon.png")} alt=""/>
            } else {
                return <img src={require("../images/sele_cele_icon.png")} alt=""/>
            }
        };

        //总收藏数
        const isSupport = (collectNum, collectionId) => {
            if (collectionId === null || collectionId <= 0) {
                return <div className={"supportArea"}>
                    <span className={'supportNumber'}>{collectNum || 0}</span>
                    {_isCollected(collectionId)}
                </div>
            } else {
                return <div className={"supportArea"}>
                    <span className={'supportNumber'} style={{color: '#3D7EFF'}}>{collectNum || 0}</span>
                    {_isCollected(collectionId)}
                </div>
            }
        };


        const isFocusList = (rowData, sectionID, rowID) => {

            return (
                <div key={rowID} style={{
                    padding: '0 16px',
                    paddingTop: '0',
                    borderBottom: '1px solid #eee',
                    background: '#ffffff'
                }}>
                    <div style={{
                        padding: '15px 0', position: 'relative',
                        display: 'flex', background: '#FFFFFF'
                    }}>
                        <div className={'setListImageArea'}>

                            {showTagStatus(rowData.status, rowData.queryContentType, rowData.startingTime)}
                            {changeQueryContentType(rowData)}
                            {showHowManyPeople(rowData.queryContentType, rowData.readingCount, rowData.enrollNum, rowData.status, rowData.isgratis)}
                        </div>

                        <div style={{flex: '1'}} className={'setListRightArea setsl'}>

                            <div><span className={'setListRightAreaTitle'}>{rowData.title}</span></div>

                            {rowData.queryType === 1 ? '' : beforeRelease(rowData.queryType, rowData.queryContentType, rowData.createDate, rowData.duration)}

                            {/*<div>{getTimeRemain(rowData.status, rowData.startingTime)}</div>*/}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                lineHeight: '15px',
                                marginTop: '5px'
                            }}>
                                <div style={{display: 'flex', width: "100%", marginTop: '2px'}}>
                                    {isReportedOrDone(rowData.queryContentType, rowData.payStatus, rowData.isView, rowData.isgratis, rowData.amout, rowData.isdelete)}
                                </div>
                                {rowData.isdelete === 1 ? <div className={'supportArea'}>
                                    {isSupport(rowData.collectedNum, rowData.collectionId)}
                                </div> : ''}
                                {rowData.isdelete === 2 ? <div className={'supportArea'}>
                                    <div style={{
                                        background: 'rgba(165,165,165,1)',
                                        borderRadius: '3px', opacity: '0.5', color: '#fff', width: '55px',
                                        height: '25px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>删除
                                    </div>
                                </div> : ''}

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
                            text: '取 消',
                            onPress: () => {
                                this.abolish(rowData.id, rowData.queryContentType)
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
                        pathname: `/detailedInformation/${rowData.id}/${changeModuleTitleType(rowData.queryContentType)}/0/0`
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


        // 状态：0 全部  3语音；5：文章 6：视频 7 直播
        const tabs = [
            {title: '全部', key: 't1', type: 0},
            {title: '直播', key: 't2', type: 7},
            {title: '视频', key: 't3', type: 6},
            {title: '图文', key: 't4', type: 5},
            {title: '语音', key: 't5', type: 3},
        ];


        return (
            <ErrorBoundary>
                {/*<DocumentTitle title='科普列表'>*/}
                <div className='livelisttitlebox entryRecord myCollection' style={{background: 'rgba(238,242,249,1)'}}>
                    <HeaderNavBar title={'我的收藏'} isLight={'navBarHeaderLight'} noIcon={true}/>
                    <SearchBox parent={this} placeholder={'请输入关键字'}/>
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
                                    width: '10%',
                                    marginLeft: '5%'
                                }}
                            >

                            </Tabs>
                        </StickyContainer>
                        <WhiteSpace/>
                    </div>


                    <ListView
                        // renderSeparator={separator}
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

export default myCollection
