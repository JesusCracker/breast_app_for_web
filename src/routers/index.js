import React, {Component} from 'react';
import { HashRouter as Router , Route ,Switch,Redirect,withRouter} from "react-router-dom";

import Room from '../components/room/index';
import ListContainer from "../components/liveList";
import AttentionPage from "../components/attentionPage";
import PolularScienceList from "../components/polularScienceList";
import DetailedInformation from "../components/detailedInformation";
import CommentList from "../components/commentList";
import DiagnosisList from "../components/diagnosisList";
import DiseasesList from "../components/diseasesList";
import DiseaseDetail from "../components/diseaseDetail";
import MoreCourseList from "../components/moreCourseList";
import MoreDocList from "../components/moreDocList";
import DoctorDetailedInformation from "../components/doctorDetailedInformation";
import DocCommentList from "../components/docCommentList";
import HospitalList from "../components/hospitalList";
import HospitalDetail from "../components/hospitalDetail";
import ShareApp from "../components/shareApp";

/*app分享下载*/
import shareUserSide from "../components/shareUserSide";
import shareDoctorSide from "../components/shareDoctorSide";

/*orders*/
import MyOrders from "../components/myOrders";
import OrderDetail from '../components/orderDetail';

/*wiki*/
import Wiki from "../components/wiki";
import WikiList from "../components/wikiList";
import WikiSearchList from "../components/wikiSearchList";
import WikiSlide from "../components/wikiSlide";
import WikiChannel from "../components/wikiChannel";


import ShareEducation from "../components/shareApp/education";
import Inquiry from "../components/inquiry";
import Wz from "../components/inquiry/wz";
import Supplement from "../components/inquiry/supplement";
import BlDetails from "../components/inquiry/blDetails";
import CfDetails from "../components/inquiry/cfDetails";
import EvaluateDoctor from "../components/inquiry/evaluateDoctor";
import Wsbl from "../components/inquiry/wsbl";
import ShareDcotor from "../components/shareApp/doctor";
import ShareTw from"../components/shareApp/shareTw";
import ShareRoom from"../components/shareApp/roomDetails";
import NoticeList from"../components/live/notice_list";
import NoticeDetails from"../components/live/notice_details";
import DoctorHomepage from"../components/live/doctor_homepage";
import Live from"../components/live";
import LiveLookBack from"../components/live/index1";

/*报名记录*/
import EntryRecord from "../components/entryRecord";
/*我的收藏*/
import MyCollection from "../components/myCollection";

/*我的问诊记录*/
import MyRecord from "../components/myRecord";

/*我的历史足迹*/
import MyHistoryTrace from "../components/myHistoryTrace";

/*下部菜单栏*/
import TabBarMenu from "../components/tabBarMenu";

/*首页*/
import Home from "../components/home";

/*我的*/
import My from "../components/my";
/*我的设置*/
import MySets from "../components/mySets";
import FeedBack from "../components/feedBack";
import AboutUs from "../components/aboutUs";
/*关注*/
import myFocus from "../components/myFocus";

/*登录*/
import LoginIn from "../components/loginIn";

class Routers extends Component {
    render() {
        return (
                <Router >
                    <div style={{height:'100%'}}>

                        <Route exact path='/' component={TabBarMenu}/>
                        <Route exact path='/home' component={Home}/>
                        <Route exact path='/TabBarMenu/:group' component={TabBarMenu}/>

                        <Route exact path='/PolularScienceList/:group' component={PolularScienceList}/>

                        <Route exact path="/ListContainer" component={ListContainer}/>
                        <Route exact path='/detailedInformation/:id/:queryContentType/:isShare/:client' component={DetailedInformation}/>
                        <Route exact path='/room/:id/:isShare' component={Room}/>
                        <Route exact path='/noticeList' component={NoticeList}/>
                        <Route exact path='/noticeDetails/:id' component={NoticeDetails}/>
                        <Route exact path='/doctorHomePage/:doctorId' component={DoctorHomepage}/>
                        <Route exact path='/live/:liveId' component={Live}/>
                        <Route exact path='/liveLookBack/:liveId' component={LiveLookBack}/>
                        

                        <Route exact path='/commentList/:id/:postType/:commentId/:collectNum/:dzNum/:isDz/:collectedIds/:isExtend/:isShare' component={CommentList}/>
                        <Route exact path='/attentionPage' component={AttentionPage}/>

                        <Route exact path='/shareApp/:type' component={ShareApp}/>
                        <Route exact path='/shareEducation/:id/:queryContentType/:type' component={ShareEducation}/>
                        <Route exact path='/shareTw/:id/:queryContentType/:isShare' component={ShareTw}/>
                        <Route exact path='/shareDcotor/:doctorId/:type' component={ShareDcotor}/>
                        <Route exact path='/shareRoom/:id/:type' component={ShareRoom}/>

                        <Route exact path='/inquiry/:doctorId' component={Inquiry}/>
                        <Route exact path='/inquiry/wsbl/:patientId/:doctorId/:questionnaireId/:type/:ids' component={Wsbl}/>
                        <Route exact path='/inquiry/wz/:patientId/:doctorId/:questionnaireId/:type' component={Wz}/>
                        <Route exact path='/inquiry/supplement/:patientId/:doctorId/:questionnaireId' component={Supplement}/>
                        <Route exact path='/inquiry/wz/blDetails/:patientId/:doctorId/:questionnaireId/:type' component={BlDetails}/>
                        <Route exact path='/inquiry/wz/cfDetails/:patientId/:doctorId/:questionnaireId/:type' component={CfDetails}/>
                        <Route exact path='/evaluateDoctor/:doctorId/:patientId/:questionnaireId' component={EvaluateDoctor}/>

                        {/*问诊*/}
                        {/*<Redirect from="/*" to="/" />*/}
                        <Route exact path={'/diagnosisList/:group'} component={DiagnosisList}/>
                        <Route exact path={'/hospitalList'} component={HospitalList}/>
                        <Route exact path={'/hospitalDetail/:hospitalId/:hospitalName'} component={HospitalDetail}/>

                        <Route exact path={'/diseasesList'} component={DiseasesList}/>
                        <Route exact path={'/diseaseDetail/:diseaseId/:diseaseName'} component={DiseaseDetail}/>
                        <Route exact path={'/moreCourseList/:diseaseName/:doctorName/:type'} component={MoreCourseList}/>
                        <Route exact path={'/moreDocList/:name/:id/:type'} component={MoreDocList}/>
                        <Route exact path={'/doctorDetailedInformation/:doctorId/:isShare/:client'} component={DoctorDetailedInformation}/>
                        <Route exact path={'/docCommentList/:doctorId/:commentTotal/:heat/:questionnaireNum/:recoverySpeed/:isShare'} component={DocCommentList}/>
                        {/*orders*/}
                        <Route exact path={'/myOrders/:menu/:type'} component={MyOrders}/>
                        <Route exact path={'/OrderDetail/:orderId/:detailFrom'} component={OrderDetail}/>

                        {/*app分享下载*/}
                        <Route exact path="/shareUserSide" component={shareUserSide}/>
                        <Route exact path="/shareDoctorSide" component={shareDoctorSide}/>

                        {/*乳腺百科*/}
                        <Route exact path="/wiki" component={Wiki}/>
                        <Route exact path="/wikiList/:title/:type" component={WikiList}/>
                        <Route exact path="/WikiSearchList/" component={WikiSearchList}/>
                        <Route exact path="/wikiSlide/" component={WikiSlide}/>
                        <Route exact path="/wikiChannel/" component={WikiChannel}/>

                        {/*直播报名记录*/}
                        <Route exact path={'/entryRecord/'} component={EntryRecord}/>

                        {/*我的收藏*/}
                        <Route exact path={'/myCollection/'} component={MyCollection}/>

                        {/*我的问诊记录*/}
                        <Route exact path={'/myRecord/'} component={MyRecord}/>

                        {/*我的历史足迹*/}
                        <Route exact path={'/myHistoryTrace/'} component={MyHistoryTrace}/>

                        {/*我的*/}
                        <Route exact path={'/my/'} component={My}/>
                        {/*我的设置*/}
                        <Route exact path={'/feedBack/'} component={FeedBack}/>
                        {/*意见反馈*/}
                        <Route exact path={'/mySets/'} component={MySets}/>
                        {/*关于我们*/}
                        <Route exact path={'/aboutUs/'} component={AboutUs}/>
                        {/*关注*/}
                        <Route exact path={'/myFocus/'} component={myFocus}/>
                        {/*登录*/}
                        <Route exact path={'/loginIn/'} component={LoginIn}/>

                    </div>
                </Router>
        );
    }
}

export default Routers;
