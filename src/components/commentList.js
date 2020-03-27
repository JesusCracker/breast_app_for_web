import React, {Component} from 'react';
import axios from "axios";
import URLconfig from "../config/urlConfig";
import config from "../config/wxconfig";
import '../less/commentList.less';
import {Button, InputItem, Toast} from "antd-mobile";
import HeaderNavBar from "./headerNavBar";
import DownloadTips from "./downloadTips";

class CommentList extends React.Component {
    constructor(props) {
        super(props);
        const {postType, commentId, collectNum, dzNum, isDz, collectedIds, isExtend,id} = this.props.match.params;
        this.state = {
            id:parseInt(id),
            pageTitle: '评论回复',
            commentList: '',
            commentTotal:0,
            postType: parseInt(postType),
            commentId: commentId,
            collectNum: parseInt(collectNum),
            dzNum: parseInt(dzNum),
            isDz: parseInt(isDz),
            collectedIds: parseInt(collectedIds),
            isExtend: parseInt(isExtend),
            messageSendStatus:false,
        };

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

    //异常提示
    failToast(message) {
        Toast.fail(message, 2000);
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };


    //设置分享的缩略图
    _setThumbnail(coverPic){
        let imgUrl='';
        if(coverPic){
            imgUrl=config.publicStaticUrl + coverPic;
        }
        return imgUrl;
    }


    //获取列表信息
    getCommentList(postType, id, isExtend) {
        this.setState({
            messageSendStatus:false,
        })

        const {pageTitle,commentTotal} = this.state;
        axios({
            url: URLconfig.publicUrl + `/appglandular/getReplyDetailById.do?postType=${postType}&id=${id}&isExtend=${isExtend}&page=1&limit=999`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            // this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    commentList: response.data.data,
                    commentTotal:response.data.data.childrenReplys.length,
                    glandularArticleId: response.data.data.glandularArticleId,
                    replyRefer: response.data.data.userName,
                    replyUserId: response.data.data.userId,
                    replyUserType:response.data.data.commentatorType,
                    parentId: response.data.data.id,
                    coverPic:response.data.data.coverPic,
                    innerContent:response.data.data.innerContent,
                    title:response.data.data.title,

                });
                config.share2Friend('commentListModule',postType,this.state.id,this.state.title,this.state.innerContent,this._setThumbnail(this.state.coverPic));

                //评论回复详情
                this.inputRef.focus();
                setTimeout(() => {
                    this.inputRef.setState({
                        placeholder: `回复:${this.state.replyRefer}`
                    });
                }, 550)
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };

    componentDidMount() {
        this.setState({
            isShare:parseInt(this.props.match.params.isShare),
        });
        const {postType, commentId, isExtend,replyRefer} = this.state;
        this.getCommentList(postType, commentId, isExtend);

    }


    replyClass(name = '', glandularArticleId, commentatorType, postType, replyUserId = '', replyUserType = '', parentId = '') {
        // name===replyRefer 引用的用户昵称
        // glandularArticleId 主贴的id
        // content 内容
        // commentatorType 1:用户评论 2医生评论
        // postType 帖子类型 3：语音 5文章 6视频
        // replyUserId 被回复人Id
        // replyUserType 被回复人类型 1 用户 2 医生
        // parentId 每组首条评论id
        this.inputRef.focus();
        this.setState({
            'replyRefer': name,
            'glandularArticleId': glandularArticleId,
            'commentatorType': commentatorType,
            'postType': postType,
            'replyUserId': replyUserId,
            'replyUserType': commentatorType,
            'parentId': parentId,
        });
        setTimeout(() => {
            this.inputRef.setState({
                placeholder: `回复${name}:`
            });
        }, 0)
    }

    replyOrComment(replyUserName, content, userName, doctorId, replyUserId, replyUserType) {

        if (replyUserName) {
            return <div>
                回复：<span
                style={{color: '#6793F3'}}>{userName}{doctorId === replyUserId && replyUserType === 2 ? '（楼主）' : ''}</span>
                <span> {content}</span>
            </div>
        } else {
            return content;
        }
    }

    isLZ = (type) => {
        if(type==='firstClass'){
            return <span className={'lzTag'}>楼主</span>
        }
        if(type==='secondClass'){
            return <span className={'lz'}>楼主</span>
        }
    };


    setComments(commentsList) {
        if (commentsList) {
            return (<div className={'onePieceOfComment'}>
                <div className={'firstClass'}>
                    <div className={'commentsAll'}>
                        <div className={'commentsHeader'}>
                            <div className={'commentsName'}>
                                <img src={config.publicStaticUrl + commentsList.headicon} alt=""/>
                                <span className={'name'}>{commentsList.userName || commentsList.name}</span>
                                {commentsList.doctorId === commentsList.userId && commentsList.commentatorType === 2 ? this.isLZ('firstClass') : ''}
                            </div>
                            <div className={'commentsTime'}>{commentsList.publishTime}</div>
                        </div>
                        <div className={'commentsInner'}
                             onClick={() => this.replyClass(commentsList.userName, commentsList.glandularArticleId, commentsList.commentatorType, commentsList.postType, commentsList.userId, commentsList.replyUserType, commentsList.id)}>{commentsList.content}
                            <span className={'commentsInnerResponseNum'}>{commentsList.childrenNum} 回复</span>
                        </div>
                    </div>
                </div>
                {
                    commentsList.childrenReplys.map((item1, key1) =>
                        <div key={key1} className={'secondClass'}>
                            <div className={'commentsAll'}>
                                <div className={'commentsHeader'}>
                                    <div className={'commentsName'}>
                                        <img src={config.publicStaticUrl + item1.headicon} alt=""/>
                                        <span className={'name'}>{item1.userName || item1.name}</span>
                                        {item1.doctorId === item1.userId && item1.commentatorType === 2 ? this.isLZ('secondClass') : ''}
                                    </div>
                                    <div className={'commentsTime'}>{item1.publishTime}</div>
                                </div>
                                <div className={'commentsInner'}
                                     onClick={() => this.replyClass(item1.userName, item1.glandularArticleId, item1.commentatorType, item1.postType, item1.userId, item1.replyUserType, item1.parentId)}>
                                    {this.replyOrComment(item1.replyUserName, item1.content, item1.replyUserName, item1.doctorId, item1.replyUserId, item1.replyUserType)}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>)
        }
    }

    //收藏
    isCollected = (collectedIds, collectionType, collectNum) => {
        let {glandularArticleId} = this.state.commentList;
        if (collectedIds <= 0) {
            //收藏
            axios({
                url: URLconfig.publicUrl + '/upload/saveCollection.do',
                method: 'post',
                data: {
                    "collectedId": glandularArticleId,
                    "collectionType": collectionType,
                    "userType": 1,
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
                    if (response.data.status === 1) {
                        this.setState({
                            collectedIds: 1,
                            collectNum: collectNum + 1,
                        });
                        Toast.success('收藏成功', 1);
                    }
                }
            })
                .catch(function (error) {
                    alert(JSON.stringify(error));
                });
        } else {
            //取消收藏
            axios({
                url: URLconfig.publicUrl + '/upload/cancelCollection.do',
                method: 'post',
                data: {
                    "collectedId": glandularArticleId,
                    "collectionType": collectionType,
                    "userType": 1,
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
                    if (response.data.status === 1) {
                        this.setState({
                            collectedIds: 0,
                            collectNum: collectNum - 1,
                        })
                    }
                }
            })
                .catch(function (error) {
                    alert(JSON.stringify(error));
                });
        }
    };
    //当免费或已经给钱后进入详情的收藏样式
    _setCollectionWhenPayed = (collectionId, collectNum) => {

        if (collectionId <= 0) {
            return (
                <div className={'box1'}>
                    <img src={require('../images/sele_uncele_icon.png')} alt=""/>
                    <span>{collectNum}</span>
                </div>
            )
        } else {
            return (
                <div className={'box1'}>
                    <img src={require('../images/shoucang_.png')} alt=""/>
                    <span>{collectNum}</span>
                </div>
            )
        }
    };

    //点赞
    supportHeart = (collectionType, dzNum) => {
        let {glandularArticleId} = this.state.commentList;
        axios({
            url: URLconfig.publicUrl + '/appEducation/educationDz.do',
            method: 'post',
            data: {
                "educationId": glandularArticleId,
                "type": collectionType,
                "drOrUser": 1,
            },
            headers: {
                'Content-Type': 'application/json',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    isDz: true,
                    dzNum: dzNum + 1,
                });
                Toast.success('点赞成功', 1);
            }
            if (response.status === 200 && response.data.status === 2) {
                Toast.info(response.data.message);
                return false;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };

    _isSupportHeart = (dzNum, isDz) => {
        if (isDz) {
            return (
                <div className={'box1'}>
                    <img src={require('../images/xiangq_red.png')} alt=""/>
                    <span>{dzNum}</span>
                </div>
            )
        } else {
            return (
                <div className={'box1'}>
                    <img src={require('../images/xiangq_dianzan.png')} alt=""/>
                    <span>{dzNum}</span>
                </div>
            )
        }
    };

    //发送消息时候给状态等待
    waitingMessageSendStatus=(messageSendState,type='sendSuccess',message='loading...')=>{
        if (messageSendState === false && type === 'sending') {
            Toast.loading(message, 1);
        }
        if (messageSendState === true && type === 'sendSuccess') {
            Toast.success(message, 1);
        }
    };

    async sendComments() {
        const{messageSendStatus}=this.state;
        await this.waitingMessageSendStatus(messageSendStatus,'sending','发送中，请等待');
        //这里的keyWords就是评论内容
        // name===replyRefer 引用的用户昵称
        // glandularArticleId 主贴的id
        // content 内容
        // commentatorType 1:用户评论 2医生评论
        // postType 帖子类型 3：语音 5文章 6视频
        // replyUserId 被回复人Id
        // replyUserType 被回复人类型 1 用户 2 医生
        // parentId 每组首条评论id

        const {commentId, contentType, keyWords, replyRefer, glandularArticleId, commentatorType, postType, replyUserId, replyUserType, parentId,isExtend} = this.state;
        //默认参数值是第一次评论的时候

        axios({
            url: URLconfig.publicUrl + `/appglandular/comment.do`,
            method: 'post',
            data: {
                "content": keyWords,
                "glandularArticleId": glandularArticleId || commentId,
                "replyRefer": replyRefer,
                'commentatorType': 1,
                'postType': postType || contentType,
                'replyUserId': replyUserId,
                'replyUserType': replyUserType,
                'parentId': parentId,
            },
            headers: {
                'Content-Type': 'application/json',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {

            this.goSignWhenMissLoginToken(response.data.status,response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                this.setState({
                    keyWords:'',
                    messageSendStatus:true,
                });
                this.waitingMessageSendStatus(this.state.messageSendStatus,'sendSuccess','发送成功');
                this.getCommentList(postType, commentId,isExtend);
                this.inputRef.setState({
                    value: ``,
                    placeholder: `回复${replyRefer}:`
                });
            }
            if (response.status === 200 && response.data.status === 2) {
                Toast.fail(response.data.message);

                /*   this.inputRef.setState({
                       value: ``,
                       placeholder: `回复${replyRefer}:`
                   });*/
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //发送评论
    onVirtualKeyboardConfirm = (e) => {
        const keycode = e.keyCode;
        const {keyWords} = this.state;

        if (keyWords === '') {
            Toast.info(`请输入评论内容`, 2, null, true);
            return false;
        } else {
            this.sendComments();
        }
        /*  if (keycode === 13 && !isNaN(keycode)) {
              e.preventDefault(); //安卓上点击穿透


          }*/
    };

    //键盘收起&修复键盘所占区域高度
    inputBlurHandle = () => {
        window.scroll(0, 0);
    };

    render() {
        const {commentList, postType, commentId, collectNum, dzNum, isDz, collectedIds, pageTitle,commentTotal,isShare} = this.state;
        return (
            <div>
                <HeaderNavBar title={pageTitle} number={commentTotal}/>
                {isShare===1?<DownloadTips whereIs={'commentListModule'} contentType={postType} id={this.props.match.params.id}/>:''}
                <div className={'forthPart'}>
                    {this.state.commentList && this.setComments(commentList)}
                </div>
                <div className={'buttonArea'}>
                    <div className={'commentsBox'}>
                        <InputItem
                            ref={el => this.inputRef = el}
                            placeholder="请输入评论"
                            // onKeyUp={this.onVirtualKeyboardConfirm}
                            onChange={(value) => {
                                this.setState({keyWords: value})
                            }}
                            onBlur={this.inputBlurHandle}
                        />
                        <Button className={'sendCommentBtn'} onClick={this.onVirtualKeyboardConfirm}>发送</Button>
                    </div>
                    <div className={'clickBox'}>
                        <div className={'box1 setBox1Margin'}
                             onClick={() => this.isCollected(collectedIds, commentList.postType, collectNum)}>
                            {this._setCollectionWhenPayed(collectedIds, collectNum)}
                        </div>
                        <div className={'box1'} onClick={() => this.supportHeart(commentList.postType, dzNum)}>
                            {this._isSupportHeart(dzNum, isDz)}
                        </div>
                    </div>

                </div>
            </div>

        );
    }
}

CommentList.propTypes = {};

export default CommentList;
