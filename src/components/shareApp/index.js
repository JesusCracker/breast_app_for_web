import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'

import user_bg from './images/user_bg.png';
import doctor_bg from './images/doctor_bg.png';
import QRcode from './images/QRcode.png';
import userapp_logo from './images/userapp_logo.png';
import doctorapp_logo from './images/doctorapp_logo.png';

class index extends Component {
  
    render () {
        const { type } = this.props.match.params;

        return (
            <DocumentTitle title='乳腺好大夫简介'>
                <div style={{"display": "flex", "flexDirection": "column", "background": "#EEF2F9", "height": "100%", "color": "#333"}}>
                    <img style={{"width": "100%"}} src={ type === '1' ? doctor_bg : user_bg} alt=""/>
                    <p style={{"textAlign": "center", "marginTop": "18px", "fontSize": "15px", "fontWeight": "500"}}>扫码关注微信公众号</p>
                    <img style={{"width": "90px", "margin": "12px auto"}} src={QRcode} alt=""/>
                    <p style={{"textAlign": "center", "marginBottom": "18px"}}>乳腺好大夫 & 最懂你的乳腺健康管理专家</p>

                    <div style={{"display": "flex", "justifyContent": "space-between","background": "#fff", "opacity": '.7', "padding": "8px 18px", "alignItems": "center", "position": "fixed", "left": 0, "right": 0}}>
                        <div style={{"display": "flex"}}>
                            <img style={{"width": "44px", "height": "44px"}} src={ type === '1' ? doctorapp_logo : userapp_logo} alt=""/>
                            <div style={{"paddingTop": "1px", "marginLeft": "10px"}}>
                                <p style={{"fontSize": "18px", "lineHeight": "25px"}}>乳腺好大夫-{type === '1' ? '医生' : '用户'}版</p>
                                <p style={{"fontSize": "12px", "lineHeight": "17px"}}>您身边的乳腺智能管理专家</p>
                            </div>
                        </div>
                        <a href="#" style={{"color": "#529EFF", "fontFamily": "PingFangSC-Medium,PingFang SC", "padding": "5px 10px", "border": "1px solid #529EFF", "borderRadius": "16px", "height": "20px", "lineHeight": "20px"}}>
                            立即下载
                        </a>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
};

export default index;