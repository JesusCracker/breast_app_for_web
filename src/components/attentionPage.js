import React , { Component } from 'react';
import DocumentTitle from 'react-document-title'
import axios from "axios";
import URLconfig from "../config/urlConfig";
import config from "../config/wxconfig";
import moment from "moment";
import { Popover} from 'antd-mobile';
import { Route, Redirect } from 'react-router'


const shareImage = {
    width: "100%",
    height: '100%',
    overflow: 'scroll',
};

class AttentionPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            whereIs:'',
            shareType:0,
            liveID:0,
        };
    }

    //截取分享链接的url参数
    getQueryString(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.hash.split("?")[1].match(reg);
        if(r != null) {
            return unescape(r[2]);
        }
        return null;
    }


    //改变时间的格式
    changeTimeFormat(timeStamp,format='YYYY-MM-DD dddd HH:mm:ss'){
        return moment(timeStamp).format(format);
    }

    componentDidMount() {
        this.setState({
            whereIs:this.getQueryString('whereIs')&&this.getQueryString('whereIs').toString(),
            shareType:parseInt(this.getQueryString('shareType')),
            liveID:parseInt(this.getQueryString('liveID')),
            isShare:parseInt(this.getQueryString('isShare')),
        })
    }



    render() {

        const{shareType,liveID,whereIs,isShare}=this.state;
   /*     alert('shareType:'+this.getQueryString('shareType')+'=========='+'isLiving:'+this.getQueryString('isLivingDetail')
            +'=========='+'liveID:'+this.getQueryString('liveID')
        );*/

        if(isShare&&shareType&&liveID&&whereIs&&whereIs==='detailModule'){

            return (
                //重定向redirect
                <Redirect to={"/detailedInformation/" +liveID+"/"+shareType+'/'+isShare+'/'+0} />

            );
        }
        else if (whereIs==='listModule'){
            //重定向到科普列表
            return (
                <Redirect to={"/"} />
                );
        }
        else if(whereIs==='roomModule'){
            return (
                // <Redirect to={"/detailedInformation/" +liveID+"/"+shareType+'/'+isShare} />
                <Redirect to={"/room/"+liveID+'/'+isShare} />
            )
        }
        else if(isShare&&shareType&&liveID&&whereIs&&whereIs==='commentListModule'){
            return(
                <Redirect to={"/detailedInformation/" +liveID+"/"+shareType+'/'+isShare+'/'+0} />
                );
        }
        else if(whereIs==='myOrdersModule'){
            return (
                <Redirect to={"/myOrders/"} />
            )
        }
        else if(whereIs==='doctorDetailInformation'&&liveID){
            return (
                <Redirect to={`/doctorDetailedInformation/${liveID}`+'/'+isShare+'/'+0}/>
            )
        }
        else{
            return (
                <DocumentTitle title='乳腺好大夫介绍'>
                <div style={shareImage}>
                    <img src={require('../images/share.png')} alt="" style={{  width: "100%",height: 'auto'}}/>
                </div>
                </DocumentTitle>
            );
        }

    }
}

AttentionPage.propTypes = {};

export default AttentionPage;