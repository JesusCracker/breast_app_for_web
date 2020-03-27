import * as constants from '../contants';
/*import abbr from '../../../../config/abbr';
import { apiGetFameShare } from '../../../../config/index';*/

export const getAllList = (list, pflag, ptype, ppage, ppagesize) => {
    let flag = parseInt(pflag);
    let type = parseInt(ptype);
    let page = parseInt(ppage);
    let pagesize = parseInt(ppagesize);
    let formData = {
        flag: flag,
        type: type,
        page: page,
        pagesize: pagesize,
    }
    return (dispatch) => {
        //获取全部热门课程
   /*     apiGetFameShare(formData).then(response => {
            if (response.code === abbr.okId) {
                let plist = list.toJS().concat(response.data);
                if(plist.length >= response.total){
                    dispatch(changeHasmore(false));
                }
                dispatch(changeAllList(response.data, plist));
                dispatch(changeLoading(false));
            }else{
                dispatch(changeAllList([],[]));
                dispatch(changeLoading(false));
                dispatch(changeHasmore(false));
                return;
            }
        }).catch(error => {
            dispatch(changeAllList([],[]));
            dispatch(changeLoading(false));
            dispatch(changeHasmore(false));
            console.log(error)
        })*/
    }
}

export const changeAllList = (data, plist) => ({
    type: constants.CHANGE_ALL_LIST,
    data, plist
})

export const changeLoading = (isShow) => ({
    type: constants.CHANGE_LOADING,
    isShow
})

export const changePage = (value) => ({
    type: constants.CHANGE_PAGE,
    value
})

export const changeHasmore = (isShow) => ({
    type: constants.CHANGE_HASMORE,
    isShow
})


export const setFromPath = (value) => ({
    type: constants.SET_FROMPATH,
    value
})


