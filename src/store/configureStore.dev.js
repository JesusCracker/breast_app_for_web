import { applyMiddleware , createStore } from "redux";
import rootReducers from "../reducers";
import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";
import createSagaMiddleware from 'redux-saga'
import rootSaga from "../sagas";


const sagaMiddleware=createSagaMiddleware();

const  configureStore=(preloadState)=>{
    const store=createStore(rootReducers,preloadState,composeWithDevTools(applyMiddleware(logger,thunk,promise,sagaMiddleware)));
    sagaMiddleware.run(rootSaga);


    if (process.env.NODE_ENV !== "production") {
        if (module.hot) {
            module.hot.accept('../reducers', () => {
                store.replaceReducer(rootReducers)
            })
        }
    }

    return store;
};

export default configureStore;
