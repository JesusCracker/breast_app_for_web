import React, {Component} from 'react';

class SetStars extends React.Component {
    constructor(props) {
        super(props);
        const { number} = this.props;

        this.state = {
        };

    }

    setEmptyStar(){
        return <img src={require('../images/0.png')} alt=""/>
    }

    setHalfStar(){
        return  <img src={require('../images/1.png')} alt=""/>
    }

    setAllStar(){
        return <img src={require('../images/2.png')} alt=""/>
    }

    getStarScore(number){

        let allStar=0,halfStar=0,emptyStar=0;
        if(number%2===0&&number!==0){
            allStar=number/2;
        }
        if(number%2===0&&number===0){
            emptyStar=0;
        }
        if(number%2!==0){
            allStar=parseInt(number/2);
            halfStar=number%2
        }
        let param={
            'allStar':allStar,
            'halfStar':halfStar,
            'emptyStar':emptyStar,
        };
        return param;
    }




    setStars=(number)=>{
        let param=this.getStarScore(number);
    /*    this.state.arr.map((item,index)=>{
            console.dir(item);

            return(
                <span key={index}>
                        {item>=item.Star?<span style={{color:"#FFAC2D",fontSize:"20px"}}>☆</span>:<span style={{color:"#FFAC2D",fontSize:"20px"}}>★</span>}
                      </span>
            )
        });
*/

    //最傻逼的判断办法
        if (param.allStar===0&&param.emptyStar===0){
            return <div>
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===0&&param.halfStar===1){
            return <div>
                {this.setHalfStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===1&&param.halfStar===0){
            return <div>
                {this.setAllStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===1&&param.halfStar!==0){
            return <div>
                {this.setAllStar()}
                {this.setHalfStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===2&&param.halfStar===0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===2&&param.halfStar!==0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setHalfStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===3&&param.halfStar===0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setEmptyStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===3&&param.halfStar!==0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setHalfStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===4&&param.halfStar===0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setEmptyStar()}
            </div>
        }
        if(param.allStar===4&&param.halfStar!==0){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setHalfStar()}
            </div>
        }
        if(param.allStar===5){
            return <div>
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
                {this.setAllStar()}
            </div>
        }


    };

    render() {
        const {number}=this.props;

        return (
            this.setStars(number)
        )
    }
}

SetStars.propTypes = {};

export default SetStars;