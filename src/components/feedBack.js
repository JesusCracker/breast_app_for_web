import React, {Component} from 'react';
import {List, TextareaItem, ImagePicker, Toast, Button} from 'antd-mobile';
import '../less/feedBack.less'
import HeaderNavBar from "./headerNavBar";
import axios from "axios";
import URLconfig from "../config/urlConfig";

const data = [];

class FeedBack extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            feedNames: [
                {name: '问诊相关', checked: false},
                {name: '挂号相关', checked: false},
                {name: '直播相关', checked: false},
                {name: '发帖相关', checked: false},
                {name: '登录/账号', checked: false},
                {name: '系统故障', checked: false},
                {name: '交互体验', checked: false},
                {name: '其他建议', checked: false}],
            feedType:'',
            files: data,
            multiple: true,
            comment:'',
        };
    }

    componentDidMount() {

    }


    getQuestion() {

    }

    itemClick(item,index){


        let list = this.state.feedNames;
        list.forEach(item=>{
            item.checked = false;
        });
        list[index].checked = true;
        this.setState({
            feedNames:list,
            feedType:item
        })
    }



    setFeedBack(feedName) {
        return feedName.length && feedName.map((item, index) => {
            return  <div className={item.checked ? 'piece active' : 'piece'} key={index} onClick={this.itemClick.bind(this,item,index)}>
                {item.name}
            </div>
        })
    }

    onChange = (files, type, index) => {
        console.log(files, type, index);
        if(files.length>5){
            Toast.fail('最多选择5张图片,请重新选择',3,()=>{
               /* this.setState({
                    files:[],
                });*/
            })
        }else{
            this.setState({
                files,
            },()=>{
                this.complexImage(files);
            });

        }
    };

    //获取反馈内容
    getInner=(value)=>{
        if(value!==null&&value!==''&&value!=='undefined'&&value!==undefined&&value!=='null'){
            this.setState({
                comment:value,
            })
        }else {
            Toast.info('反馈内容不为空',2)
        }
    };

    //结构化上传的图片
    complexImage(file){
        let newImgArr=[];
        for(let i=0;i<file.length;i++){
            newImgArr.push(file[i].url)
        }
        return newImgArr
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

    //发送意见反馈
    sendFeedBack=(feedType,comment,files)=>{
        if(feedType===''){
            Toast.info('请选择反馈类型')
            return;
        }
        else if(comment===''){
            Toast.info('请填写反馈内容')
            return;
        }

        axios({
            url: URLconfig.publicUrl + 'app/wxUserFeedback.do',
            method: 'post',
            data: {
                "type": feedType,
                "comment":comment,
                'image1':this.complexImage(files)[0],
                'image2':this.complexImage(files)[1],
                'image3':this.complexImage(files)[2],
                'image4':this.complexImage(files)[3],
                'image5':this.complexImage(files)[4],

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
                Toast.success('意见反馈成功',1);
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    render() {
        const {feedNames,feedType,files,type,comment,imgList} = this.state;
        return (
            <div className={'feedBack'}>
                <HeaderNavBar title={'意见反馈'} isLight={'navBarHeaderLight'}/>
                <div className={'content'} style={{height:'95%'}}>
                    <div className={'title'}>反馈类型</div>
                    <div className={'feedBackName'}>
                        {this.setFeedBack(feedNames)}
                    </div>
                    <div className={'innerContent'}>
                        <div className={'title'}>反馈内容</div>
                        <List>
                            <TextareaItem
                                onChange={(v) => { this.getInner(v)}}
                                autoHeight
                                rows={5}
                                count={100}
                                clear={true}
                                placeholder={'请至少输入10字以上的反馈内容，以便我们提供更好的服务'}
                            />
                        </List>
                    </div>
                    <div className={'innerContent'}>
                        <div className={'title'}>上传图片<span className={'title1'}>(最多上传五张)</span></div>
                        <ImagePicker
                            files={files}
                            onChange={this.onChange}
                            onImageClick={(index, fs) => console.log(index, fs)}
                            selectable={files.length < 5}
                            multiple={this.state.multiple}
                        />
                    </div>
                </div>
                <Button type="primary" className={'out'} onClick={()=>{this.sendFeedBack(feedType.name,comment,files)}}>提交</Button>
            </div>
        );
    }
}

FeedBack.propTypes = {};

export default FeedBack;
