import React, {Component} from 'react';
import "video-react/dist/video-react.css";
import { Player } from 'video-react';
import config from "../config/wxconfig";


class Video extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    render() {
        const {src,postImage} = this.props;
        console.dir(src);
        return (
            <Player
                playsInline
                poster={config.publicStaticUrl + postImage}
                ref={player => {
                    this.player = player;
                }}
                src={src}
                videoId="video-1"
            >
            </Player>
        );
    }
}

Video.propTypes = {};

export default Video;