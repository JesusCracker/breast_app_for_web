import React, {Component} from 'react';
import { NavBar, Icon,NoticeBar } from 'antd-mobile';
import '../less/navBarHeader.less';
import {createBrowserHistory} from 'history';
const history = createBrowserHistory();

class HeaderNavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    goBackPage = () => {
        console.dir(window.location.href);

        if (window.location.href.indexOf("?#") >0) {
            if(window.location.href.indexOf('orderDetail')){
                window.location.href = window.location.href.replace("?#", "#").split('orderDetail')[0]+'myOrders/';
            }
            if(window.location.href.indexOf('wikiSearchList')){
                window.location.href = window.location.href.replace("?#", "#").split('wikiSearchList')[0]+'wikiSlide/';
            }
            // console.dir(window.location.href.replace("?#", "#").split('orderDetail')[0]+'myOrders/')
        }else{
            history.goBack();
        }
    };

    isList(isCourses,title,docOrCourse){
        let str='';
        if(docOrCourse==='course'){
            str='课程';
        }
        if(docOrCourse==='doctor'){
            str='专家'
        }
       return  <div className={'isAbout'}>
                <span className={'name'}>{title}</span>相关{str}
            </div>
    }


    render() {
        const {title,number,isLight,showDiseaseName,docOrCourse,noIcon}=this.props;
        return (
            <div>
                {noIcon?<NavBar
                    className={isLight==='navBarHeaderLight'?'navBarHeaderLight':(isLight==='thirdStyle'?'thirdStyle':'navBarHeaderDark')}
                >
                    {showDiseaseName&&docOrCourse?this.isList(showDiseaseName,title,docOrCourse):title}{number&&number?`（${number}）`:''}

                </NavBar>:<NavBar
                    className={isLight==='navBarHeaderLight'?'navBarHeaderLight':(isLight==='thirdStyle'?'thirdStyle':'navBarHeaderDark')}
                    icon={<Icon type="left" size={'lg'} />}
                    onLeftClick={() =>this.goBackPage()}
                >
                    {showDiseaseName&&docOrCourse?this.isList(showDiseaseName,title,docOrCourse):title}{number&&number?`（${number}）`:''}

                </NavBar>}

            </div>
        );
    }
}

export default HeaderNavBar;