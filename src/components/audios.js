import React, {Component} from 'react';
import ReactAudioPlayer from 'react-audio-player';

class Audios extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying:'',
            pause:'',
            audiosIsClick:'',
        };

    }

    changePlayStart(id){
        this.setState({
            isPlaying:true,
            pause:false,
            audiosIsClick:true,
        });
        this.props.parent.getAudiosState(this.state.isPlaying, this.state.audiosIsClick,id);
    }

    changePlayPause(){
        this.setState({
            isPlaying:false,
            pasue:true,
            audiosIsClick:true,
        });

        this.props.parent.getAudiosState(this.state.isPlaying, this.state.audiosIsClick);
    }



    render() {
        const { id,src,isStopPlay } = this.props;
        // console.dir(this.state);
        if(isStopPlay) {
            return (
                <div style={{width:"100%"}}>
                    <ReactAudioPlayer
                        src={src}
                        autoPlay={false}
                        controls
                        id={id}
                        onPlay={()=>{this.changePlayStart(id)}}
                        onPause={()=>{this.changePlayPause()}}
                    />
                </div>
            );
        }else{
            return (
                <div style={{width:"100%"}}>
                    <ReactAudioPlayer
                        src={src}
                        autoPlay={true}
                        controls
                        id={id}
                        onPlay={()=>{this.changePlayStart(id)}}
                        onPause={()=>{this.changePlayPause()}}
                    />
                </div>
            );
        }

    }
}

Audios.propTypes = {};

export default Audios;