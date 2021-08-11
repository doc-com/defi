import {
  createStore, combineReducers, applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import { composeWithDevTools } from 'redux-devtools-extension';
import themeReducer from './reducer/themereducer';
import web3Reducer from './reducer/web3reducer';
import authReducer from './reducer/authReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  web3: web3Reducer,
});

const Store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(logger, thunk)),
);
export default Store;
