import React , { Component } from 'react'
import ReactDOM from 'react-dom'
import '../less/diagnosisList.less';
import SearchBox from '../components/searchBox'
import axios from 'axios';
import SetStars from "./setStars";
import NoContent from "./noContent";
import { Icon , InputItem , NavBar , PullToRefresh , ListView , Tabs , WhiteSpace ,Toast,Grid} from 'antd-mobile';
import { StickyContainer , Sticky } from 'react-sticky';
import moment from "moment";

import { Link } from "react-router-dom";
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import URLconfig from "../config/urlConfig";


class DiagnosisList extends Component {
    constructor(props) {
        super(props);
        this.pageNo = 0; //定义分页信息
        const {group} = this.props.match.params;
        console.dir(group);

        this.state = {
            group:group,
            page:1,
            recommendList:'',
            isRecommend:1,
            name:'',
            dataTotal:0,
            diseaseNum:0,
            hospitalNum:0,

        };
    }


    componentDidUpdate() {

    }

    componentDidMount() {
        this.getSupportDocList();
        this.getDiseaseHospitalNum();
    }


    getDiseaseHospitalNum(){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/diseaseHospitalNum.do',
            method: 'post',
            data: '',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    diseaseNum:response.data.data.diseaseNum,
                    hospitalNum:response.data.data.hospitalNum,

                })
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
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

    onChange= (value) => {
        this.setState({ name:value });

    };

    clear = () => {
        this.setState({ name: '' });
        this.getSupportDocList(1,1,'');
    };

    getData=(val)=>{
        this.setState({ name:val });
        if(val===''){
            this.getSupportDocList(1,1,val);
        }
        else{
            this.getSupportDocList(1,2,val);
        }

    };

    getSupportDocList(page=1,isRecommend=1,name='',another=false){
        const {group}=this.state;


        axios({
            url: URLconfig.publicUrl + '/appinquiry/inquiryRecommendList.do',
            method: 'post',
            data: {
                "page": page,
                "limit": 3,
                'isRecommend':isRecommend,
                'name':name,
                'teamSources':group||0,
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
                if(another&&response.data.data.length===0){
                    // Toast.info('没有更多了哟',2);
                    // setTimeout(() => {
                        this.getSupportDocList(1,isRecommend,name,another);
                        // Toast.hide();
                    // }, 100);
                }
                else{
                    this.setState({
                        recommendList:response.data.data,
                        dataTotal: response.data.dataTotal,
                        page:page,
                    })
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });

    }

    setRecommendList(recommendList){
        if(recommendList.length===0){
            return(
              <NoContent parent={this} inner={'暂无查询内容'}/>
            )
        }
        else{
            return  recommendList.map((item, index) => {
                return(
                    <Link to={{pathname: `/doctorDetailedInformation/${item.id}/0/0`}} key={index}>
                    <div className={'docTag'} >
                        <div className={'leftCorner'}>
                            <img className={'bgImg'} src={require('../images/recomened_icon.png')} alt=""/>
                            <div className={'score'}>{item.serviceEvaluate.toFixed(1)}</div>
                            <img className={'recommend'} src={require('../images/reconmend_icon.png')} alt=""/>
                        </div>
                        <div className={'docResume'}>
                            <div className={'header'}>
                                {/*<img  src={config.publicStaticUrl + item.headicon} alt=""/>*/}
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
                                    {item.goodAt}
                                </div>
                                <div className={'forth'}>

                                    <SetStars parent={this} number={item.serviceEvaluate}/>
                                    <div className={'forth'}>
                                        <div className={'one'}>
                                            满意度{typeof (item.satisfied) === 'number' && (item.satisfied)%1 === 0?item.satisfied+'%':item.satisfied.toFixed(1)+'%'}
                                            {/*满意度{item.satisfied.toFixed(1)}%*/}
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
                    </Link>
                )
            })
        }
    }

    render() {
        const {page,isRecommend,recommendList,name,dataTotal,diseaseNum,hospitalNum,group}=this.state;

        return (
            <DocumentTitle title='问诊列表'>
                <div className='diagnosisList'>
                    {group&&parseInt(group)===0?<div>
                        <SearchBox parent={this} placeholder={'请输入疾病/医院/医生'}/>
                        <div className={'searchArea'}>
                            <Link to={{pathname: `/diseasesList/`}}>
                                <div className={'half one'}>
                                    <img src={require('../images/breast_disease.png')} alt=""/>
                                    <div className={'font'}>
                                        <div className={'searchTitle'}>按疾病查找</div>
                                        <div className={'number'}>{diseaseNum}种乳腺疾病</div>
                                    </div>
                                </div>
                            </Link>
                            <Link to={{pathname: `/hospitalList/`}}>
                                <div className={'half'}>
                                    <img src={require('../images/hospital_brea.png')} alt=""/>
                                    <div  className={'font'}>
                                        <div className={'searchTitle'}>按医院查找</div>
                                        <div className={'number'}>{hospitalNum}家医院</div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>:''

                    }

                    <div className={'supportTitle'}>
                      <div className={'title'}>推荐医生</div>
                        <div className={'other'} onClick={()=>{this.getSupportDocList(page+1,isRecommend,name,true)}}>
                            <img src={require('../images/redo.png')} alt=""/>
                            <span>换一批</span>

                        </div>
                    </div>
                    <div className={'docList'}>
                        {recommendList&&this.setRecommendList(recommendList)}
                    </div>

                </div>
            </DocumentTitle>
        );
    }
}

export default DiagnosisList
