import * as types from '../contants'

const getLiveList = (state = {} , action = {}) => {

    switch (action.type) {

        case types.GET_ALL_LIST:
            return action

        default:
            return state;
    }
};

export default getLiveList;
