    import React , { Component } from 'react'
    import ReactDOM from 'react-dom'    //下拉刷新组件依赖react-dom，所以需要将其引进来
    import { Icon , InputItem , NavBar , PullToRefresh , ListView , Tabs , WhiteSpace ,Toast} from 'antd-mobile';
    import { StickyContainer , Sticky } from 'react-sticky';
    import moment from "moment";
    import { Link } from "react-router-dom";
    import '../css/liveList.css'
    import '../css/liveListHeader.css'
    import noContentImg from '../images/no_content.png';
    import config from "../config/wxconfig";
    import {} from '../i18n/local'
    import DocumentTitle from 'react-document-title'


    class ListContainer extends Component {
        constructor(props) {
            super(props);

            const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
                rowHasChanged: (row1 , row2) => row1 !== row2 ,
            });

            this.pageNo = 0 //定义分页信息
            // this.keyWords='';
            this.state = {
                dataSource ,
                refreshing: true ,
                isLoading: true ,
                height: document.documentElement.clientHeight ,
                useBodyScroll: false ,
                hasMore: true ,
                keyWords: "" ,
                isContain: false ,
                type: 0 ,
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
                dataSource: this.state.dataSource.cloneWithRows(this.rData) ,
                height: hei ,
                refreshing: false ,
                isLoading: false ,
            });
        }

        async changeContent(content) {
            this.setState({type: content.type});
            this.pageNo = 1; //定义分页信息
            this.rData = (await this.genData(true , content.type)).data;

            if (this.rData.length === 0) {
                this.setState({
                    isContain: false
                });
            }
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData) ,
                refreshing: false ,
                isLoading: false ,
            });

        }


        async searchLiveList() {
            const {keyWords} = this.state;
            const {type}=this.state
            this.pageNo = 1; //定义分页信息
            this.rData = (await this.genData(true,type)).data;
            // console.dir(this.rData)
            if (this.rData.length === 0) {
                this.setState({
                    isContain: false
                });
            }
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData) ,
                refreshing: false ,
                isLoading: false ,
            });
        }


        onVirtualKeyboardConfirm = (e) => {
            const keycode = e.keyCode;
            //不想删代码
            if (keycode === 13||!isNaN(keycode)) {
                e.preventDefault();
                this.searchLiveList();
               if(this.state.keyWords===''){
                   Toast.info(`请输入查询内容`, 2, null, true);
                   return false;
               }

            }
        };

        genData = (isSearch , type = 0) => {  //请求数据的方法

            // console.dir(this.state.type);

            if (isSearch) {
                this.pageNo = 1;    //每次下拉的时候pageNo++
            } else {
                this.pageNo++;    //每次下拉的时候pageNo++
            }
            return fetch(config.publicUrl + `liveTelecast/liveTelecastList.do` ,
                {
                    method: 'POST' ,
                    headers: {
                        // 'content-type': 'application/json',
                        'Accept': 'application/json, text/plain, */*' , 'Content-Type': 'application/x-www-form-urlencoded'
                    } ,
                    body: `page=${this.pageNo}&limit=5&title=${this.state.keyWords}&selectWhole=${type}`
                })
                .then(response => response.json())
                .then((result) => {
                    if (result.dataTotal !== 0) {
                        this.setState({
                            hasMore: true
                        });
                        return result

                    } else {

                        this.setState({
                            hasMore: false
                        });
                        return result
                    }
                })
                .catch(function (error) {
                    console.log('request failed' , error)
                })
        }


        onRefresh = async (event) => {
            const {type} = this.state;
            // load new data
            // hasMore: from backend data, indicates whether it is the last page, here is false
            if (this.state.isLoading && !this.state.hasMore) {
                return;
            }   //如果this.state.hasMore为false，说明没数据了，直接返回
            console.log('reach end' , event);
            this.setState({isLoading: true});
            this.rData = [ ...((await this.genData(true , type)).data) ];  //每次下拉之后将新数据装填过来
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData) ,
                isLoading: false ,
            });
        };

        onEndReached = async (event) => {
            const {type} = this.state;
            // load new data
            // hasMore: from backend data, indicates whether it is the last page, here is false
            if (this.state.isLoading && !this.state.hasMore) {
                return;
            }   //如果this.state.hasMore为false，说明没数据了，直接返回
            console.log('reach end' , event);
            this.setState({isLoading: true});
            this.rData = [ ...this.rData , ...((await this.genData('' , type)).data) ];  //每次下拉之后将新数据装填过来
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.rData) ,
                isLoading: false ,
            });
        };


        render() {

            const separator = (sectionID, rowID) => (
                <div
                    key={`${sectionID}-${rowID}`}
                    style={{
                        backgroundColor: '#F5F5F9' ,
                        height: 8 ,
                        borderTop: '1px solid #ECECED' ,
                        borderBottom: '1px solid #ECECED' ,
                    }}
                />
            );

            const changeStatus = (status) => {
                //10-待审核；20-待直播；30：直播中 40：已结束
                switch (status) {
                    case 20:
                        return <div style={{
                            display: 'flex' ,
                            position: 'absolute' ,
                            top: '-0.5px' ,
                            left: '-0.6px' ,
                            padding: '3px 5px 3px 5px' ,
                            backgroundColor: 'rgba(249, 189, 60, 1)' ,
                            color: 'rgba(255, 255, 255, 1)' ,
                            textAlign: 'center' ,
                        }}>
                            <span style={{fontSize: '12px'}}>报名中</span>
                        </div>;

                    case 30:
                        return <div style={{
                            display: 'flex' ,
                            position: 'absolute' ,
                            top: '-0.5px' ,
                            left: '-0.6px' ,
                            padding: '3px 5px 3px 5px' ,
                            color: 'rgba(255, 255, 255, 1)' ,
                            backgroundColor: 'rgba(249, 113, 60, 1)' ,
                            textAlign: 'center' ,
                        }}>
                            <span style={{fontSize: '12px'}}>直播中</span>
                        </div>;
                    // return <span style={{backgroundColor:'rgba(255,255,255,1)'}}>直播中</span>;
                    case 40:
                        return <div style={{
                            display: 'flex' ,
                            position: 'absolute' ,
                            top: '-0.5px' ,
                            left: '-0.6px' ,
                            padding: '3px 5px 3px 5px' ,
                            backgroundColor: 'rgba(169, 171, 175, 1)' ,
                            color: 'rgba(255, 255, 255, 1)' ,
                            textAlign: 'center' ,

                        }}>
                            <span style={{fontSize: '12px'}}>已结束</span>
                        </div>;
                    default:
                        return [ ...status ]
                }
            };

            const showData = (peopleNum = 0 , status) => {

                if (status === 20) {
                    // return peopleNum + '人报名';
                } else {
                    return peopleNum + '人观看';
                }
            };

            const isFree = (isgratis , fee) => {
                if (isgratis === 2) {
                    return <p style={{
                        color: 'rgba(232, 84, 30, 1)' ,
                        width: '40px' ,
                        height: '20px' ,
                        lineHeight: '20px' ,
                        textAlign: 'center' ,
                        fontSize: '16px' ,
                        margin: '0' ,
                        fontWeight: 600 ,
                    }}>{'￥' + fee}</p>
                } else {
                    return <p style={{
                        // backgroundColor: 'rgba(154, 224, 253, 0.39)' ,
                        color: 'rgba(60, 60, 60, 1)' ,
                        fontWeight: 600 ,
                        width: '40px' ,
                        height: '20px' ,
                        lineHeight: '20px' ,
                        textAlign: 'center' ,
                        fontSize: '15px' ,
                        margin: '0'
                    }}>免费</p>
                }
            };

            const getTimeRemain = (status , startingTime) => {
                //startTime 时间戳
                // startingTime=1571217481854
                let timestamp = (new Date()).getTime();
                if (startingTime && status === 20 && timestamp <= startingTime) {
                    return "即将开播：" +moment(startingTime).endOf('minute ').fromNow();
                }
            };

            //这里就是个渲染数据，rowData就是每次过来的那一批数据，已经自动给你遍历好了，rouID可以作为key值使用，直接渲染数据即可
            const row = (rowData , sectionID , rowID) => {
                // console.dir(rowData);

                return (
                    <Link to={{
                        pathname: `/details/${rowData.id}`
                    }}>
                        <div key={rowID} style={{padding: '0 16px' , borderBottom: '1px solid #eee'}}>
                            <div style={{
                                padding: '15px 0' , position: 'relative' ,
                                display: 'flex' ,
                            }}>
                                <div style={{
                                    position: 'relative' ,
                                    width: '100px' , height: '120px' , marginRight: '10px'
                                }}>
                                    {changeStatus(rowData.status)}
                                    <img style={{
                                        height: '100%' , width: '100%' ,
                                        display: 'block',objectFit: 'cover',
                                    }}
                                         src={config.publicStaticUrl + rowData.coverPic} alt=""/>

                                </div>

                                <div style={{flex: '1'}}>
                                    <div style={{
                                        display: 'flex' ,
                                        position: 'absolute' ,
                                        bottom: '15px' ,
                                        left: '0' ,
                                        paddingLeft: '20px'
                                    }}>
                                    </div>
                                    <div><span style={{
                                        marginBottom: '10px' ,
                                        fontSize: '15px' ,
                                        fontFamily: 'PingFangSC-Semibold,PingFangSC' ,
                                        overflow: 'hidden' ,
                                        textOverflow: 'ellipsis' ,
                                        display: '-webkit-box' ,
                                        fontWeight: 'bold' ,
                                        WebkitLineClamp: '2' ,
                                        WebkitBoxOrient: 'vertical' ,
                                        color: 'rgba(51,51,51,1)'
                                    }}>{rowData.title}</span></div>

                                    <div><span style={{
                                        marginBottom: '7px' ,
                                        fontSize: '14px' ,
                                        overflow: 'hidden' ,
                                        textOverflow: 'ellipsis' ,
                                        display: '-webkit-box' ,
                                        WebkitLineClamp: '2' ,
                                        WebkitBoxOrient: 'vertical' ,
                                        color: 'rgba(51,51,51,1)'
                                    }}>{rowData.name || '匿名'} <span
                                        style={{color: 'rgba(153, 153, 153, 1)'}}>/ 乳腺肿瘤专科</span>   </span></div>

                                    <div><span style={{
                                        marginBottom: '7px' ,
                                        fontSize: '14px' ,
                                        overflow: 'hidden' ,
                                        textOverflow: 'ellipsis' ,
                                        display: '-webkit-box' ,
                                        WebkitLineClamp: '2' ,
                                        WebkitBoxOrient: 'vertical' ,
                                        color: 'rgba(153, 153, 153, 1)'
                                    }}>{rowData.hospital}</span></div>

                                    <div style={{
                                        fontSize: '14px' ,
                                        overflow: 'hidden' ,
                                        textOverflow: 'ellipsis' ,
                                        display: '-webkit-box' ,
                                        WebkitLineClamp: '2' ,
                                        WebkitBoxOrient: 'vertical' ,
                                        color: 'rgba(232, 84, 30, 1)' ,
                                        fontWeight: '400'
                                    }}>{getTimeRemain(rowData.status , rowData.startingTime)}</div>
                                    {rowData.status === 20 && rowData.liveStatus === 1 ? <div style={{
                                        fontSize: '12px' ,
                                        overflow: 'hidden' ,
                                        textOverflow: 'ellipsis' ,
                                        display: '-webkit-box' ,
                                        WebkitLineClamp: '2' ,
                                        WebkitBoxOrient: 'vertical' ,
                                        color: 'rgba(68, 196, 251, 1)' ,
                                        backgroundColor: 'rgba(236, 247, 255, 1)' ,
                                        width: '50px' ,
                                        textAlign: 'center' ,
                                        padding: '3px 0' ,
                                        fontWeight: '400'
                                    }}>已报名</div> : ''}

                                    <div style={{
                                        display: 'flex' ,
                                        justifyContent: 'space-between' ,
                                        lineHeight: '15px' ,
                                        marginTop: '5px'
                                    }}>
                                        <div style={{display: 'flex',width:"100%"}}>
                                            {isFree(rowData.isgratis , rowData.fee)}
                                            <p style={{
                                                color: 'rgba(153, 153, 153, 1)' ,
                                                width: '100%' ,
                                                height: '20px' ,
                                                lineHeight: '20px' ,
                                                textAlign: 'right' ,
                                                fontSize: '14px' ,
                                                margin: '0'
                                            }}>{showData(rowData.readingCount , rowData.status)}</p>
                                        </div>
                                    </div>

                                </div>
                                <div style={{borderBottom: '1px solid #eee' , padding: '5px 0'}}>
                                </div>
                                {/*       <div style={{marginTop: '10px' , color: 'rgba(153, 153, 153, 1)' ,}}>查看直播
                                    <Icon type="right" style={{float: 'right'}}/>
                                </div>*/}

                            </div>
                        </div>
                    </Link>
                );
            };

            function renderTabBar(props) {
                return (<Sticky>
                    {({style}) => <div style={{...style , zIndex: 1}}><Tabs.DefaultTabBar {...props} /></div>}
                </Sticky>);
            }

            const tabs = [
                {title: '全部' , key: 't1' , type: 0} ,
                {title: '报名中' , key: 't2' , type: 2} ,
                {title: '直播中' , key: 't3' , type: 1} ,
                {title: '已结束' , key: 't4' , type: 6} ,
            ];

            return (
                <DocumentTitle title='直播列表'>
                <div className='livelisttitlebox'>
                    <NavBar mode="dark" style={{
                        height: '80px' ,
                        color: 'rgba(255,255,255,1)' ,
                        fontSize: '18px' ,
                        backgroundColor: 'rgba(66, 198, 255, 1)'
                    }}>

                        <div>
                            {/*    <h2 style={{margin:'0',fontSize:'18px',fontWeight:'500',textAlign:'center',marginBottom:'15px'}}>专家直播列表</h2>*/}
                            <InputItem
                                clear
                                onChange={(value) => {
                                    this.setState({keyWords: value})
                                }}
                                // onVirtualKeyboardConfirm={() => this.searchLiveList()}
                                // onBlur={() => this.searchLiveList()}

                                onKeyUp={this.onVirtualKeyboardConfirm}
                                moneyKeyboardAlign="left"
                                placeholder="请输入你要搜索的内容">

                                <Icon style={{width: '22px' , height: '22px'}} color={'#eee'} key="2" type="search"
                                      size={"xxs"} onClick={() => this.searchLiveList()}/>
                            </InputItem>


                        </div>

                    </NavBar>

                    <div>
                        <WhiteSpace/>
                        <StickyContainer>
                            <Tabs
                                tabs={tabs}
                                  activeTab={this.state.index}
                                  initialPage={'t1'}
                                  renderTabBar={renderTabBar}
                                  onTabClick={(activeTab) => this.changeContent(activeTab)}
                                  tabBarUnderlineStyle={{border: '2px rgb(66, 198, 255) solid',}}
                                tabBarActiveTextColor={'rgb(66, 198, 255)'}
                                tabBarTextStyle={{
                                    color: '#000000',
                                    fontFamily:'PingFangSC-Medium,PingFangSC',
                                    }}
                            >
                            </Tabs>
                        </StickyContainer>
                        <WhiteSpace/>
                    </div>


                    <ListView
                        renderSeparator={separator}
                        key={this.state.useBodyScroll ? '0' : '1'}
                        ref={el => this.lv = el}
                        dataSource={this.state.dataSource}
                        renderFooter={    //renderFooter就是下拉时候的loading效果，这里的内容随需求更改
                            () => (
                                    <div>

                                        <div>
                                            {this.state.hasMore ? '' :
                                                <div style={{dispaly: 'flex' , textAlign: 'center'}}><img src={noContentImg}
                                                                                                          style={{width: '100%'}}/><span>暂无内容</span>
                                                </div>}
                                        </div>

                                        {/*<div style={{padding: 30 , textAlign: 'center'}}>
                                      {this.state.isLoading&&this.state.hasMore ? 'Loading...' : 'Loaded'}
                                  </div>*/}
                                    </div>
                            )
                        }
                        renderRow={row}   //渲染上边写好的那个row
                        useBodyScroll={this.state.useBodyScroll}
                        style={this.state.useBodyScroll ? {} : {
                            height: this.state.height ,
                            // border: '1px solid #ddd',
                            margin: '0px 0' ,
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
            );
        }
    }

    export default ListContainer