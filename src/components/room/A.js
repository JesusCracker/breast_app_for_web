import React, { Component } from 'react';
import './style/index.css'
import config from "../../config/wxconfig";
import imgUrl from './img'

class A extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imga: false,
			objHeight: true
		};


	}
	componentDidMount() {
	let objHeight = document.getElementById('speciality').offsetHeight > 30 ? true : false;
	this.setState({
		objHeight: objHeight
	})

}

showGoodAt = () => {
	this.setState({
		imga: !this.state.imga
	})
}
render() {
	let { coverPic, headicon, name, doctorTitle, hospital, doctorDepartment, goodAt, summary } = this.props.data;
	let { imga, objHeight } = this.state;
	return (
		<div className="wrap_a">
			<div className="top">
				<img src={config.publicStaticUrl + coverPic} alt="" />
			</div>

			<div className="personal">
				<div className="details">
					<div className="lf">
						<img src={config.publicStaticUrl + headicon} alt="" />
					</div>
					<div className="rg">
						<p>
							<span className="name">{name}</span>
							&nbsp;&nbsp;
								<span>{doctorTitle}</span>
						</p>
						<p>
							<span>{hospital}</span>
							&nbsp;&nbsp;
								<span>{doctorDepartment}</span>
						</p>
					</div>
				</div>
				<div id="speciality" className={imga ? "speciality show" : "speciality none"}>
					擅长：{goodAt}

					<i onClick={this.showGoodAt} style={{ display: objHeight ? 'block' : 'none' }}>
						<img src={imga ? imgUrl.up : imgUrl.down} alt="" />
					</i>
				</div>
			</div>

			<div className="bottom">
				<h2 className="title">直播介绍</h2>
				<div className="text-con" >
					{summary}
				</div>
			</div>

		</div>
	);
}
}

export default A