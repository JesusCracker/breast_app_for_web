import React, {Component} from 'react';
import SearchBox from "./searchBox";
import HeaderNavBar from "./headerNavBar";
import {ListView, PullToRefresh,Picker,List} from "antd-mobile";
import noContentImg from "../images/no_content.png";
import '../less/hospitalList.less';
import config from "../config/wxconfig";
import moment from "moment";
import SetStars from "./setStars";
import axios from "axios";
import URLconfig from "../config/urlConfig";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";

const CustomChildren = props => (
    <div
        onClick={props.onClick}
        style={{ backgroundColor: '#fff', width:'auto'}}
    >
        <div className="test" style={{ display: 'flex', height: '45px', lineHeight: '45px',position:'relative',borderBottom:0 }}>
            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{props.children}</div>
            {/*<div style={{ textAlign: 'right', color: '#888', marginRight: 15 }}>{props.extra}</div>*/}
        </div>
    </div>
);

class HospitalList extends React.Component {
    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({  //这个dataSource有cloneWithRows方法
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.pageNo = 0 //定义分页信息

        this.state = {
            hospitalName:'',
            hospitalType:'',
            city:'',
            province:'',
            hospitalType1:'',

            dataTotal: 0,
            dataSource,
            refreshing: true,
            isLoading: true,
            height: document.documentElement.clientHeight,
            useBodyScroll: false,
            hasMore: true,
            keyWords: "",
            isContain: false,
            type: 2,
            secondType: 1,
            hasCollected: false,


            pickerValue: [],
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
        const{hospitalName,province,city}=this.state;
        // this.getHospitalList(hospitalName);
       this.getHospitalAddress();
       this.getHospitalType();
        const hei = this.state.height - ReactDOM.findDOMNode(this.lv).offsetTop;

        this.rData = (await this.genData()).data;
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rData),
            height: hei,
            refreshing: false,
            isLoading: false,
        });
    }

    onChange= (name) => {
        this.setState({ hospitalName:name });
    };

    clear = () => {
        this.setState({ hospitalName: '' });
        this.getHospitalList();
    };

    getData=(name)=>{
        this.setState({ hospitalName:name });
        this.getHospitalList();

    };


    genData = (isSearch) => {  //请求数据的方法
        const{province,city,hospitalType1,hospitalName}=this.state;

        if (isSearch) {
            this.pageNo = 1;    //每次下拉的时候pageNo++
        } else {
            this.pageNo++;    //每次下拉的时候pageNo++
        }
        return axios({
            url: URLconfig.publicUrl + '/appinquiry/hospitalList.do',
            method: 'post',
            data: {
                'page': this.pageNo,
                "limit": 10,
                'province': province,
                'city': city,
                'hospitalType': hospitalType1,
                'hospitalName': hospitalName,
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
            if (response.status === 200) {
                let result=response.data;
                if (result.status === 1) {
                    this.setState({
                        dataTotal: result.dataTotal,
                    });
                    if (result.dataTotal !== 0) {
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
                    alert(result.message);
                    return false;
                }

            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    };

    onRefresh = async (event) => {
        const {doctorId} = this.state;
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
        const {doctorId} = this.state;
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


    setList(rowData, sectionID, rowID) {
        return <Link to={{pathname: `/hospitalDetail/${rowData.hospitalId}/${rowData.hospitalName}`}} key={rowID}>
                <div className={'inner'} >
               <div className={'leftArea'}>
                   <img src={require('../images/hospital.png')} alt=""/>
               </div>
                <div className={'rightArea'}>
                    <div className={'hospitalName'}>
                        {rowData.hospitalName}
                    </div>
                    <div className={'hospitalClass'}>
                       <div className={'grade'}>{rowData.hospitalGrade}</div>
                        <div className={'type'}>{rowData.hospitalType}</div>
                    </div>
                </div>
            </div>
            </Link>
    }


    async getHospitalList(){

        this.pageNo = 1; //定义分页信息
        this.rData = (await this.genData(true)).data;
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

    //获取医院省市地区
    getHospitalAddress(){
        axios({
            url: URLconfig.publicUrl + '/hospital/regionDetail.do',
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            if (response.status === 200&&response.data.status===1) {

                // let addressContain=response.data.data;
                this.setState({
                    address:response.data.data,
                })
               return response.data.data;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }
    //获取医院类型
    getHospitalType(){
        axios({
            url: URLconfig.publicUrl + '/appinquiry/hospitalType.do',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
            }
        }).then((response) => {
            if (response.status === 200&&response.data.status===1) {

                // let addressContain=response.data.data;
                this.setState({
                    hospitalType:response.data.data,
                })
                // return response.data.data;
            }
        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }


    //选择省市地区后显示
    getAddressDetail(pickerValue){
        if(pickerValue&&pickerValue.length){
            return <div>{pickerValue[0]}{pickerValue[1]}</div>
        }else{
            return <div>选择城市</div>
        }
    }

    //选择医院类型后显示
    getHospitalTitle(pickerValue1){

        if(pickerValue1&&pickerValue1.length){
            return <div>{pickerValue1}</div>
        }else{
            return <div>医院类型</div>
        }
    }


   async afterChoosed(pickerValue){
        // console.dir(this.state)
        if(pickerValue){
            await  this.setState({
                pickerValue:pickerValue,
                province:pickerValue[0],
                city:pickerValue[1],
            });

            if(this.state.pickerValue&&this.state.province&&this.state.city){
                this.getHospitalList();
            }
        }else{
            await this.setState({
                pickerValue:["请选择","省市"],
                province:'',
                city:'',
            });
            this.getHospitalList();
       }
    };

    async afterHospitalChoosed(pickerValue1){
        if(pickerValue1){
            await this.setState({
                pickerValue1:pickerValue1,
                hospitalType1:pickerValue1[0],
            });
            if(this.state.pickerValue1&&this.state.hospitalType1){
                this.getHospitalList();
            }
        }else{
            await this.setState({
                pickerValue1:['医院类型'],
                hospitalType1:'',
            });
            this.getHospitalList();
        }

    }



    render() {
        const {hospitalName,address,pickerValue,province,city,hospitalType,hospitalType1,pickerValue1}=this.state;


        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    height: 10,
                   borderTop: '1px solid #ECECED',
                   borderBottom: '1px solid #ECECED',
                }}
            />
        );
        const row = (rowData, sectionID, rowID) => {
            return (
                this.setList(rowData, sectionID, rowID)
            );
        };

        let antdDistrict =[],hospitalDistict=[];
        if(address){
                let districtData=address;
                // console.dir(address)
                Object.keys(districtData).forEach((index)=>{
                let itemLevel1 ={};
                let itemLevel2 ={};
                itemLevel1.value = districtData[index].province;
                itemLevel1.label = districtData[index].province;
                itemLevel1.children = [];
                let data = districtData[index].citys;
                Object.keys(data).forEach((index)=>{
                    itemLevel2.value = data[index].name;
                    itemLevel2.label = data[index].name;
                    itemLevel2.children = [];

                    itemLevel1.children.push(itemLevel2);
                    itemLevel2 ={};
                });
                antdDistrict.push(itemLevel1)
            });
        }


        if(hospitalType){
           let districtHospitalData=hospitalType;
           // console.dir(districtHospitalData);

            Object.keys(districtHospitalData).forEach((index)=>{
                let itemLevel1 ={};
                itemLevel1.value = districtHospitalData[index].hospitalType;
                itemLevel1.label = districtHospitalData[index].hospitalType;
                itemLevel1.children = [];
                hospitalDistict.push(itemLevel1)
            });
            // console.dir(hospitalDistict);
        }


        return (

            <div className={'hospitalList'}>
                <HeaderNavBar title={'医院列表'} isLight={'navBarHeaderLight'} />
                <div className={'chooseBar'}>
                    <Picker
                        cols={'2'}
                        title="选择地区"
                        extra="请选择(可选)"
                        data={antdDistrict}
                        onDismiss={v => this.afterChoosed(v)}
                        // value={this.state.pickerValue}
                        // onChange={v => this.setState({ pickerValue: v })}
                        onOk={v => this.afterChoosed(v)}
                        onClick={()=>{console.log('xx')}}
                    >
                        <CustomChildren>{this.getAddressDetail(pickerValue)}</CustomChildren>
                    </Picker>

                    <Picker
                        cols={'1'}
                        title="选择医院类型"
                        extra="请选择(可选)"
                        data={hospitalDistict}
                        // value={this.state.pickerValue}
                        // onChange={v => this.setState({ pickerValue: v })}
                        onDismiss={v => this.afterHospitalChoosed(v)}
                        onOk={v => this.afterHospitalChoosed(v)}
                        onClick={()=>{console.log('xx')}}
                    >
                        <CustomChildren>{this.getHospitalTitle(pickerValue1)}</CustomChildren>
                    </Picker>

                </div>
                <SearchBox parent={this} placeholder={'按医院查找'}/>
                <div>
                    {/*{hospitalName}*/}
                </div>
                <div className={'list'}>
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
                            damping={50}
                        />}
                        onEndReachedThreshold={20}
                        onEndReached={this.onEndReached}
                        pageSize={5}    //每次下拉之后显示的数据条数
                    />
                </div>
                {hospitalName}
            </div>
        );
    }
}

HospitalList.propTypes = {};

export default HospitalList;