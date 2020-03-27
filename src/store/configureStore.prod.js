import { applyMiddleware , createStore } from "redux";
import rootReducers from "../reducers";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";


const configureStore=(preloadState)=>{
    const store=createStore(
        rootReducers,
        preloadState,
        applyMiddleware(thunk,promise)
    );

    return store;
};

export default configureStore;
