import {put, call, takeEvery, select, fork, all, delay,takeLatest } from 'redux-saga/effects';
import * as types from '../contants'
import axios from 'axios'


function* getUserLiveList(action) {
    const {page} = action;

    try {
        const userLiveList=yield call(

            axios.post,
            decodeURIComponent(`http://www.aisono.cn/aiplat/liveTelecast/liveTelecastList.do?page=1&limit=3&title=${action.keyWords}`)
        );

        console.dir(userLiveList);
        yield put({type:types.GET_USER_LIVE_LIST,userLiveList});
    } catch(e) {
        yield put({type: types.GET_USER_LIVE_LIST_FAILURE, error: e.message});
    }


}


function* watchUserLiveList() {

    yield takeEvery(types.GET_USER_LIVE_LIST_ASYNC,getUserLiveList);

}

export const userLiveSagas=[watchUserLiveList()];
