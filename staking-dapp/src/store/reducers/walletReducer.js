import {
  SET_WALLET_ADDRESS,
  SET_CONTRACT,
  DELETE_CONTRACT,
  DELETE_WALLET_ADDRESS,
  SET_PROVIDER,
} from "../actionTypes";

let initialState = {
  provider: "",
  walletAddress: "",
  contract: "",
};

function metaMaskReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_PROVIDER:
      return {
        ...state,
        provider: { ...payload },
      };

    case SET_WALLET_ADDRESS:
      localStorage.setItem("userConnected", true);
      return {
        ...state,
        walletAddress: payload,
      };

    case SET_CONTRACT:
      return {
        ...state,
        contract: payload,
      };

    case DELETE_WALLET_ADDRESS:
      return {
        ...state,
        walletAddress: "",
      };

    case DELETE_CONTRACT:
      return {
        ...state,
        contract: "",
      };

    default:
      return state;
  }
}

export default metaMaskReducer;
