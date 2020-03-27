import React, {Component} from 'react';
import {NavLink, withRouter} from "react-router-dom"
import {Carousel, Icon, InputItem, NavBar, WingBlank} from 'antd-mobile';
import axios from "axios";
import URLconfig from "../config/urlConfig";
import '../less/home.less'
import {storiesOf, action} from '@storybook/react';
import Cards, {Card} from '../components/cardComplex'
import '../css/style.css'

import config from "../config/wxconfig";
import moment from "moment";


const data = ['Alexandre', 'Thomas', 'Lucien'];

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.pageNo = 1 //定义分页信息
        this.state = {
            // data: ['1', '2', '3'],
            imgHeight: 176,
            carouselList: [],
            carouselListNotices: [],
            liveTelecastRecommomd: [],
            guessYouLike: [],
            isEnd: false,
            topRanking: [],
            carefullyChosen: [],
            group: 0,
            noticeList: [],

        };
        this.navPrev = this.navPrev.bind(this);
        this.navNext = this.navNext.bind(this);
    }

    navPrev() {
        let list = [...this.state.liveTelecastRecommomd];
        let p = list.pop();
        list.unshift(p);
        this.setState({
            liveTelecastRecommomd: list,
        })
    }

    navNext() {
        let list = [...this.state.liveTelecastRecommomd];
        let element = list.shift();
        list.push(element);
        this.setState({
            liveTelecastRecommomd: list,
        })
    }


    componentDidMount() {
        this.getCarouselPic();
        this.getCarouseNotices();
        this.getHomePageInfo();
    }

    //轮播图
    async getCarouselPic() {
        let arr = [];
        await axios({
            url: URLconfig.publicUrl + 'app/navigationPage.do',
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
            }
        }).then((response) => {
            if (response.status === 200) {
                let result = response.data;
                if (result.status === 1) {
                    arr.push(result.data[0].navigationPage1);
                    arr.push(result.data[1].navigationPage2);
                    arr.push(result.data[2].navigationPage3);

                    this.setState({
                        carouselList: arr,
                    })

                } else {
                    alert(result.message);
                    return false;
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };

    //轮播通知
    getCarouseNotices() {
        let arr = [];
        axios({
            url: URLconfig.publicUrl + 'app/serviceDynamic.do',
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
            }
        }).then((response) => {
            if (response.status === 200) {
                let result = response.data;
                if (result.status === 1) {
                    this.setState({
                        carouselListNotices: result.data,
                    })

                } else {
                    alert(result.message);
                    return false;
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //拼接轮播通知
    connectNotice(docName, type, title) {
        // type  3：问答  4：问诊 5：医生文章  6 视频
        if (type === 3) {
            return `${docName}医生 发布了新问答 《${title}》`
        } else if (type === 4) {
            return `${docName}医生 录制了新问答 《${title}》`
        } else if (type === 5) {
            return `${docName}医生 发布了新文章 《${title}》`
        } else if (type === 6) {
            return `${docName}医生 录制了新视频 《${title}》`
        }
    }


    //输入框聚焦的时候
    getFocusStatus() {
        this.props.history.push({pathname: `/wikiSearchList/`,});
    }

    //首页的信息
    getHomePageInfo() {
        axios({
            url: URLconfig.publicUrl + 'appEducation/firstPage.do',
            method: 'post',
            data: {
                'drOrUser': 1,
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
                let result = response.data;
                // console.dir(result);

                if (result.status === 1) {
                    this.setState({
                        liveTelecastRecommomd: result.data.liveTelecastRecommomd,
                        topRanking: result.data.topRanking,
                        carefullyChosen: result.data.carefullyChosen,
                        guessYouLike: result.data.guessYouLike,
                        noticeList: result.data.noticeList,
                    })


                } else {
                    alert(result.message);
                    return false;
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    showTagStatus = (status) => {
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
    };

    showHowManyPeople = (...args) => {
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

    isPay(isgratis, enrollId, isView, fee) {
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
            if (enrollId === null) {
                //未支付
                return <p className={'setPriceStyle'}>{'￥' + fee}</p>
            }
            if (enrollId) {
                //已支付
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


    isEnd = (result, msg) => {
        console.dir(result)
        // console.log(result, msg)
        /*  this.setState({
              isEnd: result
          })*/
    }


    getChildValue(val) {
        console.log("getChildValue", val);
        this.setState({
            isEnd: val
        });
        if (val) {
            this.navNext();
        }
    }

    //到对应的详情
    toDetail(id, queryContentType) {

        this.props.history.push({pathname: `/detailedInformation/${id}/${queryContentType}/0/0`,});
    }

    //滑动组件
    Wrapper = (liveTelecastRecommomd, isEnd) => {
        return (
            <Cards onEnd={action('end')} className='master-root' toFatherValue={this.getChildValue.bind(this)}
                   isEnd={this.state.isEnd}>
                {liveTelecastRecommomd.map((item, key) =>
                    <Card
                        key={key}
                        onSwipeLeft={action('swipe left')}
                        onSwipeRight={action('swipe right')}>
                        <div className={'myjt'} style={{
                            padding: '15px', position: 'relative',
                            display: 'flex', background: '#FFFFFF'
                        }} onClick={() => {
                            this.toDetail(item.id, 2)
                        }}>
                            <div className={'leftArea'}>


                                <img className={'setImage'}
                                     src={item.coverPic ? (config.publicStaticUrl + item.coverPic.replace(" ", "")) : require("../images/cover.png")}
                                     alt=""
                                     onError={(e) => {
                                         e.target.onerror = null;
                                         e.target.src = require("../images/cover.png")
                                     }}/>
                                {/* <div className={'setImageTagsBGCDone'}>
                                    <span style={{fontSize: '14px', padding: '0 5px'}}>未通过</span>
                                </div>*/}
                                {this.showTagStatus(item.status)}
                                {this.showHowManyPeople(2, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                            </div>
                            <div className={'rightArea'}>
                                <div className={'title'}>
                                    {item.title}
                                </div>
                                <div className={'sec'}>
                                    <div className={'docName'}>
                                        {item.name}
                                    </div>
                                    <img className={'V'} src={require('../images/doctor_defi_icon.png')} alt=""/>
                                    <div className={'hospital'}>
                                        {item.hospital}
                                    </div>
                                </div>
                                <div className={'third'}>
                                    <div className={'date'}>{moment(item.startingTime).format("MM月DD日")}</div>
                                    <div className={'ispay'}>
                                        {this.isPay(item.isgratis, item.enrollId, item.isView, item.fee)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </Cards>
        )
    };


    //图文
    isGetImageTextPic = (rowData) => {
        //第三个判断是专为数据异常处理的
        if (rowData.image1 === null || rowData.image1 === '' || rowData.image1 === "data:image/jpeg;base64,") {
            return <img className={'setImage'} src={require("../images/cover.png")} alt=""/>;
        } else {
            return <img className={'setImage'} src={config.publicStaticUrl + rowData.image1} alt=""/>;
        }
    };

    //语音
    setAudiosPic = (rowData) => {
        if (rowData.coverPic) {
            return <img className={'setImage'} src={config.publicStaticUrl + rowData.coverPic} alt=""/>
        } else {
            return <div className={'setImage isAudios'}>
                <img className={'disk'} src={require("../images/voice_yp_img.png")} alt=""/>
                <img className={'pointer'} src={require("../images/voice_play_img.png")} alt=""/>
            </div>;
        }
    };

    getType(rowData) {
        // 查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音 10视频直播
        switch (rowData.queryContentType) {
            case 2:
                return <img className={'setImage'}
                            src={rowData.coverPic ? (config.publicStaticUrl + rowData.coverPic.replace(" ", "")) : require("../images/cover.png")}
                            alt=""
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
            case 3:
                return <div style={{position: 'relative'}}>
                    <img className={'setImage'} src={config.publicStaticUrl + rowData.image1} alt=""/>
                    <img className={'videoMarker'} src={require("../images/video_play_icon.png")} alt=""/>
                </div>;
            case 4:
                return this.isGetImageTextPic(rowData);

            case 5:
                return this.setAudiosPic(rowData);
            case 10:
                return <img className={'setImage1'}
                            src={rowData.coverPic ? (config.publicStaticUrl + rowData.coverPic.replace(" ", "")) : require("../images/cover.png")}
                            alt=""
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
            default:
                return [...rowData]
        }
    }

    //展示多少人阅读
    showHowManyPeoples = (...args) => {
        let queryContentType = args[0];
        let readingCount = args[1];
        let enrollNum = args[2];
        let status = args[3];
        let isgratis = args[4];
        const _isPay = (isgratis, readingCount, enrollNum) => {

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
        if (queryContentType !== 10) {
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
        }

    };

    //展示多少点赞数
    showSupport = (number) => {
        return <div className={'supportNum'}>
            <div className={'number'}>{number || 0}</div>
            <img className={'thumb'} src={require('../images/press_good_icon.png')} alt=""/>
        </div>
    }

    showTagStatus1 = (status, queryContentType, queryType) => {
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


    changeQueryContentType = (rowData, number) => {
        if (number === 1) {

            return rowData.map((item, key) =>
                <div key={key} className={key === 0 ? 'oneItem' : 'oneItem1'} onClick={() => {
                    this.toDetail(item.id, item.queryContentType)
                }}>
                    {this.getType(item)}
                    {/*{this.showTagStatus1(item.status, item.queryContentType, item.queryType)}*/}
                    <div className={'title'}>
                        {item.title}
                    </div>
                    <div className={'thirdLine'}>
                        {this.showHowManyPeoples(item.queryContentType, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                        {this.showSupport(item.dzNum)}
                    </div>
                </div>
            )
        } else if (number === 2) {
            return rowData.map((item, key) =>
                <div key={key} className={key === 0 ? 'oneItem1' : 'smOne'} onClick={() => {
                    this.toDetail(item.id, item.queryContentType)
                }}>

                    {this.getType(item)}
                    {this.showTagStatus1(item.status, item.queryContentType, item.queryType)}
                    <div className={'title'}>
                        {item.title}
                    </div>
                    <div className={'thirdLine'}>
                        {this.showHowManyPeoples(item.queryContentType, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                        {this.showSupport(item.dzNum)}
                    </div>
                </div>
            )
        }
    };

    showSomething = (carefullyChosen) => {
        return carefullyChosen.map((item, key) =>
            <div key={key} className={'oneItem'} onClick={() => {
                this.toDetail(item.id, item.queryContentType)
            }}>
                <div className={'left'} style={{width: '40%'}}>
                    {this.getType(item)}
                </div>
                <div className={'right'}>
                    <div className={'title'}>
                        {item.title}
                    </div>
                    <div className={'thirdLine'}>
                        {this.showHowManyPeoples(item.queryContentType, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                        {this.isPay(item.isgratis, item.enrollId, item.isView, item.amout)}
                    </div>
                </div>
            </div>
        )
    };

    showWhatYouLike = (guessYouLike) => {
        return guessYouLike.map((item, key) =>
            <div key={key} className={'oneItem'} onClick={() => {
                this.toDetail(item.id, item.queryContentType)
            }}>

                {this.getType(item)}
                {this.showTagStatus1(item.status, item.queryContentType, item.queryType)}
                <div className={'title'}>
                    {item.title}
                </div>
                <div className={'thirdLine'}>
                    {this.showHowManyPeoples(item.queryContentType, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                    {item.queryContentType!==10&&this.showSupport(item.dzNum)}
                </div>
            </div>
        )
    };

    //换一批
    getOthers = (isSearch) => {
        const {group} = this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        fetch(config.publicUrl + `/appEducation/query.do`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json, text/plain, */*',
                    'loginToken': localStorage.getItem('loginToken'),
                },
                body: JSON.stringify({
                    'drOrUser': 1,
                    'page': this.pageNo,
                    'limit': 4,
                    'queryType': 2,
                    'queryContentType': 1,
                    'teamSources': group || '',
                }),
            })
            .then(response => response.json())
            .then((result) => {

                if (result.status === 1) {


                    if (result.dataTotal !== 0) {
                        this.setState({
                            hasMore: true,
                            guessYouLike: result.data,
                        });


                    } else {
                        this.setState({
                            hasMore: false,

                        });

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

    //到问诊
    toPage(to) {
        const {group} = this.state;
        if (to === 'diagnosisList') {
            this.props.history.push(`/diagnosisList/${group}`);
        } else if (to === 'PolularScienceList') {
            this.props.history.push(`/PolularScienceList/${group}`);
        } else if (to === 'wiki') {
            this.props.history.push(`/wiki`);
        } else if (to === 'shopIndex') {
            window.location.href = `${URLconfig.toWxHis}/wxapp/shop_index.html`
        }
    }

    isStatus(status) {
        if (status === 1) return <img className="imgs_1" src={require('../images/11.gif')} alt=""/>
        if (status === 2) return <img className="imgs_2" src={require('../images/22.png')} alt=""/>
        if (status === 3) return <img className="imgs_3" src={require('../images/33.png')} alt=""/>
    }

    /*进入视频直播*/
    toLive(liveId){
        this.props.history.push(`/noticeDetails/${liveId}`);
    }
    //直播公告
    setNotices(noticeList) {
        return noticeList.map((item, index) => {
            return <div key={index} className={'items'} onClick={()=>{this.toLive(item.id)}}>
                <div className="left">
                    <p className="title">{item.title}</p>
                    <p className="time">直播时间：{moment(item.createDate).format('MM月DD日 HH:mm')}</p>
                </div>
                <div className="img">
                    {this.isStatus(item.status)}
                    <img className="imgs" src={config.publicStaticUrl + item.coverPic} alt=""/>
                </div>
            </div>
        })
    };

    //直播公告更多
    moreNotices(){
        this.props.history.push(`/noticeList/`);
    }


    render() {
        const {carouselList, carouselListNotices, liveTelecastRecommomd, isEnd, topRanking, carefullyChosen, guessYouLike, noticeList} = this.state;

        /*        {guessYouLike.length>0&&console.dir(guessYouLike)}*/

        return (
            <div className={'home'}>
                <div className={'carouse'}>
                    {carouselList.length > 0 && <Carousel
                        autoplay={true}
                        infinite

                        dotStyle={{color: 'red',}}
                        // beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
                        // afterChange={index => console.log('slide to', index)}
                    >

                        {carouselList.map(val => (
                            <a
                                key={val}
                                href="http://www.alipay.com"
                                style={{display: 'inline-block', width: '100%', height: this.state.imgHeight}}
                            >
                                <img
                                    src={`${URLconfig.publicStaticUrl}/${val}`}
                                    alt=""
                                    style={{width: '100%', verticalAlign: 'top'}}
                                    onLoad={() => {
                                        // fire window resize event to change height
                                        window.dispatchEvent(new Event('resize'));
                                        this.setState({imgHeight: 'auto'});
                                    }}
                                />
                            </a>
                        ))}
                    </Carousel>}
                </div>
                <div className={'searchBox'}>
                    <NavBar mode="dark" style={{
                        height: 'auto',
                        color: 'rgba(255,255,255,1)',
                        fontSize: '18px',
                        backgroundColor: 'transparent',

                    }}>

                        <div className={'searchBar'}>
                            <div className={'setInputStyle'}>
                                <InputItem
                                    clear
                                    onFocus={(value) => {
                                        this.getFocusStatus()
                                    }}
                                    moneyKeyboardAlign="left"
                                    placeholder="请输入您要搜索的内容">

                                    <Icon style={{width: '22px', height: '22px'}} color={'rgba(165,165,165,1)'}
                                          key="2"
                                          type="search" size={"xxs"} onClick={() => this.searchLiveList()}/>
                                </InputItem>

                            </div>
                        </div>
                    </NavBar>
                </div>
                <div className={'mainMenu'}>
                    <div className={'item1'} onClick={() => {
                        this.toPage('diagnosisList')
                    }}>
                        <img src={require('../images/home_main_inquiry_icon.png')} alt=""/>
                        <div>问诊</div>
                    </div>
                    <div className={'item1'} onClick={() => {
                        this.toPage('PolularScienceList')
                    }}>
                        <img src={require('../images/home_main_education_icon.png')} alt=""/>
                        <div>开课</div>
                    </div>
                    <div className={'item1'} onClick={() => {
                        this.toPage('wiki')
                    }}>
                        <img src={require('../images/home_main_baike_icon.png')} alt=""/>
                        <div>百科</div>
                    </div>
                    <div className={'item1'} onClick={() => {
                        this.toPage('shopIndex')
                    }}>
                        <img src={require('../images/home_main_shopping_icon.png')} alt=""/>
                        <div>好物</div>
                    </div>
                </div>
                <div className={'notices'}>
                    {/* {carouselListNotices.length > 0 && console.dir(carouselListNotices)}*/}
                    <img src={require('../images/home_message_dt_icon.png')} alt=""/>
                    <div className={'tags'}>
                        {carouselListNotices.length &&
                        <Carousel className="my-carousel"
                                  vertical
                                  dots={false}
                                  dragging={false}
                                  swiping={false}
                                  autoplay={true}
                                  infinite
                                  autoplayInterval={2000}
                        >
                            {carouselListNotices.map((item, key) =>
                                <div key={key} className="v-item" style={{
                                    width: '97%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '10px',
                                    fontWeight: 'bold',
                                    color: " rgba(49,50,51,1)",

                                }}>{this.connectNotice(item.docName, item.type, item.title)}</div>
                            )}
                        </Carousel>}
                    </div>
                </div>
                <div className={'areas1 noticess'}>
                    <div className={'title1 sp'}>
                        直播公告
                        <span className={'more'} onClick={()=>{this.moreNotices()}}>更多...</span>
                    </div>
                    <div className={'inner1'}>
                        {this.setNotices(noticeList)}
                    </div>
                </div>
                <div className={'areas'}>
                    <div className={'title1'}>
                        名医讲堂
                    </div>
                    <div className={'inner'}>
                        {liveTelecastRecommomd.length > 0 && this.Wrapper(liveTelecastRecommomd, isEnd)}
                    </div>
                </div>
                <div className={'areas1'}>
                    <div className={'title1'}>
                        热门排行
                    </div>
                    <div className={'inner1'}>
                        <div className={'bigOne'}>
                            {topRanking.length > 0 && this.changeQueryContentType(topRanking, 1)}
                        </div>
                        <div className={'twoSmall'}>
                            {topRanking.length > 0 && this.changeQueryContentType(topRanking, 2)}
                        </div>
                    </div>
                </div>
                <div className={'areas1 goodArticle'}>
                    <div className={'title1'}>
                        精选好文
                    </div>
                    <div className={'inner1'}>
                        {carefullyChosen.length > 0 && this.showSomething(carefullyChosen)}
                    </div>
                </div>
                <div className={'areas1 guessYouLike'}>
                    <div className={'title1'}>
                        猜你喜欢
                    </div>
                    <div className={'inner1'}>
                        {guessYouLike.length > 0 && this.showWhatYouLike(guessYouLike)}
                    </div>
                    <div className={'getOthers'} onClick={() => {
                        this.getOthers()
                    }}>
                        <img src={require('../images/home_change_cont_icon.png')} alt=""/>
                        <div className={'font'}>换一批</div>
                    </div>
                </div>

            </div>
        );
    }
}

Home
    .propTypes = {};

export default withRouter(Home);
