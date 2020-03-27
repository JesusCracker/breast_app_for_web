import React, {Component} from 'react';
import HeaderNavBar from "./headerNavBar";
import '../less/docCommentList.less'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import {ListView, Popover, PullToRefresh, Tag} from "antd-mobile";
import noContentImg from "../images/no_content.png";
import {Link} from "react-router-dom";
import ReactDOM from "react-dom";
import config from "../config/wxconfig";
import qs from "qs";
import moment from "moment";
import SetStars from "./setStars";
import DownloadArea from "./downloadArea";

class DocCommentList extends React.Component {
    constructor(props) {
        super(props);
        const {doctorId, commentTotal, heat, questionnaireNum, recoverySpeed,isShare} = this.props.match.params;

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.pageNo = 0 //定义分页信息


        this.state = {
            doctorId: doctorId,
            commentTotal: commentTotal,
            heat: parseFloat(heat),
            questionnaireNum: questionnaireNum,
            recoverySpeed: recoverySpeed,
            subjectiveImpression: '',
            commentList: '',
            impressionTags: '',

            dataTotal: 0,
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
            isShare:parseInt(isShare),
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
        const {doctorId, subjectiveImpression} = this.state;
        this.getCustomerCommentTags(doctorId);
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;

        this.rData = (await this.genData('', doctorId)).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });

    }


    genData = (isSearch, doctorId) => {  //请求数据的方法
        const{subjectiveImpression}=this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + 'appglandular/hisDocappraiseList.do',
            method: 'post',
            data: {
                'page': this.pageNo,
                "limit": 5,
                'docId': doctorId,
                'subjectiveImpression': subjectiveImpression,
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
            if (response.status === 200) {
               let result=response.data;
                if (result.status === 1) {
                    this.setState({
                        dataTotal: result.dataTotal,
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

    onRefresh = async (event) => {
        const {doctorId} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...((await this.genData(true, doctorId)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

    onEndReached = async (event) => {
        const {doctorId} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...this.rData, ...((await this.genData('', doctorId)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };


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

    async tagsChange(selected, item) {
        const {doctorId,subjectiveImpression} = this.state;
        if(selected){
            await this.setState({
                subjectiveImpression:item.subjectiveImpression,
            });
        }else{
            await this.setState({
                subjectiveImpression:'',
            });
        }
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, doctorId, item.subjectiveImpression)).data;
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

    //设置评价标签
    setCommentTags(impressionTags) {
        return impressionTags.map((item, index) =>
            (
                <Tag key={index} selected={false} onChange={(selected) => {
                    this.tagsChange(selected, item)
                }}>{item.subjectiveImpression}</Tag>
            )
        )
    }

    //获取诊断结果
    showDiaogon = diagonoList => {
        let name = [];
        diagonoList.map((item, index) =>
            (
                item.name&&name.push(item.name+',')
            )
        );
       return name
    };


     showHospitalDetail=(diagonoList) => (
        <Popover mask
                 overlayClassName="fortest"
                 overlayStyle={{color: 'currentColor', padding: '1px'}}
                 visible={this.state.visible}
                 overlay={this.showDiaogon(diagonoList)}

              /*   align={{
                     overflow: {adjustY: 1, adjustX: 1},
                     offset: [0, 0],
                 }}
                 onVisibleChange={this.handleVisibleChange}
                 onSelect={this.onSelect}*/
                 align={{
                     overflow: {adjustY: 1, adjustX: 1},
                     offset: [0, 0],
                 }}
                 onVisibleChange={this.handleVisibleChange}
                 onSelect={this.onSelect}
        >
            <div>
                <div className={'hospitalAddress'}>{this.showDiaogon(diagonoList)}</div>
            </div>
        </Popover>
    );


    formatName(str) {
        return new Array(str.length).join('*') + str.substr(-1);
    }
    //获取评价列表

    setList(rowData, sectionID, rowID) {
        return <div className={'comment'} key={rowID}>
            <div className={'first'}>
                <div className={'left'}>
                    <img  className={'headerIcon'} src={rowData.headicon&&rowData.headicon.indexOf('http') !== -1 ?rowData.headicon : config.publicStaticUrl+rowData.headicon} alt="" onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require("../images/cover.png")
                    }}/>

                    {/*<img className={'headerIcon'} src={config.publicStaticUrl + rowData.headicon} alt=""/>*/}
                    <div className={'name'}>{rowData.patName&&this.formatName(rowData.patName)}</div>
                </div>
                <div className={'date'}>{moment(rowData.createDate).format("YYYY/MM/DD")}</div>
            </div>
            <div className={'second'}>
                {rowData.description}
            </div>
            <div className={'trd'}>
                <div className={'slash'}></div>
                <div className={'part2'}>
                    <div className={'one'}>
                        <div className={'apart'}>
                            <div className={'name'}>
                                问诊类型
                            </div>
                            <div className={'type'}>
                                图文问诊
                            </div>
                        </div>
                        <div className={'apart'}>
                            <div className={'name'}>
                                总体评价
                            </div>
                            <div className={'score'}>
                                <SetStars parent={this} number={rowData.serviceEvaluate}/>
                            </div>
                        </div>
                    </div>
                    <div className={'one'}>
                        <div className={'apart'}>
                            <div className={'name'}>
                                诊断结果
                            </div>
                            <div className={'results'}>

                                {rowData.diaogon&&this.showHospitalDetail(rowData.diaogon)}
                            </div>
                        </div>
                        <div className={'apart'}>
                            <div className={'name'}>
                                服务质量
                            </div>
                            <div className={'results'}>
                                {rowData.inquiryQualityString}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
            </div>
        </div>
    }


    render() {
        const {doctorId, commentTotal, heat, questionnaireNum, recoverySpeed, impressionTags,isShare} = this.state;

        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#fff',
                    height: 15,


                    /*   borderTop: '1px solid #ECECED',
                       borderBottom: '1px solid #ECECED',*/
                }}
            />
        );
        const row = (rowData, sectionID, rowID) => {
            console.dir(rowData);
            return (
                this.setList(rowData, sectionID, rowID)
            );
        };

        return (
            <div className={'docCommentList'}>
                <HeaderNavBar title={'评论列表'} isLight={'navBarHeaderLight'} number={commentTotal}/>
                <div className={'firsts'}>
                    <div className={'part'}>
                        <div className={'rate'}>{typeof (heat) === 'number' && (heat)%1 === 0?heat+'%':heat.toFixed(1)+'%'}</div>
                        <div>推荐热度</div>
                    </div>
                    <div className={'part'}>
                        <div className={'bd'}>{questionnaireNum}</div>
                        <div>问诊量</div>
                    </div>
                    <div className={'part'}>
                        <div className={'bd'}>{recoverySpeed}</div>
                        <div>回复速度</div>
                    </div>
                </div>

                <div className={'seconds'}>
                    {impressionTags && this.setCommentTags(impressionTags)}
                </div>

                <div className={'third'}>
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

                {isShare===1?<DownloadArea whereIs={'doctorDetailedInformation'} contentType={'doctorDetailedInformation'} id={doctorId}/>:''}
            </div>
        );
    }
}

DocCommentList.propTypes = {};

export default DocCommentList;