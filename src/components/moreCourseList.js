import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import {Link} from "react-router-dom";
import '../less/polularScience.less'
import '../less/moreCourseList.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import HeaderNavBar from "./headerNavBar";


class MoreCourseList extends Component {
    constructor(props) {
        super(props);
        const { diseaseId,diseaseName,doctorId,type,doctorName } = this.props.match.params;

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.pageNo = 0 //定义分页信息
        // this.keyWords='';
        this.state = {
            fromType:type,
            doctorName:doctorName,
            diseaseName:diseaseName,
            doctorId:doctorId,
            diseaseId:diseaseId,
            dataTotal:0,
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            useBodyScroll: false,
            hasMore: true,
            keyWords: "",
            isContain: false,
            type: 2,
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
        config.share2Friend('listModule','','','科普列表','欢迎来到苏逢锡诊所');
    }

    async changeContent(content) {

        // console.dir(secondType);

        // console.dir(content);
        this.setState({type: content.type});
        const {secondType} = this.state;
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, content.type, secondType)).data;
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

    async changeContentType(content) {
        // console.dir(content);
        this.setState({secondType: content.type});
        const {type} = this.state;
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, type, content.type)).data;
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
        const {keyWords} = this.state;
        const {type, secondType} = this.state
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, type, secondType)).data;
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


    //右侧点赞
    supportContentList = (id = 0, contentType) => {

    };

    onVirtualKeyboardConfirm = (e) => {
        const keycode = e.keyCode;
        //不想删代码
        if (keycode === 13 || !isNaN(keycode)) {
            e.preventDefault();
            this.searchLiveList();
            if (this.state.keyWords === '') {
                Toast.info(`请输入查询内容`, 2, null, true);
                return false;
            }

        }
    };

    genData = (isSearch, type = 2, secondType = 1) => {  //请求数据的方法
        //第一个type是第一层navbar的type  第二个type是第二层navbar的type；\
        let param={};
        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        if(this.state.fromType==='doctorId'){
            param=JSON.stringify({
                'drOrUser': 1,
                'page': this.pageNo,
                'limit':5,
                'doctorId':this.state.diseaseName,
                'queryType': type,
                'queryContentType': secondType
            });
        }
        if(this.state.fromType==='diseaseName'){
            param=JSON.stringify({
                'drOrUser': 1,
                'page': this.pageNo,
                'limit':5,
                'keywords': this.state.diseaseName,
                'queryType': type,
                'queryContentType': secondType
            })
        }


        return fetch(config.publicUrl + `/appEducation/query.do`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',

                },
                body:param ,
            })
            .then(response => response.json())
            .then((result) => {
                // console.dir(result);
                if(result.status===1){
                    this.setState({
                        dataTotal:result.dataTotal,
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
                }
                else{
                    alert(result.message);
                    return  false;
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
        this.rData = [...((await this.genData(true, type, secondType)).data)];  //每次下拉之后将新数据装填过来
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
        this.rData = [...this.rData, ...((await this.genData('', type, secondType)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };


    render() {
        const {diseaseId,diseaseName,dataTotal,doctorName,fromType}=this.state;
        console.dir(fromType);
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 8,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );

        const showTagStatus = (status, queryContentType, queryType) => {
            //只有queryContentType为直播的时候才有对应的状态显示
            // 直播状态 7：审核不通过8:关闭直播 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束',
// 其余状态：0-待审核；1-审核通过；2-审核关闭；3-审核不通过; 4:已删除',
            if (queryContentType === 2 && queryType !== 1) {
                switch (status) {
                    case 20:
                        return <div className={'setImageTagsBGCWaiting'}>
                            <img src={require("../images/decatate_enroll_icon.png")} alt=""
                                 style={{width: '18px', paddingRight: '1px'}}/>
                            <span style={{fontSize: '14px', padding: '0 2px'}}>报名中</span>
                        </div>;

                    case 30:
                        return <div className={'setImageTagsBGCLiving'}><img src={require("../images/palying.gif")}
                                                                             alt=""/></div>;
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

        //图文
        const isGetImageTextPic = (rowData) => {
            //第三个判断是专为数据异常处理的
            if (rowData.image1 === null || rowData.image1 === '' || rowData.image1 === "data:image/jpeg;base64,") {
                return <img className={'setImage'} src={require("../images/cbcs_companion.png")} alt=""/>;
            } else {
                return <img className={'setImage'} src={config.publicStaticUrl + rowData.image1} alt=""/>;
            }
        };

        //语音
        const setAudiosPic = (rowData) => {
            /* if (rowData.coverPic) {
                 return <img className={'setImage'} src={config.publicStaticUrl + rowData.coverPic} alt=""/>
             } else {*/
            return <div className={'setImage isAudios'}>
                <img className={'disk'} src={require("../images/voice_yp_img.png")} alt=""/>
                <img className={'pointer'} src={require("../images/voice_play_img.png")} alt=""/>
            </div>;
            // }
        };


        const changeQueryContentType = (rowData) => {
            // 查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音
            switch (rowData.queryContentType) {
                case 2:
                    return <img className={'setImage'} src={config.publicStaticUrl + rowData.coverPic} alt="" onError={(e) => {e.target.onerror = null;e.target.src=require("../images/cover.png")}}/>
                case 3:
                    return <div style={{position: 'relative'}} >
                        <img className={'setImage'} src={config.publicStaticUrl + rowData.image1} alt=""/>
                        <img className={'videoMarker'} src={require("../images/video_play_icon.png")} alt=""/>
                    </div>;
                case 4:
                    return isGetImageTextPic(rowData);

                case 5:
                    return setAudiosPic(rowData);

                default:
                    return [...rowData]
            }
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
                /* if(isgratis===1){
                     return readingCount
                 }
                 if(isgratis===2){
                     return enrollNum;
                 }*/
                if (queryContentType === 3 || queryContentType === 4 || queryContentType === 5 || (queryContentType === 2 && status !== 20)) {
                    return readingCount
                }
                if (queryContentType === 2 && status === 20) {
                    return enrollNum;
                }
            };
            //isgratis是否免费 1:免费 2:不免费
            // 查询内容类型   2 直播 3 视频 4 图文 5 语音
            // 其余状态：0-待审核；1-审核通过；2-审核关闭；3-审核不通过; 4:已删除',
            // 直播状态 7：审核不通过8:关闭直播 9:取消直播 10-待审核；20-待直播；30：直播中 40：已结束',
            switch (queryContentType) {
                case 2: {
                    if (status === 20) {
                        return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人报名</div>;
                    } else {
                        return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人观看</div>;
                    }
                }
                case 3:
                    return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人观看</div>;
                case 4:
                    return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人阅读</div>;
                case 5:
                    return <div className={'registerNumber'}>{_isPay(isgratis, readingCount, enrollNum)}人收听</div>;
                default:
                    return [...queryContentType]
            }

        };

        // isgratis 是否免费 1:免费 2:不免费

        //判断是否免费然后还有已报名/已观看/未观看/已阅读/已收听
        // isView 是否已观看/阅读/收听  0 未观看阅读/收听 1 已观看/阅读/收听
        //付费的  用 ispay 1未支付 2 已支付 支付了 就是已读 已看  免费的 就 enrollId这个
        const isReportedOrDone = (isgratis, fee, enrollId, queryContentType, ispay, isView) => {
            //先判断类型查询内容类型 1 全部 2 直播 3 视频 4 图文 5 语音
            // enrollId 直播报名/已观看记录,enrollId不为null时 为已报名
            if (queryContentType === 2) {
                if (isgratis === 1) {
                    //免费
                    if (enrollId !== null) {
                        //已报名
                        if (isView === 1) {
                            //已观看
                            return <p className={'setDoneStyle'}>已观看</p>
                        } else {
                            //未观看
                            return <p className={'setDoneReportStyle'}>已报名</p>
                        }
                    } else {
                        //未报名
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                } else {
                    //收费
                    if (ispay === 1) {
                        //未支付
                        return <p className={'setPriceStyle'}>{'￥' + fee}</p>
                    }
                    if (ispay === 2) {
                        //已支付
                        if (enrollId !== null) {
                            //已报名
                            if (isView === 1) {
                                //已观看
                                return <p className={'setDoneStyle'}>已观看</p>
                            } else {
                                //未观看
                                return <p className={'setDoneReportStyle'}>已报名</p>
                            }
                        } else {
                            //未报名
                            return ''
                        }
                    }
                }
            }

            if (queryContentType === 3) {
                if (enrollId !== null) {
                    if (isView === 1) {
                        return <p className={'setDoneStyle'}>已观看</p>
                    }
                } else {
                    if (isgratis === 2) {
                        return <p className={'setPriceStyle'}>{'￥' + fee}</p>
                    } else {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                }
            }
            if (queryContentType === 4) {
                if (enrollId !== null) {
                    if (isView === 1) {
                        return <p className={'setDoneStyle'}>已阅读</p>
                    }
                } else {
                    if (isgratis === 2) {
                        return <p className={'setPriceStyle'}>{'￥' + fee}</p>
                    } else {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                }
            }
            if (queryContentType === 5) {
                if (enrollId !== null) {
                    if (isView === 1) {
                        return <p className={'setDoneStyle'}>已收听</p>
                    }
                } else {
                    if (isgratis === 2) {
                        return <p className={'setPriceStyle'}>{'￥' + fee}</p>
                    } else {
                        return <p className={'setFreeStyle'}>免费</p>
                    }
                }
            }
        };

        const getTimeRemain = (status, startingTime) => {
            //startTime 时间戳
            // startingTime=1571217481854
            let timestamp = (new Date()).getTime();
            if (startingTime && status === 20 && timestamp <= startingTime) {
                return "即将开播：" + moment(startingTime).endOf('minute ').fromNow();
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
            if (collectionId === null || collectionId === undefined) {
                return <img src={require("../images/sele_uncele_icon.png")} alt=""/>
            } else {
                return <img src={require("../images/sele_cele_icon.png")} alt=""/>
            }
        };

        //总收藏数
        const isSupport = (collectNum, collectionId) => {
            if (collectionId === null) {
                return <div className={"supportArea"}>
                    <span className={'supportNumber'}>{collectNum||0}</span>
                    {_isCollected(collectionId)}
                </div>
            } else {
                return <div className={"supportArea"}>
                    <span className={'supportNumber'} style={{color: '#3D7EFF'}}>{collectNum}</span>
                    {_isCollected(collectionId)}
                </div>
            }
        };

        //关注状态时的状态（直播中30，报名中20）新样式
        const _newFocusStatus = (status) => {
            if (status === 20) {
                return <div className={'focusStatus focusStatusReport'}>
                    <img src={require("../images/decatate_enroll_icon.png")} alt=""/>
                    <span>报名中</span>
                </div>;
            }
            if (status === 30) {
                return <div className={'focusStatus focusStatusLiving'}><img src={require("../images/palying.gif")}
                                                                             alt=""/><span>直播中</span></div>;
            }
            if (status === 40) {
                return <div className={'focusStatus focusStatusDone'}><span>已结束</span></div>;
            }
        };


        //关注列表的单独样式
        const focusArea = (queryType, headicon, name = '', queryContentType, createDate, duration, status) => {
            if (queryType === 1) {
                return (
                    <div className={'focusArea'}>
                        <img className={'headicon'} src={headicon.indexOf('http')!==-1?headicon:config.publicStaticUrl +headicon } alt=""  onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = require("../images/doctor_defu.png")
                        }}/>
                        <div className={'focusDesc'}>
                            <div style={{display: 'flex'}}>
                                <span className={'focusName'}>{name}</span>
                                <img className={'register'} src={require("../images/doctor_defi_icon.png")} alt=""/>
                                <span className={'focusClient'}>/ 苏逢锡诊所</span>
                            </div>
                            <div className={'focusClient'} style={{paddingTop: '5px'}}>
                                {queryType === 1 ? beforeRelease(queryType, queryContentType, createDate, duration) : ''}
                            </div>
                        </div>
                        {_newFocusStatus(status)}
                    </div>
                );
            }
        };

        const isFocusList = (rowData, sectionID, rowID) => {
                return (
                    <div key={rowID} style={{padding: '8px 8px', borderBottom: '1px solid #eee',background:'rgba(238,242,249,1)',}}>
                        <div style={{
                            padding: '15px 15px', position: 'relative',
                            display: 'flex', background: '#FFFFFF',borderRadius:'10px',
                        }}>
                            <div className={'setListImageArea'}>

                                {showTagStatus(rowData.status, rowData.queryContentType)}
                                {changeQueryContentType(rowData)}
                                {showHowManyPeople(rowData.queryContentType, rowData.readingCount, rowData.enrollNum, rowData.status, rowData.isgratis)}
                            </div>

                            <div style={{flex: '1'}} className={'setListRightArea setsl'}>

                                <div><span className={'setListRightAreaTitle'}>{rowData.title}</span></div>

                                {rowData.queryType === 1 ? '' : beforeRelease(rowData.queryType, rowData.queryContentType, rowData.createDate, rowData.duration)}

                                <div style={{
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                    color: 'rgba(232, 84, 30, 1)',
                                    fontWeight: '400'
                                }}>{getTimeRemain(rowData.status, rowData.startingTime)}</div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    lineHeight: '15px',
                                    marginTop: '5px'
                                }}>
                                    <div style={{display: 'flex', width: "100%"}}>
                                        {isReportedOrDone(rowData.isgratis, rowData.amout, rowData.enrollId, rowData.queryContentType, rowData.ispay, rowData.isView)}
                                    </div>
                                    <div className={'supportArea'}
                                         onClick={() => this.supportContentList(rowData.id, rowData.queryContentType)}>
                                        {isSupport(rowData.collectNum, rowData.collectionId)}
                                        {/* <div className={"supportArea"}>
                                            <span className={'supportNumber'}>11</span>
                                            <img src={require("../images/sele_uncele_icon.png")} alt=""/>
                                        </div>*/}

                                    </div>

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
                <Link to={{
                    pathname: `/detailedInformation/${rowData.id}/${rowData.queryContentType}/0/0`
                }}>
                    <div>
                        <div>
                            {focusArea(rowData.queryType, rowData.headicon, rowData.name, rowData.queryContentType, rowData.createDate, rowData.duration, rowData.status)}
                        </div>
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


        // 1 关注 2 推荐 3 精选 4 最新 5 免费  6 精选好文 7热门排行
        const tabs = [
            {title: '全部', key: 't1', type: 1},
            {title: '直播', key: 't2', type: 2},
            {title: '视频', key: 't3', type: 3},
            {title: '图文', key: 't4', type: 4},
            {title: '语音', key: 't5', type: 5},
        ];

        return (

            <ErrorBoundary>
                <div className='livelisttitlebox moreCoursesList' style={{background:'rgba(238,242,249,1)'}}>
                        <HeaderNavBar title={fromType==='doctorId'?doctorName:diseaseName} isLight={'navBarHeaderLight'} showDiseaseName={true} docOrCourse={'course'}/>
                        <NavBar mode="dark" style={{
                            height: '50px',
                            color: '#729DF2',
                            fontSize: '18px',
                            backgroundColor: 'rgba(255,255,255,1)'
                        }}>
                            <div className={'setInputStyle'}>
                                <div>
                                    <WhiteSpace/>
                                    <StickyContainer>
                                        <Tabs
                                            tabBarBackgroundColor={'#FFFFFF'}
                                            tabs={tabs}
                                            activeTab={this.state.index}
                                            initialPage={'t1'}
                                            renderTabBar={renderTabBar}
                                            onTabClick={(activeTab) => this.changeContentType(activeTab)}
                                            tabBarInactiveTextColor={'#333333'}
                                            tabBarActiveTextColor={'#6793F3'}
                                            tabBarActiveBackgroundColor={'red'}
                                            tabBarUnderlineStyle={{
                                                border: '2px #6793F3 solid',
                                                width: '12%',
                                                marginLeft: '4%'
                                            }}
                                        >

                                        </Tabs>
                                    </StickyContainer>
                                    <WhiteSpace/>
                                </div>

                            </div>
                        </NavBar>
                        <div className={'totalCourseNum'}>
                           共发现{dataTotal&&dataTotal}个课程
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
                                damping={50}
                            />}
                            onEndReachedThreshold={20}
                            onEndReached={this.onEndReached}
                            pageSize={5}    //每次下拉之后显示的数据条数
                        />
                    </div>
            </ErrorBoundary>
        );
    }
}

export default MoreCourseList