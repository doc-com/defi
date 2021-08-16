import React, { useState } from 'react';
import ERC20Exchanger from 'utils/ERC20/erc20Exchanger';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Web3 from 'web3';

// redux
import { useSelector, useDispatch } from 'react-redux';
import StakeMtc from 'utils/MTC/STKMTC';
import { Web3Object, web3Connected } from '../../redux/actions/web3action';

import { setUserData } from '../../redux/actions/authAction';

import './style.scss';

import lifechange from '../../assets/images/lifechange.png';

function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  // const [totalSupply, setTotalSupply] = useState(0);
  // const [totalReserve, setTotalReserve] = useState(0);
  const [open, setOpen] = React.useState(false);

  const web3Object = useSelector((state) => state.web3.web3object);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const refreshUI = async () => {
    const web3 = web3Object;
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
    const stkMtc = new StakeMtc(web3);
    const tokenBalance = Web3.utils.fromWei(
      await erc20Exchanger.balanceOf(accounts[0]),
      'ether',
    );
    const totalReserve = await stkMtc.totalReserve();
    const totalSupply = await stkMtc.totalSupply();
    const stkBalance = Web3.utils.fromWei(
      await stkMtc.balanceOf(accounts[0]),
      'ether',
    );
    dispatch(setUserData({
      tokenBalance: Number(tokenBalance).toFixed(2),
      etherBalance: Number(ethers).toFixed(2),
      stkBalance,
      totalReserve,
      totalSupply,
      account: accounts[0],
    }));
  };
  const deposit = async () => {
    console.log(user);
    const web3 = web3Object;
    // Init erc721 smart contract invoke service
    const stkMtc = new StakeMtc(web3);
    const erc20Exchanger = new ERC20Exchanger(web3);

    // const decimals = await erc20Exchanger.decimals();
    const strPrice = web3.utils.toBN(
      `0x${(depositAmount * 10 ** 18).toString(16)}`,
    );
    console.log(process.env.REACT_APP_STAKING_CONTRACT);
    const approveRes = await erc20Exchanger.approve(
      user.account,
      process.env.REACT_APP_STAKING_CONTRACT,
      strPrice,
    );
    console.log(approveRes);
    const res = await stkMtc.deposit(user.account, strPrice);
    console.log(res);
    refreshUI();
  };
  const withdraw = async () => {
    const web3 = web3Object;
    // Init erc721 smart contract invoke service
    const stkMtc = new StakeMtc(web3);
    // const erc20Exchanger = new ERC20Exchanger(web3);
    // const decimals = await erc20Exchanger.decimals();
    const strPrice = web3.utils.toBN(
      `0x${(withdrawAmount * 10 ** 18).toString(16)}`,
    );
    const res = await stkMtc.widthraw(user.account, strPrice);
    console.log(res);
    refreshUI();
  };

  return (
    <div className="homepage">
      <div className="banner">
        <h1>Lifechain Staking</h1>
        <div className="banner-info">
          <div className="info-row">
            <p className="info-lead">BNB Balance:</p>
            <p className="info-lead">{user.etherBalance}</p>
          </div>
          <div className="info-row">
            <p className="info-lead">MTC Balance:</p>
            <p className="info-lead">{user.tokenBalance}</p>
          </div>
          <div className="info-row">
            <p className="info-lead">MTC/stkMTC Ratio: </p>
            <p className="info-lead">{(user.totalReserve / user.totalSupply)}</p>
          </div>
        </div>
        <div className="banner-card">
          <div className="tree-window">
            <div className="row">
              <div className="col-md-4">
                <div className="window-item">
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <button onClick={() => deposit()} className="btn-deposit">Deposit</button>
                </div>
              </div>
              <div className="col-md-4 d-flex justify-content-center tree-image">
                <img src={lifechange} alt="tree" />
              </div>
              <div className="col-md-4">
                <div className="window-item">
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <button onClick={() => withdraw()} className="btn-withdraw">Withdraw</button>
                </div>
              </div>
            </div>
          </div>
          <p className="card-title">Your Holdings</p>
          <p className="card-lead">
            {Number(user.stkBalance).toFixed(2)}
            {' '}
            stkMTC
          </p>
          <p className="card-lead">
            =
            {' '}
            { (user.stkBalance * (user.totalReserve / user.totalSupply)).toFixed(2)}
            {' '}
            MTC ($0.000000)
          </p>
          <button onClick={handleClickOpen} className="btn-card-info">
            Info
          </button>
          <p className="card-lead">APY for Compounding: 14.19%</p>
        </div>
        <div className="banner-sub-info">
          <p className="info-lead">Total value locked in contract</p>
          <p className="info-lead">
            {Number(user.totalReserve / (10 ** 18)).toFixed(2)}
            {' '}
            MTC ($0.00)
          </p>
          <p className="info-list">Top Holders List</p>
        </div>
      </div>
      <div className="keep-date">
        <div className="keep-date-bg">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2>Keep Up To Date</h2>
                <p className="keep-lead">
                  We have a very friendly telegram community and you can also
                  find us on twitter.
                </p>
              </div>
            </div>
            <div className="row">
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }} className="col-md-12">
                <div className="social-link">
                  <a target="_blank" href="https://t.me/docToken" rel="noreferrer">
                    <img src="./images/telegram.png" alt="Telegram" />
                  </a>
                </div>
                <div className="social-link">
                  <a target="_blank" href="https://www.twitter.com/DocLifechain" rel="noreferrer">
                    <img src="./images/twitter.png" alt="Twitter" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          stkMTC is the tokenised representation of having MTC staked on the Binance Smart Chain blockchain.
          The purpose of the staking pool is to distribute a % of the
          revenue from Doc.com data sales with long-term holders of MTC.
          stkMTC is always appreciating vs MTC. The fee structure is 6%
          total for every stake/unstake (3% is burnt and 3% goes back to stkMTC holders.)
        </DialogTitle>
      </Dialog>
    </div>
  );
}

export default Home;
