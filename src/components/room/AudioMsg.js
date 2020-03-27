import React, { Component } from 'react';
import axios from 'axios';
import qs from 'qs';
import $ from 'jquery';
import defaultImg from './img'
import config from "../../config/wxconfig";


import { Toast } from 'antd-mobile'
import BenzAMRRecorder from 'benz-amr-recorder'
var amr = new BenzAMRRecorder();



function loadingToast() {
	Toast.loading('语音下载中...', 0);
}

class AudioMsg extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imgUrl: defaultImg.play,
			play: false,
			stop: false,
			id: ''
		};
	}

	componentDidMount() {
		window.addEventListener('popstate', () => {
			amr.stop();
		})
	}

	getaudiobase64(data, e) {
		let _this = $(e.currentTarget);
		
		let { play } = this.state;
		data.ac = true;
		this.props.setRoomAc();

		let playAudioId = localStorage.getItem('playAudioId');
		if (play && playAudioId == data.id) {
			amr.playOrPauseOrResume();
			if(amr.isPaused()){
				this.setState({ imgUrl: defaultImg.play })
				_this.find('div div').stop();
			} else{
				this.setState({ imgUrl: defaultImg.zant })
				_this.find('div div').animate({width: '100%'}, (parseInt(data.audioLength)+1 - parseInt(amr.getCurrentPosition()))*1000, 'linear', ()=>{
					_this.find('div div').css('width', 0)
				})
			}
		} else {
			_this.find('div div').stop();
			
			loadingToast();
			if(amr.isPlaying()){
				amr.playOrPauseOrResume();
			}
			
			amr = new BenzAMRRecorder();
			if (data.sx) {
				amr.initWithUrl(data.fileUrl).then( () => {
					Toast.hide();
					amr.play();
					
					_this.parents('.list').find('.imgTop').attr('src', require('./img/voice_icon_play.png'));
					_this.find('.imgTop').attr('src', require('./img/voice_icon_zant.png'));
					$('.item_con.audioMsg').removeClass('yes').find('div').addClass('hide');
					$('.item_con.audioMsg').find('span').removeClass('hide');
					_this.addClass('yes').find('div').removeClass('hide');
					_this.find('span').addClass('hide');
					_this.find('div div').css('width', 0);
					this.setState({
						imgUrl: defaultImg.zant,
						play: true
					})
					localStorage.setItem('playAudioId', data.id);
					_this.find('div div').animate({width: '100%'}, (parseInt(data.audioLength)+1)*1000, 'linear',  ()=>{
						_this.find('div div').css('width', 0)
					})
				});
				amr.onEnded(() => {
					this.setState({
						imgUrl: defaultImg.play,
						play: false
					})
					localStorage.removeItem('playAudioId');
					_this.parents('.item').nextAll().find('.item_con.audioMsg').eq(0).click();
				})
			} else {

				axios
					.post(
						config.publicUrl + 'ringletter/filetobase64.do',
						qs.stringify({ filepath: data.fileUrl }),
						{ headers: { loginToken: localStorage.getItem('loginToken') } }
					)
					.then((res) => {
						if (res.status === 200) {
	
							amr.initWithUrl("data:;base64," + res.data).then(() => {
								Toast.hide();
								amr.play();
								
								_this.parents('.list').find('.imgTop').attr('src', require('./img/voice_icon_play.png'));
								_this.find('.imgTop').attr('src', require('./img/voice_icon_zant.png'));
								$('.item_con.audioMsg').removeClass('yes').find('div').addClass('hide');
								$('.item_con.audioMsg').find('span').removeClass('hide');
								_this.addClass('yes').find('div').removeClass('hide');
								_this.find('span').addClass('hide');
								_this.find('div div').css('width', 0);
								this.setState({
									imgUrl: defaultImg.zant,
									play: true
								})
								localStorage.setItem('playAudioId', data.id);
								_this.find('div div').animate({width: '100%'}, (parseInt(data.audioLength)+1)*1000, 'linear',  ()=>{
									_this.find('div div').css('width', 0)
								})
							});
	
							amr.onEnded(() => {
								this.setState({
									imgUrl: defaultImg.play,
									play: false
								})
								localStorage.removeItem('playAudioId');
								_this.parents('.item').nextAll().find('.item_con.audioMsg').eq(0).click();
							})
						}
					})
					.catch((err) => {
						console.log('base64' + err);
					});
			}
		}


	}

	render() {
		let { data } = this.props;
		let { imgUrl, play } = this.state;
		return (
			// <div onClick={this.getaudiobase64.bind(this, data)} className="item_con audioMsg" style={{width: 280/60*data.audioLength+'px'}}>
			<div onClick={this.getaudiobase64.bind(this, data)} className={data.ac ? "item_con audioMsg" : "item_con audioMsg wd"} style={{width: 230/60*data.audioLength+'px'}}>
				<img src={imgUrl} alt="" className="imgTop"/>
				<div className={play ? "bft" : "hide"}>
					<div className={play ? "play" : "hide"} >
						{/* <span></span> */}
					</div>
				</div>
				<span className={play ? 'hide' : 'audioTime'}>{data.audioLength + "''"}</span>
				{/* <div >
					<div >
						<span></span>
					</div>
				</div>
				<span >{data.audioLength + "''"}</span> */}
				{/* <span className={play ? 'hide' : 'audioTime'}>{data.audioLength === 60 ? "01'00''" : " 00'" + (data.audioLength > 9 ? data.audioLength : "0" + data.audioLength) + "''"}</span> */}
			</div>
			// <audio controls src="http://st.chaoyindj.com/zwcs/蒋一豪 - 好兄弟今生一起走 Dj大圣.mp4"></audio>
		)
	}
}

export default AudioMsg;
