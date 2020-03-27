import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import qs from 'qs';
import {Link} from "react-router-dom";
import '../less/moreDocList.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import HeaderNavBar from "./headerNavBar";
import SetStars from "./setStars";


class MoreDocList extends Component {
    constructor(props) {
        super(props);
        const { id,name,type } = this.props.match.params;

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });

        this.pageNo = 0 //定义分页信息
        // this.keyWords='';
        this.state = {
            whereType:type,
            name:name,
            id:parseInt(id),
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
        const { id,name } = this.state;
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;

        this.rData = (await this.genData('',id)).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });
        config.share2Friend('listModule','','','科普列表','欢迎来到苏逢锡诊所');
    }

    //根据不同的type，接口





    genData = (isSearch,id) => {  //请求数据的方法
        //第一个type是第一层navbar的type  第二个type是第二层navbar的type；
        // console.dir(this.state.type);
       const {whereType}=this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        return fetch(config.publicUrl + (whereType==='diseaseDetail'?`/appinquiry/questionDocList.do`:`/appinquiry/hospitalByhospitalIdList.do`),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json, text/plain, */*',

                },
                body: qs.stringify({
                    'page': this.pageNo,
                    "limit": 5,
                    'diseaseId':id,
                    'hospitalId':id,
                }),
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
        const { id} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...((await this.genData(true,id)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

    onEndReached = async (event) => {
        const {id} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...this.rData, ...((await this.genData('',id)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };


    render() {
        const {id,name,dataTotal}=this.state;

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

        const isFocusList = (rowData, sectionID, rowID) => {
            return (
                    <div className={'docTag'} key={rowID} >
                        <div className={'leftCorner'}>
                            <img className={'bgImg'} src={require('../images/recomened_icon.png')} alt=""/>
                            <div className={'score'}>{rowData.serviceEvaluate.toFixed(1)}</div>
                            <img className={'recommend'} src={require('../images/reconmend_icon.png')} alt=""/>
                        </div>
                        <div className={'docResume'}>
                            <div className={'header'}>
                                <img src={rowData.headicon&&rowData.headicon.indexOf('http') !== -1 ?rowData.headicon : config.publicStaticUrl+rowData.headicon} alt="" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = require("../images/cover.png")
                                }}/>
                                <p>{rowData.teachingTitle}</p>
                            </div>
                            <div className={'detail'}>
                                <div className={'first'}>
                                    <div className={'title'}>{rowData.name}</div>
                                    <div className={'title'}>{rowData.doctorTitle}</div>
                                </div>
                                <div className={'second'}>
                                    <div className={'title'}>{rowData.hospital}</div>
                                    <div className={'title'}>{rowData.doctorDepartment}</div>
                                </div>
                                <div className={'third'}>
                                    {'擅长：'+rowData.goodAt}
                                </div>
                                <div className={'forth'}>

                                    <SetStars parent={this} number={rowData.serviceEvaluate}/>
                                    <div className={'forth'}>
                                        <div className={'one'}>
                                            满意度{rowData.satisfied.toFixed(1)}%
                                        </div>
                                        <div className={'slash'}>
                                        </div>
                                        <div className={'one'}>
                                            问诊量{rowData.questionnaireNum}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'docOther'}>
                            <div className={'one'}>回复{rowData.recoverySpeed}</div>
                            <div className={'one'}>图文问诊:
                                <span className={'price'}>￥{rowData.graphicInquiryPrice}</span>
                            </div>
                        </div>
                    </div>
                // </div>
            )
        };


        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            return (
                <Link to={{
                    pathname: `/doctorDetailedInformation/${rowData.id}/0/0`
                }}>
                    <div className={'box'}>
                        {isFocusList(rowData, sectionID, rowID)}
                    </div>
                </Link>
            );
        };



        return (

            <ErrorBoundary>
                <div className='livelisttitlebox moreCoursesList' style={{background:'rgba(238,242,249,1)'}}>
                    <HeaderNavBar title={name} isLight={'navBarHeaderLight'} showDiseaseName={true} docOrCourse={'doctor'}/>
                    <div className={'totalCourseNum'}>
                        共发现{dataTotal&&dataTotal}位专家
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

export default MoreDocList