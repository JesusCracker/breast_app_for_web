import React, { Component } from 'react';
import WebIM from './easemob';
import imgUrl from './img';
import { Toast } from 'antd-mobile';

class Footer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ''
		};

		this.handleChange = this.handleChange.bind(this)
		this.emitEmpty = this.emitEmpty.bind(this)
		this.handleSend = this.handleSend.bind(this)
	}

	handleChange(e) {
		const v = e.target.value
		this.setState({
			value: v
		})
	}
	emitEmpty() {
		this.setState({
			value: ""
		})
	}

	handleSend() {
		const { value } = this.state;
		const { chatRoomId } = this.props;

		if (!value) {
			Toast.info('请输入要发送的内容', 1);
			return;
		}
		var id = WebIM.conn.getUniqueId();         // 生成本地消息id
		var msg = new WebIM.message('txt', id); // 创建文本消息
		var option = {
			msg: value,          // 消息内容
			to: chatRoomId,               // 接收消息对象(聊天室id)
			roomType: true,                  // 群聊类型，true时为聊天室，false时为群组
			ext: {
				headicon: localStorage.getItem('headicon'),
				nickname: localStorage.getItem('nickname')
			},                         // 扩展消息
			success: () => {
				let data = {
					msg: value,
					name: '',
					headicon: ''
				}
				this.props.pfn(data);
				console.log('send room text success');
			},                               // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
			fail: function () {
				console.log('failed');
			}                                // 对失败的相关定义，sdk会将消息id登记到日志进行备份处理
		};
		msg.set(option);
		msg.setGroup('groupchat');           // 群聊类型
		WebIM.conn.send(msg.body);
		this.emitEmpty()
	}

	render() {
		let { value } = this.state;
		let { status, danmu, danmu1, dianzan, content, data } = this.props;

		return (
			<footer className="footers">
				{status === 30 ?
					(<div>
						<input type="text"
							className="inputValue"
							value={value}
							onChange={this.handleChange}
						/>
						<span className="submit" onClick={this.handleSend}>发送</span>

						<img style={{display: content === 1 ? 'block' : 'none'}} onClick={danmu} src={danmu1 ? imgUrl.dm_open : imgUrl.dm_open1} alt="弹幕" />
						<img style={{display: content === 1 ? 'block' : 'none'}} onClick={dianzan} src={data.userIdDz > 0 ? imgUrl.dz_icon : imgUrl.dz_icon1} alt="点赞" />
					</div>) :
					(<div>
						<span className="endStyle">直播已结束</span>
						<img style={{display: content === 1 ? 'block' : 'none'}} onClick={dianzan} src={data.userIdDz > 0 ? imgUrl.dz_icon : imgUrl.dz_icon1} alt="点赞" />
					</div>)
				}
			</footer>
		);
	}
}

export default Footer;