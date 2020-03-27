import React, {Component} from 'react';
import HeaderNavBar from "./headerNavBar";
import {Button, Modal, Toast ,Icon} from 'antd-mobile';
import axios from 'axios';
import qs from 'qs';
import '../less/hospitalDetail.less';
import URLconfig from "../config/urlConfig";
import NoContent from "./noContent";
import config from "../config/wxconfig";
import SetStars from "./setStars";
import moment from "moment";
import DetailedInformation from "./detailedInformation";
const alert = Modal.alert;

class HospitalDetail extends React.Component {
    constructor(props) {
        super(props);
        const { hospitalId,hospitalName} = this.props.match.params;
        this.state = {
            hospitalId:parseInt(hospitalId),
            hospitalName:hospitalName,

            spread:false,
            hospitalDetail:'',
            hospitalType:0,
            aboutDocList:'',
            aboutCourseList:'',

        };
    }

    componentDidUpdate() {

    }

    componentDidMount() {
        const {hospitalId,hospitalName}=this.state;
        this.getHospitalDetail(hospitalId);
        this.getDocAbout(1,hospitalId);
    }

    //获取医院详情
    getHospitalDetail(id){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/hospitalDetail.do',
            method: 'post',
            data: {
                "hospitalId": id,
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
                console.dir(response.data.data);

                this.setState({
                    hospitalDetail:response.data.data.hosIntro,
                    hospitalType:response.data.data.hospitalType,
                })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //获取对应疾病专家
    getDocAbout(page=1,hospitalId){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/hospitalByhospitalIdList.do',
            method: 'post',
            data: {
                "page": page,
                "limit": 3,
                'hospitalId':hospitalId,
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

    //医生详情模块
    toDoctorDetailedInformation(doctorId){
        this.props.history.push({pathname: `/doctorDetailedInformation/${doctorId}/0/0`,});
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


    //当前医院相关专家更多
    toMoreDoc(hospitalName,hospitalId,type){
        this.props.history.push({pathname: `/moreDocList/${hospitalName}/${hospitalId}/${type}`,});
    }


    render() {
        const{hospitalName,spread,hospitalDetail,aboutDocList,hospitalId}=this.state;
        return (
            <div className={'diseaseDetail'}>
                <HeaderNavBar title={hospitalName} isLight={'navBarHeaderLight'}/>
                <div className={'resume'}>
                    <div className={'title'}>医院简介</div>
                    <div className={spread?'content shows':'content hides'} >
                        {hospitalDetail}
                    </div>
                    <div className={hospitalDetail.length>110?'more':'hide'} onClick={()=>{this.isSpread(spread)}}>
                        {this._showTag(spread)}
                    </div>
                </div>
                <div className={'about'}>
                    <div className={'column'}>
                        <div className={'title'}>医生列表</div>
                        <div className={aboutDocList.length>0?'more':'hide'} onClick={()=>{this.toMoreDoc(hospitalName,hospitalId,'hospitalDetail')}}>
                            <div className={'font'}>更多</div>
                            <Icon type="ellipsis" size={'xxs'}/>
                        </div>
                    </div>
                    {aboutDocList&&this.setDocAboutList(aboutDocList)}
                </div>
            </div>
        );
    }
}

HospitalDetail.propTypes = {};

export default HospitalDetail;