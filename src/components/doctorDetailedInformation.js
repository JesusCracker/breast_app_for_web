import React, {Component} from 'react';
import '../less/doctorDetailedInformation.less';
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import config from "../config/wxconfig";
import SetStars from "./setStars";
import {Icon, ListView, PullToRefresh, Tag,Modal} from "antd-mobile";
import moment from 'moment';

import noContentImg from "../images/no_content.png";
import {Link} from "react-router-dom";
import ReactDOM from "react-dom";
import qs from "qs";
import DownloadTips from "./downloadTips";
import DownloadArea from "./downloadArea";

const alert = Modal.alert;

class DoctorDetailedInformation extends React.Component {
    constructor(props) {
        super(props);
        const {doctorId,isShare,client} = this.props.match.params;

        this.state = {
            doctorId: doctorId,
            doctorDetail: '',
            goodAtSpread: false,
            expSpread: false,
            impressionTags: '',
            serviceEvaluate: 0,
            commentList: '',
            commentTotal: 0,
            subjectiveImpression: '',
            isShare:parseInt(isShare),
            client:parseInt(client),
            modal1: false,
            modal2: false,

        };
    }

    componentDidMount() {
        const {doctorId, subjectiveImpression,isShare,client} = this.state;

        this.getDocDetail(doctorId);
        this.getCustomerCommentTags(doctorId);
        this.getCommentList(doctorId)

    }

    //设置分享的缩略图
    _setThumbnail(coverPic){
        let imgUrl='';
        if(coverPic){
            imgUrl=config.publicStaticUrl + coverPic;
        }
        return imgUrl;
    }

    //设置分享title
    _setShareContent(content){
        return content.doctorTitle+','+content.doctorDepartment+'擅长：'+content.goodAt;
    }


    //获取患者评价标签
    getCustomerCommentTags(docId) {
        axios({
            url: URLconfig.publicUrl + '/app/docSubjectiveImpression.do',
            method: 'post',
            data: {
                "doctorId": docId,
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
                    impressionTags: response.data.data,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }

    getDocDetail(docId) {
        axios({
            url: URLconfig.publicUrl + '/appinquiry/doctorDetailById.do',
            method: 'post',
            data: {
                "doctorId": docId,
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
                    doctorDetail: response.data.data,
                    serviceEvaluate: response.data.data.serviceEvaluate,
                })

            }
            console.dir(this.state.doctorDetail)
            config.share2Friend('doctorDetailInformation', '', docId, `医生${this.state.doctorDetail.name}的主页`, this._setShareContent(this.state.doctorDetail),this._setThumbnail(this.state.doctorDetail.headicon));
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    showArrow(innerFont, spread) {
        if (innerFont && innerFont.length < 100) {
            return ('');
        } else {
            if (!spread) {
                return (<div className={'goodAtMore'}>
                    <Icon type="down"/>
                </div>)
            } else {
                return (<div className={'goodAtMore'}>
                    <Icon type="up"/>
                </div>)
            }

        }
    }


    showSpread(type, isSpread) {
        if (type === 'goodAtSpread') {
            if (isSpread === false) {
                this.setState({
                    goodAtSpread: true,
                })
            } else {
                this.setState({
                    goodAtSpread: false,
                })
            }
        }
        if (type === 'expSpread') {
            if (isSpread === false) {
                this.setState({
                    expSpread: true,
                })
            } else {
                this.setState({
                    expSpread: false,
                })
            }
        }
    }


    async tagsChange(selected,item) {
        const {doctorId}=this.state;
        // console.dir(selected);
       // console.dir(item.subjectiveImpression);
        if(selected){
          await this.setState({
                subjectiveImpression:item.subjectiveImpression
            })
        }else{
         await this.setState({
                subjectiveImpression:'',
            })
        }
       await this.getCommentList(doctorId,item.subjectiveImpression);

    }

    //设置标签
    setCommentTags(impressionTags) {
        return impressionTags.map((item, index) => {
            return (
                <Tag key={index} selected={false}  onChange={(selected) => { this.tagsChange(selected, item) }} >{item.subjectiveImpression}</Tag>
            )
        })
    }

    //获取评论列表
    getCommentList(docId) {
        const{subjectiveImpression}=this.state;
        axios({
            url: URLconfig.publicUrl + '/appglandular/hisDocappraiseList.do',
            method: 'post',
            data: {
                "docId": docId,
                "subjectiveImpression": subjectiveImpression,
                'page': 1,
                "limit": 999,
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
                console.dir(response);
                this.setState({
                    commentTotal: response.data.dataTotal,
                    commentList: response.data.data,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

     formatName(str) {
        return new Array(str.length).join('*') + str.substr(-1);
    }

    //设置评论列表
    setCommentList(commentList) {

        return  commentList.map((item, index) =>

                <div className={'comment'} key={index}>
                    <div className={'first'}>
                        <div className={'left'}>

                            <img className={'headerIcon'}  src={item.headicon&&item.headicon.indexOf('http') !== -1 ?item.headicon : config.publicStaticUrl+item.headicon} alt="" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
                            <div className={'name'}>{item.patName&&this.formatName(item.patName)}</div>
                        </div>
                        <div className={'date'}>{moment(item.createDate).format("YYYY/MM/DD")}</div>
                    </div>
                    <div className={'second'}>
                        {item.description}
                    </div>
                </div>
        )
    }

    //评价列表
    toDocCommentList(doctorId,commentTotal,heat,questionnaireNum,recoverySpeed,isShare){
        this.props.history.push({pathname: `/docCommentList/${doctorId}/${commentTotal}/${heat}/${questionnaireNum}/${recoverySpeed}/${isShare}`,});
    }

    //学习课程
    toMoreCourses(doctorId,doctorName){
        this.props.history.push({pathname: `/moreCourseList/${doctorId}/${doctorName}/doctorId/`,});
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

    //图文问诊
    toTeletext(doctorId){
        this.props.history.push({pathname: `/inquiry/${doctorId}`,});
    }

    render() {

        const {doctorId,doctorDetail,goodAtSpread,expSpread,impressionTags,serviceEvaluate,subjectiveImpression,commentList,commentTotal,heat,questionnaireNum,recoverySpeed,isShare,client}=this.state;



        return (

            <div className={'doctorDetailedInformation'}>
                <HeaderNavBar title={'医生主页'} isLight={'thirdStyle'}/>
                {isShare === 1 ? <DownloadTips client={parseInt(this.props.match.params.client)} whereIs={'doctorDetailedInformation'} contentType={'doctorDetailedInformation'} id={doctorId}/> : ''}

               <div className={'container'}>
                   <div className={'resume'}>
                       <div className={'docTag'}>
                           <div className={'docResume'}>
                               <div className={'header'}>
                                   {doctorDetail&&<img  src={doctorDetail&&doctorDetail.headicon.indexOf('http') !== -1 ?doctorDetail.headicon : config.publicStaticUrl+doctorDetail.headicon} alt="" onError={(e) => {
                                       e.target.onerror = null;
                                       e.target.src = require("../images/cover.png")
                                   }}/>}

                                   {/*<img  src={doctorDetail&&config.publicStaticUrl + doctorDetail.headicon} alt=""/>*/}
                                   <p>{doctorDetail.teachingTitle}</p>
                               </div>
                               <div className={'detail'}>
                                   <div className={'first'}>
                                       <div className={'title name'}>{doctorDetail.name}</div>
                                       <div className={'title'}>{doctorDetail.doctorTitle}</div>
                                   </div>
                                   <div className={'second'}>
                                       <div className={'title'}>{doctorDetail.hospital}</div>
                                       <div className={'title'}>{doctorDetail.doctorDepartment}</div>
                                   </div>
                                   <div className={'forth'}>
                                       <SetStars parent={this} number={serviceEvaluate}/>

                                       <div className={'forth'}>
                                           <div className={'one'}>
                                               满意度{typeof (doctorDetail.satisfied) === 'number' && (doctorDetail.satisfied)%1 === 0?doctorDetail.satisfied+'%':parseFloat(doctorDetail.satisfied).toFixed(1)+'%'}
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                           <div className={'docOther'}>
                               <div className={'one'}>
                                   <div className={'first percent'}>{typeof (doctorDetail.heat) === 'number' && (doctorDetail.heat)%1 === 0?doctorDetail.heat+'%':parseFloat(doctorDetail.heat).toFixed(1)+'%'}</div>
                                   <div>推荐热度</div>
                               </div>
                               <div className={'one'}>
                                   <div className={'first'}>{doctorDetail.questionnaireNum}</div>
                                   <div>问诊量</div>
                               </div>
                               <div className={'one'}>
                                   <div className={'first'}>{doctorDetail.recoverySpeed}</div>
                                   <div>回复速度</div>
                               </div>
                           </div>
                       </div>
                   </div>
                   <Modal
                       visible={this.state.modal1}
                       transparent
                       maskClosable={true}
                       onClose={this.onClose('modal1')}
                       title={<div className={'modalTitle'}>
                           下载选择
                           <span onClick={this.onClose('modal1')}>×</span>
                       </div>}

                       // footer={[{ text: 'Ok', onPress: () => { console.log('ok'); this.onClose('modal1')(); } }]}
                       // wrapProps={{ onTouchStart: this.onWrapTouchStart }}
                       // afterClose={() => { alert('afterClose'); }}
                   >
                       <div style={{height: 'auto', overflow: 'scroll', width: '400px'}}>
                           <div className={'client setTop setSlash setBottom'}>
                               <img src={require('../images/userapp_logo.png')} alt=""/>
                               <div className={'name'}>乳腺好大夫用户版</div>
                               <div className={'downLoad'} onClick={() => {
                                   this.downloadAPP(2)
                               }}>点击下载
                               </div>
                           </div>
                           <div className={'client setTop'}>
                               <img src={require('../images/doctorapp_logo.png')} alt=""/>
                               <div className={'name'}>乳腺好大夫医生版</div>
                               <div className={'downLoad'} onClick={() => {
                                   this.downloadAPP(1)
                               }}>点击下载
                               </div>
                           </div>
                       </div>
                   </Modal>

                   <div className={'about'}>
                       {isShare===1?
                           <div className={'onePart'} >
                           <img src={require('../images/xuexi.png')} alt=""/>
                           <div className={'name'}>学习课程</div>
                           <div className={'detail'}>{doctorDetail.educationNum}个课程</div>
                       </div>:
                           <div className={'onePart'} onClick={()=>{this.toMoreCourses(doctorId,doctorDetail.name)}}>
                           <img src={require('../images/xuexi.png')} alt=""/>
                           <div className={'name'}>学习课程</div>
                           <div className={'detail'}>{doctorDetail.educationNum}个课程</div>
                       </div>}

                       {isShare===1?
                           <div className={'onePart'}>
                               <img src={require('../images/tuwenwenz.png')} alt=""/>
                               <div className={'name'}>图文问诊</div>
                               <div className={'detail'}>￥{doctorDetail.graphicInquiryPrice}</div>
                           </div>:<div className={'onePart'} onClick={()=>this.toTeletext(doctorId)}>
                               <img src={require('../images/tuwenwenz.png')} alt=""/>
                               <div className={'name'}>图文问诊</div>
                               <div className={'detail'}>￥{doctorDetail.graphicInquiryPrice}</div>
                           </div>
                       }
                       <div className={'onePart closePart'}>
                           <img src={require('../images/phone_un.png')} alt=""/>
                           <div className={'name closeFontColor'}>电话问诊</div>
                           <div className={'detail closeFontColor'}>未开通</div>
                       </div>
                       <div className={'onePart closePart'}>
                           <img src={require('../images/shipin_un.png')} alt=""/>
                           <div className={'name closeFontColor'}>视频问诊</div>
                           <div className={'detail closeFontColor'}>未开通</div>
                       </div>
                   </div>
                   <div className={'goodAt mb'}>
                       <div className={'intro'}>
                           <img src={require('../images/shanchang.png')} alt=""/>
                           <div className={'title'}>专业擅长</div>
                       </div>

                       <div className={'inner '} onClick={()=>{this.showSpread('goodAtSpread',goodAtSpread)}}>
                           <div className={goodAtSpread?'threeLines shows':'threeLines hides'}>
                               {doctorDetail.goodAt}

                           </div>
                           {this.showArrow(doctorDetail.goodAt,goodAtSpread)}
                       </div>
                   </div>

                   <div className={'goodAt mb'}>
                       <div className={'intro'}>
                           <img src={require('../images/zhiyejingli.png')} alt=""/>
                           <div className={'title'}>执业经历</div>
                       </div>

                       <div className={'inner '} onClick={()=>{this.showSpread('expSpread',expSpread)}}>
                           <div className={expSpread?'threeLines shows':'threeLines hides'}>
                               {doctorDetail.introduction}
                           </div>
                           {this.showArrow(doctorDetail.goodAt,expSpread)}
                       </div>
                   </div>

                   <div className={'goodAt mb comments'}>
                       <div className={'intro'}>
                           <img src={require('../images/zhiyejingli.png')} alt=""/>
                           <div className={'title'}>患者评价（{commentTotal}）</div>
                           <div className={'all'} onClick={()=>this.toDocCommentList(doctorId,commentTotal,doctorDetail.heat,doctorDetail.questionnaireNum,doctorDetail.recoverySpeed,isShare)}>
                               <div>全部</div>
                               <Icon type="right"/>
                           </div>
                       </div>
                       <div className={'commentTags'}>
                           {impressionTags&&this.setCommentTags(impressionTags)}
                       </div>

                       <div className={'commentList'}>
                           {commentList&&this.setCommentList(commentList)}
                       </div>
                   </div>

                   {isShare===1?<div className={'goodAt mb'}>
                       <DownloadArea whereIs={'doctorDetailedInformation'} contentType={'doctorDetailedInformation'} id={doctorId}/>
                   </div>:''}


               </div>
            </div>
        );
    }
}

DoctorDetailedInformation.propTypes = {};

export default DoctorDetailedInformation;