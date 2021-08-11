import React, { useState } from 'react';
import ERC20Exchanger from 'utils/ERC20/erc20Exchanger';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

import './style.scss';
import { useSelector } from 'react-redux';
import StakeGro from 'utils/GRO/STKGRO';

import lifechange from '../../assets/images/lifechange.png';

function Home() {
  const user = useSelector((state) => state.auth.userData);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [open, setOpen] = React.useState(false);

  const web3Object = useSelector((state) => state.web3.web3object);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deposit = async () => {
    console.log(user);
    const web3 = web3Object;
    // Init erc721 smart contract invoke service
    const stkGro = new StakeGro(web3);
    const erc20Exchanger = new ERC20Exchanger(web3);

    const decimals = await erc20Exchanger.decimals();
    const strPrice = web3.utils.toBN(
      `0x${(depositAmount * 10 ** decimals).toString(16)}`,
    );
    console.log(process.env.REACT_APP_STAKING_CONTRACT);
    const approveRes = await erc20Exchanger.approve(
      user.account,
      process.env.REACT_APP_STAKING_CONTRACT,
      strPrice,
    );
    console.log(approveRes);
    const res = await stkGro.deposit(user.account, strPrice);
    console.log(res);
  };
  const withdraw = async () => {
    console.log(withdrawAmount);

    const web3 = web3Object;
    // Init erc721 smart contract invoke service
    const stkGro = new StakeGro(web3);
    const erc20Exchanger = new ERC20Exchanger(web3);
    const decimals = await erc20Exchanger.decimals();
    const strPrice = web3.utils.toBN(
      `0x${(withdrawAmount * 10 ** decimals).toString(16)}`,
    );
    const res = await stkGro.widthraw(user.account, strPrice);
    console.log(res);
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
            <p className="info-lead">MTC/stkMTC Ratio:</p>
            <p className="info-lead">0.000000</p>
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
          <p className="card-lead">0.000000 stkMTC</p>
          <p className="card-lead">=0.000000 MTC ($0.000000)</p>
          <button onClick={handleClickOpen} className="btn-card-info">
            Info
          </button>
          <p className="card-lead">APY for Compounding: 14.19%</p>
        </div>
        <div className="banner-sub-info">
          <p className="info-lead">Total value locked in contract</p>
          <p className="info-lead">0.000000 MTC ($0.00)</p>
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
