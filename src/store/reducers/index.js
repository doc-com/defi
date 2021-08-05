import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import walletReducer from './walletReducer';
import themeReducer from '../../redux/reducer/themereducer';
import web3Reducer from '../../redux/reducer/web3reducer';
import authReducer from '../../redux/reducer/authReducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  walletReducer,
  auth: authReducer,
  theme: themeReducer,
  web3: web3Reducer,
});
