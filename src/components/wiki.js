import React, {Component} from 'react'
import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
import {Icon, InputItem, NavBar, PullToRefresh, ListView, Tabs, WhiteSpace, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import '../less/polularScience.less'
import '../less/myOrders.less';
import '../less/wiki.less'
import noContentImg from '../images/no_content.png';
import config from "../config/wxconfig";
import {} from '../i18n/local'
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import {Player} from 'video-react';
import Audios from "./audios";
import moment from "moment";
import {
    NavLink,
    withRouter
} from "react-router-dom"

class Wiki extends Component {
    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        const {pathName}=this.props;

        /*console.dir(window.location.href.replace("?", "#").replace('type=',''))

        if (window.location.href.indexOf("?#") < 0) {

            window.location.href = window.location.href.replace("?", "#").replace('type=','');
            this.props.history.push({pathname: `/wikiSlide/`,});
        }*/


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
        };
    }

    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }


/*    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }*/

    async componentDidMount() {
        console.dir(this)
        // this.mounted();
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

            if (this.state.title === '') {
                Toast.info(`请输入查询百科内容`, 2, null, true);
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
        const {title, type} = this.state;
        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/headline/newTypeList.do?'+`page=${this.pageNo}&limit=5&type=3&userType=1`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }).then((response) => {
            if (response.status === 200) {
                // this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                let result = response.data;

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


    mounted() {

        // 要检索的字符串值没有出现，则该方法返回 -1。
        if (window.location.href.indexOf("?#") < 0) {
            // console.dir(window.location.href.replace("?", "#").replace('type=',''))

            window.location.href = window.location.href.replace("?", "#").replace('type=','');
            this.props.history.push({pathname: `/wikiSlide/`,});
        }
    }


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
        this.props.history.push(`/wikiSlide`);
    }


     scroll=()=>{

    }

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

    //到对应的type的list
    toContentList(title,type){
        this.props.history.push({pathname: `/wikiList/${title}/${type}/`,});

    }

    //输入框聚焦的时候
    getFocusStatus(){
        this.props.history.push({pathname: `/wikiSearchList/`,});
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


        return (
            <ErrorBoundary>
                {/*<ToDiagnosisList/>*/}
                <DocumentTitle title='乳腺百科'>
                    <div className='livelisttitlebox myOrders wiki' style={{background: 'rgba(238,242,249,1)'}}>
                        {/*<HeaderNavBar title={'我的订单'} isLight={'navBarHeaderLight'}/>*/}
                        <NavBar mode="dark" style={{
                            height: '70px',
                            color: 'rgba(255,255,255,1)',
                            fontSize: '18px',
                            backgroundColor: '#729DF2',

                        }}>

                          <div className={'searchBar'}>
                              <img src={require('../images/ruxbk_logo.png')} alt=""/>
                              <div className={'setInputStyle'}>
                                  {/*    <h2 style={{margin:'0',fontSize:'18px',fontWeight:'500',textAlign:'center',marginBottom:'15px'}}>专家直播列表</h2>*/}
                                  <InputItem

                                      clear
                                      onFocus={(value) => {
                                          this.getFocusStatus()
                                      }}
                                      // onVirtualKeyboardConfirm={() => this.searchLiveList()}
                                      // onBlur={() => this.searchLiveList()}

                                      // onKeyUp={this.onVirtualKeyboardConfirm}
                                      moneyKeyboardAlign="left"
                                      placeholder="请输入您要搜索的内容">

                                      <Icon style={{width: '22px', height: '22px'}} color={'rgba(165,165,165,1)'} key="2"
                                            type="search" size={"xxs"} onClick={() => this.searchLiveList()}/>
                                  </InputItem>

                              </div>
                          </div>
                        </NavBar>

                        <div className={'introduction'}>
                            <div className={'images'}>
                                <img onClick={()=>this.toContentList('医院介绍',12)} src={require('../images/hospital_profile_1.png')} alt=""/>
                                <img  onClick={()=>this.toContentList('医生介绍',13)} src={require('../images/doctor_introduce_1.png')} alt=""/>
                            </div>
                            <div className={'images second'}>
                                <img  onClick={()=>this.toContentList('NCCN指南',11)} src={require('../images/nccn_compasion_1.png')} alt=""/>
                                <img  onClick={()=>this.toContentList('CBCS指南',10)} src={require('../images/cbcs_companion_1.png')} alt=""/>
                            </div>
                        </div>

                        <div className={'typeArea'}>
                            <div className={'line'}>
                               <div className={'one'}  onClick={()=>this.toContentList('新闻资讯',1)}>
                                   <img src={require('../images/baike_news_icon.png')} alt=""/>
                                   <p>新闻资讯</p>
                               </div>
                                <div className={'one'}  onClick={()=>this.toContentList('政策法规',2)}>
                                    <img src={require('../images/baike_zcfg_icon.png')} alt=""/>
                                    <p>政策法规</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('临床路径',3)}>
                                    <img src={require('../images/baike_lclj_icon.png')} alt=""/>
                                    <p>临床路径</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('乳腺科普',4)}>
                                    <img src={require('../images/baike_breast_icon.png')} alt=""/>
                                    <p>乳腺科普</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('专家教学',5)}>
                                    <img src={require('../images/baike_teach_icon.png')} alt=""/>
                                    <p>专家教学</p>
                                </div>
                            </div>
                            <div className={'line seconds'}>
                                <div className={'one'}  onClick={()=>this.toContentList('专业会议',6)}>
                                    <img src={require('../images/baike_promeeting_icon.png')} alt=""/>
                                    <p>专业会议</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('乳腺专利',7)}>
                                    <img src={require('../images/baike_breast_zl_icon.png')} alt=""/>
                                    <p>乳腺专利</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('乳腺成果',8)}>
                                    <img src={require('../images/baike_result_icon.png')} alt=""/>
                                    <p>乳腺成果</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('专业文献',9)}>
                                    <img src={require('../images/baike_prowz_icon.png')} alt=""/>
                                    <p>专业文献</p>
                                </div>
                                <div className={'one'}  onClick={()=>this.toContentList('经验分享',14)}>
                                    <img src={require('../images/baike_expe_icon.png')} alt=""/>
                                    <p>经验分享</p>
                                </div>
                            </div>
                        </div>

                        <ListView
                            onScroll={this.scroll}

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

export default withRouter(Wiki)
