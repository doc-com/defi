import {
  SET_USER_DATA,
  SET_USER_DATA_LOADER,
  SET_USER_NFTS,
  SET_EXPLORE_NFTS,
} from '../constants';

const initialState = {
  userData: {
    tokenBalance: 0.00,
    etherBalance: 0.00,
    account: '0x',
  },
  nfts: [],
  exploreNfts: [],
  isUserDataLoading: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA_LOADER:
      return {
        ...state,
        isUserDataLoading: action.payload,
      };

    case SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
        isUserDataLoading: false,
      };

    case SET_USER_NFTS:
      return {
        ...state,
        nfts: action.payload,
      };

    case SET_EXPLORE_NFTS:
      return {
        ...state,
        exploreNfts: action.payload,
      };

    default:
      return state;
  }
};

export default authReducer;
