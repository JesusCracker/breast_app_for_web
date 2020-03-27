import React, {Component} from 'react';
import { Route, Redirect } from 'react-router'

class ToDiagnosisList extends Component {
    componentWillUnmount(){

        //处理逻辑
    }

     getQueryString() {
        var obg={},a='';
        (a=window.location.search.substr(1))&&(a=window.location.search.split('?')[1])
         // console.dir(window.location.search.split('?')[1]);
        a.split(/&/g).forEach(function(item){
            obg[(item=item.split('='))[0]]=item[1];

        });
        return obg
    }

    getGroupNum(type){
        if(type!=='diagnosisList'){
           return  parseInt(this.getQueryString().type.split('_')[1]);
        }else{
            return 0;
        }
    }

    render() {
        if(this.getQueryString().type&&this.getQueryString().type.indexOf('diagnosisList')!==-1){

            //重定向到问诊列表
            return(
                <Redirect to={`/diagnosisList/${this.getGroupNum(this.getQueryString().type)}`} />
            )
        }

      return <div>

      </div>
    }
}

export default ToDiagnosisList;
