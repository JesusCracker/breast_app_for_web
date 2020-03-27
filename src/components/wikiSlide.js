import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast, Tag} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import {StickyContainer, Sticky} from 'react-sticky';
import moment, {min} from "moment";
import {Link} from "react-router-dom";
import '../less/polularScience.less'
import '../less/wikiSlide.less';
import '../less/wiki.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import ToDiagnosisList from "./toDiagnosisList";
import ToOrderList from './toOrderList';
import ToWiki from "./toWiki";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import {Player} from "video-react";
import Audios from "./audios";


class WikiSlide extends Component {
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
            type: 3,
            secondType: 1,
            hasCollected: false,
            tabs:'',
            audios: '',
            isPlaying: false,
            audiosIsClick: false,
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
        this.getChannelList();

        this.rData = (await this.genData()).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });
        // config.share2Friend('listModule', '', '', '科普列表', '欢迎来到苏逢锡诊所');
    }

    //获取type
    getType=(name)=>{
        let type=0;
        if(name==='收藏'){
            type=2;
        }
        else if(name==='热点'){
            type=3;
        }
        else if(name==='感兴趣'){
            type=4;
        }
        else if(name==='名师推荐'){
            type=5;
        }
        else if(name==='文章'){
            type=6;
        }
        else if(name==='视频'){
            type=7;
        }
        else if(name==='音频'){
            type=8;
        }
        else if(name==='网址'){
            type=10;
        }
        return type;
    };

    //获取频道列表
    getChannelList = () => {
        const str = localStorage.channelList;
        if (str === '' || str === undefined) {
            const tages = [JSON.stringify({name: '名师推荐', selected: true}) + "|" + JSON.stringify({
                name: '文章',
                selected: true
            }) + '|' + JSON.stringify({name: '视频', selected: true}) + '|' + JSON.stringify({
                name: '音频',
                selected: true
            }) + '|' + JSON.stringify({name: '网址', selected: true})];
            localStorage.setItem('channelList', tages);
            const tabs = [
                {title: '收藏', key: 't1', type: 2},
                {title: '热点', key: 't2', type: 3},
                {title: '感兴趣', key: 't3', type: 4},
                {title: '名师推荐', key: 't4', type: 5},
                {title: '文章', key: 't5', type: 6},
                {title: '视频', key: 't6', type: 7},
                {title: '音频', key: 't7', type: 8},
                {title: '网址', key: 't8', type: 10},
            ];

            this.setState({
                tabs:tabs
            });

        }else{
            let list1 = str.split("|");
            let arr = [],tabs =[{title: '收藏', key: 't1', type: 2},
                {title: '热点', key: 't2', type: 3},
                {title: '感兴趣', key: 't3', type: 4}];
            for (let i = 0; i < list1.length; i++) {
                arr.push(JSON.parse(list1[i]))
            }
            let html_i = '';
            if (arr.length > 0) {
                {
                  for(let i=0;i<arr.length;i++){
                    if(arr[i].selected){
                        tabs.push({title:arr[i].name,key:`t${i+4}`,type:this.getType(arr[i].name)})
                    }
                  }
                }
            }
            this.setState({
                tabs:tabs
            });
        }
    };


    async changeContent(content) {
        // console.dir(content.type);
        this.setState({type: content.type});
        const {secondType} = this.state;
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, content.type)).data;
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


    async searchLiveList() {
        const {keyWords} = this.state;
        const {type, secondType} = this.state
        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true, type)).data;
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


 /*   onVirtualKeyboardConfirm = (e) => {
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
    };*/

    genData = (isSearch,type = 3) => {  //请求数据的方法
        // const {title, type} = this.state;
        // console.dir(type);
        const {keyWords} = this.state;


        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/headline/newTypeList.do?' + `page=${this.pageNo}&limit=10&type=${type}&userType=1`,
            method: 'get',
            headers: {
                'loginToken': localStorage.getItem('loginToken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then((response) => {
            if (response.status === 200) {

                let result = response.data;
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
        const {type, secondType} = this.state;
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (this.state.isLoading && !this.state.hasMore) {
            return;
        }   //如果this.state.hasMore为false，说明没数据了，直接返回
        console.log('reach end', event);
        this.setState({isLoading: true});
        this.rData = [...((await this.genData(true, type)).data)];  //每次下拉之后将新数据装填过来
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
        this.rData = [...this.rData, ...((await this.genData('', type)).data)];  //每次下拉之后将新数据装填过来
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            isLoading: false,
        });
    };

//调到文章详情
    toDetail(rowData){
        if(rowData.type!==6){
            window.location.href=`http://www.aisono.cn/bdoctor/appview/detail.html?id=${rowData.id}&sourceType=${rowData.sourceType}&uuid=${rowData.uuid}&userType=1&source=${rowData.source}&loginToken=${localStorage.getItem('loginToken')}`
        }else{
            window.location.href=`${rowData.path}`
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

    //到频道列表
    toMyChannel=()=>{
        this.props.history.push({pathname: `/wikiChannel/`,});
    }
    //到搜索列表
    onFocus=()=>{
        this.props.history.push({pathname: `/wikiSearchList/`,});
    }

    render() {
        const {tabs}=this.state;

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
            //  资源类型：1表示1个图片；2表示3个图片；3表示视频;4表示只有文字 5 音频 6网址
            if(rowData.type===2){
                return (
                    <div className={'hotPort'} onClick={()=>this.toDetail(rowData)}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={'coverImage'}>
                            <img src={rowData.image} alt="" className={'first'}/>
                            <img src={rowData.image1} alt="" className={'second'}/>
                            <img src={rowData.image2} alt="" className={'third'}/>
                        </div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}>{rowData.reading_count}次</span>
                        </div>
                    </div>
                );
            }
            else if(rowData.type===1){
                return (
                    <div className={'article'}  onClick={()=>this.toDetail(rowData)}>
                        <div className={'firstLine'}>
                            <div className={'part'}>
                                <div className={'title'}>{rowData.title}</div>
                                <div className={'scan'}>
                                    <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                                    <span className={'scanNum'}>{rowData.reading_count}次</span>
                                </div>
                            </div>
                            <div className={'coverIcon'}>
                                <img src={rowData.image} alt=""/>
                            </div>
                        </div>
                    </div>

                )
            }
            else if(rowData.type===4){
                return (
                    <div className={'onlyFont'} onClick={()=>this.toDetail(rowData)}>
                        <div className={'title'}>{rowData.title}</div>
                        <div className={'summary'}>{rowData.summary}</div>
                        <div className={'scan'}>
                            <img src={require('../images/sb.png')} alt="" className={'scanIcon'}/>
                            <span className={'scanNum'}> {rowData.reading_count} 次</span>
                        </div>
                    </div>
                )
            }
            else if(rowData.type===3) {
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
            }
            else if(rowData.type===5){
                return <div className={'audios'}>
                    <div className={'title'}>{rowData.title}</div>
                    <div className={'tools'}>
                        <Audios parent={this} src={rowData.path} id={this.state.id} isPlaying={this.state.isPlaying}
                                audiosIsClick={this.state.audiosIsClick} isStopPlay={true}/>
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
            }
            else if(rowData.type===6){
                return <div className={'ads'} onClick={()=>this.toDetail(rowData)}>
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
            }
            else{
                return <div>暂无内容</div>
            }
        };

        function renderTabBar(props) {
            return (<Sticky>
                {({style}) => <div style={{...style, zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
            </Sticky>);
        }

        return (
            <ErrorBoundary>
                <ToDiagnosisList/>
                <ToOrderList/>
                <ToWiki/>
                <DocumentTitle title='乳腺百科'>
                    <div className='livelisttitlebox wikiSlide wiki' style={{background: 'rgba(238,242,249,1)'}}>
                        <NavBar mode="dark" style={{
                            height: '79px',
                            color: 'rgba(255,255,255,1)',
                            fontSize: '18px',
                            backgroundColor: '#fff'
                        }}>

                            <div className={'setInputStyle'}>
                                {/*    <h2 style={{margin:'0',fontSize:'18px',fontWeight:'500',textAlign:'center',marginBottom:'15px'}}>专家直播列表</h2>*/}
                                <InputItem
                                    clear
                                    // onChange={(value) => {
                                    //     this.setState({keyWords: value})
                                    // }}
                                    // onVirtualKeyboardConfirm={() => this.searchLiveList()}
                                    // onBlur={() => this.searchLiveList()}
                                    // onKeyUp={this.onVirtualKeyboardConfirm}
                                    onFocus={()=>this.onFocus()}
                                    moneyKeyboardAlign="left"
                                    placeholder="请输入您要搜索的内容">

                                    <Icon style={{width: '22px', height: '22px'}} color={'rgba(165,165,165,1)'} key="2"
                                          type="search" size={"xxs"} onClick={() => this.searchLiveList()}/>
                                </InputItem>
                                <div className={'tabs'}>
                                    <StickyContainer className={'StickyContainer'}>
                                       {tabs&&<Tabs
                                            tabBarBackgroundColor={'#fff'}
                                            tabs={tabs}
                                            activeTab={this.state.index}
                                            initialPage={'t2'}
                                            renderTabBar={renderTabBar}
                                            onTabClick={(activeTab) => this.changeContent(activeTab)}
                                            tabBarInactiveTextColor={'#000000'}
                                            tabBarActiveTextColor={'#000000'}
                                            tabBarActiveBackgroundColor={'red'}
                                        >
                                        </Tabs>}
                                        <div className={'more'} onClick={()=>{this.toMyChannel()}}>+</div>
                                    </StickyContainer>

                                </div>

                            </div>

                        </NavBar>

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

export default WikiSlide
