import { all, fork } from 'redux-saga/effects';
import {userLiveSagas} from "./liveList";
// import * as userLiveSagas from './liveList';

export default  function* rootSaga() {
    yield all([
        ...userLiveSagas,
    ])

}
