import React, {Component} from 'react';
import '../less/diseasesList.less';
import axios from 'axios';
import {NavBar, Icon, SearchBar, ListView, Tabs, Flex, Button, Grid, Toast} from 'antd-mobile';
import noContentImg from "../images/no_content.png";
import {Link} from "react-router-dom";
import config from "../config/wxconfig";
import URLconfig from "../config/urlConfig";
import SearchBox from "./searchBox";



class DiseasesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            diseasesType:0,
            diseaseName:'',
            btnIsActive1:false,
            btnIsActive2:false,
            btnIsActive3:false,
            dataTotal:0,

        };

    }

    componentDidUpdate() {
        if (this.state.useBodyScroll) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
        }
    }


     componentDidMount() {
         this.getDiseasesList()
    }

    onChange= (value) => {
        this.setState({ diseaseName:value });

    };

    clear = () => {
        const{diseasesType}=this.state;
        this.setState({ diseaseName: '' });
        this.getDiseasesList(diseasesType,'','')
    };

    getData=(val)=>{
        const{diseasesType}=this.state;
        this.setState({ diseaseName:val });
        this.getDiseasesList(diseasesType,val,'');

    };

    //登录页
    goSign = () => {
        this.props.history.push({pathname: `/loginIn`,});
    };

    //接口token失效时处理
    goSignWhenMissLoginToken = (status, message) => {
        if (status && message && status === 2 && message === '权限错误') {
            this.failToast(message);
            setTimeout(() => {
                this.goSign();
            }, 1000);
        }
    };



    getDiseasesList=(diseasesType=1,diseasesName='',btnIsActive='btnIsActive1')=>{
        if(btnIsActive==='btnIsActive1'){
            this.setState({
                diseasesType:diseasesType,
                btnIsActive1:true,
                btnIsActive2:false,
                btnIsActive3:false,
            });
        }
        if(btnIsActive==='btnIsActive2'){
            this.setState({
                diseasesType:diseasesType,
                btnIsActive1:false,
                btnIsActive2:true,
                btnIsActive3:false,
            })
        }
        if(btnIsActive==='btnIsActive3'){
            this.setState({
                diseasesType:diseasesType,
                btnIsActive1:false,
                btnIsActive2:false,
                btnIsActive3:true,
            })
        }

/*
        this.setState({
            btnIsActive1:true,
        });*/
    //diseaseType 疾病分类  1普通疾病 2良性肿瘤 3恶性肿瘤
        axios({
            url: URLconfig.publicUrl + '/appinquiry/diseaseList.do',
            method: 'post',
            data: {
                "page": 1,
                "limit": 999,
                "diseaseType": diseasesType,
                'diseaseName':diseasesName,
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
               this.setState({
                   diseasesListData:response.data.data,
                   dataTotal:response.data.dataTotal,
               })

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });


    };

    //疾病详情
    toDiseaseDetail(id,name){
        this.props.history.push({pathname: `/diseaseDetail/${id}/${name}`,});

    }

    render() {
        const itemStyle={
                boxShadow:'0px 6px 15px 0px rgba(0,0,0,0.08)',
                borderRadius:'10px',
                border:'1px solid rgba(229,236,247,1)',
                margin: '5px 8px',
                padding:'10px 7px',
                lineHeight:'17px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily:'PingFangSC-Regular,PingFang SC',
                fontWeight:400,
                color:'rgba(51,51,51,1)',
                letterSpacing:'1px',
                fontSize:'14px'
        };

        const {diseasesListData,btnIsActive1,btnIsActive2,btnIsActive3,diseaseName,diseaseType,dataTotal}=this.state;

        const listData = diseasesListData&&diseasesListData.map((item, index) => ({
            text: `${item.diseaseName}`,
            id:`${item.id}`,
            diseaseType:`${item.diseaseType}`,
            diseaseContent:`${item.diseaseContent}`,
            index:`${index}`,
        }));

        return (
            <div className={'diseasesList'}>
             <SearchBox parent={this} placeholder={'按疾病查找'}/>
                <div className={'image'}>
                    <span className={'title'}>请选择查找疾病</span>
                    <span className={'content'}>{dataTotal}种乳腺疾病</span>
                    <img src={require("../images/disease_title_bg.png")} alt=""/>
                </div>
                <div className={'diseasesBtns'}>
                    <Button  className={btnIsActive1===true?'diseasesBtnActive':'normalBtn'} onClick={()=>{this.getDiseasesList(1,diseaseName,'btnIsActive1')}}>普通疾病</Button>
                    <Button  className={btnIsActive2===true?'diseasesBtnActive':'normalBtn'} onClick={()=>{this.getDiseasesList(2,diseaseName,'btnIsActive2')}}>良性肿瘤</Button>
                    <Button  className={btnIsActive3===true?'diseasesBtnActive':'normalBtn'} onClick={()=>{this.getDiseasesList(3,diseaseName,'btnIsActive3')}}>恶性肿瘤</Button>
                </div>
                <div className={'contentList'}>
                    <Grid data={listData}
                          columnNum={2}
                          renderItem={dataItem => (
                              <div style={itemStyle}>
                                  {(dataItem.index==0||dataItem.index==1||dataItem.index==2)&&<img src={require('../images/hot_font.png')} alt="" className={'hotFire'}/>}
                                  <span>{dataItem.text}</span>
                              </div>
                          )}
                          itemStyle={{ height:'65px',}}
                          onClick={_el => this.toDiseaseDetail(_el.id,_el.text)}
                    />
                </div>


            </div>
        );
    }
}

DiseasesList.propTypes = {};

export default DiseasesList;
