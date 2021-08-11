import React, { useState } from 'react';

import './style.scss';
import { Link } from 'react-router-dom';
import lifechange from '../../assets/images/lifechange.png';
import { useDispatch, useSelector } from 'react-redux';

import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ERC20Exchanger from 'utils/ERC20/erc20Exchanger';
import SelectWalletModal from '../SelectWalletModal/selectWalletModal';

// Redux
import { Web3Object, web3Connected } from '../../redux/actions/web3action';
import { setUserData } from '../../redux/actions/authAction';

const Header = () => {
  const dispatch = useDispatch();
  const isWeb3Connected = useSelector((state) => state.web3.web3connected);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const hideShow = () => {
    setShowWalletModal(false);
  };
  console.log(process.env.REACT_APP_INFURA_KEY);
  const providerOptions = {
    walletconnect: {
      display: {
        name: 'Mobile',
      },
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_INFURA_KEY, // required
      },
    },
  };
  const web3Modal = new Web3Modal({
    network: 'rinkeby',
    // cacheProvider: true,
    providerOptions, // required
  });

  const disconnectWallet = async () => {
    dispatch(web3Connected(false));
    web3Modal.clearCachedProvider();
  };

  const connectWallet = async (e) => {
    console.log(e);
    localStorage.removeItem('walletconnect');
    const provider = await web3Modal.connect();
    // Subscribe to accounts change
    provider.on('accountsChanged', (accounts) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on('chainChanged', (chainId) => {
      console.log(chainId);
    });

    // Subscribe to provider connection
    provider.on('connect', (info) => {
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on('disconnect', (error) => {
      console.log(error);
    });
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    const ethers = Web3.utils.fromWei(
      await web3.eth.getBalance(accounts[0]),
      'ether',
    );
    sessionStorage.setItem('userBalance', Number(ethers).toFixed(2));
    sessionStorage.setItem('userAccount', accounts[0]);
    dispatch(Web3Object(web3));
    dispatch(web3Connected(true));
    const erc20Exchanger = new ERC20Exchanger(web3, process.env.REACT_APP_STAKING_TOKEN);
    const tokenBalance = Web3.utils.fromWei(
      await erc20Exchanger.balanceOf(accounts[0]),
      'ether',
    );
    dispatch(setUserData({
      tokenBalance: Number(tokenBalance).toFixed(2),
      etherBalance: Number(ethers).toFixed(2),
      account: accounts[0],
    }));
  };
  return (
    <>
      <div className="app-header">
        <div className="container header-container">
          <Link to="/" className="d-flex align-items-center logo-wrap">
            <img src={lifechange} className="logo" alt="Logo" />
            <h2>Lifechain</h2>
          </Link>
          <div className="header-menus">
            <ul>
              {!isWeb3Connected
              && (
                <li>
                  <button
                    className="btn-connect"
                    onClick={() => connectWallet()}
                  >
                    Connect
                  </button>
                </li>
              )}
              {isWeb3Connected
              && (
                <li>
                  <button
                    className="btn-connect"
                    onClick={() => disconnectWallet()}
                  >
                    Disconnect
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {showWalletModal ? <SelectWalletModal hideShow={hideShow} /> : undefined}
    </>
  );
};

export default Header;
