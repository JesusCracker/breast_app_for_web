import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Tag, Toast} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import HeaderNavBar from "./headerNavBar";
import '../less/wikiChannel.less';


function onChange(selected) {
    console.log(`tag selected: ${selected}`);
}

class WikiChannel extends Component {
    constructor(props) {
        super(props);
        this.setDefaultChannel();
    }

    componentDidMount() {


    }

    //设置默认的频道
    //初始化
    setDefaultChannel(){
        var str = localStorage.channelList;
        if (str === '' || str === undefined) {
            const tages = [JSON.stringify({name: '名师推荐', selected: true}) + "|" + JSON.stringify({
                name: '文章',
                selected: true
            }) + '|' + JSON.stringify({name: '视频', selected: true}) + '|' + JSON.stringify({
                name: '音频',
                selected: true
            }) + '|' + JSON.stringify({name: '网址', selected: true})];
            localStorage.setItem('channelList', tages);
        }
    }

    //选择频道的时候本地储存
    tagsChange(selected, item) {
        if (selected) {
            item.selected = true;
            let {channelList} = localStorage;
            if (channelList === undefined) {
                localStorage.channelList = JSON.stringify(item);
            } else {
                let lista = new Array()
                lista = channelList.split('|');
                this.distinct(lista)
                let arr = [];
                for (let i = 0; i < lista.length; i++) {
                    arr.push(JSON.parse(lista[i]))
                }

                if (lista.length > 10) {
                    lista.splice(9)
                }
                /*channelList = JSON.stringify(item) + '|' + lista.filter(e => e !== JSON.stringify(item)).join('|');*/
                let sup = [];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].name === item.name) {
                        arr[i].selected = true;
                    }
                    sup.push(JSON.stringify(arr[i]));
                }
                channelList = sup.join('|');
                localStorage.channelList = channelList;
            }
            let list1 = localStorage.channelList.split('|');
            this.distinct(list1)
            Toast.success('订阅成功', 1);

        } else {
            item.selected = false;
            let {channelList} = localStorage;
            if (channelList === undefined) {
                localStorage.channelList = JSON.stringify(item);
            } else {
                let lista = new Array()
                lista = channelList.split('|');
                this.distinct(lista)
                let arr = [];
                for (let i = 0; i < lista.length; i++) {
                    arr.push(JSON.parse(lista[i]))
                }
                let sup = [];
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].name === item.name) {
                        arr[i].selected = false;
                    }
                    sup.push(JSON.stringify(arr[i]));
                }
                channelList = sup.join('|');
                localStorage.channelList = channelList;
                Toast.success('取消订阅成功', 1);
            }
        }
    }

    //数组去重（去除多条相同搜索数据）
    distinct(list) {
        return Array.from(new Set(list))
    }


    //设置评价标签
    setCommentTags() {
        var str = localStorage.channelList;
        var s = '';
        if (str === undefined || str === '') {
           /* //初始化
            const tages = [JSON.stringify({name: '名师推荐', selected: true}) + "|" + JSON.stringify({
                name: '文章',
                selected: true
            }) + '|' + JSON.stringify({name: '视频', selected: true}) + '|' + JSON.stringify({
                name: '音频',
                selected: true
            }) + '|' + JSON.stringify({name: '网址', selected: true})];
            localStorage.setItem('channelList', tages);*/
        } else {
            let list1 = str.split("|");
            let arr = [];
            for (let i = 0; i < list1.length; i++) {
                arr.push(JSON.parse(list1[i]))
            }
            let html_i = '';
            if (arr.length > 0) {
                {
                    return arr.map((item, index) => {
                            if (item) {
                                return (
                                    <Tag key={index} selected={item.selected} onChange={(selected) => {
                                        this.tagsChange(selected, item)
                                    }}>{item.name}</Tag>
                                );
                            }
                        }
                    )
                }
            }
        }


    }

    //将已设置的订阅标签展示出来
    storageReader() {

        var str = localStorage.channelList;
        var s = '';
        if (str === undefined) {
            return (
                <div className={'noneRecorder'}>暂无搜索记录</div>
            );
        } else {
            let list1 = str.split("|");
            let html_i = ''
            if (list1.length > 0) {
                {
                    return list1.map((item, index) => {
                            if (item) {
                                return (
                                    <Tag key={index} selected={true} onChange={(selected) => {
                                        this.tagsChange(selected, item)
                                    }}>{item}</Tag>
                                );
                            }
                        }
                    )
                }
            }
        }
    }

    render() {
        return (
            <ErrorBoundary>
                <DocumentTitle title='乳腺百科'>
                    <div className='wikiChannel' style={{background: '#fff'}}>
                        <HeaderNavBar title={'频道设置'} isLight={'navBarHeaderLight'} noIcon={true}/>
                        <div className={'allChannel'}>全部频道</div>
                        <div className={'channels'}>
                            <div className={'defaultChannel'}>
                                <p>收藏</p>
                                <p>热点</p>
                                <p>感兴趣</p>
                            </div>
                            <div className={'channelTages'}>
                                {this.setCommentTags()}
                            </div>
                        </div>


                    </div>

                </DocumentTitle>
            </ErrorBoundary>
        );
    }
}

export default WikiChannel