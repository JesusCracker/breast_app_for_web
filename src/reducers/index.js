import {combineReducers} from "redux";
import getUserLiveList from "./getUserLiveList";
import getLiveList from "./getLiveList";


const rootReducer=combineReducers({
    getUserLiveList,
    // getLiveList

});

export default rootReducer;