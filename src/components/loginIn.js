import React, {Component} from 'react';
import '../less/loginIn.less'
import {InputItem, Toast, Button} from "antd-mobile";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import config from "../config/wxconfig";

class LoginIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            value: '',
            code: '',
            liked: true,
            count: 60,
            changeTitle: false,
        };

    }

    componentDidMount() {
        if (this.props.location.hash.indexOf('sets') !== -1) {
            this.setState({
                changeTitle: true
            })
        }
        // this.autoFocusInst.focus();
    }

    countDown() {
        const {count} = this.state;
        if (count === 1) {
            this.setState({
                count: 60,
                liked: true,
            });
        } else {
            this.setState({
                count: count - 1,
                liked: false,
            });
            setTimeout(this.countDown.bind(this), 1000);
        }
    }


    onErrorClick = () => {
        if (this.state.hasError) {
            Toast.info('请输入11位手机号');
        }
    }

    getCodeNumber = (code) => {
        this.setState({
            code,
        });

    };


    onChange = (value) => {
        if (value.replace(/\s/g, '').length < 11) {
            this.setState({
                hasError: true,
            });
        } else {
            this.setState({
                hasError: false,
            });
        }
        this.setState({
            value,
        });
    };

    checkPhoneNumber = (value) => {
        let number = value.replace(/\s/g, '');
        if (this.isPoneAvailable(number)) {

        } else {
            Toast.fail('输入的手机号码格式有误，请重新输入', 1, () => {
                this.setState({
                    value: '',
                })
            });

        }
    };

    //手机号码验证
    isPoneAvailable(str) {
        var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test(str)) {
            return false;
        } else {
            return true;
        }
    }

    //发送验证码
    sendMsg() {
        const {value, liked} = this.state;
        if (!liked) {
            return;
        }
        this.countDown();
        axios({
            url: URLconfig.publicUrl + '/app/phoneVeriCode.do',
            method: 'post',
            data: {
                "tel": value.replace(/\s/g, ''),
                "telType": 1
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
                Toast.success('发送成功', 1, () => {
                    this.setState({
                        code: response.data.data.code,
                    })
                })


            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    //登录OR修改
    loginOrEdit() {
        let {changeTitle, code, value} = this.state;
        let interFace = ''
        if (changeTitle) {
            interFace = `/app/wxEditUserName.do?userName=${value.replace(/\s/g, '')}&phoneCode=${code}`
        } else {
            interFace = '/app/login.do'
        }
        return interFace;

    }

    //登录
    sign = () => {
        const {code, value, changeTitle} = this.state;
        let param = '';
        if (!changeTitle) {
            param = {
                "username": value.replace(/\s/g, ''),
                "phoneCode": code,
            }
        }

        axios({
            url: URLconfig.publicUrl + this.loginOrEdit(),
            method: 'post',
            data: param,
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
                'loginToken': changeTitle && localStorage.getItem('loginToken'),
            }
        }).then((response) => {
            if (response.status === 200 && response.data.status === 1) {
                let all = response.data.data;
                if (changeTitle === false) {
                    localStorage.setItem('loginToken', all.loginToken);
                    localStorage.setItem('ringUser', all.ringUser);
                    localStorage.setItem('userId', all.userId);
                    localStorage.setItem('headicon', all.headicon);
                    localStorage.setItem('nickname', all.nickname);
                    this.props.history.push({pathname: `/`,});
                } else {
                    Toast.success('手机号码修改成功', 1);
                }


            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }

    render() {
        const {changeTitle} = this.state;

        return (
            <div className={'loginIn'}>
                <div className={'items'}>
                    <div className={'title'}>{changeTitle ? "修改手机号" : '欢迎你'}</div>
                    <InputItem
                        className={'phoneNum'}
                        maxLength={13}
                        clear={false}
                        type="phone"
                        placeholder="请输入手机号码"
                        error={this.state.hasError}
                        onErrorClick={this.onErrorClick}
                        onChange={this.onChange}
                        value={this.state.value}
                        onBlur={this.checkPhoneNumber}

                    />
                    <div className={'sec'}>
                        <InputItem
                            maxLength={6}
                            clear={false}
                            className={'checkCode'}
                            type="number"
                            placeholder="请输入验证码"
                            value={this.state.code}
                            onChange={this.getCodeNumber}
                        />
                        <Button disabled={this.state.liked ? false : true} type={"primary"} className={'sendMsg'}
                                onClick={() => {
                                    this.sendMsg()
                                }}>
                            {
                                this.state.liked
                                    ? '获取验证码'
                                    : `${this.state.count} 秒后重发`
                            }
                        </Button>
                    </div>
                    <div className={'third'}>
                        <Button type="primary" className={'signIn'} onClick={() => {
                            this.sign()
                        }}>{changeTitle ? '确定' : '登录'}</Button>
                    </div>
                </div>
            </div>
        );
    }
}

LoginIn.propTypes = {};

export default LoginIn;
