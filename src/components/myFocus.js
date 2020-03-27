import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast, Button} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import {Link} from "react-router-dom";
import '../less/polularScience.less'
import '../less/myFocus.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import ToDiagnosisList from "./toDiagnosisList";
import ToOrderList from './toOrderList';
import ToWiki from "./toWiki";
import ToEntryRecord from "./toEntryRecord";
import ToMyCollection from "./toMyCollection";
import ToMyRecord from "./toMyRecord";
import ToMyHistroyTrace from './toMyHistoryTrace'
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import ToLiveBroadCast from "./toLiveBroadCast";
import {
    withRouter
} from "react-router-dom"
import SearchBox from "./searchBox";

class myFocus extends Component {
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

    }


    async searchLiveList() {
        const {keyWords} = this.state;
        const {type, secondType} = this.state
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true)).data;
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

    genData = (isSearch) => {  //请求数据的方法
        //第一个type是第一层navbar的type  第二个type是第二层navbar的type；
        // console.dir(this.state.type);

        const {keyWords} = this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }

        return fetch(config.publicUrl + `appglandular/glandularList.do?name=${keyWords}&page=${this.pageNo}&&limit=5`,
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
                this.goSignWhenMissLoginToken(result.status,result.message);
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
        this.rData = [...((await this.genData(true)).data)];  //每次下拉之后将新数据装填过来
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
        this.rData = [...this.rData, ...((await this.genData('')).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };


    onChange = (value) => {
        this.setState({keyWords: value});

    };

    clear = () => {
        this.setState({keyWords: ''}, () => {
            this.searchLiveList();
        });

    };

    getData = (val) => {
        this.setState({keyWords: val});
        if (val === '') {
            this.searchLiveList();
        } else {
            this.searchLiveList();
        }
    };

    //设置class
    setTagClass(index) {
        if (index === 0) {
            return 'orange'
        } else if (index === 1) {
            return 'green'
        } else if (index === 2) {
            return 'blue';
        }
        else if(index===3){
            return 'default';
        }
    }

    //专家标签
    showTags(tags) {
        let arr = tags !== undefined && tags.split(',');
        if(arr.length>3){
            arr=arr.slice(0,3);
            arr.push('更多评价>>');
        }
        return arr && arr.map((item, index) => {
            if (item !== '') {
                return <div className={`tagss  ${this.setTagClass(index)}`} key={index}>
                    {item}
                </div>
            }

        })
    }


    render() {
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


        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            return (
                <Link to={{
                    pathname: `/doctorDetailedInformation/${rowData.attentionId}/0/0`
                }}>
                    <div className={'focusItem'} style={{backgroundColor: '#fff'}}>
                        <div className={'left'}>
                            <ul className={'menu'}>
                                <li className={'one'}>
                                    <div className={'ball'}></div>
                                    <div className={'title'}>发布</div>
                                    <div className={'number'}>{rowData.publishNum}</div>
                                </li>
                                <li className={'one'}>
                                    <div className={'ball green'}></div>
                                    <div className={'title'}>问诊</div>
                                    <div className={'number'}>{rowData.inquiryNum}</div>
                                </li>
                                <li className={'one'}>
                                    <div className={'ball green'}></div>
                                    <div className={'title'}>获赞</div>
                                    <div className={'number'}>{rowData.dzNum}</div>
                                </li>
                                <li className={'one'}>
                                    <div className={'ball green'}></div>
                                    <div className={'title'}>粉丝</div>
                                    <div className={'number'}>{rowData.fansNum}</div>
                                </li>
                            </ul>
                        </div>
                        <div className={'right'}>
                            <div className={'left1'}>
                                <img className={'headIcon'}
                                     src={rowData.headicon && rowData.headicon.indexOf('http') !== -1 ? rowData.headicon : config.publicStaticUrl + rowData.headicon}
                                     alt="" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = require("../images/cover.png")
                                }}/>
                                <div className={'sepc'}>
                                    <div className={'secArea'}>
                                        <div className={'name'}>{rowData.name}</div>
                                        <img src={require('../images/doctor_defi_icon.png')} className={'v'}/>
                                        <div className={'doctorTitle'}>{rowData.doctorTitle}</div>
                                    </div>
                                    <div className={'third'}>
                                        <div className={'hospital'}>{rowData.hospital}</div>
                                        <div className={'docDept'}>{rowData.doctorDepartment}</div>
                                    </div>
                                    <div className={'forthh'}>
                                        {this.showTags(rowData.subjectiveImpression)}
                                    </div>
                                </div>
                            </div>
                            <div className={'right1'}>
                                <div  className={'focus'}>已关注</div>
                                <div  className={'focus1'}>咨询</div>
                            </div>
                        </div>
                    </div>
                </Link>
            );
        };


        return (
            <ErrorBoundary>
                <DocumentTitle title='我的关注'>
                    <div className='livelisttitlebox myFocus' style={{background: 'rgba(238,242,249,1)'}}>
                        <SearchBox parent={this} placeholder={'请输入疾病/医院/医生'}/>
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

                </DocumentTitle>
            </ErrorBoundary>
        );
    }
}

export default withRouter(myFocus)
