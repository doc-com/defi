import ERC20 from '../../abis/ERC20.json';

class ERC20Exchanger {
  constructor(web3) {
    this.web3 = web3;
    this.contract = new this.web3.eth.Contract(ERC20, process.env.REACT_APP_STAKING_TOKEN);
  }

  async approve(
    bidder,
    collection,
    price,
  ) {
    const data = await this.contract.methods.approve(
      collection,
      price,
    ).send({ from: bidder });
    return data;
  }

  async decimals() {
    const data = await this.contract.methods.decimals().call();
    return data;
  }

  async balanceOf(address) {
    const data = await this.contract.methods.balanceOf(address).call();
    return data;
  }
}
export default ERC20Exchanger;
