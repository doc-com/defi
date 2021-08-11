import stkGRO from '../../abis/stkGRO.json';

class StakeGro {
  constructor(web3) {
    this.web3 = web3;
    this.contract = new this.web3.eth.Contract(stkGRO, process.env.REACT_APP_STAKING_CONTRACT);
  }

  async deposit(from,
    amount) {
    const data = await this.contract.methods.deposit(
      amount,
    ).send({ from: this.web3.utils.toChecksumAddress(from) });
    return data;
  }

  async widthraw(from,
    amount) {
    const data = await this.contract.methods.withdraw(
      amount,
    ).send({ from: this.web3.utils.toChecksumAddress(from) });
    return data;
  }
}
export default StakeGro;
