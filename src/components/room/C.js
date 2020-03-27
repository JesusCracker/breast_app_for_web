import React, { Component } from 'react';
import './style/index.css'
import config from "../../config/wxconfig";
import { PullToRefresh } from 'antd-mobile';
class C extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// user: 'user_300_1569207272190',
			user: localStorage.getItem('ringUser'),
		};
	}

	createTime1(v) {
		var date = new Date(v);
		var m = date.getMonth() + 1;
		m = m < 10 ? '0' + m : m;
		var d = date.getDate();
		d = d < 10 ? ("0" + d) : d;
		var h = date.getHours();
		h = h < 10 ? ("0" + h) : h;
		var M = date.getMinutes();
		M = M < 10 ? ("0" + M) : M;
		let str = `${m}/${d} ${h}:${M}`;
		return str;
	}


	render() {
		let { user } = this.state;
		let { userMsgList, getUserMsg } = this.props;
		return (
			<div className="wrap_c">
				<div className="list">
					<PullToRefresh
						style={{
							overflow: 'auto',
						}}
						onRefresh={() => {
							getUserMsg()
						}}
					>
						{
							userMsgList.map((item, index) => {
								return (
									<div className={`item ${item.fromUser === user ? 'me' : ''}`} key={index}>
										{/* <p className="time">{this.createTime1(item.timestamp)}</p> */}
										<div className="msg">
											<div className="left">
												<img src={item.headicon.indexOf('http') !== -1 ? item.headicon : (config.publicStaticUrl + item.headicon)} alt="" />
											</div>
											<div className="right">
												<p className="name">{item.name}</p>
												<p className="text">
													{item.msg}
												</p>
											</div>
										</div>
									</div>
								)
							})
						}
					</PullToRefresh>
				</div>
			</div>
		);
	}
}

export default C