import React, {Component} from 'react';
import '../less/aboutUs.less';
import HeaderNavBar from "./headerNavBar";


class AboutUs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

    }

    render() {
        return (
            <div className={'aboutUs'}>
                <HeaderNavBar title={'关于我们'} isLight={'navBarHeaderLight'}/>
                <div className={"pannel"}>
                    <img src={require('../images/userapp_logo.png')} alt="" className={'logo'}/>
                    <div className={'explane'}>乳腺全生命周期人工智能管理专家</div>
                </div>
                <div className={'company'}>瀚维智能科技有限公司</div>
            </div>
        );
    }
}

AboutUs.propTypes = {};

export default AboutUs;
