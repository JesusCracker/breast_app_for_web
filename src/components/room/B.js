import React, { Component } from 'react';
import './style/index.css';

import TxtMsg from './TxtMsg';
import ImgMsg from './ImgMsg';
import AudioMsg from './AudioMsg';
import config from "../../config/wxconfig";

import { PullToRefresh } from 'antd-mobile';

class B extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imgUrl: config.publicStaticUrl,
			refreshing: false,

		};
	}

	isMsg = (data) => {
		if (data.msgType === 'audio') {
			return <AudioMsg data={data} />;
		} else if (data.msgType === 'img') {
			return <ImgMsg data={data.fileUrl&&data.fileUrl.indexOf('http') !== -1 ? data.fileUrl : (this.state.imgUrl + data.fileUrl)} />;
		} else if (data.msgType === 'txt') {
			return <TxtMsg data={data.msg} />;
		}
	};
	goC = () => {
		this.props.pfn(2);
	}
	render() {
		let { imgUrl } = this.state;
		let { userMsgList, masterMsgList, getMasterMsg, danmu } = this.props;
		return (
			<div className="wrap_b">
				<div className="list">
					<PullToRefresh
						style={{
							overflow: 'auto',
						}}
						onRefresh={() => {
							getMasterMsg()
						}}
					>
						{masterMsgList.map((item, index) => {
							return (
								<div className="item" key={index}>
									<p className="time">{item.time}</p>
									<div className="msg">
										<div className="left">
											<img src={imgUrl + item.headicon} alt="" />
										</div>
										<div className="right">
											{/* <p className="name">{item.name}</p> */}
											<div className="text">
												{this.isMsg(item)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</PullToRefresh>


				</div>

				<ul className="bulletScreen" style={{ display: danmu ? 'flex' : 'none' }}>

					{(userMsgList.length < 3 ? userMsgList : userMsgList.slice(userMsgList.length - 3, userMsgList.length)).map((item, index) => {
						return (
							<li key={index}>
								<p onClick={this.goC}>
									<img src={item.headicon&&item.headicon.indexOf('http') !== -1 ? item.headicon : (imgUrl + item.headicon)} alt="" />
									{/* <img src={imgUrl + item.headicon} alt="" /> */}
									<span>{item.msg}</span>
								</p>
							</li>
						);
					})}
				</ul>

			</div>
		);
	}
}

export default B;
