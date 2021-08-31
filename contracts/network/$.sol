// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.0;

/**
 * @dev This library is provided for conveniece. It is the single source for
 *      the current network and all related hardcoded contract addresses. It
 *      also provide useful definitions for debuging faultless code via events.
 */
library $
{
	enum Network { Mainnet, Ropsten, Rinkeby, Kovan, Goerli }

	Network constant NETWORK = Network.Mainnet;

	bool constant DEBUG = NETWORK != Network.Mainnet;

	function debug(string memory _message) internal
	{
		address _from = msg.sender;
		if (DEBUG) emit Debug(_from, _message);
	}

	function debug(string memory _message, uint256 _value) internal
	{
		address _from = msg.sender;
		if (DEBUG) emit Debug(_from, _message, _value);
	}

	function debug(string memory _message, address _address) internal
	{
		address _from = msg.sender;
		if (DEBUG) emit Debug(_from, _message, _address);
	}

	event Debug(address indexed _from, string _message);
	event Debug(address indexed _from, string _message, uint256 _value);
	event Debug(address indexed _from, string _message, address _address);

	address constant stkMTC =
		NETWORK == Network.Mainnet ? 0xD93f98b483CC2F9EFE512696DF8F5deCB73F9497 :
		// NETWORK == Network.Ropsten ? 0x0000000000000000000000000000000000000000 :
		NETWORK == Network.Rinkeby ? 0x437664B64b88fDe761c54b3ab1568dA4227757fc :
		NETWORK == Network.Kovan ? 0x760FbB334dbbc15B9774e3d9fA0def86C0A6e7Af :
		// NETWORK == Network.Goerli ? 0x0000000000000000000000000000000000000000 :
		0x0000000000000000000000000000000000000000;

	address constant MTC =
		NETWORK == Network.Mainnet ? 0x9492064273686eEee3B8F3ccbCF3f8D914F5Eef2:
		NETWORK == Network.Ropsten ? 0x5BaF82B5Eddd5d64E03509F0a7dBa4Cbf88CF455 :
		//NETWORK == Network.Rinkeby ? 0x020e317e70B406E23dF059F3656F6fc419411401 :
		NETWORK == Network.Rinkeby ? 0xc1ACB7dD45752495468aFE2E9b2dc576F3d90E23 :
		NETWORK == Network.Kovan ? 0xFcB74f30d8949650AA524d8bF496218a20ce2db4 :
		// NETWORK == Network.Goerli ? 0x0000000000000000000000000000000000000000 :
		0x0000000000000000000000000000000000000000;
}
