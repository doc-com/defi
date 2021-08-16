// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice This contract allows external agents to detect when new GTokens
 *         are deployed to the network.
 */
contract GTokenRegistry is Ownable
{
	/**
	 * @notice Registers a new gToken.
	 * @param _mtcToken The address of the token being registered.
	 * @param _oldMtcToken The address of the token implementation
	 *                        being replaced, for upgrades, or 0x0 0therwise.
	 */
	function registerNewToken(address _mtcToken, address _oldMtcToken) public onlyOwner
	{
		emit NewToken(_mtcToken, _oldMtcToken);
	}

	event NewToken(address indexed _mtcToken, address indexed _oldMtcToken);
}
