import stkMTC from '../../abis/stkMTC.json';

class StakeMtc {
  constructor(web3) {
    this.web3 = web3;
    this.contract = new this.web3.eth.Contract(stkMTC, process.env.REACT_APP_STAKING_CONTRACT);
  }

  async deposit(from,
    amount) {
    const data = await this.contract.methods.deposit(
      amount,
    ).send({ from: this.web3.utils.toChecksumAddress(from) });
    return data;
  }

  async totalReserve() {
    const data = await this.contract.methods.totalReserve().call();
    return data;
  }

  async totalSupply() {
    const data = await this.contract.methods.totalSupply().call();
    return data;
  }

  async balanceOf(address) {
    const data = await this.contract.methods.balanceOf(address).call();
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
export default StakeMtc;
