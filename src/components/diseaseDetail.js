import React, {Component} from 'react';
import HeaderNavBar from "./headerNavBar";
import {Button, Modal, Toast ,Icon} from 'antd-mobile';
import axios from 'axios';
import qs from 'qs';
import '../less/diseaseDetail.less';
import URLconfig from "../config/urlConfig";
import NoContent from "./noContent";
import config from "../config/wxconfig";
import SetStars from "./setStars";
import moment from "moment";
import DetailedInformation from "./detailedInformation";
const alert = Modal.alert;

class DiseaseDetail extends React.Component {
    constructor(props) {
        super(props);
        const { diseaseId,diseaseName } = this.props.match.params;
        this.state = {
            diseaseId:parseInt(diseaseId),
            diseaseName:diseaseName,
            spread:false,
            diseaseDetail:'',
            diseaseType:0,
            aboutDocList:'',
            aboutCourseList:'',

        };
    }

    componentDidUpdate() {

    }

    componentDidMount() {
        const {diseaseId,diseaseName}=this.state;
        this.getDiseaseDetail(diseaseId);
        this.getDocAbout(1,diseaseId);
        this.getCourseAbout(1,diseaseName);
    }

    //获取对应疾病专家
    getDocAbout(page=1,diseaseId){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/questionDocList.do',
            method: 'post',
            data: {
                "page": page,
                "limit": 3,
                'diseaseId':diseaseId,
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
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    aboutDocList:response.data.data
                });

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }
    //设置专家列表
    setDocAboutList(aboutDocList){
        if(aboutDocList.length===0){
            return(
                <NoContent parent={this} inner={'暂无相关专家'}/>
            )
        }
        else{
            return  aboutDocList.map((item, index) => {
                return(
                    <div className={'docTag'} key={index} onClick={()=>{this.toDoctorDetailedInformation(item.id)}}>
                        <div className={'leftCorner'}>
                            <img className={'bgImg'} src={require('../images/recomened_icon.png')} alt=""/>
                            <div className={'score'}>{item.serviceEvaluate.toFixed(1)}</div>
                            <img className={'recommend'} src={require('../images/reconmend_icon.png')} alt=""/>
                        </div>
                        <div className={'docResume'}>
                            <div className={'header'}>
                                <img src={item.headicon&&item.headicon.indexOf('http') !== -1 ?item.headicon : config.publicStaticUrl+item.headicon} alt="" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = require("../images/cover.png")
                                }}/>

                                <p>{item.teachingTitle}</p>
                            </div>
                            <div className={'detail'}>
                                <div className={'first'}>
                                    <div className={'title'}>{item.name}</div>
                                    <div className={'title'}>{item.doctorTitle}</div>
                                </div>
                                <div className={'second'}>
                                    <div className={'title'}>{item.hospital}</div>
                                    <div className={'title'}>{item.doctorDepartment}</div>
                                </div>
                                <div className={'third'}>
                                    {'擅长：'+item.goodAt}
                                </div>
                                <div className={'forth'}>

                                    <SetStars parent={this} number={item.serviceEvaluate}/>
                                    <div className={'forth'}>
                                        <div className={'one'}>
                                            满意度{item.satisfied.toFixed(1)}%
                                        </div>
                                        <div className={'slash'}>
                                        </div>
                                        <div className={'one'}>
                                            问诊量{item.questionnaireNum}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'docOther'}>
                            <div className={'one'}>回复{item.recoverySpeed}</div>
                            <div className={'one'}>图文问诊:
                                <span className={'price'}>￥{item.graphicInquiryPrice}</span>
                            </div>
                        </div>
                    </div>
                )
            })
        }
    }
    //获取对应疾病相关课程
    getCourseAbout(page=1,diseaseName){
        axios({
            url: URLconfig.publicUrl + '/appEducation/query.do',
            method: 'post',
            data:{
                "page": page,
                "limit": 3,
                'queryType':2,
                'queryContentType':1,
                'keywords':diseaseName,
                'drOrUser':1,
            },
            transformRequest: [function(data) {
                data = JSON.stringify(data)
                return data
            }],
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }).then((response) => {
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    aboutCourseList:response.data.data
                });
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }

     showTagStatus = (status, queryContentType, queryType) => {
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
     isGetImageTextPic = (rowData) => {
        //第三个判断是专为数据异常处理的
        if (rowData.image1 === null || rowData.image1 === '' || rowData.image1 === "data:image/jpeg;base64,") {
            return <img className={'setImage'} src={require("../images/cbcs_companion.png")} alt=""/>;
        } else {
            return <img className={'setImage'} src={config.publicStaticUrl + rowData.image1} alt=""/>;
        }
    };

    //语音
     setAudiosPic = (rowData) => {
        /* if (rowData.coverPic) {
             return <img className={'setImage'} src={config.publicStaticUrl + rowData.coverPic} alt=""/>
         } else {*/
        return <div className={'setImage isAudios'}>
            <img className={'disk'} src={require("../images/voice_yp_img.png")} alt=""/>
            <img className={'pointer'} src={require("../images/voice_play_img.png")} alt=""/>
        </div>;
        // }
    };

     changeQueryContentType = (rowData) => {
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
                return this.isGetImageTextPic(rowData);

            case 5:
                return this.setAudiosPic(rowData);

            default:
                return [...rowData]
        }
    };

    //展示报名人数or观看人数or阅读人数or收听人数，
    // 付费的 取enrollNum 不付费的取readingCount
    // rowData.queryContentType,rowData.readingCount,rowData.payCount,rowData.status,rowData.isgratis
    // queryContentType查询内容类型  1 全部  2 直播 3 视频 4 图文 5 语音
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
    //将字符串时长换算时分秒时间
     toSeconds = (duration) => {
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
     beforeRelease = (queryType, queryContentType, createDate, duration) => {
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
                                  className={'timeRemaining '}>时长{this.toSeconds(duration)}</span>
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
                                  className={'timeRemaining'}>时长{this.toSeconds(duration)}</span>
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


     getTimeRemain = (status, startingTime) => {
        //startTime 时间戳
        // startingTime=1571217481854
        let timestamp = (new Date()).getTime();
        if (startingTime && status === 20 && timestamp <= startingTime) {
            return "即将开播：" + moment(startingTime).endOf('minute ').fromNow();
        }
    };
    // isgratis 是否免费 1:免费 2:不免费

    //判断是否免费然后还有已报名/已观看/未观看/已阅读/已收听
    // isView 是否已观看/阅读/收听  0 未观看阅读/收听 1 已观看/阅读/收听
    //付费的  用 ispay 1未支付 2 已支付 支付了 就是已读 已看  免费的 就 enrollId这个
     isReportedOrDone = (isgratis, fee, enrollId, queryContentType, ispay, isView) => {
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


     //课程详情模块
    toDetailedInformation(detailId,queryContentType,isShare=0){
        this.props.history.push({pathname: `/detailedInformation/${detailId}/${queryContentType}/${isShare}/${0}`,});
    }

    //医生详情模块
    toDoctorDetailedInformation(doctorId){
        this.props.history.push({pathname: `/doctorDetailedInformation/${doctorId}/0/0`,});
    }

    //设置相关课程列表
    setCourseList(aboutCourseList){
        if(aboutCourseList.length===0){
            return(
                <NoContent parent={this} inner={'暂无相关课程'}/>
            )
        }
        else{
            return  aboutCourseList.map((item, index) => {
                return(
                    <div className={'courseList'} key={index} onClick={()=>{this.toDetailedInformation(item.id,item.queryContentType,0)}}>
                        <div style={{
                            padding: '10px', position: 'relative',
                            display: 'flex', background: 'rgba(250,251,254,1)',
                            borderRadius:'10px',
                        }}>
                            <div className={'setListImageArea'}>

                                {this.showTagStatus(item.status, item.queryContentType, item.queryType)}
                                {this.changeQueryContentType(item)}
                                {this.showHowManyPeople(item.queryContentType, item.readingCount, item.enrollNum, item.status, item.isgratis)}
                                {/*queryContentType,readingCount,payCount,status,isgratis*/}
                            </div>

                            <div style={{flex: '1'}} className={'setListRightArea'}>

                                <div><span className={'setListRightAreaTitle'}>{item.title}</span></div>

                                {item.queryType === 1 ? '' : this.beforeRelease(item.queryType, item.queryContentType, item.createDate, item.duration)}

                                <div style={{
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                    color: 'rgba(232, 84, 30, 1)',
                                    fontWeight: '400'
                                }}>{this.getTimeRemain(item.status, item.startingTime)}</div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    lineHeight: '15px',
                                    marginTop: '5px'
                                }}>
                                    <div style={{display: 'flex', width: "100%"}}>
                                        {this.isReportedOrDone(item.isgratis, item.amout, item.enrollId, item.queryContentType, item.ispay, item.isView)}
                                    </div>
                                </div>
                            </div>
                            <div style={{borderBottom: '1px solid #eee', padding: '5px 0'}}>
                            </div>
                        </div>
                    </div>
                )
            })
        }
    }


    //获取疾病详情
    getDiseaseDetail(id){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/diseaseDetail.do',
            method: 'post',
            data: {
                "diseaseId": id,
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
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    diseaseDetail:response.data.data.diseaseContent,
                    diseaseType:response.data.data.diseaseType,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //是否展开简介
    isSpread(spread){
        if(spread){
            this.setState({
                spread:false,
            })
        }else {
            this.setState({
                spread:true,
            })
        }
    };

    _showTag(isSpread){
        if(isSpread){
            return (
            <div>
                <div>收起详情</div>
                <Icon type="up" />
            </div>
            )
        }else{
            return (
            <div>
                <div>查看详情</div>
                <Icon type="down" />
            </div>
            )
        }
    }

    //当前疾病相关课程更多
    toMoreCourses(diseaseName){
        this.props.history.push({pathname: `/moreCourseList/${diseaseName}/noDocName/diseaseName/`,});
    }

    //当前疾病相关专家更多
    toMoreDoc(diseaseName,diseaseId,type){
        this.props.history.push({pathname: `/moreDocList/${diseaseName}/${diseaseId}/${type}`,});
    }


    render() {
        const{diseaseName,spread,diseaseDetail,aboutDocList,aboutCourseList,diseaseId}=this.state;
        return (
            <div className={'diseaseDetail'}>
                <HeaderNavBar title={diseaseName} isLight={'navBarHeaderLight'}/>
                <div className={'resume'}>
                    <div className={'title'}>简介</div>
                    <div className={spread?'content shows':'content hides'} >
                        {diseaseDetail}
                    </div>
                    <div className={diseaseDetail.length>110?'more':'hide'} onClick={()=>{this.isSpread(spread)}}>
                        {this._showTag(spread)}
                    </div>
                </div>
                <div className={'about'}>
                    <div className={'column'}>
                        <div className={'title'}>相关专家</div>
                        <div className={aboutDocList.length>0?'more':'hide'} onClick={()=>{this.toMoreDoc(diseaseName,diseaseId,'diseaseDetail')}}>
                            <div className={'font'}>更多</div>
                            <Icon type="ellipsis" size={'xxs'}/>
                        </div>
                    </div>
                    {aboutDocList&&this.setDocAboutList(aboutDocList)}
                </div>
                <div className={'about'}>
                    <div className={'column'}>
                        <div className={'title'}>相关课程</div>
                        <div className={aboutCourseList.length>0?'more':'hide'} onClick={()=>{this.toMoreCourses(diseaseName)}}>
                            <div className={'font'}>更多</div>
                            <Icon type="ellipsis" size={'xxs'}/>
                        </div>
                    </div>
                    {aboutCourseList&&this.setCourseList(aboutCourseList)}
                </div>
            </div>
        );
    }
}

DiseaseDetail.propTypes = {};

export default DiseaseDetail;