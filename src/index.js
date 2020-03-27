import React from 'react';
import ReactDOM from 'react-dom';
// import {} from "./components/juggle";
import App from './components/App';
import { Provider } from 'react-redux'
import configureStore from "./store/configureStore";




/*if(localStorage.getItem("loginToken") == null){
    window.location.href='http://www.aisono.cn/wxHis/old&new/sign.html'
}*/

const store = configureStore();
const root = document.getElementById('root');
ReactDOM.render(<Provider store={store}><App/></Provider> , root);
