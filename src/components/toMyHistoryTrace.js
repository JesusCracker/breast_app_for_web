import React, {Component} from 'react';
import { Route, Redirect } from 'react-router'

class ToMyHistoryTrace extends Component {


     getQueryString() {
        var obg={},a='';
        (a=window.location.search.substr(1))&&(a=window.location.search.split('?')[1])
         // console.dir(window.location.search.split('?')[1]);
        a.split(/&/g).forEach(function(item){
            obg[(item=item.split('='))[0]]=item[1];

        });
        return obg
    }

    render() {



        if(this.getQueryString().type&&this.getQueryString().type==='myHistoryTrace'){
            //重定向到订单列表
            return(
                <Redirect to={"/myHistoryTrace/"} />
            )
        }

      return <div>

      </div>
    }
}

export default ToMyHistoryTrace;