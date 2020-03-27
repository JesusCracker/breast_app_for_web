import * as types from '../contants'

export const getUserLiveList=(keyWords,page)=>{

    return{
        type:types.GET_USER_LIVE_LIST_ASYNC,
        keyWords,
        page,

    }
}

export const onEndReached=()=>{

    return{
        type:types.GET_ALL_LIST
    }
}

