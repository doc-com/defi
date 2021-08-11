import {
  SET_WALLET_ADDRESS,
  SET_CONTRACT,
  DELETE_CONTRACT,
  DELETE_WALLET_ADDRESS,
  SET_PROVIDER,
} from "../store/actionTypes";

export const setProvider = (content) => ({
  type: SET_PROVIDER,
  payload: content,
});

export const setWalletAddress = (content) => ({
  type: SET_WALLET_ADDRESS,
  payload: content,
});

export const deleteWalletAddress = () => ({ type: DELETE_WALLET_ADDRESS });

export const setContract = (content) => ({
  type: SET_CONTRACT,
  payload: content,
});

export const deleteContract = () => ({
  type: DELETE_CONTRACT,
});
