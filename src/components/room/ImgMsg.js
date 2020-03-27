import React, { Component } from 'react';

class ImgMsg extends Component {

	seeImg = (data) => {
		let obj = document.getElementById('seeImg');
		obj.getElementsByTagName('img')[0].src = data;
		obj.style.display = 'flex';		
	}
	render() {
		let { data } = this.props;
		return <img src={data} alt="" onClick={this.seeImg.bind(this, data)}/>;
	}
}

export default ImgMsg;
