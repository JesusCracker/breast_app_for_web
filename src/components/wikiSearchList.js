import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast, Modal} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import '../less/polularScience.less'
import '../less/wiki.less'
import '../less/wikiList.less'
import '../less/wikiSearchList.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import {Player} from 'video-react';
import Audios from "./audios";
import moment from "moment";
import HeaderNavBar from "./headerNavBar";
import SearchBox from "./searchBox";

const alert = Modal.alert;

class WikiSearchList extends Component {
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
            title: "",
            isContain: false,
            type: 0,
            secondType: 1,
            audios: '',
            isPlaying: false,
            audiosIsClick: false,
            keyWords: '',
            hasRecorder: false,
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
        // config.share2Friend('myOrdersModule', '', '', '我的订单', '欢迎来到乳腺好大夫');
    }


    async searchLiveList() {
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


    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };

    //异常提示
    failToast(message) {
        Toast.fail(message, 2000);
    }

    //接口token失效时处理
    goSignWhenMissLoginToken = (status, message) => {
        if (status && message && status === 2 && message === '权限错误') {
            this.failToast(message);
            setTimeout(() => {
                this.goSign();
            }, 1000);
        }
    };


    genData = (isSearch) => {  //请求数据的方法
        const {title} = this.state;
        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/headline/newSearchList.do?' + `page=${this.pageNo}&limit=10&title=${title}&userType=1`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then((response) => {
            if (response.status === 200) {
                // this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                let result = response.data;
                // console.dir(result);

                if (result.status === 1) {
                    this.setState({
                        dataTotal: result.dataTotal,
                    });

                    if (result.dataTotal === 0||result.dataTotal===null) {
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
                    // console.dir(result);
                    // alert(result.message);
                    return false;
                }
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };


    onRefresh = async (event) => {

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

//调到文章详情
    toDetail(rowData) {
        if (rowData.type !== 6) {
            window.location.href = `http://www.aisono.cn/bdoctor/appview/detail.html?id=${rowData.id}&sourceType=${rowData.sourceType}&uuid=${rowData.uuid}&userType=1&source=${rowData.source}&loginToken=${localStorage.getItem('loginToken')}`
        } else {
            window.location.href = `${rowData.path}`
        }
    }

    //播放视频
    play(id) {
        this.setState({
            audiosIsClick: true,
        })

    }

    //获取audios控件的播放状态
    getAudiosState(isPlaying, audiosIsClick, id) {

        this.setState({
            isPlaying: isPlaying,
            audiosIsClick: audiosIsClick,
            audioId: id,
        });
    }

    onChange = (v) => {
        this.setState({title: v});
    };

    clear = () => {

        // console.dir(this.state);

        this.setState({title: ''}, () => {
            this.searchLiveList();
        });

    };

    getData = (v) => {
        if (v !== '') {
            this.storageRecorder(v);
        }
        this.setState({title: v, hasRecorder: true}, () => {
            this.searchLiveList();
        });
    };

    //保存搜索记录
    storageRecorder(keyword) {
        let {historyItems} = localStorage;
        if (historyItems === undefined) {
            localStorage.historyItems = keyword;
        } else {
            let lista = new Array()
            lista = historyItems.split('|');
            this.distinct(lista)
            if (lista.length > 10) {
                lista.splice(9)
            }
            historyItems = keyword + '|' + lista.filter(e => e !== keyword).join('|');
            localStorage.historyItems = historyItems;
        }
        let list1 = localStorage.historyItems.split('|');
        this.distinct(list1)
    }

    //数组去重（去除多条相同搜索数据）
    distinct(list) {
        return Array.from(new Set(list))
    }

    //获取点击的历史记录
    setKeyWords(e) {
        let keyWords = e.target.innerText;
        this.setState({title: keyWords}, () => {
            this.searchLiveList();
        });

    }

    //将搜索记录写入页面
    storageReader() {
        const {hasRecorder} = this.state;
        var str = localStorage.historyItems;
        var s = '';
        if (str === undefined && hasRecorder === false) {
            return (
                <div className={'noneRecorder'}>暂无搜索记录</div>
            );
        } else {
            let list1 = str.split("|");
            let html_i = ''
            if (list1.length > 0) {
                {
                    return list1.map((item, index) => {
                            return (
                                <div key={index} className={'item'} onClick={(e) => {
                                    this.setKeyWords(e)
                                }}>{item}</div>
                            );
                        }
                    )
                }
            }
        }
    }

    //清空storage
    deleteHistoryRecorder() {
        alert('搜索记录', '您真的要删掉所有搜索记录吗？', [
            {
                text: '是的',
                onPress: () => {
                    this.setState({
                        hasRecorder: false,
                    }, () => {
                        localStorage.removeItem('historyItems');
                    });

                }
            },
            {text: '让我想想', onPress: () => console.log('cancel')},
        ])
    }


    render() {

        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 10,
                }}
            />
        );


        //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
        const row = (rowData, sectionID, rowID) => {
            //  资源类型：1表示1个图片；2表示3个图片；3表示视频;4表示只有文字 5 音频 6网址
            if (rowData.type === 2) {
                return (
                    <div className={'hotPort'} onClick={() => this.toDetail(rowData)}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={'coverImage'}>
                            <img src={rowData.image ? rowData.image : require('../images/cover.png')} onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }} alt="" className={'first'}/>
                            <img src={rowData.image1 ? rowData.image1 : require('../images/cover.png')} alt=""
                                 className={'second'} onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
                            <img src={rowData.image2 ? rowData.image2 : require('../images/cover.png')} alt=""
                                 className={'third'} onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = require("../images/cover.png")
                            }}/>
                        </div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}>{rowData.reading_count}次</span>
                        </div>
                    </div>
                );
            } else if (rowData.type === 1) {
                return (
                    <div className={'article'} onClick={() => this.toDetail(rowData)}>
                        <div className={'firstLine'}>
                            <div className={'part'}>
                                <div className={'title'}>{rowData.title}</div>
                                <div className={'scan'}>
                                    <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                                    <span className={'scanNum'}>{rowData.reading_count}次</span>
                                </div>
                            </div>
                            <div className={'coverIcon'}>
                                <img src={rowData.image ? rowData.image : require('../images/doctor_defu.png')} alt=""
                                     onError={(e) => {
                                         e.target.onerror = null;
                                         e.target.src = require("../images/doctor_defu.png")
                                     }}/>
                            </div>
                        </div>
                    </div>

                )
            } else if (rowData.type === 4) {
                return (
                    <div className={'onlyFont'} onClick={() => this.toDetail(rowData)}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={'summary'}>{rowData.summary}</div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}> {rowData.reading_count} 次</span>
                        </div>
                    </div>
                )
            } else if (rowData.type === 3) {
                return (
                    <div className={'videos'}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={"videoPlayer"} style={{position: 'relative'}}
                             onClick={() => this.play(rowData.id)}>
                            <Player
                                playsInline
                                poster={rowData.image}
                                ref={player => {
                                    this.player = player;
                                }}
                                src={rowData.path}
                                videoId="video-1"
                            >
                            </Player>
                        </div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}> {rowData.reading_count} 次</span>
                        </div>
                    </div>
                )
            } else if (rowData.type === 5) {
                return <div className={'audios'}>
                    <div className={'title'}>{rowData.title}</div>
                    <div className={'tools'}>
                        <Audios parent={this} src={rowData.path} id={this.state.id} isPlaying={this.state.isPlaying}
                                audiosIsClick={this.state.audiosIsClick}/>
                        <div className={'scan'}>
                            {/*<img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>*/}
                            <span className={'scanNum'}> {rowData.reading_count} 次</span>
                        </div>
                    </div>
                    <div className={'note'}>
                        <span className={'date'}>{moment(rowData.createDate).format("MM月DD日")}</span>
                        <span className={'author'}>{rowData.author}</span>
                    </div>

                </div>
            } else if (rowData.type === 6) {
                return <div className={'ads'} onClick={() => this.toDetail(rowData)}>
                    <div className={'left'}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}>{rowData.reading_count}次</span>
                        </div>
                    </div>
                    <div className={'right'}>
                        <img src={rowData.image} alt=""/>
                    </div>
                </div>
            } else {
                return <div>暂无内容</div>
            }
        };


        return (
            <ErrorBoundary>
                {/*<ToDiagnosisList/>*/}
                <DocumentTitle title='乳腺百科'>
                    <div className='livelisttitlebox  wiki wikiList wikiSearchList'
                         style={{background: 'rgba(238,242,249,1)'}}>
                        <HeaderNavBar title={'乳腺百科'} isLight={'navBarHeaderLight'}/>
                        <SearchBox parent={this} placeholder={`请输入相关百科内容查找`} isFocus={true} value={this.state.title}/>
                        <div className={'historyRecorder'}>
                            <div className={'cnm'}>
                                <div className={'title'}>历史记录</div>
                                <div className={'icon'} onClick={() => this.deleteHistoryRecorder()}>
                                    <img src={require('../images/del_icon.png')} alt=""/>
                                </div>
                            </div>
                            <div className={'historyCollection'}>
                                {this.storageReader()}
                            </div>
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

                </DocumentTitle>
            </ErrorBoundary>
        );
    }
}

export default WikiSearchList
