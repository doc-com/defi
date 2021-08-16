import { WEB3_OBJECT, WEB_3_CONNECTED } from '../constants';

const initialState = {
  web3object: {},
};

const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case WEB3_OBJECT:
      return {
        ...state,
        web3object: action.payload,
      };
    case WEB_3_CONNECTED:
      return {
        ...state,
        web3connected: action.payload,
      };
    default: return state;
  }
};
export default web3Reducer;
