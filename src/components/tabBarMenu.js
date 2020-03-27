import React, {Component} from 'react';
import {TabBar} from 'antd-mobile';
import ErrorBoundary from "./ErrorBoundary";
import PolularScienceList from "../components/polularScienceList";
import Wiki from "./wiki";
import ToIndex from "./toIndex";
import Home from "./home";
import My from './my'

class TabBarMenu extends React.Component {
    constructor(props) {
        super(props);
        const {group} = this.props.match.params;
        this.state = {
            selectedTab: 'index',
            hidden: false,
            fullScreen: false,
            group: group,
        };

    }

    componentDidMount() {

    }

    //content内容
    getContent(text) {
        const {group} = this.state;
        if (text === 'index') {
            return <Home/>
        } else if (text === 'popularScience') {
            return <PolularScienceList group={group}/>
        } else if (text === 'wiki') {
            return <Wiki pathName={'wiki'}/>
        } else if (text === 'my') {
            return <My/>
        }

    }


    renderContent(pageText) {
        return (

            <div style={{ height: '100%'}}>
                {/*    <div style={{paddingTop: 60}}>Clicked “{pageText}” tab， show “{pageText}” information</div>*/}
                {this.getContent(pageText)}
            </div>
        );
    }


    render() {
        return (
            <ErrorBoundary>
                <ToIndex/>
                <div style={{
                    position: 'fixed',
                    height: '100%',
                    width: '100%',
                    top: 0,
                    zIndex: 999,
                }}>
                    <TabBar
                        unselectedTintColor="#949494"
                        tintColor="#33A3F4"
                        barTintColor="white"
                        hidden={this.state.hidden}
                    >
                        <TabBar.Item
                            title="首页"
                            key="首页"
                            icon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: "url(" + require("../images/home_icon_1.png") + ")center center /  21px 21px no-repeat"
                            }}
                            />
                            }
                            selectedIcon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: "url(" + require("../images/home_icon.png") + ")center center /  21px 21px no-repeat"
                            }}
                            />
                            }
                            selected={this.state.selectedTab === 'index'}
                            // badge={1}
                            onPress={() => {
                                this.setState({
                                    selectedTab: 'index',
                                });
                            }}
                            data-seed="logId"
                        >
                            {this.renderContent('index')}
                        </TabBar.Item>
                        <TabBar.Item
                            icon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: "url(" + require("../images/education_icon.png") + ")center center /  21px 21px no-repeat"
                                }}
                                />
                            }
                            selectedIcon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: "url(" + require("../images/seleducation_icon.png") + ")center center /  21px 21px no-repeat"
                                }}
                                />
                            }
                            title="科普"
                            key="科普"
                            // badge={'new'}
                            selected={this.state.selectedTab === 'popularScience'}
                            onPress={() => {
                                this.setState({
                                    selectedTab: 'popularScience',
                                });
                            }}
                            data-seed="logId1"
                        >
                            {this.renderContent('popularScience')}
                        </TabBar.Item>
                        <TabBar.Item
                            icon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: "url(" + require("../images/baike_icon.png") + ")center center /  21px 21px no-repeat"
                                }}
                                />
                            }
                            selectedIcon={
                                <div style={{
                                    width: '22px',
                                    height: '22px',
                                    background: "url(" + require("../images/selebaike_icon.png") + ")center center /  21px 21px no-repeat"
                                }}
                                />
                            }
                            title="百科"
                            key="百科"
                            // dot
                            selected={this.state.selectedTab === 'wiki'}
                            onPress={() => {
                                // this.props.history.push({pathname:`/wiki`})
                                this.setState({
                                    selectedTab: 'wiki',
                                });
                            }}
                        >
                            {this.renderContent('wiki')}
                        </TabBar.Item>
                        <TabBar.Item
                            icon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: "url(" + require("../images/persionnal_center.png") + ")center center /  21px 21px no-repeat"
                            }}
                            />}
                            selectedIcon={<div style={{
                                width: '22px',
                                height: '22px',
                                background: "url(" + require("../images/selepersion_icon.png") + ")center center /  21px 21px no-repeat"
                            }}
                            />}
                            title="我的"
                            key="我的"
                            selected={this.state.selectedTab === 'my'}
                            onPress={() => {
                                this.setState({
                                    selectedTab: 'my',
                                });
                            }}
                        >
                            {this.renderContent('my')}
                        </TabBar.Item>
                    </TabBar>
                </div>
            </ErrorBoundary>
        );
    }
}

TabBarMenu.propTypes = {};

export default TabBarMenu;
