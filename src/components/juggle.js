import axios from 'axios'
import URLconfig from "../config/urlConfig";
import { Modal } from 'antd-mobile';

const alert = Modal.alert;

const showAlert = (title,msg) => {
    const alertInstance = alert('', msg, [
        // { text: 'Cancel', onPress: () => console.log('cancel'), style: 'default' },
        { text: 'OK', onPress: () => console.log('ok') },
    ]);
    setTimeout(() => {
        // 可以调用close方法以在外部close

        alertInstance.close();
    }, 50000);
};

/*const App = () => (
    <WingBlank size="lg">
        <Button onClick={showAlert}>customized buttons</Button>
    </WingBlank>
);*/


//获取截取字符串的name
const getUrlParam = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

var code = getUrlParam('code');

const getIDs = (code) => {
    axios({
        url: URLconfig.publicUrl + '/wx/getWxUser.do' ,
        method: 'post' ,
        data: {
            "code": code ,
            "type": 1
        } ,
        transformRequest: [ function (data) {
            let ret = ''
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        } ] ,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then( (response)=> {

        if(response.status===200&&response.data.status===1){

            localStorage.setItem('openid', response.data.data.openid);
            localStorage.setItem('unionid', response.data.data.unionid);
            getEase();
            if (response.data.data.loginToken === null || response.data.data.loginToken.length === 0) {
                window.location.href = 'http://www.aisono.cn/wxHis/old&new/sign.html';

            } else {
                localStorage.removeItem('loginToken');
                localStorage.setItem('loginToken', response.data.data.loginToken);
            }

        }
        else{
            showAlert('',response.data.message);
        }
    })
        .catch(function (error) {
            // alert(JSON.stringify(error));
        });

};


const getEase=()=>{
    if(localStorage.getItem('openid')||localStorage.getItem('unionid')){

        axios({
            url: URLconfig.publicUrl + '/wx/getLoginToken.do' ,
            method: 'post' ,
            data: {
                "openid": localStorage.getItem('openid'),
                "unionid": localStorage.getItem('unionid'),
            } ,
            transformRequest: [ function (data) {

                let ret = ''
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            } ] ,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response)=>{
            if(response.status===200&&response.data.status===1){
                localStorage.removeItem('ringUser');
                localStorage.removeItem('loginToken');
                localStorage.setItem('ringUser', response.data.data.ringUser);
                localStorage.setItem('loginToken', response.data.data.loginToken);
            }

        })
            .catch(function (error) {
                alert(JSON.stringify(error));
            });
    }
}

if (code) {
    getIDs(code);

}

