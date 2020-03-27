import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import '../less/polularScience.less'
import '../less/wiki.less'
import '../less/wikiList.less'
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

class WikiList extends Component {
    constructor(props) {
        super(props);
        const {type, title} = this.props.match.params;

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
            contentTitle: title,
            contentType: type,
            hzb: 0,
            ysb: 0,
            hlb: 0,
            rxjb: 0,
            rxyw: 0,
            yf: 0,
            jcjy: 0,
            zl: 0,
            hl: 0,
            kh: 0,
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


    onVirtualKeyboardConfirm = (e) => {
        const keycode = e.keyCode;
        //不想删代码
        if (keycode === 13 || !isNaN(keycode)) {
            e.preventDefault();
            this.searchLiveList();
            if (this.state.title === '') {
                Toast.info(`请输入查询的订单名称`, 2, null, true);
                return false;
            }

        }
    };

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
        const {contentTitle, contentType} = this.state;


        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/headline/newList.do?' + `page=${this.pageNo}&limit=10&type=${this.state.contentType}&userType=1`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            if (response.status === 200) {
                // this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                let result = response.data;
                console.dir(result);

                if (result.status === 1) {
                    this.setState({
                        dataTotal: result.dataTotal,
                    });

                    if (result.dataTotal === 0) {
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
        this.setState({keyWords: v});
    };

    clear = () => {
        this.setState({keyWords: ''});
    };

    getData = (v) => {
        this.setState({keyWords: v});

    };

    //临床路径切换医生版，患者版，护理版以及乳腺科普里面的所有
    changeType(type) {
        if (type) {
            if (parseInt(type) === 3) {
                this.setState({
                    contentType: type,
                    hzb: 1,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                })
            }
            if (parseInt(type) === 15) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 1,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 16) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 1,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 4) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 1,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 17) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 1,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 18) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 1,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 19) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 1,
                    zl: 0,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 20) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 1,
                    hl: 0,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 21) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 1,
                    kh: 0,
                }, () => {
                    this.searchLiveList()
                });
            }
            if (parseInt(type) === 22) {
                this.setState({
                    contentType: type,
                    hzb: 0,
                    ysb: 0,
                    hlb: 0,
                    rxjb: 0,
                    rxyw: 0,
                    yf: 0,
                    jcjy: 0,
                    zl: 0,
                    hl: 0,
                    kh: 1,
                }, () => {
                    this.searchLiveList()
                });
            }
        }
    }


    render() {
        const {contentTitle, contentType, hzb, ysb, hlb, rxjb, rxyw, yf, jcjy, zl, hl, kh} = this.state;
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
                    <div className='livelisttitlebox  wiki wikiList' style={{background: 'rgba(238,242,249,1)'}}>
                        <HeaderNavBar title={contentTitle} isLight={'navBarHeaderLight'}/>
                        {/*<SearchBox parent={this} placeholder={`请输入相关${contentTitle}查找`}/>*/}
                        {(parseInt(contentType) === 3 || parseInt(contentType) === 15 || parseInt(contentType) === 16) ?
                            <div className={'typeArea'}>
                                <div className={'line'}>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(3)
                                    }}>
                                        <img src={require('../images/hzb_icon.png')} alt=""/>
                                        <p className={parseInt(hzb) === 0 ? 'normal' : 'active'}>患者版</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(15)
                                    }}>
                                        <img src={require('../images/ysb_icon.png')} alt=""/>
                                        <p className={parseInt(ysb) === 0 ? 'normal' : 'active'}>医生版</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(16)
                                    }}>
                                        <img src={require('../images/hlb_icon.png')} alt=""/>
                                        <p className={parseInt(hlb) === 0 ? 'normal' : 'active'}>护理版</p>
                                    </div>
                                </div>
                            </div> : ''}
                        {/*乳腺科普------   4- 乳腺疾病  breast_source_encyclopedias（没值）   17: breast_medicine 乳腺药物  18  breast_source_encyclopedias预防 19：breast_test_exam  检查检验 20 ：breast_source_encyclopedias 治疗  21：breast_source_encyclopedias  护理  22：breast_source_encyclopedias  康复  （没值）*/}
                        {parseInt(contentType) === 4 || parseInt(contentType) === 17 || parseInt(contentType) === 18 || parseInt(contentType) === 19 || parseInt(contentType) === 20 || parseInt(contentType) === 21 || parseInt(contentType) === 22 ?
                            <div className={'typeArea1'}>
                                <div className={'line'}>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(4)
                                    }}>
                                        <img src={require('../images/rxjb_icon.png')} alt=""/>
                                        <p className={parseInt(rxjb) === 0 ? 'normal' : 'active'}>乳腺疾病</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(17)
                                    }}>
                                        <img src={require('../images/rxyw_icon.png')} alt=""/>
                                        <p className={parseInt(rxyw) === 0 ? 'normal' : 'active'}>乳腺药物</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(18)
                                    }}>
                                        <img src={require('../images/yf_icon.png')} alt=""/>
                                        <p className={parseInt(yf) === 0 ? 'normal' : 'active'}>预防</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(19)
                                    }}>
                                        <img src={require('../images/jyjc_icon.png')} alt=""/>
                                        <p className={parseInt(jcjy) === 0 ? 'normal' : 'active'}>检查检验</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(20)
                                    }}>
                                        <img src={require('../images/zl_icon.png')} alt=""/>
                                        <p className={parseInt(zl) === 0 ? 'normal' : 'active'}>治疗</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(21)
                                    }}>
                                        <img src={require('../images/hl.png')} alt=""/>
                                        <p className={parseInt(hl) === 0 ? 'normal' : 'active'}>护理</p>
                                    </div>
                                    <div className={'one'} onClick={() => {
                                        this.changeType(22)
                                    }}>
                                        <img src={require('../images/kf.png')} alt=""/>
                                        <p className={parseInt(kh) === 0 ? 'normal' : 'active'}>康护</p>
                                    </div>
                                </div>
                            </div> : ''}


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

export default WikiList
