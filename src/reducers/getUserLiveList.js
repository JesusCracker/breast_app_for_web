import * as types from '../contants'


const initialState = {
    isLoading: false ,
    error: null ,
    userLiveList: null,
    page:1,
    listDataArr:[],

};


const getUserLiveList = (state = initialState , action = {}) => {

    switch (action.type) {
        case types.GET_USER_LIVE_LIST:
            return {
                isLoading: false ,
                error: null ,
                userLiveList: action.userLiveList,
                page: state.page,
                listDataArr:[...action.userLiveList.data.data],

            };
        case types.GET_USER_LIVE_LIST_REQUEST:
            return {
                isLoading: true ,
                error: null ,
                userLiveList: null ,
            }
        case types.GET_USER_LIVE_LIST_FAILURE:
            return {
                isLoading: false ,
                error: action.error ,
                userLiveList: null ,
            }





        default:
            return state;
    }
};

export default getUserLiveList;
