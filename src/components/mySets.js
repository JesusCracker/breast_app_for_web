import React, {Component} from 'react';
import {List, Button, ImagePicker, Toast,Modal} from 'antd-mobile';

import '../less/mySets.less'
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import config from "../config/wxconfig";

const Item = List.Item;
const Brief = Item.Brief;
const prompt = Modal.prompt;
const alert=Modal.alert;
const data = [];

class MySets extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nickname: '',
            headicon: '',
            userName: '',
            files: data,
            multiple: false,
        };

    }

    componentDidMount() {
        this.getUserInfo();
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
        Toast.fail(message, 2);
    }

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };

    //获取用户信息
    getUserInfo = () => {

        let loginToken = localStorage.getItem('loginToken');
        axios({
            url: URLconfig.publicUrl + '/app/getUserByLoginToken.do',
            method: 'post',
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
                "loginToken": loginToken,
            }
        }).then((response) => {

            if (response.status === 200 && response.data.status === 1) {
                this.goSignWhenMissLoginToken(response.data.status, response.data.message);
                /*  enrollNum 报名数
                  collectionNum 收藏数
                  watchNum历史数
                  attentionNum关注数*/
                let data = response.data.data;
                this.setState({
                    nickname: data.nickname,
                    files:[ {'url':data.headicon && data.headicon.indexOf('http') !== -1 ? data.headicon : config.publicStaticUrl + data.headicon}],
                    userName: data.userName,
                })
            } else {
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    changeImg=(file)=>{
        axios({
            url: URLconfig.publicUrl + 'app/wxEditHeadicon.do',
            method: 'post',
            data: {
                "headicon": file,

            },
           /* transformRequest: [function (data) {
                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],*/
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
                Toast.success('头像修改成功',1);
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    onChange = (files, type, index) => {
        console.log(files, type, index);
        this.setState({
            files,
        },()=>{
            files.length&&this.changeImg(files[0].url)

        });

    };
    //改变昵称
    changeNickName=(nickName)=>{
        axios({
            url: URLconfig.publicUrl + `app/wxEditNickname.do?nickname=${nickName}`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'loginToken': localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            this.goSignWhenMissLoginToken(response.data.status, response.data.message);
            if (response.status === 200 && response.data.status === 1) {
               Toast.success('修改'+response.data.message,1,()=>{
                   this.getUserInfo();
               });
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //改变昵称
    editNickName=(nickName)=>{
        prompt('修改昵称', '', [
            { text: '取消' },
            { text: '确认', onPress: value => this.changeNickName(value) },
        ], 'default', `${nickName}`,'')
    };

    //修改手机号码
    changePhoneNumber=()=>{
        this.props.history.push({pathname: `/loginIn?#form=sets`,});
    }

    //意见反馈
    feedback=()=>{
        this.props.history.push({pathname: `/feedBack`,});
    }

    //关于我们
    ahoutus=()=>{
        this.props.history.push({pathname: `/aboutUs`,});
    }

    //退出登录
    signOut=()=>{
        alert('乳腺好大夫', '您要退出登录嘛？', [
            {
                text: '是的',
                onPress: () =>
                {
                    localStorage.removeItem('loginToken');
                    this.props.history.push({pathname: `/loginIn/`,});
                }
            },
            {text: '让我想想', onPress: () => console.log('cancel')},
        ])
    }
    render() {
        const {headicon, nickname, userName,files } = this.state;

        return (
            <div className={'mySets'}>
                <HeaderNavBar title={'设置'} isLight={'navBarHeaderLight'}/>


                <List renderHeader={() => ''}>
                    <Item
                        arrow="horizontal"
                        onClick={() => {
                        }}
                        extra={<div>
                            <ImagePicker
                                files={files}
                                onChange={this.onChange}
                                onImageClick={(index, fs) => console.log(index, fs)}
                                selectable={files.length < 1}
                                multiple={this.state.multiple}
                                length={1}

                            />
                        </div>}
                    >头像</Item>
                    <Item
                        extra={<div>
                            {nickname}
                        </div>}
                        onClick={() => {this.editNickName(nickname)}}
                        arrow="horizontal"
                    >昵称
                    </Item>
                    <Item
                        arrow="horizontal"
                        onClick={() => {this.changePhoneNumber()
                        }}
                        extra={<div>
                            {userName}
                        </div>}
                    >手机号码</Item>
                </List>
                <List renderHeader={() => ''}>
                    <Item
                        arrow="horizontal"
                        onClick={() => {this.ahoutus()}}>关于我们</Item>
                    <Item
                        arrow="horizontal"
                        onClick={() => {this.feedback()}}
                    >意见反馈</Item>
                </List>
                <Button type="primary" className={'out'} onClick={()=>{this.signOut()}}>退出登录</Button>
            </div>
        );
    }
}

MySets.propTypes = {};

export default MySets;
